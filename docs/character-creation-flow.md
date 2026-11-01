# Creación unificada de personajes

`src/characters/character-creation.js` coordina los catálogos ya presentes para generar una ficha de nivel 1 como borrador validado.

## Flujo actual

1. Seleccionar una de las 12 clases registradas (la mecánica de clases sigue pendiente).
2. Elegir uno de los 16 trasfondos.
3. Elegir una de las 10 especies y resolver sus elecciones.
4. Asignar exactamente los seis valores de la matriz estándar: 15, 14, 13, 12, 10 y 8.
5. Aplicar los aumentos permitidos por el trasfondo (+2/+1 o +1/+1/+1, solo entre las tres características que permite ese trasfondo).
6. Elegir al menos tres idiomas.
7. Validar la dote de origen que concede el trasfondo y sus elecciones.
8. Si es humano, elegir además una dote de origen por Versátil.
9. Reunir las competencias de habilidad y herramienta de origen.

## Límite deliberado: clases

El catálogo de clases solo contiene identificadores y nombres; sus dados de golpe, competencias, rasgos, equipo y progresión todavía no están verificados. Por eso el resultado queda marcado como `draft_pending_class_rules` y devuelve una advertencia. No se inventan puntos de golpe, CA, competencias de clase ni rasgos. Este borrador no debe usarse todavía como ficha completa para iniciar una partida.

## Limitaciones restantes

- La selección de idiomas exige tres nombres, pero todavía no valida la lista oficial de idiomas ni sus fuentes de concesión.
- Las elecciones de dotes se validan con los controles disponibles; algunas selecciones de conjuros y herramientas todavía no tienen catálogos completos.
- Las competencias de clase, equipo inicial de clase, puntos de golpe, CA, iniciativa, salvaciones y rasgos de clase quedan pendientes.
- La ficha se construye en memoria; aún no se guarda en base de datos ni se presenta mediante un flujo conversacional de Discord.
- Las dotes y rasgos se registran, pero sus efectos no están integrados al motor determinista.

