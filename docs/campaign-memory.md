# Memoria persistente de campaña

Atlas DM guarda el estado de juego separado de las referencias al canon original de Edrava.

- `canonRefs` apunta a registros de canon; no copia ni modifica esos registros.
- `characters`, `locations`, `npcs`, `quests` e `inventory` contienen estado de la campaña.
- `events` es un registro cronológico de sucesos confirmados en partida.
- Los eventos pueden citar referencias de canon, pero no reescriben el canon.
- La IA narrativa debe proponer cambios; el motor de reglas y las acciones validadas son quienes confirman los cambios.

## Almacenamiento

El almacenamiento inicial usa archivos JSON bajo `data/campaigns` (o `ATLAS_DATA_DIR`). El directorio debe estar en almacenamiento persistente del proveedor de hosting. Si el host borra el disco al reiniciar o redeplegar, se necesita un volumen persistente o una base de datos antes de confiarle campañas reales.

Los IDs de campaña se restringen para impedir traversal de rutas. No se guardan tokens ni credenciales en los archivos de campaña.

## Limitaciones actuales

Este bloque aporta esquema, validación, registro de eventos y lectura/escritura. Todavía no conecta los comandos de Discord a una campaña ni implementa bloqueos para escrituras concurrentes. Antes de partidas públicas, conectar permisos de Discord, persistencia real del hosting, copias de seguridad y una cola/serialización de escrituras.
