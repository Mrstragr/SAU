import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center when position changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const MapComponent = ({ vehicles = [], userLocation, height = '400px', onVehicleSelect }) => {
    // Default center (SAU Campus approx location or New Delhi)
    const defaultCenter = [28.6139, 77.2090];
    const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={15}
            style={{ height: height, width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
        >
            <ChangeView center={center} zoom={15} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                        You are here
                    </Popup>
                </Marker>
            )}

            {/* Vehicle Markers */}
            {vehicles.map((vehicle) => (
                vehicle.current_lat && vehicle.current_lng ? (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.current_lat, vehicle.current_lng]}
                        eventHandlers={{
                            click: () => {
                                if (onVehicleSelect) onVehicleSelect(vehicle);
                            }
                        }}
                        icon={new L.Icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097136.png', // Auto rickshaw icon or similar
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                            popupAnchor: [0, -32]
                        })}
                    >
                        <Popup>
                            <div className="font-semibold">{vehicle.vehicle_number || vehicle.vehicleNumber}</div>
                            <div className="text-sm text-gray-600">Status: {vehicle.current_status || vehicle.status}</div>
                            <div className="text-sm text-gray-600">Driver: {vehicle.driver_name || vehicle.driver?.name}</div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
};

export default MapComponent;
