"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

type LocationSource = "device" | "manual";
type Coordinates = { accuracy?: number; latitude: number; longitude: number; source: LocationSource };

const initialCoordinates: Coordinates = {
  latitude: -33.4489,
  longitude: -70.6693,
  source: "manual",
};

export function MapPicker() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates);
  const [message, setMessage] = useState("Puedes arrastrar el mapa y tocar el punto exacto del local.");

  useEffect(() => {
    let active = true;

    void import("leaflet").then((leaflet) => {
      if (!active || !mapElement.current) return;

      leafletRef.current = leaflet;
      const map = leaflet.map(mapElement.current, { scrollWheelZoom: false }).setView(
        [initialCoordinates.latitude, initialCoordinates.longitude],
        12,
      );
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      map.on("click", (event) => {
        setCoordinates({ latitude: event.latlng.lat, longitude: event.latlng.lng, source: "manual" });
        setMessage("Punto ajustado manualmente. Puedes volver a pulsar si deseas afinarlo.");
      });
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet) return;

    const point: [number, number] = [coordinates.latitude, coordinates.longitude];
    if (!markerRef.current) {
      markerRef.current = leaflet.marker(point, {
        icon: leaflet.divIcon({ className: "location-marker", html: "<span>✦</span>", iconSize: [34, 34] }),
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(point);
    }
    map.setView(point, Math.max(map.getZoom(), 16), { animate: true });
  }, [coordinates]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Tu navegador no permite obtener ubicación. Ajusta el punto manualmente.");
      return;
    }

    setMessage("Solicitando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "device",
        });
        setMessage("Ubicación obtenida. Confirma que el pin representa el local y ajústalo si hace falta.");
      },
      () => setMessage("No pudimos acceder a tu ubicación. Puedes fijar el punto tocando el mapa."),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  return (
    <fieldset className="location-picker">
      <legend>Ubicación del local</legend>
      <p className="field-help">Usa tu ubicación sólo si estás frente al local. El pin se puede ajustar manualmente.</p>
      <input name="latitude" type="hidden" value={coordinates.latitude} />
      <input name="longitude" type="hidden" value={coordinates.longitude} />
      <input name="locationSource" type="hidden" value={coordinates.source} />
      <input name="locationAccuracyMeters" type="hidden" value={coordinates.accuracy ?? ""} />
      <div className="map-toolbar">
        <button className="button button-secondary" onClick={useCurrentLocation} type="button">Usar mi ubicación</button>
        <span aria-live="polite">{message}</span>
      </div>
      <div aria-label="Mapa para ajustar la ubicación del local" className="location-map" ref={mapElement} />
    </fieldset>
  );
}
