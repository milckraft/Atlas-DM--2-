# Catálogo de clases — D&D 2024

Estado: competencias fundamentales registradas; algunos equipos iniciales transcritos; rasgos de nivel 1 en esquema; reglas ejecutables y progresión pendientes.

## Datos fundamentales

El catálogo contiene las doce clases principales del capítulo 3: característica principal, dado de golpe, salvaciones, opciones de habilidades y competencias con armas, armaduras y herramientas.

## Rasgos de nivel 1

Se añadieron identificadores de rasgos de nivel 1 únicamente como índice de implementación. No son todavía reglas ejecutables: sus condiciones, acciones, usos, recargas, fórmulas, excepciones e interacciones deben modelarse y probarse antes de permitir jugar con ellos.

El campo `levelOneRulesStatus` permanece en `summary_only_not_executable` para todas las clases. Cuando la extracción disponible no confirmó el nombre de un rasgo, no se rellenó con una suposición.

## Equipo inicial

Los equipos A/B que ya están transcritos se almacenan como opciones seleccionables. No se conceden automáticamente: el jugador deberá escoger una opción y el futuro motor de inventario tendrá que convertir sus identificadores en objetos concretos.

Los equipos que todavía no quedaron confirmados desde el material extraído permanecen en `null` y llevan el estado `pending_source_verification`. No se deben sustituir por paquetes inventados ni por compras calculadas a partir de precios.

## Pendiente antes de considerar jugable una clase

- Verificar y completar todos los equipos iniciales, incluidas las opciones de herramientas y focos.
- Revisar los rasgos de nivel 1 contra las páginas originales y convertir sus reglas en mecánicas deterministas.
- Completar conjuros, recursos, descansos, maestrías y demás elecciones.
- Incorporar la progresión de nivel 1 a 20 y las cuatro subclases de cada clase, con sus niveles de selección.
- Añadir pruebas de reglas y casos límite.

## Fuente y cautela

Fuente principal: *Player's Handbook 2024* en español, capítulo 3, tablas «Atributos básicos», apartados de equipo inicial y secciones de rasgos de clase. El resumen de puntos de golpe del capítulo 2 sirve como comprobación cruzada de los dados de golpe.

El OCR puede confundir caracteres (por ejemplo, mostrar «1d3» donde la tabla impresa indica «1d8»). Los datos se mantienen como resúmenes mecánicos originales y no reproducen el texto explicativo del manual. Donde la extracción no permite confirmar un dato, el catálogo lo deja pendiente.


## Primeras reglas deterministas de nivel 1

Se añadió `src/characters/class-rules.js` con cálculos puros y comprobables:

- Puntos de golpe máximos de nivel 1: dado de golpe máximo de la clase + modificador de Constitución.
- Competencias en tiradas de salvación, obtenidas del catálogo de clase.
- Validación de cantidad, duplicados y opciones permitidas para las habilidades elegidas por clase.
- Bonificador por competencia de nivel 1 (+2).
- Defensa sin armadura del bárbaro (10 + Destreza + Constitución) y del monje (10 + Destreza + Sabiduría), con restricciones explícitas de armadura y escudo.

Estas funciones no sustituyen la implementación completa de los rasgos. Tampoco deciden qué equipo lleva el personaje: el estado del equipo debe venir de la ficha/inventario.
