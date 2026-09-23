# Contrato: aporte de local

## Entrada protegida

Una cuenta registrada puede enviar:

```ts
{
  name: string;      // 2–120 caracteres
  category: BusinessCategory;
  city: string;      // 2–80 caracteres
  address: string;   // 5–200 caracteres
  websiteUrl?: string; // enlace HTTPS verificado, opcional
  instagramUrl?: string; // enlace HTTPS verificado, opcional
  latitude: number;
  longitude: number;
  locationSource: "device" | "manual";
  locationConfirmed: true;
  photo: File;       // imagen propia/autorizada del letrero, con el nombre legible; JPG, PNG o WebP, máximo 5 MB
}
```

## Categorías permitidas

Restaurante; Cafetería y pastelería; Bar, pub y cervecería; Comida rápida; Panadería; Heladería;
Peluquería y barbería; Belleza y bienestar; Moda y accesorios; Hogar y decoración; Mascotas;
Salud y farmacia; Deporte y aire libre; Tecnología y reparación; Librería y educación; Servicios
profesionales; Turismo y entretención; Otro.

## Resultado

Se crea un `item` con `status: "pending"`, asociado al usuario que lo envió. La imagen se guarda
en el bucket privado `item-submissions`; no se muestra en el juego ni se sirve como imagen pública
hasta la aprobación.

La persona puede buscar una dirección usando comuna, calle y numeración, usar su ubicación actual
con permiso del navegador o tocar el mapa para corregir el pin. La búsqueda de dirección se
considera una selección manual y nunca reemplaza la confirmación explícita del punto. La
ubicación sólo se publica al aprobar el local.

La revisión humana confirma que el letrero mostrado corresponda al nombre registrado y pueda leerse
en la foto antes de publicar. Este flujo puntúa nombres; una respuesta «no lo conozco» pertenece a
un posible modo futuro para comparar o descubrir locales y no se mezcla con estos votos.
