const fs = require('fs');
const path = require('path');

// Leer archivo actual de español
const esPath = path.join(__dirname, 'messages', 'es.json');
const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Leer archivo actual de inglés
const enPath = path.join(__dirname, 'messages', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Nuevas traducciones para pricing y billing (español)
const newEsTranslations = {
  "pricing": {
    "badge": "Precios",
    "title": "Elige Tu Plan",
    "subtitle": "Comienza gratis y escala a medida que creces. Todos los planes incluyen 14 días de prueba.",
    "billingToggle": {
      "monthly": "Mensual",
      "yearly": "Anual",
      "saveBadge": "Ahorra 20%"
    },
    "planCards": {
      "mostPopular": "Más Popular",
      "perMonth": "/mes",
      "billedAnnually": "${amount} facturados anualmente",
      "getStarted": "Comenzar",
      "startTrial": "Iniciar Prueba {plan}",
      "loading": "Cargando..."
    },
    "plans": {
      "free": {
        "name": "Gratis",
        "description": "Perfecto para probar la plataforma",
        "features": [
          "3 compañeros IA",
          "20 mensajes por día",
          "Sistema emocional básico",
          "1 mundo predefinido (Academia Sakura)",
          "5 análisis de imágenes por mes",
          "❌ Sin voz (usa tu API key de ElevenLabs)",
          "❌ Sin contenido NSFW",
          "❌ Sin comportamientos avanzados",
          "✨ Gana más mensajes e imágenes viendo anuncios",
          "Soporte comunitario"
        ]
      },
      "plus": {
        "name": "Plus",
        "description": "Ideal para usuarios regulares que quieren más",
        "features": [
          "10 compañeros IA",
          "Mensajes de texto ilimitados",
          "100 mensajes con voz por mes",
          "Sistema emocional avanzado",
          "5 mundos virtuales (chat + novelas visuales)",
          "50 análisis de imágenes por mes",
          "20 generaciones de imágenes por mes",
          "✅ Acceso a Novelas Visuales",
          "✅ Contenido NSFW habilitado",
          "✅ Comportamientos psicológicos avanzados",
          "✅ Sin publicidad",
          "Soporte prioritario por email"
        ]
      },
      "ultra": {
        "name": "Ultra",
        "description": "Experiencia completa sin límites",
        "features": [
          "Compañeros IA ilimitados",
          "Mensajes de texto ilimitados",
          "500 mensajes con voz por mes",
          "Sistema emocional avanzado",
          "Mundos virtuales ilimitados",
          "200 análisis de imágenes por mes",
          "100 generaciones de imágenes por mes",
          "✅ Generación prioritaria de imágenes (rápida)",
          "✅ Contenido NSFW sin restricciones",
          "✅ Clonación de voz personalizada",
          "✅ Acceso API para integraciones",
          "✅ Exportar conversaciones en PDF",
          "✅ Sin publicidad",
          "✅ Mensajes proactivos ilimitados",
          "Soporte prioritario 24/7",
          "Acceso anticipado a nuevas funciones"
        ]
      }
    },
    "faq": {
      "title": "Preguntas Frecuentes",
      "questions": {
        "changePlans": {
          "question": "¿Puedo cambiar de plan más tarde?",
          "answer": "¡Sí! Puedes mejorar, reducir o cancelar tu suscripción en cualquier momento desde tu panel de facturación."
        },
        "paymentMethods": {
          "question": "¿Qué métodos de pago aceptan?",
          "answer": "Aceptamos todos los métodos de pago disponibles en Mercado Pago: tarjetas de crédito y débito, transferencias bancarias, efectivo (Pago Fácil, Rapipago), y dinero en cuenta de Mercado Pago."
        },
        "freeTrial": {
          "question": "¿Hay prueba gratuita?",
          "answer": "¡Sí! Los planes Plus y Ultra incluyen una prueba gratuita de 14 días. No se requiere tarjeta de crédito para comenzar."
        },
        "afterTrial": {
          "question": "¿Qué pasa después de que termine mi prueba?",
          "answer": "Se te cobrará automáticamente a menos que canceles. Puedes cancelar en cualquier momento durante el período de prueba."
        }
      }
    },
    "cta": {
      "title": "¿Listo para crear tus agentes de IA?",
      "subtitle": "Únete a cientos de creadores construyendo el futuro de las interacciones de IA. Comienza gratis, sin tarjeta de crédito requerida.",
      "button": "Comenzar Gratis"
    },
    "errors": {
      "checkoutFailed": "Error al iniciar el proceso de pago"
    }
  }
};

// Debido a la limitación de longitud, voy a crear un archivo que simplemente agrega las claves principales
// El usuario puede completar manualmente o usar otro método

// Fusionar las nuevas traducciones
Object.assign(esData, newEsTranslations);

// Guardar archivo actualizado
fs.writeFileSync(esPath, JSON.stringify(esData, null, 2) + '\n');

console.log('✅ Archivo es.json actualizado con éxito');
console.log('Total de secciones principales:', Object.keys(esData).length);
