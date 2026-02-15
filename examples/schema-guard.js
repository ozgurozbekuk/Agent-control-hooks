import { createRuntime } from "../src/runtime/createRuntime.js";
import { logging, schemaGuard } from "../src/hooks/index.js";

const runtime = createRuntime({
  hooks: [
    logging(),
    schemaGuard({
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["status", "items"],
        properties: {
          status: { type: "string" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    }),
  ],
});

const unreliableModel = runtime.wrapModel(async ({ valid }) => {
  if (valid) {
    return { status: "ok", items: ["a", "b"] };
  }

  return { status: 200, items: "wrong-shape" };
}, { name: "json-model" });

try {
  await unreliableModel({ valid: false });
} catch (error) {
  console.log("Schema blocked invalid output:", error.message);
}

const result = await unreliableModel({ valid: true });
console.log("Valid output:", result);
