# Creación unificada de personajes

`src/characters/character-creation.js` coordina los catálogos de origen y las reglas de clase implementadas para generar una ficha de nivel 1 como borrador validado.

## Flujo actual

1. Seleccionar una de las 12 clases registradas.
2. Elegir las habilidades que concede la clase, respetando cantidad y opciones.
3. Elegir uno de los 16 trasfondos.
4. Elegir una de las 10 especies y resolver sus elecciones.
5. Asignar exactamente los seis valores de la matriz estándar: 15, 14, 13, 12, 10 y 8.
6. Aplicar los aumentos permitidos por el trasfondo (+2/+1 o +1/+1/+1, solo entre las tres características que permite ese trasfondo).
7. Elegir al menos tres idiomas.
8. Validar la dote de origen que concede el trasfondo y sus elecciones.
9. Si es humano, elegir además una dote de origen por Versátil.
10. Reunir las competencias de habilidad, salvación y herramienta disponibles.

## Cálculos de clase integrados

- Puntos de golpe máximos y actuales de nivel 1: dado de golpe máximo + modificador de Constitución.
- Competencias en tiradas de salvación según clase.
- Bonificador por competencia de nivel 1 (+2).
- Validación de cantidad y opciones de las habilidades elegidas para la clase.

Las competencias de habilidades de clase se combinan con las obtenidas por trasfondo y especie. La ficha sigue marcada como `draft_pending_class_rules`: todavía no están implementadas todas las reglas de clase ni el equipo/CA final.

## Limitaciones restantes

- La selección de idiomas exige tres nombres, pero todavía no valida la lista oficial de idiomas ni sus fuentes de concesión.
- Las elecciones de dotes se validan con los controles disponibles; algunas selecciones de conjuros y herramientas todavía no tienen catálogos completos.
- El equipo inicial, CA derivada del equipo, iniciativa, recursos, conjuros y rasgos de clase siguen pendientes de integración completa.
- La ficha se construye en memoria; aún no se guarda en base de datos ni se presenta mediante un flujo conversacional de Discord.
- Las dotes y rasgos se registran, pero sus efectos no están integrados completamente al motor determinista.
