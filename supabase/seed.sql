-- Catálogo sintético para pruebas funcionales del P0.
-- Ningún registro representa un negocio real. Los UUID permiten retirar todo el set sin
-- confundirlo con aportes reales:
-- delete from public.items where id::text like '10000000-0000-4000-8000-%';

insert into public.items (id, type, name, image_url, category, city, status)
values
  ('10000000-0000-4000-8000-000000000001', 'business_name', 'Café Cometa de Papel (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Cafetería y pastelería', 'Providencia', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'business_name', 'Pan y Punto Aparte (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Panadería', 'Santiago', 'active'),
  ('10000000-0000-4000-8000-000000000003', 'business_name', 'La Olla de Mentiritas (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Restaurante', 'La Florida', 'active'),
  ('10000000-0000-4000-8000-000000000004', 'business_name', 'Bigotes y Migas (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Mascotas', 'Maipú', 'active'),
  ('10000000-0000-4000-8000-000000000005', 'business_name', 'El Tornillo Feliz (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Tecnología y reparación', 'Estación Central', 'active'),
  ('10000000-0000-4000-8000-000000000006', 'business_name', 'Helado Que Te Quiero Helado (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Heladería', 'Las Condes', 'active'),
  ('10000000-0000-4000-8000-000000000007', 'business_name', 'La Última Excusa (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Bar, pub y cervecería', 'Recoleta', 'active'),
  ('10000000-0000-4000-8000-000000000008', 'business_name', 'Corte Cósmico (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Peluquería y barbería', 'San Miguel', 'active'),
  ('10000000-0000-4000-8000-000000000009', 'business_name', 'Página Perdida (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Librería y educación', 'Quinta Normal', 'active'),
  ('10000000-0000-4000-8000-000000000010', 'business_name', 'Don Guaucho (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Mascotas', 'Peñalolén', 'active'),
  ('10000000-0000-4000-8000-000000000011', 'business_name', 'Botica Buena Onda (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Salud y farmacia', 'Macul', 'active'),
  ('10000000-0000-4000-8000-000000000012', 'business_name', 'Paso Lunar (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Moda y accesorios', 'Puente Alto', 'active'),
  ('10000000-0000-4000-8000-000000000013', 'business_name', 'Tecno Cachureo (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Tecnología y reparación', 'Independencia', 'active'),
  ('10000000-0000-4000-8000-000000000014', 'business_name', 'Nube de Azúcar (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Cafetería y pastelería', 'Vitacura', 'active'),
  ('10000000-0000-4000-8000-000000000015', 'business_name', 'Sopaipilla Galáctica (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Comida rápida', 'La Reina', 'active'),
  ('10000000-0000-4000-8000-000000000016', 'business_name', 'Lúpulo Travieso (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Bar, pub y cervecería', 'Lo Barnechea', 'active'),
  ('10000000-0000-4000-8000-000000000017', 'business_name', 'Casa Mandarina (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Hogar y decoración', 'La Cisterna', 'active'),
  ('10000000-0000-4000-8000-000000000018', 'business_name', 'Pedal de Oro (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Deporte y aire libre', 'Pedro Aguirre Cerda', 'active'),
  ('10000000-0000-4000-8000-000000000019', 'business_name', 'Vuelta Larga (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Turismo y entretención', 'Cerrillos', 'active'),
  ('10000000-0000-4000-8000-000000000020', 'business_name', 'La Esquina Imaginaria (demo)', 'https://community-manager.javieralfredomorales-p.workers.dev/testing/local-ficticio.svg', 'Otro', 'Ñuñoa', 'active')
on conflict do nothing;
