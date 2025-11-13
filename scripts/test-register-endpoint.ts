/**
 * Script de prueba para el endpoint de registro
 *
 * Este script verifica que el endpoint /api/auth/register funcione correctamente
 * y devuelva JSON en todos los casos.
 *
 * Uso: npx tsx scripts/test-register-endpoint.ts
 */

async function testRegisterEndpoint() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const endpoint = `${baseUrl}/api/auth/register`;

  console.log("🧪 Probando endpoint de registro...");
  console.log(`📍 URL: ${endpoint}\n`);

  // Test 1: Datos válidos
  console.log("1️⃣ Test: Registro con datos válidos");
  try {
    const testData = {
      name: "Usuario Test",
      email: `test-${Date.now()}@example.com`,
      password: "Password123!",
      birthDate: "2000-01-01",
    };

    console.log("📤 Enviando:", JSON.stringify(testData, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Content-Type: ${response.headers.get("content-type")}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ ERROR: La respuesta NO es JSON");
      console.log("Respuesta completa:");
      console.log(await response.text());
      return;
    }

    const data = await response.json();
    console.log("✅ Respuesta JSON válida:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Datos inválidos (sin email)
  console.log("2️⃣ Test: Registro sin email (debería fallar con JSON)");
  try {
    const testData = {
      name: "Usuario Test",
      password: "Password123!",
      birthDate: "2000-01-01",
    };

    console.log("📤 Enviando:", JSON.stringify(testData, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Content-Type: ${response.headers.get("content-type")}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ ERROR: La respuesta NO es JSON");
      console.log("Respuesta completa:");
      console.log(await response.text());
      return;
    }

    const data = await response.json();
    console.log("✅ Respuesta JSON válida:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Email ya registrado
  console.log("3️⃣ Test: Registro con email duplicado");
  try {
    const testData = {
      name: "Usuario Test",
      email: "duplicate@example.com",
      password: "Password123!",
      birthDate: "2000-01-01",
    };

    console.log("📤 Enviando:", JSON.stringify(testData, null, 2));

    // Primer intento
    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Primer intento - Status: ${response1.status}`);

    // Segundo intento (debería fallar)
    const response2 = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Segundo intento - Status: ${response2.status} ${response2.statusText}`);
    console.log(`📥 Content-Type: ${response2.headers.get("content-type")}`);

    const contentType = response2.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ ERROR: La respuesta NO es JSON");
      console.log("Respuesta completa:");
      console.log(await response2.text());
      return;
    }

    const data = await response2.json();
    console.log("✅ Respuesta JSON válida:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 4: Edad inválida
  console.log("4️⃣ Test: Registro con edad menor a 13 años");
  try {
    const testData = {
      name: "Usuario Test",
      email: `test-young-${Date.now()}@example.com`,
      password: "Password123!",
      birthDate: "2020-01-01", // Muy joven
    };

    console.log("📤 Enviando:", JSON.stringify(testData, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Content-Type: ${response.headers.get("content-type")}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ ERROR: La respuesta NO es JSON");
      console.log("Respuesta completa:");
      console.log(await response.text());
      return;
    }

    const data = await response.json();
    console.log("✅ Respuesta JSON válida:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error);
  }

  console.log("\n✅ Todas las pruebas completadas");
}

// Ejecutar tests
testRegisterEndpoint().catch((error) => {
  console.error("❌ Error ejecutando tests:", error);
  process.exit(1);
});
