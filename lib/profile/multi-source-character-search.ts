/**
 * Multi-Source Character Search System
 *
 * Sistema que busca personajes en múltiples fuentes gratuitas:
 * - Wikipedia (históricos, celebridades)
 * - AniList (anime/manga)
 * - Fandom Wikis (videojuegos, series, películas)
 * - URL personalizada (cualquier web)
 *
 * 100% GRATIS - Sin API keys necesarias
 */

// Import undici for better timeout control
// Node.js native fetch uses undici internally but doesn't expose socket timeout controls
import { Agent, fetch as undiciFetch } from 'undici';

// Timeout configuration (in milliseconds)
const WIKIPEDIA_TIMEOUT = 60000; // 60 seconds for Wikipedia API
const ANILIST_TIMEOUT = 30000; // 30 seconds for AniList GraphQL API (fast and reliable)
const FANDOM_TIMEOUT = 60000; // 60 seconds for Fandom
const CUSTOM_URL_TIMEOUT = 30000; // 30 seconds for custom URLs

/**
 * Custom Undici Agent with extended socket timeouts
 * This solves the ETIMEDOUT issue by configuring connection-level timeouts
 *
 * CRITICAL: Node.js native fetch uses undici but doesn't allow configuring socket timeouts
 * AbortController only controls request timeout, NOT socket/connection timeout
 *
 * See: https://github.com/nodejs/undici/issues/4215
 * See: https://github.com/nodejs/undici/issues/1373
 */
const extendedTimeoutAgent = new Agent({
  // Socket connection timeout (time to establish connection)
  connectTimeout: 60000, // 60 seconds (was defaulting to ~10s)

  // Keep-alive timeout for persistent connections
  keepAliveTimeout: 60000, // 60 seconds

  // Maximum time for entire request (including DNS, connection, headers, body)
  bodyTimeout: 70000, // 70 seconds (slightly higher than request timeout)

  // Maximum time to wait for response headers
  headersTimeout: 60000, // 60 seconds

  // Enable keep-alive for better performance
  keepAliveMaxTimeout: 600000, // 10 minutes

  // Pipelining disabled for compatibility
  pipelining: 0,
});

/**
 * Fetch with timeout using undici dispatcher
 * This properly controls BOTH request timeout AND socket timeout
 *
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Request timeout in milliseconds
 * @returns Fetch response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Use undici fetch with custom dispatcher for socket timeout control
    const response = await undiciFetch(url, {
      ...options,
      signal: controller.signal,
      // CRITICAL: Pass custom dispatcher with extended timeouts
      // @ts-ignore - undici types may not match exactly but this works
      dispatcher: extendedTimeoutAgent,
    } as any);
    clearTimeout(timeoutId);
    // @ts-ignore - undici Response is compatible with standard Response
    return response as Response;
  } catch (error) {
    clearTimeout(timeoutId);
    // Re-throw with better error message
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export interface CharacterSearchResult {
  id: string; // Identificador único
  source: 'wikipedia' | 'anilist' | 'fandom' | 'custom' | 'jikan' | 'mal' | 'tmdb' | 'tvmaze' | 'igdb' | 'myanimelist' | 'wikidata' | 'firecrawl';
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
async function searchWikipedia(name: string, limit: number = 5): Promise<CharacterSearchResult[]> {
  const results: CharacterSearchResult[] = [];

  try {
    // Buscar en inglés con límite más alto
    const enUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=${limit * 2}`;
    const enResponse = await fetchWithTimeout(
      enUrl,
      {
        headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
      },
      WIKIPEDIA_TIMEOUT
    );

    if (enResponse.ok) {
      const enData = await enResponse.json();

      if (enData.pages && Array.isArray(enData.pages)) {
        for (const page of enData.pages) {
          // Filtrar páginas de desambiguación de forma más estricta
          const excerpt = page.excerpt?.toLowerCase() || '';
          const title = page.title?.toLowerCase() || '';
          const description = page.description?.toLowerCase() || '';

          // Skip disambiguation pages
          if (
            excerpt.includes('may refer to') ||
            excerpt.includes('disambiguation') ||
            description.includes('disambiguation') ||
            description.includes('topics referred to')
          ) {
            continue;
          }

          // Fix image URL (Wikipedia returns URLs without protocol)
          let imageUrl = page.thumbnail?.url;
          if (imageUrl && imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`;
          }

          // Calculate confidence based on title match
          let confidence = 0.7;
          if (title === name.toLowerCase()) {
            confidence = 0.95; // Exact match
          } else if (title.includes(name.toLowerCase())) {
            confidence = 0.85; // Contains search term
          }

          results.push({
            id: `wikipedia-en-${page.id}`,
            source: 'wikipedia',
            name: page.title,
            description: page.excerpt?.replace(/<[^>]*>/g, '') || page.description || 'Sin descripción disponible',
            imageUrl,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
            confidence,
          });

          // Stop when we have enough results
          if (results.length >= limit) break;
        }
      }
    }

    // Si no hay suficientes resultados, buscar en español
    if (results.length < 3) {
      const esUrl = `https://es.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=${limit * 2}`;
      const esResponse = await fetchWithTimeout(
        esUrl,
        {
          headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
        },
        WIKIPEDIA_TIMEOUT
      );

      if (esResponse.ok) {
        const esData = await esResponse.json();

        if (esData.pages && Array.isArray(esData.pages)) {
          for (const page of esData.pages) {
            const excerpt = page.excerpt?.toLowerCase() || '';
            const description = page.description?.toLowerCase() || '';

            // Skip disambiguation pages
            if (
              excerpt.includes('puede referirse a') ||
              excerpt.includes('desambiguación') ||
              description.includes('desambiguación')
            ) {
              continue;
            }

            // Fix image URL
            let imageUrl = page.thumbnail?.url;
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = `https:${imageUrl}`;
            }

            const title = page.title?.toLowerCase() || '';
            let confidence = 0.65;
            if (title === name.toLowerCase()) {
              confidence = 0.9;
            } else if (title.includes(name.toLowerCase())) {
              confidence = 0.8;
            }

            results.push({
              id: `wikipedia-es-${page.id}`,
              source: 'wikipedia',
              name: page.title,
              description: page.excerpt?.replace(/<[^>]*>/g, '') || page.description || 'Sin descripción disponible',
              imageUrl,
              url: `https://es.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
              confidence,
            });

            if (results.length >= limit) break;
          }
        }
      }
    }

  } catch (error) {
    // Wikipedia errors are non-fatal - just log and continue
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('[MultiSourceSearch] Wikipedia timeout - continuing without Wikipedia results');
    } else {
      console.error('[MultiSourceSearch] Error en Wikipedia:', error);
    }
  }

  return results;
}

/**
 * Busca en AniList (API oficial de anime/manga) - Anime/Manga
 * Reemplaza a Jikan debido a problemas de conectividad IPv6
 */
async function searchAniList(name: string, limit: number = 3): Promise<CharacterSearchResult[]> {
  const results: CharacterSearchResult[] = [];

  try {
    // AniList GraphQL API
    const url = 'https://graphql.anilist.co';

    // GraphQL query for character search
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          characters(search: $search) {
            id
            name {
              full
              native
              alternative
            }
            image {
              large
              medium
            }
            description
            siteUrl
            media {
              nodes {
                title {
                  romaji
                  english
                }
                type
              }
            }
          }
        }
      }
    `;

    const variables = {
      search: name,
      page: 1,
      perPage: limit,
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      },
      ANILIST_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();

      if (data.data?.Page?.characters && Array.isArray(data.data.Page.characters)) {
        for (const character of data.data.Page.characters) {
          if (!character.name?.full) continue;

          // Crear descripción limpia (AniList usa HTML en description)
          let description = character.description || 'Personaje de anime/manga';
          // Remover tags HTML
          description = description.replace(/<[^>]*>/g, '');
          // Limitar longitud
          if (description.length > 150) {
            description = description.substring(0, 150) + '...';
          }

          // Construir nombre alternativo si existe
          const alternativeNames = character.name.alternative?.filter(Boolean).join(', ') || '';
          const nativeName = character.name.native || '';

          results.push({
            id: `anilist-${character.id}`,
            source: 'anilist',
            name: character.name.full,
            description,
            imageUrl: character.image?.large || character.image?.medium,
            url: character.siteUrl,
            rawData: JSON.stringify({
              ...character,
              alternativeNames,
              nativeName,
            }), // Guardamos todo para uso posterior
            confidence: 0.9, // AniList es muy preciso para anime
          });
        }
      }
    }
  } catch (error) {
    // AniList errors are NON-FATAL - search continues with other sources
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        console.log('[MultiSourceSearch] ⏱️ AniList timeout - continuing without anime results');
      } else if (error.message.includes('fetch failed')) {
        console.log('[MultiSourceSearch] 🌐 AniList connection failed - continuing without anime results');
      } else {
        console.error('[MultiSourceSearch] ❌ AniList error:', error.message);
      }
    }
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

        const response = await fetchWithTimeout(
          url,
          {},
          FANDOM_TIMEOUT
        );
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
    // Fandom errors are non-fatal - just log and continue
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('[MultiSourceSearch] Fandom timeout - continuing without Fandom results');
    } else {
      console.error('[MultiSourceSearch] Error en Fandom:', error);
    }
  }

  return results;
}

/**
 * Busca información desde una URL personalizada
 * Usa web scraping básico para extraer información
 */
export async function searchCustomUrl(url: string): Promise<CharacterSearchResult | null> {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CreadorInteligencias/1.0)',
        },
      },
      CUSTOM_URL_TIMEOUT
    );

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
    // Custom URL errors are non-fatal - just log and return null
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('[MultiSourceSearch] Custom URL timeout');
    } else {
      console.error('[MultiSourceSearch] Error en URL personalizada:', error);
    }
    return null;
  }
}

/**
 * Common celebrity/character surname suggestions
 * Used to expand single-name searches for better results
 */
const COMMON_CELEBRITY_SURNAMES: Record<string, string[]> = {
  'marilyn': ['Monroe', 'Manson'],
  'elvis': ['Presley'],
  'madonna': ['Ciccone', 'Louise'],
  'prince': ['Rogers Nelson'],
  'cher': ['Sarkisian'],
  'beyonce': ['Knowles'],
  'shakira': ['Ripoll'],
  'rihanna': ['Fenty'],
  'adele': ['Adkins'],
  'drake': ['Graham'],
  'eminem': ['Mathers'],
};

/**
 * Función principal: Busca en todas las fuentes en paralelo
 */
export async function searchCharacterMultiSource(
  name: string,
  options: {
    includeWikipedia?: boolean;
    includeAniList?: boolean;
    includeFandom?: boolean;
    limit?: number;
  } = {}
): Promise<MultiSourceSearchResult> {
  const {
    includeWikipedia = true,
    includeAniList = true,
    includeFandom = true,
    limit = 20, // Increased default limit
  } = options;

  console.log('[MultiSourceSearch] 🔍 Buscando:', name);

  // Check if we should suggest full names for single-name searches
  const nameLower = name.toLowerCase().trim();
  const words = nameLower.split(/\s+/);
  const suggestedSearches: string[] = [name];

  // If single word and we have suggestions, add them
  if (words.length === 1 && COMMON_CELEBRITY_SURNAMES[nameLower]) {
    const surnames = COMMON_CELEBRITY_SURNAMES[nameLower];
    for (const surname of surnames) {
      suggestedSearches.push(`${name} ${surname}`);
    }
    console.log('[MultiSourceSearch] 💡 Búsquedas sugeridas:', suggestedSearches);
  }

  // Buscar en todas las fuentes en paralelo (including suggested searches)
  const searches: Promise<CharacterSearchResult[]>[] = [];

  // Search for each suggested name
  for (let i = 0; i < suggestedSearches.length; i++) {
    const searchName = suggestedSearches[i];
    const isOriginalSearch = i === 0;

    if (includeWikipedia) {
      searches.push(searchWikipedia(searchName, Math.ceil(limit / 2))); // Más resultados de Wikipedia
    }

    // ONLY search AniList with original query to avoid rate limiting
    if (includeAniList && isOriginalSearch) {
      searches.push(searchAniList(searchName, Math.ceil(limit / 3))); // Más resultados de anime
    }

    if (includeFandom && isOriginalSearch) {
      // Also limit Fandom to original search to reduce API load
      searches.push(searchFandom(searchName, 2)); // Más resultados de Fandom
    }
  }

  // Use Promise.allSettled instead of Promise.all to handle failures gracefully
  const allResults = await Promise.allSettled(searches);

  // Log any failed searches
  const failedSearches = allResults.filter(r => r.status === 'rejected');
  if (failedSearches.length > 0) {
    console.log(`[MultiSourceSearch] ⚠️  ${failedSearches.length} source(s) failed, continuing with available results`);
  }

  // Combinar y ordenar resultados (ignoring rejected promises)
  const combined = allResults
    .filter((result): result is PromiseFulfilledResult<CharacterSearchResult[]> =>
      result.status === 'fulfilled'
    )
    .flatMap(result => result.value);

  // Ordenar por confianza (mayor primero)
  combined.sort((a, b) => b.confidence - a.confidence);

  // Remove duplicates (same name from different sources)
  const uniqueResults = combined.filter((result, index, self) =>
    index === self.findIndex((r) => r.name.toLowerCase() === result.name.toLowerCase())
  );

  // Limitar resultados
  const results = uniqueResults.slice(0, limit);

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

        const response = await fetchWithTimeout(
          summaryUrl,
          {
            headers: { 'User-Agent': 'CreadorInteligencias/1.0 (Educational)' },
          },
          WIKIPEDIA_TIMEOUT
        );

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

      case 'anilist': {
        // Extraer anilist_id del id
        const anilistId = result.id.replace('anilist-', '');

        // AniList GraphQL query for full character details
        const query = `
          query ($id: Int) {
            Character(id: $id) {
              id
              name {
                full
                native
                alternative
              }
              description
              age
              gender
              bloodType
              dateOfBirth {
                year
                month
                day
              }
              media {
                nodes {
                  title {
                    romaji
                    english
                  }
                  type
                }
              }
              siteUrl
            }
          }
        `;

        const response = await fetchWithTimeout(
          'https://graphql.anilist.co',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              query,
              variables: { id: parseInt(anilistId) },
            }),
          },
          ANILIST_TIMEOUT
        );

        if (response.ok) {
          const data = await response.json();
          const char = data.data?.Character;

          if (char) {
            // Limpiar descripción HTML
            const cleanDescription = char.description?.replace(/<[^>]*>/g, '') || 'Sin información adicional';

            // Construir información de medios
            const mediaList = char.media?.nodes
              ?.slice(0, 3)
              .map((m: any) => `${m.title.romaji || m.title.english} (${m.type})`)
              .join(', ') || 'N/A';

            return `
NOMBRE: ${char.name.full}
${char.name.native ? `NOMBRE NATIVO: ${char.name.native}` : ''}
${char.name.alternative?.length ? `NOMBRES ALTERNATIVOS: ${char.name.alternative.filter(Boolean).join(', ')}` : ''}
${char.age ? `EDAD: ${char.age}` : ''}
${char.gender ? `GÉNERO: ${char.gender}` : ''}
${char.bloodType ? `TIPO DE SANGRE: ${char.bloodType}` : ''}

APARECE EN: ${mediaList}

SOBRE EL PERSONAJE:
${cleanDescription}

FUENTE: AniList
ENLACE: ${result.url}
            `.trim();
          }
        }
        break;
      }

      case 'fandom': {
        // Para Fandom, intentar obtener el contenido de la página
        if (result.url) {
          const response = await fetchWithTimeout(
            result.url,
            {},
            FANDOM_TIMEOUT
          );
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
