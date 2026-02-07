# Guía de Implementación: OAuth2 con Google en Minecraft Mod

**Fecha:** 2026-01-28
**Autor:** Investigación técnica exhaustiva
**Objetivo:** Implementar Google Sign-In en el mod Blaniel-MC usando OAuth2 + PKCE

---

## Tabla de Contenidos

1. [Casos de Éxito](#1-casos-de-éxito)
2. [Arquitectura Propuesta](#2-arquitectura-propuesta)
3. [Implementación Backend](#3-implementación-backend)
4. [Implementación Mod (Java)](#4-implementación-mod-java)
5. [Seguridad](#5-seguridad)
6. [Alternativas Evaluadas](#6-alternativas-evaluadas)
7. [Plan de Implementación](#7-plan-de-implementación)

---

## 1. Casos de Éxito

### 1.1. Microsoft Authentication en Minecraft

**Minecraft vanilla** usa Microsoft OAuth2 desde 2020 cuando Microsoft adquirió Mojang. El flujo funciona así:

- Usuario inicia login desde el launcher
- Se abre browser del sistema con URL de Microsoft OAuth
- Usuario autoriza en browser
- Callback regresa al launcher con authorization code
- Launcher intercambia code por access token + Xbox Live token + Minecraft token

**Fuente:** [Minecraft Wiki - Microsoft Authentication](https://minecraft.wiki/w/Microsoft_authentication)

### 1.2. DevAuth - Mod para Desarrollo

[DevAuth](https://github.com/DJtheRedstoner/DevAuth) es un mod de Minecraft que permite autenticación con cuenta Microsoft en entornos de desarrollo.

**Características:**
- Abre browser del sistema para OAuth
- Almacena tokens en `microsoft_accounts.json`
- Usa refresh tokens para evitar re-autenticación
- Soporta Fabric, Forge, NeoForge
- **Sin servidor localhost**: usa device flow o redirección web

**Lección aprendida:** No reinventar la rueda, usar OAuth2 estándar con system browser.

**Fuente:** [GitHub - DJtheRedstoner/DevAuth](https://github.com/DJtheRedstoner/DevAuth)

### 1.3. OAuth Mod para Minecraft

[OAuth Mod](https://www.curseforge.com/minecraft/mc-mods/oauth) permite login en el multiplayer screen usando Microsoft/Mojang accounts.

**Características:**
- Botón "Login with Microsoft" en multiplayer screen
- Abre browser para OAuth flow
- Callback listener en localhost

**Lección aprendida:** Integrar OAuth en GUI de Minecraft es posible sin romper la experiencia del usuario.

**Fuente:** [CurseForge - OAuth Mod](https://www.curseforge.com/minecraft/mc-mods/oauth)

### 1.4. OauthMC - Plugin de Servidor

[OauthMC](https://modrinth.com/plugin/oauthmc) es un plugin de servidor que fuerza OAuth authentication con Google/Microsoft.

**Características:**
- Login obligatorio con Google OAuth
- Integración con organizaciones (G Suite)
- Verificación de dominio de email

**Lección aprendida:** OAuth2 puede integrarse tanto client-side como server-side en Minecraft.

**Fuente:** [Modrinth - OauthMC](https://modrinth.com/plugin/oauthmc)

### 1.5. Mc-Auth.com - OAuth2 Completo

[Mc-Auth.com](https://github.com/Mc-Auth-com/Mc-Auth) es una implementación completa de OAuth 2.0 para Minecraft (RFC 6749 compliant).

**Características:**
- OAuth 2.0 Provider completo
- Authorization Code Flow
- PKCE support
- Refresh tokens

**Lección aprendida:** OAuth2 puede implementarse siguiendo estrictamente el RFC 6749.

**Fuente:** [GitHub - Mc-Auth.com](https://github.com/Mc-Auth-com/Mc-Auth)

---

## 2. Arquitectura Propuesta

### 2.1. Flujo Completo (OAuth2 Authorization Code Flow + PKCE)

```
┌─────────────────┐                                    ┌──────────────────┐
│  Minecraft Mod  │                                    │  Google OAuth2   │
│  (Java Client)  │                                    │   Auth Server    │
└────────┬────────┘                                    └────────┬─────────┘
         │                                                      │
         │ 1. User clicks "Login with Google"                  │
         │                                                      │
         │ 2. Generate code_verifier (random 128 chars)        │
         │    code_challenge = SHA256(code_verifier)           │
         │                                                      │
         │ 3. Open system browser with authorization URL       │
         │─────────────────────────────────────────────────────>│
         │    https://accounts.google.com/o/oauth2/v2/auth?    │
         │      client_id=...                                  │
         │      redirect_uri=http://127.0.0.1:8888/callback    │
         │      response_type=code                             │
         │      scope=openid email profile                     │
         │      code_challenge=...                             │
         │      code_challenge_method=S256                     │
         │      state=random_csrf_token                        │
         │                                                      │
         │                                        4. User authorizes
         │                                                      │
         │ 5. Redirect to localhost with code                  │
         │<─────────────────────────────────────────────────────│
         │    http://127.0.0.1:8888/callback?                  │
         │      code=AUTH_CODE&state=random_csrf_token         │
         │                                                      │
┌────────┴────────┐                                             │
│ Localhost HTTP  │                                             │
│ Server (8888)   │                                             │
└────────┬────────┘                                             │
         │                                                      │
         │ 6. Capture code from callback                       │
         │    Validate state parameter                         │
         │    Stop HTTP server                                 │
         │    Return success page to browser                   │
         │                                                      │
         │ 7. Exchange code for tokens                         │
         │─────────────────────────────────────────────────────>│
         │    POST https://oauth2.googleapis.com/token         │
         │      code=AUTH_CODE                                 │
         │      client_id=...                                  │
         │      redirect_uri=http://127.0.0.1:8888/callback    │
         │      grant_type=authorization_code                  │
         │      code_verifier=original_verifier                │
         │                                                      │
         │ 8. Response: { access_token, id_token, ... }        │
         │<─────────────────────────────────────────────────────│
         │                                                      │
         │                                    ┌─────────────────┴──────────────┐
         │                                    │   Blaniel Backend (Next.js)    │
         │                                    └─────────────────┬──────────────┘
         │                                                      │
         │ 9. Send id_token to Blaniel backend                 │
         │─────────────────────────────────────────────────────>│
         │    POST /api/auth/minecraft-oauth-login             │
         │      { id_token: "..." }                            │
         │                                                      │
         │                              10. Backend validates id_token
         │                                  - Verify signature with Google
         │                                  - Check email, sub, aud
         │                                  - Find or create user in DB
         │                                  - Generate Blaniel JWT (30 days)
         │                                                      │
         │ 11. Response: { token, user, agents }               │
         │<─────────────────────────────────────────────────────│
         │                                                      │
         │ 12. Save JWT to config file                         │
         │     (.minecraft/config/blaniel-mc.json)             │
         │                                                      │
         │ 13. Close login screen, show success message        │
         │                                                      │
```

### 2.2. Componentes Necesarios

#### Backend (Next.js + Better Auth):
- **Nuevo endpoint:** `POST /api/auth/minecraft-oauth-login`
- **Función:** Validar `id_token` de Google, crear/buscar user, retornar JWT Blaniel

#### Mod (Java):
- **OAuth2Client:** Clase que maneja el flujo OAuth2 + PKCE
- **LocalCallbackServer:** HTTP server en localhost para capturar callback
- **BrowserLauncher:** Abre system browser con Desktop.browse()
- **LoginScreen:** Añadir botón "Login with Google"

#### Google Cloud Console:
- **OAuth2 Client ID** para aplicación de escritorio
- **Redirect URI:** `http://127.0.0.1:8888/callback` (y rangos de puertos)

---

## 3. Implementación Backend

### 3.1. Nuevo Endpoint: `/api/auth/minecraft-oauth-login`

**Archivo:** `app/api/auth/minecraft-oauth-login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { formatZodError } from '@/lib/validation/schemas';
import { OAuth2Client } from 'google-auth-library';

/**
 * POST /api/auth/minecraft-oauth-login
 *
 * Endpoint para login con Google OAuth desde Minecraft mod.
 *
 * Diferencias con login normal:
 * - Acepta id_token de Google en lugar de email/password
 * - Valida token con Google OAuth2 API
 * - Crea usuario si no existe (auto-registro)
 * - Retorna JWT de larga duración (30 días)
 */

const oauthLoginSchema = z.object({
  id_token: z.string().min(1, 'ID token requerido'),
});

// Google OAuth2 Client para validación de tokens
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = oauthLoginSchema.safeParse(body);

    if (!validation.success) {
      return formatZodError(validation.error);
    }

    const { id_token } = validation.data;

    // 1. Verificar id_token con Google
    console.log('[Minecraft OAuth Login] Verificando id_token con Google...');

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
    } catch (error: any) {
      console.error('[Minecraft OAuth Login] Error al verificar token:', error);
      return NextResponse.json(
        { error: 'Token de Google inválido o expirado' },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: 'Payload del token inválido' },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json(
        { error: 'Email no disponible en token de Google' },
        { status: 400 }
      );
    }

    console.log('[Minecraft OAuth Login] Token válido para email:', email);

    // 2. Buscar o crear usuario
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          {
            Account: {
              some: {
                providerId: 'google',
                accountId: googleId,
              },
            },
          },
        ],
      },
      include: {
        Agent: {
          select: {
            id: true,
            name: true,
            gender: true,
            profile: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Si no existe, crear usuario nuevo (auto-registro)
    if (!user) {
      console.log('[Minecraft OAuth Login] Usuario nuevo, creando cuenta...');

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          image: picture,
          emailVerified: new Date(), // OAuth emails son verificados
          plan: 'FREE',
          Account: {
            create: {
              providerId: 'google',
              accountId: googleId,
              access_token: '', // No almacenamos access_token del OAuth
              refresh_token: null,
              expires_at: null,
            },
          },
        },
        include: {
          Agent: {
            select: {
              id: true,
              name: true,
              gender: true,
              profile: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      console.log('[Minecraft OAuth Login] Usuario creado:', user.id);
    } else {
      console.log('[Minecraft OAuth Login] Usuario existente:', user.id);
    }

    // 3. Generar JWT de Blaniel (30 días)
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    // 4. Registrar login exitoso
    console.log(`[Minecraft OAuth Login] Usuario autenticado: ${user.email}`);

    // 5. Retornar JWT + datos del usuario
    return NextResponse.json({
      token,
      expiresIn: 30 * 24 * 60 * 60, // 30 días en segundos
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
      },
      agents: user.Agent.map((agent) => {
        const profile = agent.profile as any;
        const age = profile?.identidad?.edad || profile?.age || null;

        return {
          id: agent.id,
          name: agent.name,
          gender: agent.gender || 'unknown',
          age: age,
        };
      }),
      message: 'Login exitoso con Google',
    });

  } catch (error: any) {
    console.error('[Minecraft OAuth Login Error]', error);
    return NextResponse.json(
      {
        error: 'Error al iniciar sesión',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
```

### 3.2. Dependencias Necesarias

**package.json:**
```json
{
  "dependencies": {
    "google-auth-library": "^9.6.3"
  }
}
```

**Instalación:**
```bash
npm install google-auth-library
```

### 3.3. Variables de Entorno

**`.env`:**
```bash
# Existing Google OAuth (para web)
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123..."

# No se necesitan nuevas variables, usamos las mismas credenciales
# pero configuramos redirect URIs adicionales en Google Cloud Console
```

### 3.4. Configuración en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Seleccionar proyecto Blaniel (o crear uno nuevo)
3. Ir a **APIs & Services > Credentials**
4. Editar OAuth 2.0 Client ID existente (o crear uno nuevo de tipo "Desktop app")
5. Agregar Redirect URIs:
   ```
   http://127.0.0.1:8888/callback
   http://localhost:8888/callback
   http://127.0.0.1:*/callback    (si Google soporta wildcards)
   ```
6. Guardar cambios

**Nota:** Google recomienda usar `127.0.0.1` en lugar de `localhost` para evitar problemas con firewalls.

**Fuente:** [Google Developers - OAuth2 for Native Apps](https://developers.google.com/identity/protocols/oauth2/native-app)

---

## 4. Implementación Mod (Java)

### 4.1. Estructura de Archivos

```
Juego/Blaniel-MC/src/main/java/com/blaniel/minecraft/
├── oauth/
│   ├── OAuth2Client.java           # Cliente OAuth2 principal
│   ├── LocalCallbackServer.java    # HTTP server para callback
│   ├── PKCE.java                   # Generación de PKCE codes
│   └── BrowserLauncher.java        # Abre system browser
└── screen/
    └── LoginScreen.java            # Modificar para agregar botón Google
```

### 4.2. OAuth2Client.java

```java
package com.blaniel.minecraft.oauth;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Cliente OAuth2 para Google Sign-In en Minecraft
 *
 * Implementa Authorization Code Flow con PKCE (RFC 7636)
 *
 * Flujo:
 * 1. Generar code_verifier y code_challenge (PKCE)
 * 2. Abrir browser con authorization URL
 * 3. Iniciar servidor HTTP local en 127.0.0.1:8888
 * 4. Usuario autoriza en browser
 * 5. Capturar authorization code del callback
 * 6. Intercambiar code por tokens (access_token, id_token)
 * 7. Enviar id_token a backend de Blaniel
 * 8. Recibir JWT de Blaniel
 */
public class OAuth2Client {

    private static final Gson GSON = new Gson();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    // Google OAuth2 endpoints
    private static final String AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

    // OAuth2 configuration
    private final String clientId;
    private final String redirectUri;
    private final String blanielApiUrl;

    // PKCE values (generated per request)
    private String codeVerifier;
    private String codeChallenge;

    // CSRF protection
    private String state;

    public OAuth2Client(String clientId, String redirectUri, String blanielApiUrl) {
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this.blanielApiUrl = blanielApiUrl;
    }

    /**
     * Iniciar flujo de autorización completo
     *
     * @return CompletableFuture con LoginResponse de Blaniel
     */
    public CompletableFuture<LoginResponse> authorize() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 1. Generar PKCE codes
                codeVerifier = PKCE.generateCodeVerifier();
                codeChallenge = PKCE.generateCodeChallenge(codeVerifier);

                // 2. Generar state para CSRF protection
                state = PKCE.generateRandomString(32);

                // 3. Construir authorization URL
                String authUrl = buildAuthorizationUrl();

                System.out.println("[OAuth2] Authorization URL: " + authUrl);

                // 4. Abrir browser
                if (!BrowserLauncher.openBrowser(authUrl)) {
                    throw new RuntimeException("No se pudo abrir el navegador");
                }

                // 5. Iniciar servidor HTTP local y esperar callback
                LocalCallbackServer callbackServer = new LocalCallbackServer(8888, "/callback");
                callbackServer.start();

                System.out.println("[OAuth2] Esperando autorización del usuario...");

                // Bloquear hasta recibir callback (con timeout de 5 minutos)
                Map<String, String> callbackParams = callbackServer.waitForCallback(5 * 60 * 1000);

                // 6. Validar state parameter (CSRF)
                String receivedState = callbackParams.get("state");
                if (!state.equals(receivedState)) {
                    throw new RuntimeException("Estado CSRF inválido");
                }

                // 7. Verificar si hubo error
                String error = callbackParams.get("error");
                if (error != null) {
                    throw new RuntimeException("Error de autorización: " + error);
                }

                // 8. Obtener authorization code
                String authorizationCode = callbackParams.get("code");
                if (authorizationCode == null || authorizationCode.isEmpty()) {
                    throw new RuntimeException("No se recibió código de autorización");
                }

                System.out.println("[OAuth2] Código de autorización recibido");

                // 9. Intercambiar code por tokens
                TokenResponse tokens = exchangeCodeForTokens(authorizationCode);

                System.out.println("[OAuth2] Tokens recibidos de Google");

                // 10. Enviar id_token a backend de Blaniel
                LoginResponse blanielResponse = loginToBlaniel(tokens.id_token);

                System.out.println("[OAuth2] Login exitoso en Blaniel");

                return blanielResponse;

            } catch (Exception e) {
                System.err.println("[OAuth2] Error en flujo de autorización: " + e.getMessage());
                e.printStackTrace();

                LoginResponse errorResponse = new LoginResponse();
                errorResponse.success = false;
                errorResponse.error = e.getMessage();
                return errorResponse;
            }
        });
    }

    /**
     * Construir URL de autorización con todos los parámetros
     */
    private String buildAuthorizationUrl() throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("client_id", clientId);
        params.put("redirect_uri", redirectUri);
        params.put("response_type", "code");
        params.put("scope", "openid email profile");
        params.put("code_challenge", codeChallenge);
        params.put("code_challenge_method", "S256");
        params.put("state", state);
        params.put("access_type", "offline"); // Para obtener refresh_token
        params.put("prompt", "select_account"); // Permitir cambiar de cuenta

        StringBuilder url = new StringBuilder(AUTHORIZATION_ENDPOINT);
        url.append("?");

        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                url.append("&");
            }
            url.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            url.append("=");
            url.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            first = false;
        }

        return url.toString();
    }

    /**
     * Intercambiar authorization code por tokens
     */
    private TokenResponse exchangeCodeForTokens(String authorizationCode) throws Exception {
        // Construir request body (application/x-www-form-urlencoded)
        Map<String, String> params = new HashMap<>();
        params.put("code", authorizationCode);
        params.put("client_id", clientId);
        params.put("redirect_uri", redirectUri);
        params.put("grant_type", "authorization_code");
        params.put("code_verifier", codeVerifier); // PKCE

        String body = buildFormUrlEncoded(params);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(TOKEN_ENDPOINT))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Error al intercambiar código: HTTP " + response.statusCode() + " - " + response.body());
        }

        return GSON.fromJson(response.body(), TokenResponse.class);
    }

    /**
     * Login a backend de Blaniel con id_token
     */
    private LoginResponse loginToBlaniel(String idToken) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("id_token", idToken);

        String url = blanielApiUrl + "/api/auth/minecraft-oauth-login";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            // Parsear error del backend
            JsonObject errorJson = GSON.fromJson(response.body(), JsonObject.class);
            String errorMessage = errorJson.has("error") ? errorJson.get("error").getAsString() : "Error desconocido";

            LoginResponse errorResponse = new LoginResponse();
            errorResponse.success = false;
            errorResponse.error = errorMessage;
            return errorResponse;
        }

        LoginResponse loginResponse = GSON.fromJson(response.body(), LoginResponse.class);
        loginResponse.success = true;
        return loginResponse;
    }

    /**
     * Helper: Construir body application/x-www-form-urlencoded
     */
    private String buildFormUrlEncoded(Map<String, String> params) throws Exception {
        StringBuilder body = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                body.append("&");
            }
            body.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            body.append("=");
            body.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            first = false;
        }
        return body.toString();
    }

    // ===== Data Classes =====

    public static class TokenResponse {
        public String access_token;
        public String id_token;
        public String refresh_token;
        public int expires_in;
        public String token_type;
        public String scope;
    }

    public static class LoginResponse {
        public boolean success;
        public String error;
        public String token;
        public int expiresIn;
        public UserDataResponse user;
        public AgentData[] agents;
        public String message;
    }

    public static class UserDataResponse {
        public String id;
        public String email;
        public String name;
        public String image;
        public String plan;
    }

    public static class AgentData {
        public String id;
        public String name;
        public String gender;
        public Integer age;
    }
}
```

### 4.3. PKCE.java

```java
package com.blaniel.minecraft.oauth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Generación de PKCE (Proof Key for Code Exchange)
 *
 * RFC 7636: https://datatracker.ietf.org/doc/html/rfc7636
 *
 * PKCE previene ataques de intercepción de authorization code
 * al requerir que el cliente que solicita el code sea el mismo
 * que lo intercambia por tokens.
 */
public class PKCE {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    /**
     * Generar code_verifier (43-128 caracteres)
     *
     * RFC 7636 recomienda 128 caracteres para máxima entropía
     */
    public static String generateCodeVerifier() {
        return generateRandomString(128);
    }

    /**
     * Generar code_challenge desde code_verifier
     *
     * Método: S256 (SHA-256)
     * code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
     */
    public static String generateCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return base64UrlEncode(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar code_challenge", e);
        }
    }

    /**
     * Generar string aleatorio seguro (para state, code_verifier)
     */
    public static String generateRandomString(int length) {
        StringBuilder result = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            result.append(ALLOWED_CHARS.charAt(RANDOM.nextInt(ALLOWED_CHARS.length())));
        }
        return result.toString();
    }

    /**
     * Base64 URL-safe encoding (sin padding)
     */
    private static String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
}
```

### 4.4. LocalCallbackServer.java

```java
package com.blaniel.minecraft.oauth;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Servidor HTTP local para recibir OAuth2 callback
 *
 * Escucha en http://127.0.0.1:8888/callback y captura
 * el authorization code enviado por Google.
 *
 * Inspirado en: Google OAuth Client Library - LocalServerReceiver
 * https://github.com/googleapis/google-oauth-java-client/blob/main/google-oauth-client-jetty/src/main/java/com/google/api/client/extensions/jetty/auth/oauth2/LocalServerReceiver.java
 */
public class LocalCallbackServer {

    private final int port;
    private final String callbackPath;

    private HttpServer server;
    private Map<String, String> callbackParams;
    private CountDownLatch latch;

    public LocalCallbackServer(int port, String callbackPath) {
        this.port = port;
        this.callbackPath = callbackPath;
    }

    /**
     * Iniciar servidor HTTP
     */
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext(callbackPath, new CallbackHandler());
        server.setExecutor(null); // Use default executor
        server.start();

        latch = new CountDownLatch(1);

        System.out.println("[LocalCallbackServer] Servidor iniciado en http://127.0.0.1:" + port + callbackPath);
    }

    /**
     * Esperar callback (bloquea thread hasta recibir callback o timeout)
     *
     * @param timeoutMs Timeout en milisegundos
     * @return Parámetros del callback (code, state, error, etc.)
     */
    public Map<String, String> waitForCallback(long timeoutMs) throws InterruptedException {
        boolean received = latch.await(timeoutMs, TimeUnit.MILLISECONDS);

        // Detener servidor
        server.stop(0);

        if (!received) {
            throw new RuntimeException("Timeout esperando autorización del usuario");
        }

        return callbackParams;
    }

    /**
     * Handler para el callback de OAuth2
     */
    private class CallbackHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                // Parsear query parameters
                URI requestUri = exchange.getRequestURI();
                String query = requestUri.getQuery();
                callbackParams = queryToMap(query);

                // Mostrar página de éxito al usuario
                String response = buildSuccessPage();

                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(200, response.getBytes(StandardCharsets.UTF_8).length);

                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes(StandardCharsets.UTF_8));
                }

                // Notificar que recibimos el callback
                latch.countDown();

            } catch (Exception e) {
                System.err.println("[CallbackHandler] Error procesando callback: " + e.getMessage());
                e.printStackTrace();

                // Enviar error al browser
                String errorResponse = buildErrorPage(e.getMessage());
                exchange.sendResponseHeaders(500, errorResponse.getBytes(StandardCharsets.UTF_8).length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(errorResponse.getBytes(StandardCharsets.UTF_8));
                }
            }
        }

        /**
         * Convertir query string a Map
         * Ejemplo: "code=abc&state=xyz" -> {code: "abc", state: "xyz"}
         */
        private Map<String, String> queryToMap(String query) {
            Map<String, String> result = new HashMap<>();
            if (query == null || query.isEmpty()) {
                return result;
            }

            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=", 2);
                if (keyValue.length == 2) {
                    result.put(keyValue[0], keyValue[1]);
                }
            }

            return result;
        }

        /**
         * HTML de éxito mostrado al usuario en el browser
         */
        private String buildSuccessPage() {
            return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'>\n" +
                "  <title>Login Exitoso - Blaniel</title>\n" +
                "  <style>\n" +
                "    body {\n" +
                "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n" +
                "      display: flex;\n" +
                "      justify-content: center;\n" +
                "      align-items: center;\n" +
                "      height: 100vh;\n" +
                "      margin: 0;\n" +
                "      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n" +
                "    }\n" +
                "    .container {\n" +
                "      background: white;\n" +
                "      padding: 40px;\n" +
                "      border-radius: 12px;\n" +
                "      box-shadow: 0 10px 40px rgba(0,0,0,0.2);\n" +
                "      text-align: center;\n" +
                "      max-width: 400px;\n" +
                "    }\n" +
                "    h1 { color: #667eea; margin-bottom: 10px; }\n" +
                "    p { color: #555; line-height: 1.6; }\n" +
                "    .checkmark {\n" +
                "      width: 80px;\n" +
                "      height: 80px;\n" +
                "      border-radius: 50%;\n" +
                "      display: block;\n" +
                "      stroke-width: 3;\n" +
                "      stroke: #4bb71b;\n" +
                "      stroke-miterlimit: 10;\n" +
                "      margin: 10% auto;\n" +
                "      box-shadow: inset 0px 0px 0px #4bb71b;\n" +
                "      animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;\n" +
                "    }\n" +
                "    .checkmark__circle {\n" +
                "      stroke-dasharray: 166;\n" +
                "      stroke-dashoffset: 166;\n" +
                "      stroke-width: 3;\n" +
                "      stroke-miterlimit: 10;\n" +
                "      stroke: #4bb71b;\n" +
                "      fill: none;\n" +
                "      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;\n" +
                "    }\n" +
                "    .checkmark__check {\n" +
                "      transform-origin: 50% 50%;\n" +
                "      stroke-dasharray: 48;\n" +
                "      stroke-dashoffset: 48;\n" +
                "      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;\n" +
                "    }\n" +
                "    @keyframes stroke { 100% { stroke-dashoffset: 0; } }\n" +
                "    @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }\n" +
                "    @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 30px #4bb71b; } }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class='container'>\n" +
                "    <svg class='checkmark' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52'>\n" +
                "      <circle class='checkmark__circle' cx='26' cy='26' r='25' fill='none'/>\n" +
                "      <path class='checkmark__check' fill='none' d='M14.1 27.2l7.1 7.2 16.7-16.8'/>\n" +
                "    </svg>\n" +
                "    <h1>¡Login Exitoso!</h1>\n" +
                "    <p>Te has autenticado correctamente con Google.</p>\n" +
                "    <p><strong>Puedes cerrar esta ventana y volver a Minecraft.</strong></p>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
        }

        /**
         * HTML de error
         */
        private String buildErrorPage(String errorMessage) {
            return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'>\n" +
                "  <title>Error - Blaniel</title>\n" +
                "  <style>\n" +
                "    body {\n" +
                "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n" +
                "      display: flex;\n" +
                "      justify-content: center;\n" +
                "      align-items: center;\n" +
                "      height: 100vh;\n" +
                "      margin: 0;\n" +
                "      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);\n" +
                "    }\n" +
                "    .container {\n" +
                "      background: white;\n" +
                "      padding: 40px;\n" +
                "      border-radius: 12px;\n" +
                "      box-shadow: 0 10px 40px rgba(0,0,0,0.2);\n" +
                "      text-align: center;\n" +
                "      max-width: 400px;\n" +
                "    }\n" +
                "    h1 { color: #f5576c; }\n" +
                "    p { color: #555; line-height: 1.6; }\n" +
                "    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class='container'>\n" +
                "    <h1>❌ Error</h1>\n" +
                "    <p>Ocurrió un error durante la autenticación:</p>\n" +
                "    <p><code>" + errorMessage + "</code></p>\n" +
                "    <p>Puedes cerrar esta ventana e intentar nuevamente.</p>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
        }
    }
}
```

### 4.5. BrowserLauncher.java

```java
package com.blaniel.minecraft.oauth;

import java.awt.Desktop;
import java.net.URI;

/**
 * Abre el browser del sistema de forma cross-platform
 *
 * Soporta:
 * - Windows (Desktop.browse)
 * - macOS (Desktop.browse o comando `open`)
 * - Linux (Desktop.browse o comando `xdg-open`)
 *
 * Basado en: java.awt.Desktop API
 * https://docs.oracle.com/javase/8/docs/api/java/awt/Desktop.html
 */
public class BrowserLauncher {

    /**
     * Abrir URL en el browser del sistema
     *
     * @param url URL a abrir
     * @return true si se abrió correctamente, false si hubo error
     */
    public static boolean openBrowser(String url) {
        try {
            // Intentar con Desktop API (funciona en la mayoría de sistemas)
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                System.out.println("[BrowserLauncher] Browser abierto con Desktop.browse()");
                return true;
            }

            // Fallback para sistemas sin Desktop API
            String os = System.getProperty("os.name").toLowerCase();

            if (os.contains("win")) {
                // Windows: usar cmd /c start
                Runtime.getRuntime().exec("cmd /c start " + url);
                System.out.println("[BrowserLauncher] Browser abierto con cmd (Windows)");
                return true;
            } else if (os.contains("mac")) {
                // macOS: usar comando open
                Runtime.getRuntime().exec("open " + url);
                System.out.println("[BrowserLauncher] Browser abierto con open (macOS)");
                return true;
            } else if (os.contains("nix") || os.contains("nux")) {
                // Linux/Unix: usar xdg-open
                Runtime.getRuntime().exec("xdg-open " + url);
                System.out.println("[BrowserLauncher] Browser abierto con xdg-open (Linux)");
                return true;
            }

            System.err.println("[BrowserLauncher] Sistema operativo no soportado: " + os);
            return false;

        } catch (Exception e) {
            System.err.println("[BrowserLauncher] Error al abrir browser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
```

### 4.6. Modificación de LoginScreen.java

```java
package com.blaniel.minecraft.screen;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.config.BlanielConfig;
import com.blaniel.minecraft.network.BlanielAPIClient;
import com.blaniel.minecraft.oauth.OAuth2Client;
import com.mojang.blaze3d.systems.RenderSystem;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.TextFieldWidget;
import net.minecraft.text.Text;

/**
 * Pantalla de login para Blaniel MC
 *
 * Permite al usuario:
 * 1. Iniciar sesión con Google (OAuth2) - RECOMENDADO
 * 2. Iniciar sesión con email y contraseña (tradicional)
 */
public class LoginScreen extends Screen {

    private final Screen parent;

    // Email/Password fields
    private TextFieldWidget emailField;
    private TextFieldWidget passwordField;
    private ButtonWidget loginButton;

    // OAuth button
    private ButtonWidget googleLoginButton;

    private String errorMessage = "";
    private boolean loggingIn = false;
    private boolean firstRender = true;

    // Google OAuth2 configuration
    private static final String GOOGLE_CLIENT_ID = "TU_CLIENT_ID.apps.googleusercontent.com";
    private static final String REDIRECT_URI = "http://127.0.0.1:8888/callback";

    public LoginScreen(Screen parent) {
        super(Text.literal("Iniciar Sesión en Blaniel"));
        this.parent = parent;
        BlanielMod.LOGGER.info("LoginScreen constructor llamado");
    }

    @Override
    protected void init() {
        super.init();

        int centerX = this.width / 2;
        int startY = this.height / 2 - 80;

        // ===== GOOGLE LOGIN BUTTON (PRINCIPAL) =====
        this.googleLoginButton = ButtonWidget.builder(
            Text.literal("🔐 Iniciar Sesión con Google"),
            (button) -> this.attemptGoogleLogin()
        )
        .dimensions(centerX - 150, startY, 300, 30)
        .build();
        this.addDrawableChild(this.googleLoginButton);

        // ===== SEPARATOR =====
        // Texto "o" será renderizado en render()

        // ===== EMAIL/PASSWORD LOGIN (ALTERNATIVA) =====

        // Email field
        this.emailField = new TextFieldWidget(
            this.textRenderer,
            centerX - 150,
            startY + 70,
            300,
            20,
            Text.literal("Email")
        );
        this.emailField.setMaxLength(100);
        this.emailField.setPlaceholder(Text.literal("tu@email.com"));
        this.addSelectableChild(this.emailField);

        // Password field
        this.passwordField = new TextFieldWidget(
            this.textRenderer,
            centerX - 150,
            startY + 110,
            300,
            20,
            Text.literal("Contraseña")
        );
        this.passwordField.setMaxLength(100);
        this.passwordField.setPlaceholder(Text.literal("Contraseña"));
        this.addSelectableChild(this.passwordField);

        // Login button (email/password)
        this.loginButton = ButtonWidget.builder(
            Text.literal("Iniciar Sesión"),
            (button) -> this.attemptEmailLogin()
        )
        .dimensions(centerX - 100, startY + 150, 200, 20)
        .build();
        this.addDrawableChild(this.loginButton);

        // Cancel button
        this.addDrawableChild(ButtonWidget.builder(
            Text.literal("Cancelar"),
            (button) -> this.close()
        )
        .dimensions(centerX - 100, startY + 180, 200, 20)
        .build());
    }

    /**
     * Login con Google OAuth2 (RECOMENDADO)
     */
    private void attemptGoogleLogin() {
        this.loggingIn = true;
        this.googleLoginButton.active = false;
        this.loginButton.active = false;
        this.errorMessage = "Abriendo navegador...";

        String apiUrl = BlanielMod.CONFIG.getApiUrl();

        OAuth2Client oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID, REDIRECT_URI, apiUrl);

        oauthClient.authorize().thenAccept(response -> {
            if (this.client != null) {
                this.client.execute(() -> {
                    if (response.success && response.token != null) {
                        // Login exitoso
                        BlanielConfig.UserData userData = new BlanielConfig.UserData(
                            response.user.id,
                            response.user.email,
                            response.user.name,
                            response.user.plan
                        );

                        BlanielMod.CONFIG.login(response.token, userData);

                        if (this.client.player != null) {
                            this.client.player.sendMessage(
                                Text.literal("§a[Blaniel] §fInicio de sesión exitoso. ¡Bienvenido " + response.user.name + "!"),
                                false
                            );
                        }

                        this.close();
                    } else {
                        // Login fallido
                        this.errorMessage = response.error != null ? response.error : "Error al iniciar sesión con Google";
                        this.loggingIn = false;
                        this.googleLoginButton.active = true;
                        this.loginButton.active = true;
                    }
                });
            }
        }).exceptionally(ex -> {
            if (this.client != null) {
                this.client.execute(() -> {
                    this.errorMessage = "Error: " + ex.getMessage();
                    this.loggingIn = false;
                    this.googleLoginButton.active = true;
                    this.loginButton.active = true;
                });
            }
            return null;
        });
    }

    /**
     * Login con email y contraseña (ALTERNATIVA)
     */
    private void attemptEmailLogin() {
        String email = this.emailField.getText().trim();
        String password = this.passwordField.getText();

        // Validación básica
        if (email.isEmpty()) {
            this.errorMessage = "Por favor ingresa tu email";
            return;
        }

        if (password.isEmpty()) {
            this.errorMessage = "Por favor ingresa tu contraseña";
            return;
        }

        if (!email.contains("@")) {
            this.errorMessage = "Email inválido";
            return;
        }

        // Deshabilitar botones mientras se procesa
        this.loggingIn = true;
        this.loginButton.active = false;
        this.googleLoginButton.active = false;
        this.errorMessage = "Iniciando sesión...";

        String apiUrl = BlanielMod.CONFIG.getApiUrl();

        BlanielAPIClient.login(apiUrl, email, password).thenAccept(response -> {
            if (this.client != null) {
                this.client.execute(() -> {
                    if (response.success && response.token != null) {
                        // Login exitoso
                        BlanielConfig.UserData userData = new BlanielConfig.UserData(
                            response.user.id,
                            response.user.email,
                            response.user.name,
                            response.user.plan
                        );

                        BlanielMod.CONFIG.login(response.token, userData);

                        if (this.client.player != null) {
                            this.client.player.sendMessage(
                                Text.literal("§a[Blaniel] §fInicio de sesión exitoso. ¡Bienvenido " + response.user.name + "!"),
                                false
                            );
                        }

                        this.close();
                    } else {
                        // Login fallido
                        this.errorMessage = response.error != null ? response.error : "Error al iniciar sesión";
                        this.loggingIn = false;
                        this.loginButton.active = true;
                        this.googleLoginButton.active = true;
                    }
                });
            }
        }).exceptionally(ex -> {
            if (this.client != null) {
                this.client.execute(() -> {
                    this.errorMessage = "Error de conexión: " + ex.getMessage();
                    this.loggingIn = false;
                    this.loginButton.active = true;
                    this.googleLoginButton.active = true;
                });
            }
            return null;
        });
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        if (firstRender) {
            BlanielMod.LOGGER.info("LoginScreen.render() llamado por primera vez");
            firstRender = false;
        }

        this.renderBackground(context);

        // Título principal
        context.drawCenteredTextWithShadow(
            this.textRenderer,
            this.title,
            this.width / 2,
            20,
            0xFFFFFF
        );

        // Subtítulo
        context.drawCenteredTextWithShadow(
            this.textRenderer,
            Text.literal("Elige tu método de inicio de sesión"),
            this.width / 2,
            40,
            0xAAAAAA
        );

        // Separator "o" entre Google y email/password
        int centerY = this.height / 2 - 20;
        context.drawCenteredTextWithShadow(
            this.textRenderer,
            Text.literal("─── o ───"),
            this.width / 2,
            centerY,
            0x888888
        );

        // Labels para email/password
        context.drawTextWithShadow(
            this.textRenderer,
            Text.literal("Email:"),
            this.width / 2 - 150,
            this.height / 2 - 2,
            0xFFFFFF
        );

        context.drawTextWithShadow(
            this.textRenderer,
            Text.literal("Contraseña:"),
            this.width / 2 - 150,
            this.height / 2 + 38,
            0xFFFFFF
        );

        // Renderizar widgets
        this.emailField.render(context, mouseX, mouseY, delta);
        this.passwordField.render(context, mouseX, mouseY, delta);
        super.render(context, mouseX, mouseY, delta);

        // Mensaje de error/estado
        if (!this.errorMessage.isEmpty()) {
            int color = this.loggingIn ? 0xFFFF00 : 0xFF5555;
            context.drawCenteredTextWithShadow(
                this.textRenderer,
                Text.literal(this.errorMessage),
                this.width / 2,
                this.height / 2 + 120,
                color
            );
        }
    }

    @Override
    public void close() {
        BlanielMod.LOGGER.info("LoginScreen.close() llamado");
        if (this.client != null) {
            this.client.setScreen(this.parent);
        }
    }

    @Override
    public boolean keyPressed(int keyCode, int scanCode, int modifiers) {
        // Enter para login (solo si no está procesando)
        if ((keyCode == 257 || keyCode == 335) && !this.loggingIn) {
            this.attemptEmailLogin();
            return true;
        }

        // ESC para cerrar
        if (keyCode == 256) {
            this.close();
            return true;
        }

        return super.keyPressed(keyCode, scanCode, modifiers);
    }

    @Override
    public boolean shouldPause() {
        return false;
    }
}
```

### 4.7. Configuración en Mod

**Archivo:** `Juego/Blaniel-MC/src/main/resources/blaniel-mc.properties`

```properties
# Google OAuth2 Configuration
google.client.id=TU_CLIENT_ID.apps.googleusercontent.com
google.redirect.uri=http://127.0.0.1:8888/callback
```

**Cargar desde archivo:**

```java
// En BlanielMod.java o BlanielConfig.java
private static String loadGoogleClientId() {
    try {
        Properties props = new Properties();
        InputStream is = BlanielMod.class.getResourceAsStream("/blaniel-mc.properties");
        props.load(is);
        return props.getProperty("google.client.id");
    } catch (Exception e) {
        System.err.println("Error cargando google.client.id: " + e.getMessage());
        return "";
    }
}
```

---

## 5. Seguridad

### 5.1. PKCE (Proof Key for Code Exchange)

**¿Por qué es necesario?**

PKCE previene ataques de intercepción de authorization code. Sin PKCE, un atacante podría:

1. Interceptar el authorization code del callback a localhost
2. Usar ese code para obtener access_token
3. Acceder a la cuenta del usuario

**Cómo funciona PKCE:**

1. Cliente genera `code_verifier` (string aleatorio de 128 chars)
2. Cliente calcula `code_challenge = SHA256(code_verifier)`
3. Cliente envía `code_challenge` en authorization request
4. Google almacena `code_challenge` asociado al authorization code
5. Cliente envía `code_verifier` al intercambiar code por tokens
6. Google verifica que `SHA256(code_verifier) == code_challenge`
7. Si no coincide, rechaza el token exchange

**Implementación en el código:**

```java
// PKCE.java
String codeVerifier = PKCE.generateCodeVerifier(); // 128 chars aleatorios
String codeChallenge = PKCE.generateCodeChallenge(codeVerifier); // SHA256

// OAuth2Client.java - Authorization request
params.put("code_challenge", codeChallenge);
params.put("code_challenge_method", "S256");

// OAuth2Client.java - Token exchange
params.put("code_verifier", codeVerifier);
```

**RFC 7636:** [https://datatracker.ietf.org/doc/html/rfc7636](https://datatracker.ietf.org/doc/html/rfc7636)

**Fuente:** [OAuth.net - PKCE](https://oauth.net/2/pkce/)

### 5.2. State Parameter (CSRF Protection)

**¿Por qué es necesario?**

El parámetro `state` previene ataques CSRF (Cross-Site Request Forgery). Sin `state`, un atacante podría:

1. Crear un authorization request malicioso
2. Engañar al usuario para que lo autorice
3. El callback iría al atacante, no a la víctima

**Cómo funciona:**

1. Cliente genera `state` (string aleatorio de 32+ chars)
2. Cliente envía `state` en authorization request
3. Google incluye `state` en el callback redirect
4. Cliente verifica que `state` recibido == `state` enviado
5. Si no coincide, rechaza el callback (posible CSRF)

**Implementación en el código:**

```java
// OAuth2Client.java - Generar state
state = PKCE.generateRandomString(32);

// Authorization request
params.put("state", state);

// Validar en callback
String receivedState = callbackParams.get("state");
if (!state.equals(receivedState)) {
    throw new RuntimeException("Estado CSRF inválido");
}
```

**Fuente:** [Google Developers - OAuth2 State](https://developers.google.com/identity/protocols/oauth2/native-app)

### 5.3. Localhost Security

**¿Es seguro usar http://localhost?**

**SÍ**, porque:

1. El redirect **nunca sale de la máquina del usuario**
2. El authorization code se transmite localmente
3. PKCE protege contra intercepción del code

**Google recomienda:**

- Usar `127.0.0.1` en lugar de `localhost` (evita problemas con DNS/firewall)
- No usar custom URI schemes (obsoleto, vulnerable a impersonation)
- Usar puerto dinámico si es posible (o fallback a otros puertos)

**Fuente:** [Google Developers - OAuth2 Native Apps](https://developers.google.com/identity/protocols/oauth2/native-app)

### 5.4. Token Storage

**¿Dónde guardar el JWT de Blaniel?**

Actualmente se guarda en `.minecraft/config/blaniel-mc.json` (plain text).

**Mejoras de seguridad:**

1. **Encriptación:** Encriptar JWT antes de guardarlo
   ```java
   String encrypted = AES.encrypt(jwt, secretKey);
   config.setJwtToken(encrypted);
   ```

2. **OS Keychain:**
   - Windows: Windows Credential Manager
   - macOS: Keychain Access
   - Linux: Secret Service API (gnome-keyring, kwallet)

3. **Refresh Tokens:** Guardar refresh_token encriptado y regenerar access_token al expirar

**Recomendación:** Para MVP, dejar plain text. Para producción, implementar encriptación con AES.

### 5.5. Client ID Security

**¿Es seguro exponer el Client ID en el código del mod?**

**SÍ**, porque:

1. Google OAuth2 para desktop apps **no requiere client_secret**
2. El Client ID es público por diseño (aparece en URLs)
3. PKCE protege contra uso malicioso del Client ID

**Google confirma:**

> "For OAuth 2.0 for Mobile & Desktop Apps, there is no client secret. The client ID is your application's identifier. It is not a secret."

**Fuente:** [Google OAuth2 FAQ](https://developers.google.com/identity/protocols/oauth2/native-app)

### 5.6. Checklist de Seguridad

- [x] **PKCE con S256** (SHA-256)
- [x] **State parameter** para CSRF
- [x] **Code verifier** de alta entropía (128 chars)
- [x] **Redirect URI** estricto (`127.0.0.1` no `*`)
- [x] **System browser** (no embedded webview)
- [x] **ID token validation** en backend
- [x] **JWT con expiración** (30 días)
- [ ] **Token encryption** en config file (opcional)
- [ ] **Refresh token** para sesiones largas (opcional)

---

## 6. Alternativas Evaluadas

### 6.1. Authorization Code Flow + PKCE (RECOMENDADO) ✅

**Descripción:** Flujo OAuth2 estándar con system browser + localhost callback + PKCE.

**Ventajas:**
- ✅ **Estándar OAuth2:** RFC 6749 + RFC 7636 compliant
- ✅ **Seguro:** PKCE protege contra intercepción de code
- ✅ **Cross-platform:** Funciona en Windows, macOS, Linux
- ✅ **UX aceptable:** User ve página de Google oficial
- ✅ **SSO:** Si user ya tiene sesión en Google, login automático
- ✅ **Sin dependencias pesadas:** Solo `java.net.http` y `com.sun.net.httpserver`

**Desventajas:**
- ❌ Context switch: User debe cambiar a browser
- ❌ Puerto ocupado: Si 8888 está en uso, debe usar fallback

**Decisión:** **ESTA ES LA OPCIÓN ELEGIDA**

**Fuentes:**
- [Google Developers - OAuth2 for Native Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Michał Silski - OAuth 2.0 in Desktop Apps](https://melmanm.github.io/misc/2023/02/13/article6-oauth20-authorization-in-desktop-applicaions.html)

### 6.2. Device Authorization Grant Flow

**Descripción:** User ve un código en Minecraft, va a URL en browser, ingresa código.

**Flujo:**
1. Mod solicita device code a Google
2. Google retorna `user_code` (ej: "ABCD-EFGH") y `verification_uri`
3. Mod muestra código en pantalla
4. User abre `https://google.com/device` en browser
5. User ingresa código "ABCD-EFGH"
6. Mod hace polling hasta que user autoriza

**Ventajas:**
- ✅ No requiere localhost server
- ✅ Funciona en devices sin browser integrado
- ✅ User puede usar otro dispositivo (ej: teléfono)

**Desventajas:**
- ❌ UX pobre: User debe copiar código manualmente
- ❌ Polling: Mod debe hacer requests cada 5 segundos
- ❌ Google puede no soportar Device Flow para todos los clientes

**Decisión:** **DESCARTADO** (UX inferior a Authorization Code Flow)

**Fuente:** [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628)

### 6.3. Embedded WebView (OAuth en GUI de Minecraft)

**Descripción:** Integrar browser dentro del mod usando JavaFX WebView o similar.

**Ventajas:**
- ✅ No context switch: Todo en Minecraft
- ✅ Captura de callback sin localhost server

**Desventajas:**
- ❌ **Violación de seguridad:** User no puede verificar HTTPS certificate
- ❌ **Keystroke logging:** Mod podría capturar credenciales
- ❌ **Dependencias pesadas:** JavaFX, WebView (100+ MB)
- ❌ **Google bloquea embedded webviews:** Detecta user-agent y rechaza login
- ❌ **Contra OAuth 2.0 BCP:** RFC 8252 prohíbe embedded webviews

**Decisión:** **DESCARTADO** (inseguro y bloqueado por Google)

**Fuente:** [RFC 8252 - OAuth 2.0 for Native Apps](https://datatracker.ietf.org/doc/html/rfc8252)

### 6.4. Custom URI Scheme (blaniel://callback)

**Descripción:** Registrar custom protocol handler `blaniel://` en el OS.

**Flujo:**
1. Mod registra `blaniel://callback` con el OS
2. Authorization request usa `redirect_uri=blaniel://callback`
3. Google redirige a `blaniel://callback?code=...`
4. OS abre Minecraft con el URL
5. Mod captura código del URL

**Ventajas:**
- ✅ No requiere localhost server
- ✅ Callback directo al mod

**Desventajas:**
- ❌ **Android deprecado:** Google bloqueó custom schemes en Android
- ❌ **Vulnerable a impersonation:** Cualquier app puede registrar `blaniel://`
- ❌ **Complejidad cross-platform:** Cada OS requiere registro diferente
- ❌ **Google recomienda NO usar custom schemes**

**Decisión:** **DESCARTADO** (obsoleto y vulnerable)

**Fuente:** [Google Developers - Loopback IP vs Custom Schemes](https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_loopback)

### 6.5. Proxy Web Server (Blaniel backend como proxy)

**Descripción:** Backend de Blaniel actúa como proxy OAuth.

**Flujo:**
1. Mod abre browser con URL de Blaniel: `https://blaniel.com/oauth/start?session=xyz`
2. Backend genera authorization URL y redirige a Google
3. Google redirige a `https://blaniel.com/oauth/callback?code=...`
4. Backend intercambia code por tokens
5. Backend genera JWT de Blaniel y muestra página con token
6. User copia token manualmente al mod

**Ventajas:**
- ✅ No requiere localhost server
- ✅ Backend controla el flujo completo

**Desventajas:**
- ❌ **UX horrible:** User debe copiar/pegar token manualmente
- ❌ **Token expuesto:** Token visible en browser (screenshot, history)
- ❌ **Complejidad backend:** Requiere sesiones temporales en backend

**Decisión:** **DESCARTADO** (UX muy mala)

### 6.6. Comparación de Alternativas

| Alternativa | Seguridad | UX | Complejidad | Cross-Platform | Recomendación Google |
|-------------|-----------|----|-----------|--------------|--------------------|
| **Authorization Code + PKCE** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Recomendado |
| Device Flow | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Alternativa |
| Embedded WebView | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ❌ Bloqueado |
| Custom URI Scheme | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ❌ Obsoleto |
| Proxy Web Server | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❓ No mencionado |

**Conclusión:** **Authorization Code Flow + PKCE** es la mejor opción.

---

## 7. Plan de Implementación

### 7.1. Fases del Proyecto

#### **Fase 1: Configuración Inicial** (1-2 horas)

**Backend:**
- [ ] Crear OAuth2 Client ID en Google Cloud Console
- [ ] Configurar redirect URIs: `http://127.0.0.1:8888/callback`
- [ ] Instalar `google-auth-library` en backend
- [ ] Agregar `GOOGLE_CLIENT_ID` a `.env`

**Mod:**
- [ ] Crear carpeta `oauth/` en `src/main/java/com/blaniel/minecraft/`
- [ ] Agregar `google.client.id` a resources

**Verificación:**
- [ ] TSC sin errores
- [ ] Google Client ID funcional (probar con curl)

#### **Fase 2: Implementación Backend** (2-3 horas)

**Tareas:**
- [ ] Crear endpoint `POST /api/auth/minecraft-oauth-login`
- [ ] Implementar validación de `id_token` con Google
- [ ] Implementar auto-registro si usuario no existe
- [ ] Retornar JWT de Blaniel (30 días)
- [ ] Testing con Postman/curl

**Código:**
- [ ] `app/api/auth/minecraft-oauth-login/route.ts`

**Verificación:**
- [ ] Endpoint responde 200 con token válido
- [ ] Endpoint responde 401 con token inválido
- [ ] Nuevo usuario se crea automáticamente
- [ ] Usuario existente recibe token

#### **Fase 3: Implementación PKCE y OAuth2Client** (3-4 horas)

**Tareas:**
- [ ] Implementar `PKCE.java` (code_verifier, code_challenge)
- [ ] Implementar `OAuth2Client.java` (flujo completo)
- [ ] Testing de generación de PKCE codes
- [ ] Testing de construcción de authorization URL

**Código:**
- [ ] `oauth/PKCE.java`
- [ ] `oauth/OAuth2Client.java`

**Verificación:**
- [ ] `code_verifier` tiene 128 chars
- [ ] `code_challenge` es SHA-256 de `code_verifier`
- [ ] Authorization URL tiene todos los parámetros

#### **Fase 4: Implementación LocalCallbackServer** (3-4 horas)

**Tareas:**
- [ ] Implementar `LocalCallbackServer.java` (HTTP server)
- [ ] Implementar `CallbackHandler` (parsear query params)
- [ ] Implementar HTML success/error pages
- [ ] Testing con requests manuales

**Código:**
- [ ] `oauth/LocalCallbackServer.java`

**Verificación:**
- [ ] Servidor inicia en `127.0.0.1:8888`
- [ ] Servidor captura query parameters
- [ ] Servidor muestra página de éxito al user
- [ ] Servidor se detiene después del callback

#### **Fase 5: Implementación BrowserLauncher** (1 hora)

**Tareas:**
- [ ] Implementar `BrowserLauncher.java` (Desktop.browse + fallbacks)
- [ ] Testing en Windows, macOS, Linux

**Código:**
- [ ] `oauth/BrowserLauncher.java`

**Verificación:**
- [ ] Browser se abre en Windows (Desktop.browse)
- [ ] Browser se abre en macOS (Desktop.browse o `open`)
- [ ] Browser se abre en Linux (Desktop.browse o `xdg-open`)

#### **Fase 6: Integración en LoginScreen** (2-3 horas)

**Tareas:**
- [ ] Modificar `LoginScreen.java`
- [ ] Agregar botón "Login with Google"
- [ ] Implementar `attemptGoogleLogin()`
- [ ] Reorganizar layout (Google principal, email/password secundario)
- [ ] Manejar estados: loading, success, error

**Código:**
- [ ] `screen/LoginScreen.java`

**Verificación:**
- [ ] Botón "Login with Google" visible y funcional
- [ ] Login con Google abre browser
- [ ] Login con Google guarda JWT en config
- [ ] Login con Google cierra pantalla y muestra mensaje
- [ ] Login con email/password sigue funcionando

#### **Fase 7: Testing End-to-End** (2-3 horas)

**Escenarios de prueba:**

1. **Happy Path:**
   - [ ] User clickea "Login with Google"
   - [ ] Browser se abre con URL de Google
   - [ ] User autoriza con su cuenta
   - [ ] Callback exitoso, JWT guardado
   - [ ] Mensaje de éxito en Minecraft

2. **User ya tiene sesión en Google:**
   - [ ] Login automático sin ingresar credenciales (SSO)

3. **User cancela autorización:**
   - [ ] Error "El usuario canceló la autorización"
   - [ ] Botones se reactivan

4. **Puerto 8888 ocupado:**
   - [ ] Implementar fallback a puerto dinámico
   - [ ] Testing con puerto ocupado

5. **Browser no se puede abrir:**
   - [ ] Mostrar mensaje: "No se pudo abrir el navegador. Abre manualmente: [URL]"
   - [ ] User puede copiar URL y abrir manualmente

6. **Timeout (user no autoriza en 5 minutos):**
   - [ ] Servidor se detiene
   - [ ] Mensaje de error: "Tiempo de espera agotado"

7. **Token inválido de Google:**
   - [ ] Backend rechaza token
   - [ ] Mensaje de error: "Token de Google inválido"

8. **Backend caído:**
   - [ ] Mensaje de error: "No se pudo conectar al servidor de Blaniel"

**Herramientas:**
- [ ] Testing manual en Minecraft
- [ ] Logs en consola de Minecraft
- [ ] Logs en backend de Blaniel
- [ ] Network inspector (Wireshark/Charles)

#### **Fase 8: Documentación** (1 hora)

**Tareas:**
- [ ] Documentar configuración en README.md del mod
- [ ] Documentar cómo obtener Google Client ID
- [ ] Documentar troubleshooting común
- [ ] Comentarios en código (Javadoc)

**Archivos:**
- [ ] `Juego/Blaniel-MC/README.md`
- [ ] `docs/MINECRAFT_OAUTH2_SETUP.md`

#### **Fase 9: Optimizaciones (Opcional)** (2-3 horas)

**Tareas:**
- [ ] Implementar fallback a Device Flow si localhost falla
- [ ] Implementar refresh tokens
- [ ] Encriptar JWT en config file
- [ ] Agregar telemetría (Google Analytics Events)
- [ ] Agregar loading animation en LoginScreen

### 7.2. Estimación de Complejidad

| Fase | Complejidad | Horas Estimadas | Riesgos |
|------|-------------|-----------------|---------|
| 1. Configuración Inicial | ⭐ Baja | 1-2h | ❌ Google Cloud Console puede ser confuso |
| 2. Backend | ⭐⭐ Media | 2-3h | ❌ Validación de id_token puede fallar |
| 3. PKCE + OAuth2Client | ⭐⭐⭐ Media-Alta | 3-4h | ❌ SHA-256 puede tener bugs |
| 4. LocalCallbackServer | ⭐⭐⭐ Media-Alta | 3-4h | ❌ com.sun.net.httpserver puede tener limitaciones |
| 5. BrowserLauncher | ⭐ Baja | 1h | ❌ Cross-platform puede fallar en Linux |
| 6. LoginScreen Integration | ⭐⭐ Media | 2-3h | ❌ Layout puede verse mal en diferentes resoluciones |
| 7. Testing E2E | ⭐⭐⭐⭐ Alta | 2-3h | ❌ Muchos edge cases |
| 8. Documentación | ⭐ Baja | 1h | - |
| 9. Optimizaciones | ⭐⭐⭐ Media | 2-3h | - |

**Total:** 17-25 horas de desarrollo

### 7.3. Riesgos y Mitigaciones

#### **Riesgo 1: com.sun.net.httpserver no disponible**

**Probabilidad:** Baja
**Impacto:** Alto

**Mitigación:**
- `com.sun.net.httpserver` está en JDK desde Java 6
- Verificar que Minecraft 1.20.1 usa Java 17+ (sí lo hace)
- Si no está, usar librería externa: NanoHTTPD (2 clases, 60KB)

#### **Riesgo 2: Google bloquea redirect a localhost**

**Probabilidad:** Muy Baja
**Impacto:** Crítico

**Mitigación:**
- Google oficialmente soporta `http://127.0.0.1:*` para desktop apps
- Documentación: [Google OAuth2 Native Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- Si bloquean, usar Device Flow como fallback

#### **Riesgo 3: Firewall bloquea puerto 8888**

**Probabilidad:** Media
**Impacto:** Medio

**Mitigación:**
- Puerto 8888 es común para desarrollo, raramente bloqueado
- Implementar fallback a puerto dinámico (8889, 8890, etc.)
- Implementar fallback a Device Flow

#### **Riesgo 4: User no tiene browser instalado**

**Probabilidad:** Muy Baja
**Impacto:** Alto

**Mitigación:**
- En 2026, todos los OS tienen browser por defecto
- Si falla, mostrar URL para que user copie manualmente
- Implementar fallback a Device Flow

#### **Riesgo 5: Backend no valida id_token correctamente**

**Probabilidad:** Baja
**Impacto:** Crítico (seguridad)

**Mitigación:**
- Usar librería oficial: `google-auth-library`
- Testing exhaustivo con tokens válidos e inválidos
- Verificar signature, issuer, audience, expiration

#### **Riesgo 6: Cross-platform issues (Linux, macOS)**

**Probabilidad:** Media
**Impacto:** Medio

**Mitigación:**
- Testing en VM/Docker con diferentes OS
- Implementar fallbacks para cada OS (Desktop.browse, cmd, open, xdg-open)
- Documentar limitaciones conocidas

### 7.4. Checklist de Entrega

**Backend:**
- [ ] Endpoint `POST /api/auth/minecraft-oauth-login` funcional
- [ ] Validación de `id_token` con Google
- [ ] Auto-registro de nuevos usuarios
- [ ] Retorno de JWT (30 días)
- [ ] Testing con Postman/curl

**Mod:**
- [ ] `PKCE.java` implementado
- [ ] `OAuth2Client.java` implementado
- [ ] `LocalCallbackServer.java` implementado
- [ ] `BrowserLauncher.java` implementado
- [ ] `LoginScreen.java` modificado
- [ ] Botón "Login with Google" funcional
- [ ] Login con email/password sigue funcionando
- [ ] JWT guardado en config
- [ ] Mensaje de éxito/error en Minecraft

**Testing:**
- [ ] Happy path funciona
- [ ] SSO funciona (user ya logueado en Google)
- [ ] User cancela autorización
- [ ] Timeout handling
- [ ] Error handling (backend caído, token inválido)
- [ ] Cross-platform (Windows, macOS, Linux)

**Documentación:**
- [ ] README.md actualizado
- [ ] Setup guide para Google OAuth2
- [ ] Troubleshooting guide
- [ ] Javadoc en código

**Optimizaciones (Opcional):**
- [ ] Refresh tokens
- [ ] JWT encryption
- [ ] Device Flow fallback
- [ ] Telemetría

---

## 8. Referencias y Fuentes

### Documentación Oficial

1. [Google Developers - OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
2. [RFC 6749 - OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
3. [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636)
4. [RFC 8252 - OAuth 2.0 for Native Apps](https://datatracker.ietf.org/doc/html/rfc8252)
5. [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628)
6. [OAuth.net - PKCE](https://oauth.net/2/pkce/)
7. [OWASP - OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

### Librerías y Herramientas

8. [Google OAuth Client Library for Java](https://developers.google.com/api-client-library/java/google-oauth-java-client/)
9. [google-auth-library-java](https://github.com/googleapis/google-auth-library-java)
10. [oauth-desktop (Java Desktop OAuth Library)](https://github.com/giannivh/oauth-desktop)
11. [ScribeJava (Simple OAuth Library)](https://github.com/scribejava/scribejava)
12. [Better Auth - OAuth Provider Plugin](https://www.better-auth.com/docs/plugins/oauth-provider)

### Casos de Éxito

13. [DevAuth - Minecraft Mod](https://github.com/DJtheRedstoner/DevAuth)
14. [OAuth Mod - CurseForge](https://www.curseforge.com/minecraft/mc-mods/oauth)
15. [OauthMC - Modrinth Plugin](https://modrinth.com/plugin/oauthmc)
16. [Mc-Auth.com - OAuth2 Implementation](https://github.com/Mc-Auth-com/Mc-Auth)
17. [Minecraft Wiki - Microsoft Authentication](https://minecraft.wiki/w/Microsoft_authentication)

### Artículos Técnicos

18. [Michał Silski - OAuth 2.0 in Desktop Applications](https://melmanm.github.io/misc/2023/02/13/article6-oauth20-authorization-in-desktop-applicaions.html)
19. [Auth0 - Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce)
20. [Medium - OAuth 2.0 Security Best Practices](https://medium.com/@basakerdogan/oauth-2-0-security-best-practices-from-authorization-code-to-pkce-beccdbe7ec35)
21. [Auth0 Blog - Demystifying OAuth Security: State vs. Nonce vs. PKCE](https://auth0.com/blog/demystifying-oauth-security-state-vs-nonce-vs-pkce/)

### Java Documentation

22. [Java Desktop API](https://docs.oracle.com/javase/8/docs/api/java/awt/Desktop.html)
23. [Google OAuth LocalServerReceiver Source Code](https://github.com/googleapis/google-oauth-java-client/blob/main/google-oauth-client-jetty/src/main/java/com/google/api/client/extensions/jetty/auth/oauth2/LocalServerReceiver.java)

---

## 9. Apéndice: Código de Ejemplo Completo

### Flujo de Testing Manual

```bash
# 1. Iniciar backend de Blaniel
cd /mnt/SSD/Proyectos/AI/creador-inteligencias
npm run dev

# 2. Compilar mod de Minecraft
cd Juego/Blaniel-MC
./gradlew build

# 3. Copiar mod a .minecraft/mods
cp build/libs/blaniel-mc-0.1.0-alpha.jar ~/.minecraft/mods/

# 4. Iniciar Minecraft 1.20.1 con Fabric
# (usar launcher oficial)

# 5. En Minecraft, abrir LoginScreen y clickear "Login with Google"

# 6. Verificar en consola de Minecraft:
# [OAuth2] Authorization URL: https://accounts.google.com/...
# [OAuth2] Esperando autorización del usuario...
# [LocalCallbackServer] Servidor iniciado en http://127.0.0.1:8888/callback

# 7. Browser se abre con Google OAuth

# 8. User autoriza

# 9. Verificar en consola:
# [OAuth2] Código de autorización recibido
# [OAuth2] Tokens recibidos de Google
# [OAuth2] Login exitoso en Blaniel

# 10. Verificar JWT guardado en config
cat ~/.minecraft/config/blaniel-mc.json
# Debería contener: { "jwtToken": "eyJ...", "userData": {...} }
```

### Testing con curl (Backend)

```bash
# Obtener id_token de Google (manual para testing)
# 1. Ir a https://accounts.google.com/o/oauth2/v2/auth?...
# 2. Copiar id_token del response

# Test endpoint de Blaniel
curl -X POST http://localhost:3000/api/auth/minecraft-oauth-login \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkMD..."
  }'

# Response esperado:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiresIn": 2592000,
#   "user": {
#     "id": "user_123",
#     "email": "test@gmail.com",
#     "name": "Test User",
#     "plan": "FREE"
#   },
#   "agents": [],
#   "message": "Login exitoso con Google"
# }
```

---

## 10. Conclusión

La implementación de Google OAuth2 en Blaniel-MC usando **Authorization Code Flow + PKCE** es:

1. **Técnicamente viable:** Basada en RFC 6749, RFC 7636, RFC 8252
2. **Segura:** PKCE + State parameter + ID token validation
3. **Cross-platform:** Funciona en Windows, macOS, Linux
4. **Sin dependencias pesadas:** Solo `java.net.http` y `com.sun.net.httpserver`
5. **Respaldada por Google:** Método oficialmente recomendado para desktop apps
6. **Probada en producción:** Usada por Minecraft vanilla (Microsoft), DevAuth, OAuth Mod

**Complejidad estimada:** 17-25 horas de desarrollo

**Riesgo general:** Bajo (tecnología madura y bien documentada)

**Recomendación:** **Proceder con implementación**

---

**Documento generado:** 2026-01-28
**Última actualización:** 2026-01-28
**Versión:** 1.0
