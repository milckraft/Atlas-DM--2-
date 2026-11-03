# Cloudflare Workers AI integration

## Purpose
This provider adapter gives Atlas DM two separate AI capabilities:
- Narrative text generation and structured conversation interpretation.
- Reference image generation for places and environments.

The deterministic D&D rules engine remains authoritative. The provider can interpret intent and propose a natural-language action description, but it cannot roll dice, choose a DC, calculate damage, edit a character sheet, award XP/items, or mutate campaign state.

## Models
Default text model: `@cf/zai-org/glm-4.7-flash`.
Default image model: `@cf/black-forest-labs/flux-1-schnell`.

Model identifiers can be overridden with `CLOUDFLARE_TEXT_MODEL` and `CLOUDFLARE_IMAGE_MODEL`. Model availability and free-plan eligibility can change; verify the current Cloudflare model catalog before changing defaults.

## Required runtime secrets
Set these in the hosting provider's environment-variable / secrets panel. Never commit them or paste their values into Discord or GitHub:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (scoped to the Workers AI permissions needed by the account)

Set `AI_PROVIDER=cloudflare` to select the provider for existing `requestAI` calls, including the character-background analysis. Optional model overrides:
- `CLOUDFLARE_TEXT_MODEL`
- `CLOUDFLARE_IMAGE_MODEL`

The provider registers only when both account ID and API token are present. Without them, Atlas DM continues to start with AI unavailable; Discord startup does not require Cloudflare credentials.

## Free-tier limits
Cloudflare Workers AI currently documents a shared allowance of 10,000 Neurons per day on the Workers Free plan. Requests beyond the free allowance fail on the Free plan rather than remaining unlimited. Limits reset at 00:00 UTC. Check Cloudflare's live pricing and model catalog before relying on the service; free eligibility, models, and quotas can change. Image generation shares the account's daily allowance and should be requested selectively and cached by campaign/location.

## API boundary
- Uses Cloudflare's account REST API from Node.js; no additional npm dependency is required.
- Text and image models are separate operations.
- Text output is parsed and conversation decisions are validated against a small allowlist.
- Image output is returned as base64 plus MIME type; a later storage/delivery layer must save it or attach it to Discord.
- No API key is returned in logs or model prompts.

## Current implementation status
Implemented in this branch:
- Provider adapter with text, conversation-interpretation and image-generation methods.
- Registration in the bot when credentials are configured.
- Unit tests using a mocked fetch implementation.

Not implemented yet:
- Automatic conversation-policy integration into the Discord message listener.
- Character/campaign context assembly from persisted campaign records.
- Image caching/storage and Discord attachment delivery.
- Live API verification and executed test suite.

Do not deploy or enable always-on replies until those pieces and the safety tests are reviewed.
