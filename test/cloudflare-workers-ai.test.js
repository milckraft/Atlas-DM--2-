import test from "node:test";
import assert from "node:assert/strict";
import { createCloudflareWorkersAIProvider, CLOUDFLARE_DEFAULT_MODELS } from "../src/ai/cloudflare-workers-ai.js";

function response(body, { status = 200, contentType = "application/json" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => name === "content-type" ? contentType : null },
    json: async () => body,
    text: async () => typeof body === "string" ? body : JSON.stringify(body),
    arrayBuffer: async () => Buffer.from(body)
  };
}

test("configura modelos predeterminados de texto e imagen", () => {
  assert.equal(CLOUDFLARE_DEFAULT_MODELS.text, "@cf/zai-org/glm-4.7-flash");
  assert.equal(CLOUDFLARE_DEFAULT_MODELS.image, "@cf/black-forest-labs/flux-1-schnell");
});

test("envía narración a Workers AI y analiza una respuesta JSON", async () => {
  let request;
  const provider = createCloudflareWorkersAIProvider({
    accountId: "account-test", apiToken: "token-test",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response({ success: true, result: { response: '{"summary":"Historia coherente","recommendations":[]}' } });
    }
  });
  const result = await provider.narrative({ prompt: "Analiza esta historia" });
  assert.equal(result.summary, "Historia coherente");
  assert.match(request.url, /accounts\/account-test\/ai\/run\//);
  assert.equal(request.options.headers.Authorization, "Bearer token-test");
});

test("interpreta conversación y valida la decisión estructurada", async () => {
  const provider = createCloudflareWorkersAIProvider({
    accountId: "a", apiToken: "t",
    fetchImpl: async () => response({ result: { response: '{"decision":"observe","reply":"","action":null,"clarification":null}' } })
  });
  const result = await provider.interpretConversation({ messages: [{ authorName: "Jugador", content: "Estoy hablando con otro jugador" }] });
  assert.equal(result.decision, "observe");
});

test("rechaza decisiones conversacionales que intentan usar una forma desconocida", async () => {
  const provider = createCloudflareWorkersAIProvider({
    accountId: "a", apiToken: "t",
    fetchImpl: async () => response({ result: { response: '{"decision":"roll_dice","reply":"He tirado por ti","action":null}' } })
  });
  await assert.rejects(() => provider.interpretConversation({ messages: [{ content: "Ataca" }] }), /decisión de conversación no válida/);
});

test("devuelve imagen PNG en base64 cuando el modelo entrega JSON", async () => {
  const provider = createCloudflareWorkersAIProvider({
    accountId: "a", apiToken: "t",
    fetchImpl: async () => response({ result: { image: "aGVsbG8=" } })
  });
  const result = await provider.generateImage({ prompt: "Una ciudad fantástica" });
  assert.equal(result.mimeType, "image/jpeg");
  assert.equal(result.imageBase64, "aGVsbG8=");
});

test("rechaza solicitudes de imagen vacías", async () => {
  const provider = createCloudflareWorkersAIProvider({
    accountId: "a", apiToken: "t", fetchImpl: async () => response({})
  });
  await assert.rejects(() => provider.generateImage({ prompt: " " }), /descripción de imagen/);
});
