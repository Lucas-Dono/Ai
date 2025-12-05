export interface SimpleWeather {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";
  description: string;
  city: string;
  country: string;
  localTime: string;
  geohash?: string; // Zona geográfica (precision 4 = ~20km cuadrados)
}

export interface WeatherZone {
  geohash: string;
  weather: SimpleWeather;
  expires: number;
  activeAgents: number; // Cuántos personajes hay en conversación en esta zona
}

export interface CityCoordinates {
  latitude: number;
  longitude: number;
  expires: number;
}

export interface GeocodingResult {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    timezone: string;
  }>;
}

export interface WeatherAPIResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
    windspeed: number;
    winddirection: number;
  };
  timezone: string;
}
