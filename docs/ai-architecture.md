# Arquitectura de IA de Atlas DM

## Principios
- Proveedores intercambiables; el bot no depende de un fabricante.
- Reglas D&D y resultados de dados deterministas, separados de la IA.
- Análisis de trasfondos basado en el catálogo estructurado y evidencias narrativas.
- Las historias son datos no confiables, nunca instrucciones del sistema.
- Las funciones visuales son opcionales: el bot sigue funcionando en modo texto.
- No hay proveedor ni clave configurados por defecto; no se generan llamadas ni cargos inesperados.

## Módulos iniciales
- src/ai/provider-registry.js: registro neutral de proveedores.
- src/ai/contracts.js: validación de resultados.
- src/ai/prompts/background-analysis.js: análisis narrativo basado en el catálogo real.
- src/visual/image-service.js: contrato para imágenes opcionales.
- src/maps/map-schema.js: validación de mapas estructurados.

## Próximas integraciones
1. Verificar proveedor, condiciones y cuota gratuita para el bot y sus jugadores.
2. Implementar adaptador con límites, tiempos de espera y control de costes.
3. Integrar análisis de trasfondos en Discord y retirar el recomendador heurístico tras validar el nuevo flujo.
4. Añadir proveedor visual compatible; nunca fingir una generación.
5. Añadir renderizado de mapas, manteniendo la cuadrícula como fuente de verdad.

Las claves futuras se guardarán únicamente como secretos del alojamiento, nunca en GitHub ni en mensajes de Discord.
