import { createRuntime, Hooks } from "./src/index.js"; // veya package exports'a göre düzelt

const runtime = createRuntime({
  hooks: [Hooks.logging()]
});

console.log("OK:", typeof runtime.wrapModel === "function");
