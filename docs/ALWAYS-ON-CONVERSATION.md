# Always-on Discord conversation mode

## Goal
Atlas DM observes every human message in the configured campaign channel, maintains a bounded recent context, distinguishes direct address from ambient table conversation, and only speaks when the dialogue policy decides it is useful. "Always active" means always context-aware, not that it replies to every line.

## Message pipeline
1. Ignore bots, webhooks, DMs, empty messages and slash-command payloads.
2. Capture author ID/name, message ID, content, timestamp, mentions and reply target.
3. Keep a bounded rolling context per channel. This first implementation is in-memory and is intentionally not campaign canon or persistent game state.
4. Classify direct mentions/replies to Atlas separately from ambient table conversation.
5. Send context to the Cloudflare Workers AI adapter for semantic interpretation when credentials and `AI_PROVIDER=cloudflare` are configured.
6. Validate the provider's structured intent. The provider may propose dialogue/action intent but may not roll dice, set DCs, change character sheets, award items/XP, or mutate campaign state.
7. Route mechanical actions as proposals only; deterministic rules services must resolve them before any game-state change. Player/NPC conversation can receive narrative replies; ambiguous intent receives a short clarification.
8. Persist only validated game events through the campaign store. The current dialogue listener does not persist inferred actions.

## Current implementation status
The `feature/cloudflare-ai-providers` branch now:
- Sends the last 30 messages in an active campaign channel to the configured dialogue provider.
- Supplies up to 8 campaign character profiles, including background, biography, personality, ideals, bonds, flaws, goals and relationships when those fields exist.
- Preserves those descriptive fields through character draft creation and validation.
- Lets the model choose `respond`, `observe`, `clarify` or `propose_action`. `observe` does not interrupt player-to-player conversation.
- Does not execute proposed actions or change game state.

The listener calls the provider for each human message in an active campaign channel, so usage can consume the free daily quota. Without Cloudflare credentials it remains silent. Context is in-memory and resets on restart.

## Privacy and operational limits
- Context is memory-only, bounded to 30 messages per channel and 100 channels by default.
- A process restart clears conversational context; campaign facts must be stored separately as validated events.
- Never send secrets, environment variables, or private player data to the dialogue provider.
- Do not process other bots or webhooks to prevent loops.
- Keep the current slash commands available as explicit controls and fallbacks.
- Do not deploy this branch to the live bot until tests and provider configuration are reviewed.
