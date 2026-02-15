# Agent Control Hooks

Deterministic control hooks for AI agent execution.

## What this is / What this is not

This library is a framework-agnostic runtime guardrail layer for agent systems.

- What this is: deterministic policy enforcement around model calls, tool use, and steps.
- What this is not: an agent framework or orchestration engine.
- It does not orchestrate agents; it enforces deterministic rules around execution.

## Install

```bash
npm install agent-control-hooks
```

## Quickstart

```js
import { createRuntime, Hooks } from "agent-control-hooks";

const runtime = createRuntime({
  hooks: [Hooks.logging(), Hooks.budget({ maxCalls: 100 })],
});

const model = runtime.wrapModel(async (input) => ({ ok: true, input }), { name: "demo" });
const output = await model({ prompt: "Hello" });
console.log(output);
```

## Mental model

1. You write your models, tools, and steps as usual.
2. You wrap execution with `runtime.wrapModel`, `runtime.wrapTool`, or `runtime.runStep`.
3. Hooks run before and after execution to allow, deny, mutate, or ask.

## When should I use this?

- Enforce policy for tools, domains, and commands.
- Apply budget and cost limits.
- Validate outputs with schemas.
- Add observability around execution.
- Keep control logic framework-agnostic.

## Adding a rule (hook)

```js
const denyShell = async (ctx) => {
  if (ctx.event === "PreToolUse" && ctx.current?.tool?.name === "shell") {
    return { decision: "deny", reason: "shell disabled" };
  }
};

runtime.use(denyShell);
```

## API

- `createRuntime({ hooks?, onAsk?, input? })`
- `runtime.use(hook)`
- `runtime.on("Event", hook)` or `runtime.on({ event, match }, hook)`
- `runtime.emit(eventName, payload)`
- `runtime.wrapModel(fn, { name? })`
- `runtime.wrapTool(toolName, fn)`
- `runtime.runStep(stepId, fn)`

## Events

- `wrapModel`: `PreModelCall`, `PostModelCall`, `ModelCallError`
- `wrapTool`: `PreToolUse`, `PostToolUse`, `ToolUseError`
- `runStep`: `PreStep`, `PostStep`, `StepError`

## Hook decisions

| Decision | Meaning |
| --- | --- |
| `allow` | Continue execution with no changes. |
| `deny` | Stop execution and return an explicit failure. |
| `mutate` | Continue execution after applying a patch. |
| `ask` | Escalate for external approval through `onAsk`. |

## Built-in hooks

- `logging()`
- `budget({ maxTokens?, maxCalls?, maxCostUsd?, maxTimeMs? })`
- `policy({ allowTools?, denyTools?, allowDomains?, denyDomains?, denyCommands? })`
- `schemaGuard({ event = "PostModelCall", schema })`

## Examples

```bash
npm run example:model
npm run example:tool
npm run example:schema
```
