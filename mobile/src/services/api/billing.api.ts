import { apiClient } from './client';

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'plus' | 'ultra';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  provider: 'stripe' | 'mercadopago';
}

export interface UsageStats {
  messagesUsed: number;
  messagesLimit: number;
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  imagesGenerated: number;
  imagesLimit: number;
  agentsCreated: number;
  agentsLimit: number;
  tier: 'free' | 'plus' | 'ultra';
  resetDate: Date;
}

export interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'plus' | 'ultra';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    agents: number;
    messagesPerDay: number;
    voiceMinutesPerMonth: number;
    imagesPerMonth: number;
  };
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  created: Date;
  invoiceUrl?: string;
}

const billingApi = {
  // Obtener suscripción actual
  async getSubscription() {
    const data = await apiClient.get<Subscription>('/api/billing/subscription');
    return data;
  },

  // Obtener uso actual
  async getUsage() {
    const data = await apiClient.get<UsageStats>('/api/billing/usage');
    return data;
  },

  // Crear checkout session unificado (auto-detecta proveedor por región)
  async createCheckout(planId: 'plus' | 'ultra', interval: 'month' | 'year' = 'month') {
    const data = await apiClient.post<{
      provider: 'mercadopago' | 'paddle';
      checkoutUrl?: string;
      initPoint?: string;
      preapprovalId?: string;
      transactionId?: string;
      countryCode: string;
      pricing: {
        amount: number;
        currency: string;
        displayPrice: string;
      };
    }>('/api/billing/checkout-unified', {
      planId,
      interval,
    });

    // Retornar la URL de checkout dependiendo del proveedor
    return {
      ...data,
      url: data.provider === 'mercadopago' ? data.initPoint! : data.checkoutUrl!,
    };
  },

  // Obtener pricing sin crear checkout (útil para mostrar precios antes de iniciar pago)
  async getPricing(planId: 'plus' | 'ultra', interval: 'month' | 'year' = 'month') {
    const params = new URLSearchParams({ planId, interval });
    const data = await apiClient.get<{
      countryCode: string;
      provider: 'mercadopago' | 'paddle';
      planId: string;
      interval: string;
      pricing: {
        amount: number;
        currency: string;
        displayPrice: string;
        basePrice: number;
      };
    }>(`/api/billing/checkout-unified?${params}`);
    return data;
  },

  // Obtener portal del cliente
  async getPortalUrl() {
    const data = await apiClient.post<{ url: string }>('/api/billing/portal');
    return data;
  },

  // Cancelar suscripción
  async cancelSubscription() {
    const data = await apiClient.post('/api/billing/cancel');
    return data;
  },

  // Obtener facturas
  async getInvoices() {
    const data = await apiClient.get<Invoice[]>('/api/billing/invoices');
    return data;
  },

  // Obtener planes disponibles
  async getPlans() {
    // Hardcoded ya que son estáticos
    const plans: Plan[] = [
      {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          '3 agentes',
          '20 mensajes/día',
          '5 imágenes/mes',
          'Comunidad básica',
        ],
        limits: {
          agents: 3,
          messagesPerDay: 20,
          voiceMinutesPerMonth: 0,
          imagesPerMonth: 5,
        },
      },
      {
        id: 'plus',
        name: 'Plus',
        tier: 'plus',
        price: 4.99,
        currency: 'USD',
        interval: 'month',
        features: [
          '10 agentes',
          'Mensajes ilimitados',
          '100 min voz/mes',
          '50 imágenes/mes',
          'NSFW habilitado',
          'Mundos virtuales',
        ],
        limits: {
          agents: 10,
          messagesPerDay: -1, // ilimitado
          voiceMinutesPerMonth: 100,
          imagesPerMonth: 50,
        },
        isPopular: true,
      },
      {
        id: 'ultra',
        name: 'Ultra',
        tier: 'ultra',
        price: 14.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Agentes ilimitados',
          'Mensajes ilimitados',
          '500 min voz/mes',
          '200 imágenes/mes',
          'API access',
          'Analytics avanzados',
          'Todo de Plus',
        ],
        limits: {
          agents: -1, // ilimitado
          messagesPerDay: -1,
          voiceMinutesPerMonth: 500,
          imagesPerMonth: 200,
        },
      },
    ];
    return plans;
  },
};

export default billingApi;
