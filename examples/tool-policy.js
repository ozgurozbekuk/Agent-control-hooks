import { createRuntime } from "../src/runtime/createRuntime.js";
import { logging, policy } from "../src/hooks/index.js";

const runtime = createRuntime({
  hooks: [
    logging(),
    policy({
      allowTools: ["web"],
      allowDomains: ["example.com"],
    }),
  ],
});

const webTool = runtime.wrapTool("web", async ({ url }) => {
  return { ok: true, fetched: url };
});

try {
  await webTool({ url: "https://news.ycombinator.com" });
} catch (error) {
  console.log("Blocked as expected:", error.message);
}

const ok = await webTool({ url: "https://example.com/docs" });
console.log("Allowed result:", ok);
