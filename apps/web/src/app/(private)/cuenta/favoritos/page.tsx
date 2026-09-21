import Link from "next/link";
import { redirect } from "next/navigation";

import { BusinessImage } from "@/components/business-image";
import { createClient } from "@/lib/supabase/server";

type FavoriteItem = {
  address: string | null;
  category: string;
  city: string;
  id: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  name: string;
};

type FavoriteRow = {
  created_at: string;
  items: FavoriteItem;
};

function mapLink(item: FavoriteItem) {
  if (item.latitude !== null && item.longitude !== null) {
    return `https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=18/${item.latitude}/${item.longitude}`;
  }
  if (item.address) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${item.address}, ${item.city}`)}`;
  }
  return null;
}

export default async function FavoriteItemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/ingresar?origen=cuenta");

  const { data, error } = await supabase
    .from("item_favorites")
    .select("created_at, items!inner(id, name, image_url, category, city, address, latitude, longitude)")
    .order("created_at", { ascending: false });

  const favorites = (data ?? []) as unknown as FavoriteRow[];

  return (
    <main className="account-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Tu lista privada</p>
        <h1>Locales favoritos</h1>
        <p className="lede">Los locales que guardas solo los ves tú. Puedes volver a jugar y agregar otros cuando quieras.</p>
        <div className="hero-actions">
          <Link className="button" href="/jugar">Volver a los duelos</Link>
          <Link className="button button-secondary" href="/cuenta">Mi perfil</Link>
        </div>
      </section>

      {error ? (
        <p className="form-message" role="alert">No pudimos cargar tus favoritos. Inténtalo nuevamente más tarde.</p>
      ) : favorites.length ? (
        <ul className="favorite-list">
          {favorites.map(({ items: item }) => {
            const location = mapLink(item);
            return (
              <li className="favorite-card" key={item.id}>
                <BusinessImage
                  alt={`Foto de ${item.name}`}
                  className="favorite-image"
                  name={item.name}
                  sizes="(max-width: 560px) 38vw, 160px"
                  src={item.image_url}
                />
                <div className="favorite-copy">
                  <span className="category-chip">{item.category}</span>
                  <h2>{item.name}</h2>
                  <p>{item.city}</p>
                  {item.address ? <p>{item.address}</p> : null}
                  {location ? <a href={location} rel="noreferrer" target="_blank">Ver ubicación</a> : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <section className="empty-favorites">
          <span aria-hidden="true" className="favorite-empty-icon">☆</span>
          <h2>Aquí aparecerán tus favoritos</h2>
          <p>Durante un duelo, toca la estrella del local que quieras guardar.</p>
          <Link className="button" href="/jugar">Descubrir locales</Link>
        </section>
      )}
    </main>
  );
}
