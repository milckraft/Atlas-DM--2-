# Resolución de ataques

`resolveAttack` resuelve una tirada de ataque contra una CA conocida y tira daño cuando impacta.

- Ventaja y desventaja simultáneas se cancelan.
- Un 20 natural impacta y es crítico; duplica los dados de daño, no el modificador fijo.
- Un 1 natural falla automáticamente.
- Los generadores de dados se pueden inyectar para pruebas reproducibles.

No deriva bonificadores desde la hoja, ni comprueba alcance, cobertura, competencia, resistencias, vulnerabilidades, condiciones, Ataque furtivo o economía de acciones. El controlador deberá validar esas reglas.