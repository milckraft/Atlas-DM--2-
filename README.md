# Atlas DM

Director de juego para Discord, diseñado para campañas de D&D 5.5e (reglas 2024) y mundos de fantasía propios.

> Estado: **andamiaje inicial**. El bot todavía no implementa creación completa de personajes, campañas persistentes, combate ni un director de juego con IA.

## Principios del proyecto

- Reglas oficiales, motor determinista, narración con IA y contenido de ambientación en módulos separados.
- La IA no inventa resultados de dados ni modifica por su cuenta las reglas.
- Los datos de campaña distinguen hechos, rumores, sospechas y secretos.
- El mundo tiene historia y canon independientes de los personajes.
- El contenido de Edrava se incorporará como módulo propio y ampliable.
- No incluir texto ni ilustraciones protegidos de los manuales oficiales.

## Requisitos

- Node.js 20 o superior
- Una aplicación y un bot creados en Discord Developer Portal

## Configuración local

1. Copia `.env.example` a `.env`.
2. Completa `DISCORD_TOKEN` y `DISCORD_CLIENT_ID`.
3. Instala dependencias: `npm install`.
4. Registra comandos: `npm run deploy:commands`.
5. Inicia el bot: `npm start`.

No compartas tu archivo `.env`, tokens ni claves. Nunca los subas a GitHub.

## Estructura

```
src/
  bot/          Cliente y eventos de Discord
  commands/     Comandos de aplicación
  config/       Configuración y validación del entorno
  rules/        Futuro motor determinista de reglas
  campaigns/    Futuro estado y servicios de campaña
  memory/       Futuro registro estructurado de acontecimientos
  dm/           Futuro director de juego con IA
  worlds/       Módulos de ambientación (Edrava irá aquí)
```

## Próximas etapas

1. Bot mínimo de Discord y registro de comandos.
2. Motor de tiradas y pruebas con resultados reproducibles.
3. Datos de personajes y reglas básicas de D&D 2024.
4. Persistencia de campañas, personajes y diario.
5. Narración con IA conectada al motor de reglas.
6. Incorporación progresiva del archivo de mundo de Edrava.

## Licencias y contenido

El código de este repositorio se publicará bajo MIT cuando se añada el archivo de licencia. Las reglas y textos de terceros conservarán sus licencias y atribuciones correspondientes. Este proyecto no está afiliado ni respaldado por Wizards of the Coast.
