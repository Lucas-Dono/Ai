/**
 * Test de Wikipedia API para Character Research
 *
 * Prueba la cobertura y calidad de información de Wikipedia API
 * para diferentes tipos de personajes (reales, ficción, históricos, etc.)
 */

interface WikipediaSearchResult {
  pages?: Array<{
    id: number;
    key: string;
    title: string;
    excerpt: string;
    description?: string;
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
  }>;
}

interface WikipediaSummary {
  title: string;
  description: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
  content_urls?: {
    desktop: {
      page: string;
    };
  };
}

/**
 * Busca un personaje en Wikipedia usando su API de búsqueda
 */
async function searchWikipedia(query: string): Promise<WikipediaSearchResult | null> {
  try {
    // API de búsqueda de Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=3`;

    console.log(`\n🔍 Buscando: "${query}"`);
    console.log(`📡 URL: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Testing)',
      },
    });

    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status}`);
      return null;
    }

    const data = await response.json() as WikipediaSearchResult;

    if (!data.pages || data.pages.length === 0) {
      console.log(`❌ No se encontraron resultados`);
      return null;
    }

    console.log(`✅ Encontrados ${data.pages.length} resultados:`);
    data.pages.forEach((page, idx) => {
      console.log(`   ${idx + 1}. ${page.title}`);
      console.log(`      ${page.description || page.excerpt.substring(0, 80)}...`);
    });

    return data;
  } catch (error) {
    console.error(`❌ Error en búsqueda:`, error);
    return null;
  }
}

/**
 * Obtiene el resumen detallado de una página de Wikipedia
 */
async function getWikipediaSummary(pageTitle: string): Promise<WikipediaSummary | null> {
  try {
    // API de resumen de Wikipedia (más detallada)
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;

    console.log(`\n📄 Obteniendo resumen de: "${pageTitle}"`);

    const response = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Testing)',
      },
    });

    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status}`);
      return null;
    }

    const data = await response.json() as WikipediaSummary;

    console.log(`✅ Resumen obtenido:`);
    console.log(`   Título: ${data.title}`);
    console.log(`   Descripción: ${data.description}`);
    console.log(`   Extracto (${data.extract.length} caracteres):`);
    console.log(`   "${data.extract.substring(0, 200)}..."`);
    if (data.thumbnail) {
      console.log(`   📸 Imagen: ${data.thumbnail.source}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Error obteniendo resumen:`, error);
    return null;
  }
}

/**
 * Busca en Wikipedia en español (fallback)
 */
async function searchWikipediaES(query: string): Promise<WikipediaSummary | null> {
  try {
    const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    console.log(`\n🇪🇸 Buscando en Wikipedia español: "${query}"`);

    const response = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Testing)',
      },
    });

    if (!response.ok) {
      console.log(`❌ No encontrado en español`);
      return null;
    }

    const data = await response.json() as WikipediaSummary;
    console.log(`✅ Encontrado en español`);
    console.log(`   Extracto: "${data.extract.substring(0, 150)}..."`);

    return data;
  } catch (error) {
    console.error(`❌ Error en búsqueda español:`, error);
    return null;
  }
}

/**
 * Casos de prueba
 */
const TEST_CASES = [
  // PERSONAJES DE FICCIÓN - MCU/Marvel
  { name: "Tony Stark", category: "Ficción (MCU)", expectedFound: true },
  { name: "Iron Man", category: "Ficción (MCU)", expectedFound: true },
  { name: "Peter Parker", category: "Ficción (Marvel)", expectedFound: true },
  { name: "Bruce Wayne", category: "Ficción (DC)", expectedFound: true },

  // PERSONAJES HISTÓRICOS
  { name: "Albert Einstein", category: "Histórico (Ciencia)", expectedFound: true },
  { name: "Marie Curie", category: "Histórico (Ciencia)", expectedFound: true },
  { name: "Leonardo da Vinci", category: "Histórico (Arte)", expectedFound: true },
  { name: "Cleopatra", category: "Histórico (Historia)", expectedFound: true },

  // CELEBRIDADES
  { name: "Marilyn Monroe", category: "Celebridad (Cine)", expectedFound: true },
  { name: "Elvis Presley", category: "Celebridad (Música)", expectedFound: true },
  { name: "Michael Jackson", category: "Celebridad (Música)", expectedFound: true },

  // ANIME/MANGA
  { name: "Naruto Uzumaki", category: "Ficción (Anime)", expectedFound: true },
  { name: "Goku", category: "Ficción (Anime)", expectedFound: true },
  { name: "Luffy", category: "Ficción (Anime)", expectedFound: true },

  // PERSONAJES MENOS CONOCIDOS
  { name: "Yuki Nagato", category: "Ficción (Anime nicho)", expectedFound: false },
  { name: "Makise Kurisu", category: "Ficción (Anime nicho)", expectedFound: false },

  // PERSONAJES ORIGINALES (no deberían encontrarse)
  { name: "María García", category: "Original", expectedFound: false },
  { name: "Juan Pérez", category: "Original", expectedFound: false },
];

/**
 * Ejecutar tests
 */
async function runTests() {
  console.log("════════════════════════════════════════════════════════");
  console.log("🧪 TEST DE WIKIPEDIA API - CHARACTER RESEARCH SYSTEM");
  console.log("════════════════════════════════════════════════════════\n");

  let totalTests = TEST_CASES.length;
  let passed = 0;
  let failed = 0;
  let foundCount = 0;
  let notFoundCount = 0;

  for (const testCase of TEST_CASES) {
    console.log("\n" + "─".repeat(60));
    console.log(`📝 TEST: ${testCase.name} (${testCase.category})`);
    console.log(`   Esperado: ${testCase.expectedFound ? "✅ Encontrar" : "❌ No encontrar"}`);
    console.log("─".repeat(60));

    // Buscar en Wikipedia
    const searchResult = await searchWikipedia(testCase.name);

    if (searchResult && searchResult.pages && searchResult.pages.length > 0) {
      foundCount++;

      // Obtener resumen del primer resultado
      const firstResult = searchResult.pages[0];
      await getWikipediaSummary(firstResult.title);

      // Verificar expectativa
      if (testCase.expectedFound) {
        console.log("\n✅ TEST PASSED - Personaje encontrado como esperado");
        passed++;
      } else {
        console.log("\n⚠️ TEST FAILED - Personaje encontrado pero no se esperaba");
        failed++;
      }
    } else {
      notFoundCount++;

      // Intentar en español como fallback
      console.log("\n🔄 Intentando en Wikipedia español...");
      const esResult = await searchWikipediaES(testCase.name);

      if (esResult) {
        foundCount++;
        notFoundCount--;

        if (testCase.expectedFound) {
          console.log("\n✅ TEST PASSED - Encontrado en español");
          passed++;
        } else {
          console.log("\n⚠️ TEST FAILED - Encontrado en español pero no esperado");
          failed++;
        }
      } else {
        if (!testCase.expectedFound) {
          console.log("\n✅ TEST PASSED - No encontrado como esperado");
          passed++;
        } else {
          console.log("\n❌ TEST FAILED - No encontrado pero se esperaba");
          failed++;
        }
      }
    }

    // Delay para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resultados finales
  console.log("\n" + "═".repeat(60));
  console.log("📊 RESULTADOS FINALES");
  console.log("═".repeat(60));
  console.log(`Total de tests: ${totalTests}`);
  console.log(`✅ Pasados: ${passed} (${((passed/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Fallados: ${failed} (${((failed/totalTests)*100).toFixed(1)}%)`);
  console.log(`\n📈 Cobertura de Wikipedia:`);
  console.log(`   Encontrados: ${foundCount}/${totalTests} (${((foundCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`   No encontrados: ${notFoundCount}/${totalTests} (${((notFoundCount/totalTests)*100).toFixed(1)}%)`);

  console.log("\n" + "═".repeat(60));
  console.log("💡 CONCLUSIÓN");
  console.log("═".repeat(60));

  if (foundCount / totalTests >= 0.8) {
    console.log("✅ Wikipedia tiene EXCELENTE cobertura (≥80%)");
    console.log("   Recomendación: Usar Wikipedia API como fuente principal");
  } else if (foundCount / totalTests >= 0.6) {
    console.log("⚠️ Wikipedia tiene BUENA cobertura (60-80%)");
    console.log("   Recomendación: Usar Wikipedia + fallback a LLM");
  } else {
    console.log("❌ Wikipedia tiene cobertura LIMITADA (<60%)");
    console.log("   Recomendación: Considerar otras fuentes o usar principalmente LLM");
  }
}

// Ejecutar tests
runTests().catch(console.error);
