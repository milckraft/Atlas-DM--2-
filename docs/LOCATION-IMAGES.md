# Referencias visuales de lugares

## Flujo validado
1. Un administrador o DM registra ubicaciones conocidas mediante `/ubicacion registrar`, con ID estable, nombre y descripción.
2. El DM confirma la llegada del grupo con `/ubicacion entrar`. No se infiere llegada desde el chat ni desde la IA.
3. El motor de campaña valida que el ID exista y que sea un cambio real de ubicación, actualiza `currentLocationId` y registra `location-entered`.
4. El workflow genera o recupera la imagen en caché y la publica en el canal elegido.

## Caché y límites
- Las imágenes se guardan en `<ATLAS_DATA_DIR>/image-cache`.
- La clave combina campaña, ID estable y prompt; volver al lugar con la misma descripción reutiliza la imagen.
- Solo se aceptan JPEG, PNG y WebP de hasta 8 MiB.
- Los nombres de archivo derivan de SHA-256 y nunca de texto libre del jugador.
- Si no hay proveedor, canal o imagen válida, el estado de campaña sigue siendo válido y no se publica contenido inventado.

## Seguridad e integración
- Los comandos de registro y entrada requieren permiso Gestionar servidor.
- La IA conversacional no puede emitir transiciones de ubicación.
- Las ubicaciones deben estar registradas antes de poder seleccionarlas.
- El evento de entrada se guarda en la campaña; el caché se mantiene separado del JSON.
- La publicación ocurre después de guardar el estado. Si falla el proveedor o Discord, el registro de llegada permanece y se puede reintentar usando la caché.
