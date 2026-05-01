import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { MapPin, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon paths (broken by bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored marker
const createColorMarker = (color = '#6C3CE1') => L.divIcon({
    className: '',
    html: `<div style="
        width: 28px; height: 28px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
});

// Component to fly to new coordinates
const FlyTo = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, 11, { duration: 1.5 });
    }, [coords, map]);
    return null;
};

const TripMap = ({ destination }) => {
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!destination) return;
        setLoading(true);
        setError(null);

        const geocode = async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                if (data && data.length > 0) {
                    setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                } else {
                    setError('Location not found');
                }
            } catch {
                setError('Map unavailable');
            } finally {
                setLoading(false);
            }
        };

        // Debounce geocoding so rapid re-renders don't spam the API
        const timeout = setTimeout(geocode, 500);
        return () => clearTimeout(timeout);
    }, [destination]);

    if (loading) {
        return (
            <div className="h-40 rounded-xl bg-base-200 flex items-center justify-center gap-2 text-base-content/40 text-sm">
                <Loader size={16} className="animate-spin" />
                Loading map for <strong>{destination}</strong>...
            </div>
        );
    }

    if (error || !coords) {
        return (
            <div className="h-40 rounded-xl bg-base-200 flex items-center justify-center gap-2 text-base-content/30 text-sm">
                <MapPin size={16} />
                Map unavailable for &quot;{destination}&quot;
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ height: '200px' }}>
            <MapContainer
                center={coords}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <FlyTo coords={coords} />
                <Circle
                    center={coords}
                    radius={8000}
                    pathOptions={{ color: '#6C3CE1', fillColor: '#6C3CE1', fillOpacity: 0.08, weight: 1.5 }}
                />
                <Marker position={coords} icon={createColorMarker('#6C3CE1')}>
                    <Popup>
                        <strong>{destination}</strong>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default TripMap;
