import { createRuntime } from "../src/runtime/createRuntime.js";
import { budget, logging } from "../src/hooks/index.js";

const runtime = createRuntime({
  hooks: [logging(), budget({ maxCalls: 10, maxTimeMs: 60_000 })],
});

runtime.on("PreModelCall", async (ctx) => {
  const input = ctx.current.model.input || {};
  const messages = Array.isArray(input.messages) ? input.messages : [];

  return {
    decision: "mutate",
    patch: {
      target: "model.input",
      value: {
        ...input,
        temperature: 0.2,
        messages: [{ role: "system", content: "Respond with valid JSON." }, ...messages],
      },
    },
  };
});

const fakeModel = runtime.wrapModel(
  async (modelInput) => {
    return {
      answer: "ok",
      temperatureUsed: modelInput.temperature,
      messageCount: modelInput.messages?.length || 0,
    };
  },
  { name: "fake-gpt" }
);

const result = await fakeModel({
  temperature: 0.9,
  messages: [{ role: "user", content: "Say hello" }],
});

console.log("Model result:", result);
console.log("Meta:", runtime.meta);
