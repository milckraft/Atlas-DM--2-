# Always-on Discord conversation mode

## Goal
Atlas DM observes every human message in the configured campaign channel, maintains a bounded recent context, distinguishes direct address from ambient table conversation, and only speaks when the dialogue policy decides it is useful. "Always active" means always context-aware, not that it replies to every line.

## Message pipeline
1. Ignore bots, webhooks, DMs, empty messages and slash-command payloads.
2. Capture author ID/name, message ID, content, timestamp, mentions and reply target.
3. Keep a bounded rolling context per channel. This first implementation is in-memory and is intentionally not campaign canon or persistent game state.
4. Classify direct mentions/replies to Atlas separately from ambient table conversation.
5. Send context to a dialogue provider for semantic interpretation when one is configured.
6. Validate the provider's structured intent. The provider may propose dialogue/action intent but may not roll dice, set DCs, change character sheets, award items/XP, or mutate campaign state.
7. Route mechanical actions to deterministic rules services; route player/NPC conversation to narration; route ambiguous intent to a short clarification.
8. Persist only validated game events through the campaign store.

## Important current limitation
The repository currently has no configured dialogue provider by default (`AI_PROVIDER` defaults to `disabled`). The existing keyword action detector is not a natural-language understanding system. This change adds the safe context and routing foundation; fully natural conversation requires implementing and configuring a provider adapter and adding structured-output validation before enabling automatic narration.

## Privacy and operational limits
- Context is memory-only, bounded to 30 messages per channel and 100 channels by default.
- A process restart clears conversational context; campaign facts must be stored separately as validated events.
- Never send secrets, environment variables, or private player data to the dialogue provider.
- Do not process other bots or webhooks to prevent loops.
- Keep the current slash commands available as explicit controls and fallbacks.
- Do not deploy this branch to the live bot until tests and provider configuration are reviewed.
