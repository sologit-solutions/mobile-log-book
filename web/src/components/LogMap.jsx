import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function LogMap({ lat, lon, zoom = 11, className, mapKey }) {
    const center = useMemo(() => [lat, lon], [lat, lon]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const key = mapKey ?? `${lat}-${lon}-${zoom}`;

    return (
        <div className={className}>
            <MapContainer
                key={key}
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                preferCanvas={true}
                style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} icon={defaultIcon} />
            </MapContainer>
        </div>
    );
}