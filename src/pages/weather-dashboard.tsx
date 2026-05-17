import {
  useForecastQuery,
  useReverseGeocodeQuery,
  useWeatherQuery,
} from "@/hooks/use-weather";
import { CurrentWeather } from "../components/current-weather";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { WeatherDetails } from "../components/weather-details";
import { WeatherForecast } from "../components/weather-forecast";
import { HourlyTemperature } from "../components/hourly-temprature";
import WeatherSkeleton from "../components/loading-skeleton";
import { FavoriteCities } from "@/components/favorite-cities";

// Fallback coordinates ensure the UI always has data to render if location is denied
const FALLBACK_LOCATION = { lat: 51.5074, lon: -0.1278 };

export function WeatherDashboard() {
  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  // Coalesce location: Use user's physical location if permitted, otherwise inject fallback
  const activeCoordinates = coordinates || FALLBACK_LOCATION;

  const weatherQuery = useWeatherQuery(activeCoordinates);
  const forecastQuery = useForecastQuery(activeCoordinates);
  const locationQuery = useReverseGeocodeQuery(activeCoordinates);

  const handleRefresh = () => {
    getLocation();
    if (activeCoordinates) {
      weatherQuery.refetch();
      forecastQuery.refetch();
      locationQuery.refetch();
    }
  };

  // Centralize loading and error states for TanStack Query v5
  const isDataLoading = weatherQuery.isPending || forecastQuery.isPending;
  const isDataError = weatherQuery.error || forecastQuery.error;
  const locationName = locationQuery.data?.[0];

  return (
    <div className="space-y-4">
      <FavoriteCities />

      {/* 1. Location Error - Renders inline at the top without destroying the page */}
      {(locationError || (!coordinates && !locationLoading)) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Access Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              {locationError ||
                "Please enable location access to see your local weather. Currently showing default location (London)."}
            </p>
            <Button variant="outline" onClick={getLocation} className="w-fit">
              <MapPin className="mr-2 h-4 w-4" />
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 2. Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          {coordinates ? "My Location" : "Default Location"}
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={weatherQuery.isFetching || forecastQuery.isFetching || locationLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${(weatherQuery.isFetching || locationLoading) ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* 3. API Error State - Prevents crashing if OpenWeatherMap API key is missing */}
      {isDataError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Failed to fetch weather data. Please check your API key and network connection.</p>
            <Button variant="outline" onClick={handleRefresh} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Fetch
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 4. Loading State - Takes the place of the grid while fetching data */}
      {(locationLoading || isDataLoading) && !isDataError && (
        <WeatherSkeleton />
      )}

      {/* 5. Main Weather Grid - Renders safely when data exists */}
      {!locationLoading && !isDataLoading && !isDataError && weatherQuery.data && forecastQuery.data && (
        <div className="grid gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <CurrentWeather
              data={weatherQuery.data}
              locationName={locationName}
            />
            <HourlyTemperature data={forecastQuery.data} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-start">
            <WeatherDetails data={weatherQuery.data} />
            <WeatherForecast data={forecastQuery.data} />
          </div>
        </div>
      )}
    </div>
  );
}