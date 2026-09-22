"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

import { readSubmissionDraft, writeSubmissionDraft } from "@/lib/submissions/draft";

type LocationSource = "device" | "manual";
type Coordinates = { accuracy?: number; latitude: number; longitude: number; source: LocationSource };

const initialMapCenter: [number, number] = [-33.4489, -70.6693];

function storedCoordinates(): Coordinates | null {
  const draft = readSubmissionDraft();
  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !draft.locationSource) return null;

  const coordinates: Coordinates = {
    latitude,
    longitude,
    source: draft.locationSource === "device" ? "device" : "manual",
  };
  const accuracy = Number(draft.locationAccuracyMeters);
  if (Number.isFinite(accuracy) && accuracy > 0) coordinates.accuracy = accuracy;
  return coordinates;
}

export function MapPicker() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(storedCoordinates);
  const [isConfirmed, setIsConfirmed] = useState(() => readSubmissionDraft().locationConfirmed === "true");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState(() => {
    const draft = readSubmissionDraft();
    return storedCoordinates()
      ? draft.locationConfirmed === "true" ? "Punto confirmado." : "Punto recuperado. Confírmalo antes de enviar."
      : "Elige un punto en el mapa o sugiere tu ubicación. Luego confírmalo.";
  });

  useEffect(() => {
    if (coordinates) {
      writeSubmissionDraft({
        latitude: String(coordinates.latitude),
        locationAccuracyMeters: coordinates.accuracy ? String(coordinates.accuracy) : "",
        locationConfirmed: isConfirmed ? "true" : "",
        locationSource: coordinates.source,
        longitude: String(coordinates.longitude),
      });
    }
  }, [coordinates, isConfirmed]);

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

  async function findAddress() {
    const city = (document.getElementById("city") as HTMLInputElement | null)?.value.trim() ?? "";
    const address = (document.getElementById("address") as HTMLInputElement | null)?.value.trim() ?? "";

    if (city.length < 2 || address.length < 5) {
      setMessage("Escribe la comuna, calle y numeración antes de buscar.");
      return;
    }

    setIsSearching(true);
    setMessage("Buscando la dirección…");

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(`${address}, ${city}, Santiago, Chile`)}`);
      const payload = (await response.json()) as { message?: string; result?: { displayName: string; latitude: number; longitude: number } };

      if (!response.ok || !payload.result) {
        setMessage(payload.message ?? "No encontramos esa dirección. Puedes ajustar el pin manualmente.");
        return;
      }

      setCoordinates({ latitude: payload.result.latitude, longitude: payload.result.longitude, source: "manual" });
      setIsConfirmed(false);
      setMessage(`Encontramos: ${payload.result.displayName}. Revisa el pin y confírmalo.`);
    } catch {
      setMessage("No pudimos buscar la dirección. Puedes ajustar el pin manualmente.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <fieldset className="location-picker">
      <legend>Ubicación del local</legend>
      <p className="field-help">Escribe comuna, calle y número. Buscaremos el punto automáticamente; siempre puedes ajustarlo en el mapa.</p>
      <input name="latitude" type="hidden" value={coordinates?.latitude ?? ""} />
      <input name="longitude" type="hidden" value={coordinates?.longitude ?? ""} />
      <input name="locationSource" type="hidden" value={coordinates?.source ?? ""} />
      <input name="locationAccuracyMeters" type="hidden" value={coordinates?.accuracy ?? ""} />
      <input name="locationConfirmed" type="hidden" value={isConfirmed ? "true" : ""} />
      <div className="map-toolbar">
        <button className="button button-secondary" disabled={isSearching} onClick={findAddress} type="button">{isSearching ? "Buscando…" : "Buscar dirección"}</button>
        <button className="button button-secondary" onClick={useCurrentLocation} type="button">Usar mi ubicación</button>
        <button className="button button-secondary" disabled={!coordinates || isConfirmed} onClick={() => {
          setIsConfirmed(true);
          setMessage("Punto confirmado. Ya puedes enviar el aporte.");
        }} type="button">{isConfirmed ? "Punto confirmado" : "Confirmar este punto"}</button>
        <span aria-live="polite">{message}</span>
      </div>
      <p className="field-help">La búsqueda usa OpenStreetMap y sólo se consulta cuando presionas el botón. Verifica el pin antes de confirmar.</p>
      <div aria-label="Mapa para ajustar la ubicación del local" className="location-map" ref={mapElement} />
    </fieldset>
  );
}
