# Estado de turno de combate

Módulo inmutable para economía de acciones y recursos del pícaro. No narra, no tira dados y no resuelve ataques ni posiciones.

## Responsabilidades

- Una acción, una acción adicional y una reacción por turno propio.
- Movimiento disponible y consumido; se reinicia al comenzar el turno propio.
- Puntería certera consume acción adicional, exige no haberse movido, reduce movimiento restante a cero y concede ventaja al siguiente ataque.
- Ataque furtivo se registra contra un identificador de turno global, no solo el turno propio del pícaro. Esto permite aplicar la limitación una vez por turno también durante ataques de reacción.
- Golpe de suerte consume su uso cuando convierte una prueba d20 fallida en 20; se recupera con descanso corto o largo.

## Contexto de iniciativa

El controlador debe llamar `setCombatTurnContext(state, combatTurnId)` cada vez que cambia la criatura activa en iniciativa. Esta función no refresca acciones ni reacción del pícaro. Al comenzar el turno propio, llamar `startCombatTurn(state, combatTurnId)`, que refresca su economía personal.

Los identificadores deben ser estables y distintos para cada turno individual de criatura (por ejemplo, `round-2-enemy-1`). No usar solo el número de ronda: varias criaturas actúan dentro de la misma ronda.

## Integración pendiente

Este módulo todavía no implementa iniciativa, distancias entre criaturas, alcance, ataques, daño, condiciones, concentración ni turnos de otras criaturas. El controlador de combate debe consumir la reacción al usar Esquiva asombrosa y debe consultar el contexto global antes de permitir Ataque furtivo.
