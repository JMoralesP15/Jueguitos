"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

type LocationSource = "device" | "manual";
type Coordinates = { accuracy?: number; latitude: number; longitude: number; source: LocationSource };

const initialMapCenter: [number, number] = [-33.4489, -70.6693];

export function MapPicker() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [message, setMessage] = useState("Elige un punto en el mapa o sugiere tu ubicación. Luego confírmalo.");

  useEffect(() => {
    let active = true;

    void import("leaflet").then((leaflet) => {
      if (!active || !mapElement.current) return;

      leafletRef.current = leaflet;
      const map = leaflet.map(mapElement.current, { scrollWheelZoom: false }).setView(
        initialMapCenter,
        12,
      );
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      map.on("click", (event) => {
        setCoordinates({ latitude: event.latlng.lat, longitude: event.latlng.lng, source: "manual" });
        setIsConfirmed(false);
        setMessage("Punto ajustado manualmente. Confírmalo antes de enviar el aporte.");
      });
      mapRef.current = map;
      setIsMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !coordinates || !isMapReady) return;

    const point: [number, number] = [coordinates.latitude, coordinates.longitude];
    if (!markerRef.current) {
      markerRef.current = leaflet.marker(point, {
        icon: leaflet.divIcon({ className: "location-marker", html: "<span>✦</span>", iconSize: [34, 34] }),
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(point);
    }
    map.setView(point, Math.max(map.getZoom(), 16), { animate: true });
  }, [coordinates, isMapReady]);

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
        setIsConfirmed(false);
        setMessage("Ubicación sugerida. Confirma que el pin representa el local y ajústalo si hace falta.");
      },
      () => setMessage("No pudimos acceder a tu ubicación. Puedes fijar el punto tocando el mapa."),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  return (
    <fieldset className="location-picker">
      <legend>Ubicación del local</legend>
      <p className="field-help">Usa tu ubicación sólo si estás frente al local. El pin se puede ajustar manualmente.</p>
      <input name="latitude" type="hidden" value={coordinates?.latitude ?? ""} />
      <input name="longitude" type="hidden" value={coordinates?.longitude ?? ""} />
      <input name="locationSource" type="hidden" value={coordinates?.source ?? ""} />
      <input name="locationAccuracyMeters" type="hidden" value={coordinates?.accuracy ?? ""} />
      <input name="locationConfirmed" type="hidden" value={isConfirmed ? "true" : ""} />
      <div className="map-toolbar">
        <button className="button button-secondary" onClick={useCurrentLocation} type="button">Usar mi ubicación</button>
        <button className="button button-secondary" disabled={!coordinates || isConfirmed} onClick={() => {
          setIsConfirmed(true);
          setMessage("Punto confirmado. Ya puedes enviar el aporte.");
        }} type="button">{isConfirmed ? "Punto confirmado" : "Confirmar este punto"}</button>
        <span aria-live="polite">{message}</span>
      </div>
      <div aria-label="Mapa para ajustar la ubicación del local" className="location-map" ref={mapElement} />
    </fieldset>
  );
}
