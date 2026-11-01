# Sistema de aprendizaje y consulta de reglas

## Objetivo

Atlas DM debe ayudar tanto a quien nunca ha jugado D&D como a quien conoce el juego pero necesita refrescar una regla. El aprendizaje es opcional, gradual y accesible durante la creación de personajes y las partidas. No sustituye el reglamento ni modifica sus mecánicas.

## Principios

- **A petición:** el jugador puede pedir una explicación cuando quiera, con lenguaje natural o mediante comandos.
- **Contextual:** Atlas puede ofrecer una explicación breve cuando aparece por primera vez una mecánica relevante, sin interrumpir una escena importante.
- **Progresivo:** explicar primero lo esencial y ampliar solo si el jugador lo solicita.
- **Adaptado al jugador:** guardar por jugador el nivel de explicación preferido y los temas ya presentados; no asumir que todos los miembros del grupo tienen la misma experiencia.
- **Fiel a reglas:** las explicaciones se generan a partir de reglas verificadas de D&D 5.5e/2024. No inventar excepciones ni alterar el motor determinista.
- **Separación clara:** distinguir regla oficial, ejemplo ilustrativo, interpretación del DM y regla casera.
- **Sin revelar secretos:** las ayudas de reglas nunca deben mostrar información oculta de la aventura, enemigos o mundo.

## Modos de ayuda

### 1. Guía para principiantes

Explicaciones paso a paso durante la creación del personaje y las primeras sesiones:
- qué representa cada característica y competencia;
- cómo funcionan las tiradas de d20, pruebas, ataques y salvaciones;
- acciones, acciones adicionales, reacciones y movimiento;
- combate por turnos, iniciativa, daño, puntos de golpe y descansos;
- conjuros, equipo y rasgos de clase cuando correspondan.

Cada explicación incluye una descripción sencilla, cuándo se usa y un ejemplo breve. Se puede activar o desactivar por jugador.

### 2. Consulta rápida

Para jugadores con experiencia que solo necesitan recordar algo:
- respuesta corta y directa;
- requisitos y momento de uso;
- coste de acción, alcance, duración o tirada de salvación cuando aplique;
- opción de ampliar con explicación y ejemplo.

Ejemplos de consultas naturales: «¿Cómo funcionaba la cobertura?», «¿Qué puedo hacer con mi reacción?» o «Recuérdame cómo funciona Ataque furtivo».

### 3. Ayuda contextual

Cuando una regla relevante aparece por primera vez para un jugador, Atlas puede ofrecer una sugerencia discreta. No debe detener automáticamente el combate, una conversación o una escena urgente. Si el jugador la rechaza, no repetir la misma explicación constantemente.

### 4. Práctica opcional

Ejercicios breves y situaciones simuladas para practicar una regla sin consecuencias para la campaña. El jugador puede pedir pistas, resolver el ejemplo paso a paso o ver la explicación completa. Los ejercicios no conceden ventajas, experiencia ni recompensas dentro de la aventura.

## Preferencias individuales

Guardar por jugador, no solo por campaña:
- nivel de experiencia declarado: principiante, intermedio o experimentado;
- ayudas contextuales: activadas/desactivadas;
- extensión preferida: breve o detallada;
- temas que ya se explicaron y si el jugador pidió repasarlos.

El jugador puede cambiar estas preferencias en cualquier momento. La configuración no debe afectar a otros miembros del grupo.

## Integración técnica

1. Mantener un catálogo consultable de reglas verificadas, con identificador, versión, fuente y referencias internas.
2. Separar el contenido explicativo del motor determinista: la guía describe cómo funciona una regla; el motor calcula y valida su aplicación.
3. Vincular cada rasgo, acción, condición, objeto y conjuro del personaje con su entrada de referencia cuando esté implementado.
4. Si una regla todavía no está verificada o implementada, decirlo claramente y no improvisar una respuesta como si fuera oficial.
5. Registrar qué explicación se mostró para evitar repeticiones molestas, sin almacenar conversaciones innecesarias.
6. Permitir consultas durante una sesión sin modificar el estado del combate ni consumir acciones del personaje.

## Criterios de aceptación

- Un jugador nuevo puede pedir una explicación sencilla y recibirla con un ejemplo correcto.
- Un jugador experimentado puede obtener un recordatorio breve sin leer un tutorial completo.
- Un jugador puede consultar una regla en mitad de una escena sin consumir tiempo ni acciones del personaje.
- En una campaña grupal, cada jugador conserva sus propias preferencias.
- Rechazar una sugerencia evita que Atlas insista repetidamente.
- Las respuestas distinguen reglas verificadas, ejemplos y reglas caseras.
- La guía nunca modifica tiradas, resultados, recursos ni reglas oficiales.

## Estado

Diseño aprobado para incorporarse a la arquitectura. Implementación pendiente: catálogo de referencias, preferencias por jugador, consultas contextuales y pruebas.


## Primera implementación técnica

Se incorporó una primera base funcional, todavía sin integración con Discord:
- Catálogo de referencias con identificador, palabras clave, categoría, fuente y estado de verificación.
- Búsqueda de reglas por texto e identificación directa por ID.
- Explicaciones breves o detalladas que conservan el estado de verificación.
- Preferencias individuales validadas e inmutables, con control de ayudas contextuales y registro de temas explicados.

Los estados actuales distinguen mecánicas verificadas en el motor de Atlas DM de rasgos con implementación parcial. Una entrada parcial nunca se presenta como regla oficial completamente implementada. La cobertura del catálogo es deliberadamente pequeña: crecerá a medida que se verifiquen reglas contra el Manual del jugador 2024.
