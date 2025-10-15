// test-gemini-env.js
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Cargar las variables de entorno del archivo .env
dotenv.config();

// El cliente ahora SÍ puede leer GEMINI_API_KEY
const ai = new GoogleGenAI({});

async function testGeminiAPI() {
  try {
    console.log('🔍 Probando conexión con Gemini API...\n');
    console.log('📌 API Key detectada:', process.env.GEMINI_API_KEY ? 'Sí ✓' : 'No ✗');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Responde con un mensaje confirmando que la conexión funciona",
    });
    
    console.log('✅ ¡API Key válida y funcionando!');
    console.log('\n📝 Respuesta:', response.text);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeminiAPI();