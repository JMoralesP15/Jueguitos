# Exposición de secretos

## Respuesta inmediata

1. Revocar la credencial afectada.
2. Emitir una nueva credencial con el menor privilegio posible.
3. Actualizar GitHub Environments y el proveedor correspondiente.
4. Buscar usos de la credencial en logs y despliegues.
5. Determinar si existió acceso no autorizado.
6. Registrar alcance, línea de tiempo y acciones correctivas.

Eliminar el secreto del último commit no reemplaza su revocación.
