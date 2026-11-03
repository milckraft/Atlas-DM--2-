const DEFAULT_MAX_MESSAGES = 30;
const DEFAULT_MAX_CHANNELS = 100;

function validateLimit(value, name) {
  if (!Number.isInteger(value) || value < 1) throw new TypeError(`${name} debe ser un entero positivo.`);
  return value;
}

/**
 * Bounded, in-memory conversation context for a Discord campaign channel.
 * This stores only recent message metadata/content; it does not change game state.
 */
export function createConversationContextStore({
  maxMessagesPerChannel = DEFAULT_MAX_MESSAGES,
  maxChannels = DEFAULT_MAX_CHANNELS
} = {}) {
  validateLimit(maxMessagesPerChannel, "maxMessagesPerChannel");
  validateLimit(maxChannels, "maxChannels");
  const channels = new Map();

  function getChannel(channelId) {
    if (typeof channelId !== "string" || !channelId.trim()) {
      throw new TypeError("channelId debe ser texto no vacío.");
    }
    let messages = channels.get(channelId);
    if (!messages) {
      if (channels.size >= maxChannels) {
        const oldestChannel = channels.keys().next().value;
        channels.delete(oldestChannel);
      }
      messages = [];
      channels.set(channelId, messages);
    } else {
      channels.delete(channelId);
      channels.set(channelId, messages);
    }
    return messages;
  }

  return {
    append(channelId, message) {
      if (!message || typeof message !== "object") throw new TypeError("message debe ser un objeto.");
      if (typeof message.authorId !== "string" || !message.authorId.trim()) throw new TypeError("authorId debe ser texto no vacío.");
      if (typeof message.content !== "string" || !message.content.trim()) throw new TypeError("content debe ser texto no vacío.");
      const entry = {
        messageId: typeof message.messageId === "string" ? message.messageId : null,
        authorId: message.authorId,
        authorName: typeof message.authorName === "string" ? message.authorName : "Jugador",
        content: message.content.trim().slice(0, 2000),
        timestamp: message.timestamp ?? new Date().toISOString(),
        replyToMessageId: typeof message.replyToMessageId === "string" ? message.replyToMessageId : null,
        replyToAuthorName: typeof message.replyToAuthorName === "string" ? message.replyToAuthorName.slice(0, 80) : null,
        mentions: Array.isArray(message.mentions) ? message.mentions.filter(name => typeof name === "string").slice(0, 20) : []
      };
      const messages = getChannel(channelId);
      messages.push(entry);
      if (messages.length > maxMessagesPerChannel) messages.splice(0, messages.length - maxMessagesPerChannel);
      return entry;
    },
    getRecent(channelId, limit = maxMessagesPerChannel) {
      validateLimit(limit, "limit");
      const messages = channels.get(channelId) ?? [];
      return messages.slice(-Math.min(limit, maxMessagesPerChannel)).map(message => ({ ...message, mentions: [...message.mentions] }));
    },
    clear(channelId) {
      if (channelId == null) { channels.clear(); return; }
      channels.delete(channelId);
    },
    get size() { return channels.size; }
  };
}

/**
 * Classifies message routing without pretending to understand natural language.
 * "ambient" messages remain in context; an AI dialogue provider may later decide
 * whether Atlas should speak. Commands, bots and webhooks are never forwarded.
 */
export function classifyDiscordMessage(message, { botUserId = null } = {}) {
  if (!message || typeof message !== "object") throw new TypeError("message debe ser un objeto.");
  if (message.author?.bot || message.webhookId) return { kind: "ignore", reason: "automated_message" };
  if (!message.guildId || !message.channelId) return { kind: "ignore", reason: "outside_guild" };
  const content = typeof message.content === "string" ? message.content.trim() : "";
  if (!content) return { kind: "ignore", reason: "empty_message" };
  if (content.startsWith("/")) return { kind: "ignore", reason: "command" };
  const mentionsBot = Boolean(botUserId && message.mentions?.users?.has?.(botUserId));
  const repliesToBot = Boolean(botUserId && message.reference?.messageId && message.referencedMessage?.author?.id === botUserId);
  return {
    kind: mentionsBot || repliesToBot ? "addressed_to_dm" : "ambient",
    reason: mentionsBot ? "bot_mentioned" : repliesToBot ? "reply_to_bot" : "conversation_context",
    shouldConsiderResponse: true
  };
}
