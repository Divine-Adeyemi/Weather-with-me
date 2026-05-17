import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
import { format } from "date-fns";
import type { ForecastData } from "@/api/types";

interface WeatherForecastProps {
  data: ForecastData;
}

interface DailyForecast {
  date: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  };
}

export function WeatherForecast({ data }: WeatherForecastProps) {
  // Group forecast by day and get daily min/max
  const dailyForecasts = data.list.reduce((acc, forecast) => {
    const date = format(new Date(forecast.dt * 1000), "yyyy-MM-dd");

    if (!acc[date]) {
      acc[date] = {
        temp_min: forecast.main.temp_min,
        temp_max: forecast.main.temp_max,
        humidity: forecast.main.humidity,
        wind: forecast.wind.speed,
        weather: forecast.weather[0],
        date: forecast.dt,
      };
    } else {
      acc[date].temp_min = Math.min(acc[date].temp_min, forecast.main.temp_min);
      acc[date].temp_max = Math.max(acc[date].temp_max, forecast.main.temp_max);
    }

    return acc;
  }, {} as Record<string, DailyForecast>);

  // Get next 5 days
  const nextDays = Object.values(dailyForecasts).slice(1, 6);

  // Format temperature
  const formatTemp = (temp: number) => `${Math.round(temp)}°`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {nextDays.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              {/* LEFT SIDE: Date & Description */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base whitespace-nowrap">
                  {format(new Date(day.date * 1000), "EEE, MMM d")}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                  {day.weather.description}
                </p>
              </div>

              {/* RIGHT SIDE: Weather Data Wrapper */}
              {/* flex-col: Stacks info on mobile | sm:flex-row: Displays side-by-side on desktop */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 md:gap-8">
                
                {/* Temperatures Block */}
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="flex items-center text-blue-500 whitespace-nowrap">
                    <ArrowDown className="mr-0.5 h-3.5 w-3.5 sm:mr-1 sm:h-4 sm:w-4" />
                    {formatTemp(day.temp_min)}
                  </span>
                  <span className="flex items-center text-red-500 whitespace-nowrap">
                    <ArrowUp className="mr-0.5 h-3.5 w-3.5 sm:mr-1 sm:h-4 sm:w-4" />
                    {formatTemp(day.temp_max)}
                  </span>
                </div>

                {/* Metrics Block (Humidity & Wind) */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground sm:text-foreground">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    <span>{day.humidity}%</span>
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    <span>{day.wind}m/s</span>
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}