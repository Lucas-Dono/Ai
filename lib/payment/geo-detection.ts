/**
 * Detección Geográfica para Selección de Proveedor de Pago
 *
 * Determina el mejor proveedor de pago según el país del usuario:
 * - LATAM → MercadoPago (mejor conversión, métodos locales)
 * - Global → Lemon Squeezy (pagos internacionales)
 */

import { billingLogger as log } from "@/lib/logging/loggers";

/**
 * Países de LATAM soportados por MercadoPago
 */
export const LATAM_COUNTRIES = [
  "AR", // Argentina
  "BR", // Brasil
  "MX", // México
  "CL", // Chile
  "CO", // Colombia
  "PE", // Perú
  "UY", // Uruguay
] as const;

/**
 * Pricing regional por país
 */
export const REGIONAL_PRICING = {
  // LATAM - Pricing local
  AR: { currency: "ARS", multiplier: 1000, symbol: "$" }, // $5,000 ARS
  BR: { currency: "BRL", multiplier: 25, symbol: "R$" }, // R$25
  MX: { currency: "MXN", multiplier: 100, symbol: "$" }, // $100 MXN
  CL: { currency: "CLP", multiplier: 4000, symbol: "$" }, // $4,000 CLP
  CO: { currency: "COP", multiplier: 20000, symbol: "$" }, // $20,000 COP
  PE: { currency: "PEN", multiplier: 20, symbol: "S/" }, // S/20
  UY: { currency: "UYU", multiplier: 200, symbol: "$" }, // $200 UYU

  // Global - Pricing en USD con ajustes regionales
  US: { currency: "USD", multiplier: 1, symbol: "$" }, // $20 USD (base)
  CA: { currency: "USD", multiplier: 1, symbol: "$" }, // $20 USD
  GB: { currency: "USD", multiplier: 1.05, symbol: "$" }, // $21 USD
  EU: { currency: "USD", multiplier: 1.05, symbol: "$" }, // $21 USD
  AU: { currency: "USD", multiplier: 1.1, symbol: "$" }, // $22 USD
  DEFAULT: { currency: "USD", multiplier: 1, symbol: "$" }, // $20 USD
} as const;

export type PaymentProvider = "mercadopago" | "paddle";
export type CountryCode = string;

/**
 * Detecta el país del usuario desde el request
 */
export async function detectCountryFromRequest(request: Request): Promise<CountryCode> {
  try {
    // 1. Intentar desde header CF-IPCountry (Cloudflare)
    const cfCountry = request.headers.get("CF-IPCountry");
    if (cfCountry && cfCountry !== "XX") {
      log.debug({ country: cfCountry, source: "cloudflare" }, "Country detected");
      return cfCountry;
    }

    // 2. Intentar desde header X-Vercel-IP-Country (Vercel)
    const vercelCountry = request.headers.get("X-Vercel-IP-Country");
    if (vercelCountry && vercelCountry !== "XX") {
      log.debug({ country: vercelCountry, source: "vercel" }, "Country detected");
      return vercelCountry;
    }

    // 3. Intentar desde Accept-Language (menos confiable)
    const acceptLanguage = request.headers.get("Accept-Language");
    if (acceptLanguage) {
      // Ejemplo: "es-AR,es;q=0.9,en;q=0.8"
      const match = acceptLanguage.match(/[-_]([A-Z]{2})/);
      if (match) {
        const country = match[1];
        log.debug({ country, source: "accept-language" }, "Country detected");
        return country;
      }
    }

    // 4. Fallback: Detectar por IP usando servicio externo (opcional)
    // const ip = request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP");
    // if (ip) {
    //   const country = await detectCountryByIP(ip);
    //   if (country) return country;
    // }

    // 5. Default: USA (mayoría de tráfico web)
    log.debug({ source: "default" }, "Country detection fallback to US");
    return "US";
  } catch (error) {
    log.error({ err: error }, "Error detecting country");
    return "US"; // Default fallback
  }
}

/**
 * Selecciona el proveedor de pago según el país
 */
export function selectPaymentProvider(countryCode: CountryCode): {
  provider: PaymentProvider;
  reason: string;
} {
  const isLATAM = LATAM_COUNTRIES.includes(countryCode as any);

  if (isLATAM) {
    return {
      provider: "mercadopago",
      reason: "local_payment_methods",
    };
  }

  return {
    provider: "paddle",
    reason: "international",
  };
}

/**
 * Obtiene el pricing regional para un país
 */
export function getRegionalPricing(countryCode: CountryCode, basePrice: number = 5) {
  const pricing = REGIONAL_PRICING[countryCode as keyof typeof REGIONAL_PRICING] || REGIONAL_PRICING.DEFAULT;

  return {
    ...pricing,
    amount: Math.round(basePrice * pricing.multiplier),
    displayPrice: `${pricing.symbol}${(basePrice * pricing.multiplier).toLocaleString()}`,
  };
}

/**
 * Calcula el precio ajustado por región (incluye fee de Lemon Squeezy)
 */
export function calculateRegionalPrice(
  countryCode: CountryCode,
  planId: "plus" | "ultra",
  interval: "month" | "year" = "month"
): {
  provider: PaymentProvider;
  currency: string;
  amount: number;
  displayPrice: string;
  basePrice: number;
} {
  const { provider } = selectPaymentProvider(countryCode);

  // Precios base en USD (para referencia)
  const basePrices = {
    plus: { month: 20, year: 200 },
    ultra: { month: 50, year: 500 },
  };

  const basePrice = basePrices[planId][interval];

  if (provider === "mercadopago") {
    // LATAM: Precio local reducido (poder adquisitivo)
    const localBasePrice = planId === "plus" ? 5 : 12; // USD equivalente
    const pricing = getRegionalPricing(countryCode, localBasePrice);

    return {
      provider,
      currency: pricing.currency,
      amount: pricing.amount,
      displayPrice: pricing.displayPrice,
      basePrice: localBasePrice,
    };
  }

  // Global: Precio en USD + ajuste regional + fee incluido
  const regionalMultiplier = REGIONAL_PRICING[countryCode as keyof typeof REGIONAL_PRICING]?.multiplier || 1;
  const adjustedPrice = Math.round(basePrice * regionalMultiplier);

  // Incluir fee de Paddle (8-10%) en el precio - usamos 10% para estar seguros
  const priceWithFee = Math.round(adjustedPrice / 0.90); // Dividir por 0.90 para que el neto sea adjustedPrice

  return {
    provider,
    currency: "USD",
    amount: priceWithFee,
    displayPrice: `$${priceWithFee}`,
    basePrice: adjustedPrice,
  };
}

/**
 * Detecta país y calcula pricing automáticamente
 */
export async function detectCountryAndPricing(
  request: Request,
  planId: "plus" | "ultra",
  interval: "month" | "year" = "month"
) {
  const countryCode = await detectCountryFromRequest(request);
  const pricing = calculateRegionalPrice(countryCode, planId, interval);

  log.info(
    {
      countryCode,
      provider: pricing.provider,
      planId,
      interval,
      amount: pricing.amount,
      currency: pricing.currency,
    },
    "Country detected and pricing calculated"
  );

  return {
    countryCode,
    ...pricing,
  };
}
