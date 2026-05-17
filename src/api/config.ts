// Centralized configuration for OpenWeatherMap API
export const API_CONFIG = {
  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO: "https://api.openweathermap.org/geo/1.0",
  // Provide empty string fallback to prevent "undefined" stringification
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || "",
  DEFAULT_PARAMS: {
    units: "metric",
    appid: import.meta.env.VITE_OPENWEATHER_API_KEY || "",
  },
};