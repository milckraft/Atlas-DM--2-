# Catálogo de especies — D&D 5.5e (2024)

Este catálogo contiene las diez especies del capítulo 4 del **Manual del Jugador 2024 en español**: Aasimar, Dracónido, Enano, Elfo, Gnomo, Goliat, Humano, Mediano, Orco y Tiefling.

- Fuente: Manual del Jugador 2024, capítulo 4, páginas impresas 186–197.
- Identificador de versión: `2024-phb-es`.
- Los resúmenes mecánicos son redacción original para uso interno del bot; no copian el texto del manual.
- Todas las especies del capítulo tienen tipo de criatura humanoide.
- La especie determina tamaño, velocidad y rasgos especiales. **No concede aumentos de puntuación de característica**; estos proceden del trasfondo.
- Las elecciones de linaje/ancestro se guardan como datos de personaje y se validan contra las opciones permitidas.

## Alcance de la implementación

El archivo `src/characters/species-catalogue.js` contiene los diez registros, rasgos resumidos, elecciones y validación básica. Los resúmenes documentan la intención mecánica, pero no constituyen todavía efectos ejecutables en el motor de reglas. Quedan pendientes la integración con conjuros, acciones, descansos, recursos, estados, daño, curación, vuelo, tamaños y demás subsistemas.

## Decisiones de fidelidad

- Se conserva la terminología española de la fuente: Dracónido, Enano, Elfo, Gnomo, Goliat, Humano, Mediano, Orco y Tiefling.
- La lista del catálogo no mezcla opciones de otros libros ni especies caseras.
- Las opciones concretas de linaje se guardan como identificadores internos estables; la interfaz podrá mostrarlas en español.
- Los datos de tamaño y velocidad se registran en metros tal como aparecen en el manual aportado.
- Antes de habilitar el catálogo en Discord, deben ejecutarse los tests y conectarse los rasgos al motor determinista.
