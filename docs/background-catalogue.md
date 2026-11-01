# Catálogo de trasfondos — D&D 2024

## Cobertura

Se registran los dieciséis trasfondos enumerados en el capítulo 4 del Manual del Jugador 2024 en español, páginas 180–187:

Acólito, Animador, Artesano, Campesino, Charlatán, Comerciante, Criminal, Ermitaño, Erudito, Escriba, Guardia, Guía, Marinero, Noble, Soldado y Vagabundo.

Cada entrada contiene:
- Las tres características entre las que se aplican los aumentos del trasfondo.
- La dote de origen.
- Las dos competencias en habilidades.
- La competencia con herramientas, fija o elegible.
- Las dos opciones de equipo inicial, incluida la alternativa de 50 po.

## Validación

La función `validateBackgroundChoices` comprueba que:
- Los aumentos solo se asignen a características permitidas por el trasfondo.
- Se use el patrón +2/+1 o +1/+1/+1 sin repetir característica.
- Las competencias con herramientas de elección reciban una selección.
- Las competencias fijas no sean sustituidas por una elección.

La aplicación de los aumentos y el límite de 20 se valida además con `ability-scores.js`.

## Límites conocidos

- Los nombres de dotes usan identificadores ingleses estables; falta vincularlos a un catálogo localizado de dotes.
- Las habilidades usan identificadores internos ingleses y se mostrarán en español en la interfaz.
- El equipo inicial se conserva como opciones de texto estructurado; aún no se convierte automáticamente en objetos individuales del inventario.
- Las herramientas elegibles se validan como elección no vacía; la selección contra el catálogo oficial de herramientas está pendiente.

## Fuente

Manual del Jugador 2024 en español, capítulo 4, páginas 180–187. Los datos mecánicos están estructurados de forma original y no se reproduce el texto descriptivo de los trasfondos.
