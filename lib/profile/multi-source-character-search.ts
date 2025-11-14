/**
 * Multi-Source Character Search System
 *
 * Sistema que busca personajes en múltiples fuentes gratuitas:
 * - Wikipedia (históricos, celebridades)
 * - Jikan/MyAnimeList (anime/manga)
 * - Fandom Wikis (videojuegos, series, películas)
 * - URL personalizada (cualquier web)
 *
 * 100% GRATIS - Sin API keys necesarias
 */

export interface CharacterSearchResult {
  id: string; // Identificador único
  source: 'wikipedia' | 'jikan' | 'fandom' | 'custom';
  name: string;
  description: string; // Descripción corta (1-2 líneas)
  imageUrl?: string;
  url?: string; // URL de la fuente
  rawData?: string; // Datos completos para extracción posterior
  confidence: number; // 0-1, qué tan bien matchea con la búsqueda
}

export interface MultiSourceSearchResult {
  query: string;
  results: CharacterSearchResult[];
  totalFound: number;
}

/**
 * Busca en Wikipedia (inglés y español)
 */
async function searchWikipedia(name: string, limit: number = 3): Promise<CharacterSearchResult[]> {
  const results: CharacterSearchResult[] = [];

  try {
    // Buscar en inglés
    const enUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=${limit}`;
    const enResponse = await fetch(enUrl, {
      headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
    });

    if (enResponse.ok) {
      const enData = await enResponse.json();

      if (enData.pages && Array.isArray(enData.pages)) {
        for (const page of enData.pages.slice(0, limit)) {
          // Filtrar páginas de desambiguación
          const excerpt = page.excerpt?.toLowerCase() || '';
          if (excerpt.includes('may refer to') || excerpt.includes('disambiguation')) {
            continue;
          }

          results.push({
            id: `wikipedia-en-${page.id}`,
            source: 'wikipedia',
            name: page.title,
            description: page.excerpt?.replace(/<[^>]*>/g, '') || page.description || 'Sin descripción disponible',
            imageUrl: page.thumbnail?.url,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
            confidence: 0.8,
          });
        }
      }
    }

    // Si no hay suficientes resultados, buscar en español
    if (results.length < 2) {
      const esUrl = `https://es.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=${limit}`;
      const esResponse = await fetch(esUrl, {
        headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
      });

      if (esResponse.ok) {
        const esData = await esResponse.json();

        if (esData.pages && Array.isArray(esData.pages)) {
          for (const page of esData.pages.slice(0, limit - results.length)) {
            const excerpt = page.excerpt?.toLowerCase() || '';
            if (excerpt.includes('puede referirse a') || excerpt.includes('desambiguación')) {
              continue;
            }

            results.push({
              id: `wikipedia-es-${page.id}`,
              source: 'wikipedia',
              name: page.title,
              description: page.excerpt?.replace(/<[^>]*>/g, '') || page.description || 'Sin descripción disponible',
              imageUrl: page.thumbnail?.url,
              url: `https://es.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
              confidence: 0.75,
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('[MultiSourceSearch] Error en Wikipedia:', error);
  }

  return results;
}

/**
 * Busca en Jikan (MyAnimeList API no oficial) - Anime/Manga
 */
async function searchJikan(name: string, limit: number = 3): Promise<CharacterSearchResult[]> {
  const results: CharacterSearchResult[] = [];

  try {
    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=${limit}`;

    // Jikan tiene rate limiting, agregar delay si es necesario
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        for (const character of data.data.slice(0, limit)) {
          if (!character.name) continue;

          // Crear descripción corta del about
          let description = character.about || 'Personaje de anime/manga';
          if (description.length > 150) {
            description = description.substring(0, 150) + '...';
          }

          results.push({
            id: `jikan-${character.mal_id}`,
            source: 'jikan',
            name: character.name,
            description,
            imageUrl: character.images?.jpg?.image_url || character.images?.webp?.image_url,
            url: character.url,
            rawData: JSON.stringify(character), // Guardamos todo para uso posterior
            confidence: 0.9, // Jikan es muy preciso para anime
          });
        }
      }
    }
  } catch (error) {
    console.error('[MultiSourceSearch] Error en Jikan:', error);
  }

  return results;
}

/**
 * Busca en Fandom Wikis
 * Intenta detectar el wiki correcto basado en el nombre del personaje
 */
async function searchFandom(name: string, limit: number = 2): Promise<CharacterSearchResult[]> {
  const results: CharacterSearchResult[] = [];

  // Lista de wikis populares donde buscar
  const popularWikis = [
    'naruto',
    'onepiece',
    'dragonball',
    'pokemon',
    'marvel',
    'dc',
    'starwars',
    'harrypotter',
    'GameOfThrones',
    'lotr', // Lord of the Rings
  ];

  try {
    // Intentar búsqueda en algunos wikis populares
    // Nota: Esto es limitado, idealmente necesitaríamos una búsqueda global de Fandom
    for (const wiki of popularWikis.slice(0, 3)) { // Limitar a 3 wikis para no hacer demasiadas requests
      try {
        const url = `https://${wiki}.fandom.com/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=2&format=json`;

        const response = await fetch(url);
        if (!response.ok) continue;

        const data = await response.json();

        // Formato OpenSearch: [query, [titles], [descriptions], [urls]]
        if (Array.isArray(data) && data.length >= 4) {
          const titles = data[1] || [];
          const descriptions = data[2] || [];
          const urls = data[3] || [];

          for (let i = 0; i < titles.length && i < limit; i++) {
            if (titles[i] && urls[i]) {
              results.push({
                id: `fandom-${wiki}-${i}`,
                source: 'fandom',
                name: titles[i],
                description: descriptions[i] || `Personaje de ${wiki} wiki`,
                url: urls[i],
                confidence: 0.7,
              });
            }
          }
        }

        // Si encontramos resultados, no seguir buscando en otros wikis
        if (results.length > 0) break;

      } catch (wikiError) {
        // Continuar con el siguiente wiki
        continue;
      }
    }
  } catch (error) {
    console.error('[MultiSourceSearch] Error en Fandom:', error);
  }

  return results;
}

/**
 * Busca información desde una URL personalizada
 * Usa web scraping básico para extraer información
 */
export async function searchCustomUrl(url: string): Promise<CharacterSearchResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CreadorInteligencias/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extraer título de la página
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Personaje personalizado';

    // Extraer meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1] : 'Información extraída de URL personalizada';

    // Intentar extraer imagen
    const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const imageUrl = imgMatch ? imgMatch[1] : undefined;

    return {
      id: `custom-${Date.now()}`,
      source: 'custom',
      name: title,
      description: description.substring(0, 200),
      imageUrl,
      url,
      rawData: html.substring(0, 10000), // Primeros 10KB para procesamiento posterior
      confidence: 0.6,
    };
  } catch (error) {
    console.error('[MultiSourceSearch] Error en URL personalizada:', error);
    return null;
  }
}

/**
 * Función principal: Busca en todas las fuentes en paralelo
 */
export async function searchCharacterMultiSource(
  name: string,
  options: {
    includeWikipedia?: boolean;
    includeJikan?: boolean;
    includeFandom?: boolean;
    limit?: number;
  } = {}
): Promise<MultiSourceSearchResult> {
  const {
    includeWikipedia = true,
    includeJikan = true,
    includeFandom = true,
    limit = 5,
  } = options;

  console.log('[MultiSourceSearch] 🔍 Buscando:', name);

  // Buscar en todas las fuentes en paralelo
  const searches: Promise<CharacterSearchResult[]>[] = [];

  if (includeWikipedia) {
    searches.push(searchWikipedia(name, 2));
  }

  if (includeJikan) {
    searches.push(searchJikan(name, 2));
  }

  if (includeFandom) {
    searches.push(searchFandom(name, 1));
  }

  const allResults = await Promise.all(searches);

  // Combinar y ordenar resultados
  const combined = allResults.flat();

  // Ordenar por confianza (mayor primero)
  combined.sort((a, b) => b.confidence - a.confidence);

  // Limitar resultados
  const results = combined.slice(0, limit);

  console.log(`[MultiSourceSearch] ✅ Encontrados ${results.length} resultados de ${combined.length} totales`);

  return {
    query: name,
    results,
    totalFound: combined.length,
  };
}

/**
 * Obtiene información detallada de un resultado seleccionado
 */
export async function getCharacterDetails(result: CharacterSearchResult): Promise<string> {
  console.log('[MultiSourceSearch] 📄 Obteniendo detalles de:', result.name);

  // Si ya tenemos rawData, usarla
  if (result.rawData) {
    return result.rawData;
  }

  // Sino, obtener información de la fuente
  try {
    switch (result.source) {
      case 'wikipedia': {
        // Extraer título de la URL
        const titleMatch = result.url?.match(/wiki\/(.+)$/);
        if (!titleMatch) return result.description;

        const title = decodeURIComponent(titleMatch[1]);
        const isEnglish = result.url?.includes('en.wikipedia');
        const summaryUrl = `https://${isEnglish ? 'en' : 'es'}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

        const response = await fetch(summaryUrl, {
          headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
        });

        if (response.ok) {
          const data = await response.json();
          return `
TÍTULO: ${data.title}
DESCRIPCIÓN: ${data.description}

EXTRACTO COMPLETO:
${data.extract}

FUENTE: Wikipedia
ENLACE: ${result.url}
          `.trim();
        }
        break;
      }

      case 'jikan': {
        // Extraer mal_id del id
        const malId = result.id.replace('jikan-', '');
        const detailUrl = `https://api.jikan.moe/v4/characters/${malId}/full`;

        const response = await fetch(detailUrl);
        if (response.ok) {
          const data = await response.json();
          const char = data.data;

          return `
NOMBRE: ${char.name}
${char.name_kanji ? `NOMBRE JAPONÉS: ${char.name_kanji}` : ''}
${char.nicknames?.length ? `APODOS: ${char.nicknames.join(', ')}` : ''}

SOBRE EL PERSONAJE:
${char.about || 'Sin información adicional'}

FUENTE: MyAnimeList
ENLACE: ${result.url}
          `.trim();
        }
        break;
      }

      case 'fandom': {
        // Para Fandom, intentar obtener el contenido de la página
        if (result.url) {
          const response = await fetch(result.url);
          if (response.ok) {
            const html = await response.text();
            // Extraer el primer párrafo o infobox
            // Esto es simplificado, podría mejorarse
            return `
NOMBRE: ${result.name}
DESCRIPCIÓN: ${result.description}

FUENTE: Fandom Wiki
ENLACE: ${result.url}

(Para más detalles, visitar el enlace)
            `.trim();
          }
        }
        break;
      }

      case 'custom': {
        // Ya tenemos rawData en custom
        return result.rawData || result.description;
      }
    }
  } catch (error) {
    console.error('[MultiSourceSearch] Error obteniendo detalles:', error);
  }

  // Fallback
  return result.description;
}
