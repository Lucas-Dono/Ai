// test-gemini-api.js
import { GoogleGenAI } from "@google/genai";

// Reemplaza 'TU_API_KEY_AQUI' con tu API key real
const API_KEY = 'AIzaSyBNsw5K6eeZN8knh5p5VQgr_vtMWGl-1rg';

// Inicializar el cliente con tu API key
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function testGeminiAPI() {
  try {
    console.log('🔍 Probando conexión con Gemini API...\n');
    
    // Hacer una solicitud simple
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Di 'Hola, tu API key está funcionando correctamente!' en español",
    });
    
    console.log('✅ Conexión exitosa!');
    console.log('\n📝 Respuesta de Gemini:');
    console.log(response.text);
    
  } catch (error) {
    console.error('❌ Error al conectar con la API:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n⚠️  Posibles problemas:');
      console.error('- Verifica que tu API key sea correcta');
      console.error('- Asegúrate de haber habilitado la API en Google AI Studio');
      console.error('- Revisa que no haya espacios extras en la API key');
    }
  }
}

// Ejecutar la prueba
testGeminiAPI();