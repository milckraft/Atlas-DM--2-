# Referencias visuales de lugares

## Objetivo
Generar una imagen de referencia para un lugar de campaña y publicarla como adjunto en el canal de Discord. La generación usa el método de imagen del proveedor de IA ya configurado.

## Caché y límites
- Las imágenes se guardan fuera del JSON de campaña, en `<ATLAS_DATA_DIR>/image-cache`.
- La clave de caché combina campaña, identificador estable del lugar y prompt. Volver al mismo lugar con la misma descripción reutiliza la imagen.
- Solo se aceptan JPEG, PNG y WebP de hasta 8 MiB.
- Los identificadores se validan y los nombres de archivo se derivan de SHA-256; nunca se usan nombres aportados por jugadores como rutas.
- Si el modelo falla o devuelve un formato no reconocido, no se publica una imagen.

## Integración y estado
- `createLocationImageService` genera o recupera una referencia visual.
- `postLocationReferenceImage` publica el adjunto en Discord sin menciones automáticas.
- Esta capa no decide cuándo un grupo ha llegado a un lugar. La llamada debe venir de un evento de entrada a ubicación validado por el estado de campaña, no de una frase libre o de una sugerencia de la IA.
- La detección fiable de llegada y su conexión con el motor de ubicaciones quedan pendientes. Hasta entonces, no se generan imágenes automáticamente por cada mensaje.
- La caché depende del almacenamiento persistente configurado en `ATLAS_DATA_DIR`; si el alojamiento borra ese directorio, se volverán a generar imágenes.
