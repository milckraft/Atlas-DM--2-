# Estado de turno y economía de acciones

Módulo determinista e inmutable para el estado individual de un combatiente.

- Un turno comienza con acción, acción adicional, reacción y movimiento disponibles.
- Gastar un recurso lo deja indisponible hasta el siguiente turno (la reacción se restaura al inicio del turno propio).
- El movimiento consume velocidad disponible y no puede superar el remanente.
- Puntería certera (pícaro nivel 3+) exige no haberse movido, gasta acción adicional, reduce movimiento restante a cero y concede ventaja al siguiente ataque del turno.
- Ataque furtivo se puede marcar una sola vez por turno y se restablece al comenzar el siguiente.
- Golpe de suerte (nivel 20) consume su uso al convertir una prueba d20 fallida en 20; descanso corto o largo lo recarga.

## Alcance y límites

Este módulo administra estado individual; todavía no resuelve iniciativa, posiciones, alcance, acciones de otros personajes, condiciones, ataques, daño, concentración ni duración global de efectos. La integración de Esquiva asombrosa con la reacción debe realizarse desde el controlador de combate, usando `spendTurnResource(state, "reaction")`. No se declara terminado el motor de combate.
