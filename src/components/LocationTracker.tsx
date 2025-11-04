'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Battery, BatteryLow, BatteryMedium, BatteryFull, AlertTriangle, History } from 'lucide-react';

interface LocationData {
  _id: string;
  device_id: string;
  name: string;
  model: string;
  device_class: string;
  battery_level: number;
  battery_status: string | null;
  location: {
    type: string;
    coordinates: [number, number];
  };
  location_data: {
    latitude: number;
    longitude: number;
    accuracy: number;
    position_type: string;
    is_old: boolean;
    location_timestamp: number;
  };
  timestamp: string;
  address?: string;
}

export function LocationTracker() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlarmTriggering, setIsAlarmTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchLocation();
    // Refresh location every 60 seconds
    const interval = setInterval(fetchLocation, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocation = async () => {
    try {
      const response = await fetch('/api/location');
      const result = await response.json();

      if (result.success && result.data) {
        // Fetch address using reverse geocoding
        const address = await fetchAddress(
          result.data.location_data.latitude,
          result.data.location_data.longitude
        );
        setLocationData({ ...result.data, address });
        setError(null);
      } else {
        setError('No location data available');
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Failed to fetch location');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddress = async (lat: number, lon: number): Promise<string> => {
    try {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocationTracker/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.display_name || 'Address not available';
    } catch (err) {
      console.error('Error fetching address:', err);
      return 'Address not available';
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/location/history');
      const result = await response.json();

      if (result.success && result.data) {
        // Filter out items with invalid location data and fetch addresses sequentially to avoid rate limiting
        const validItems = result.data.filter((item: LocationData) =>
          item.location_data &&
          item.location_data.latitude &&
          item.location_data.longitude
        );

        const historyWithAddresses: LocationData[] = [];
        for (const item of validItems) {
          const address = await fetchAddress(
            item.location_data.latitude,
            item.location_data.longitude
          );
          historyWithAddresses.push({ ...item, address });
        }

        setLocationHistory(historyWithAddresses);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    if (locationHistory.length === 0) {
      fetchHistory();
    }
  };

  const triggerAlarm = async () => {
    if (isAlarmTriggering) return;

    setIsAlarmTriggering(true);
    try {
      const response = await fetch('/api/alarm', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert('Emergency alarm triggered successfully!');
      } else {
        alert('Failed to trigger alarm: ' + result.message);
      }
    } catch (err) {
      console.error('Error triggering alarm:', err);
      alert('Failed to trigger alarm');
    } finally {
      setIsAlarmTriggering(false);
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level < 0.2) return <BatteryLow className="h-4 w-4 text-red-400" />;
    if (level < 0.5) return <BatteryMedium className="h-4 w-4 text-yellow-400" />;
    if (level < 0.9) return <BatteryFull className="h-4 w-4 text-green-400" />;
    return <Battery className="h-4 w-4 text-green-400" />;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - then) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const openMapLink = () => {
    if (!locationData) return;
    const { latitude, longitude } = locationData.location_data;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="text-sm text-slate-400">Loading location...</div>
      </Card>
    );
  }

  if (error || !locationData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="text-sm text-slate-400">{error || 'No location data'}</div>
      </Card>
    );
  }

  if (showHistory) {
    return (
      <div className="space-y-3">
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="h-4 w-4" />
              Location History
            </h3>
            <Button
              onClick={() => setShowHistory(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              Back
            </Button>
          </div>

          {isLoadingHistory ? (
            <div className="text-sm text-slate-400">Loading history...</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {locationHistory.map((location) => (
                <Card
                  key={location._id}
                  className="bg-slate-900/50 border-slate-700 p-3 cursor-pointer hover:bg-slate-900 transition-colors"
                  onClick={() => {
                    const { latitude, longitude } = location.location_data;
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                      '_blank'
                    );
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 break-words">
                          {location.address || 'Loading address...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeAgo(location.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getBatteryIcon(location.battery_level)}
                        <span>{Math.round(location.battery_level * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Location Card */}
      <Card className="bg-slate-800/50 border-slate-700 p-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={openMapLink}>
        <div className="space-y-3">
          {/* Map Preview - Using OSM tiles via iframe */}
          <div className="aspect-video rounded-md overflow-hidden bg-slate-900 relative group">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationData.location_data.longitude - 0.005},${locationData.location_data.latitude - 0.004},${locationData.location_data.longitude + 0.005},${locationData.location_data.latitude + 0.004}&layer=mapnik&marker=${locationData.location_data.latitude},${locationData.location_data.longitude}`}
              style={{ border: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              title="Location Map"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300 group-hover:bg-blue-900/80 transition-colors pointer-events-none">
              Click to open in maps
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{locationData.name}</span>
            </div>

            {/* Street Address */}
            {locationData.address && (
              <div className="text-xs text-slate-400 pl-6 break-words">
                {locationData.address}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Updated {getTimeAgo(locationData.timestamp)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              {getBatteryIcon(locationData.battery_level)}
              <span>{Math.round(locationData.battery_level * 100)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleShowHistory();
          }}
          variant="outline"
          className="flex-1 bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </div>

      {/* Emergency Alarm Button */}
      <Button
        onClick={(e) => {
          e.preventDefault();
          triggerAlarm();
        }}
        disabled={isAlarmTriggering}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
        variant="destructive"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        {isAlarmTriggering ? 'Triggering...' : 'Emergency Alarm'}
      </Button>
    </div>
  );
}
