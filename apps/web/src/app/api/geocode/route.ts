import { NextResponse } from "next/server";

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 5 || query.length > 250) {
    return NextResponse.json({ message: "Indica una dirección y una comuna válidas." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "cl");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Jueguitos/0.1 (contacto del proyecto)",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "El buscador de direcciones no está disponible ahora." }, { status: 502 });
    }

    const results = (await response.json()) as NominatimResult[];
    const result = results[0];
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);

    if (!result || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ message: "No encontramos esa dirección. Revisa la comuna, calle y numeración." }, { status: 404 });
    }

    return NextResponse.json({
      result: {
        displayName: result.display_name ?? query,
        latitude,
        longitude,
      },
    });
  } catch {
    return NextResponse.json({ message: "No pudimos buscar la dirección. Puedes ajustar el pin manualmente." }, { status: 502 });
  }
}
