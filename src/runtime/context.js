let idCounter = 0;

function generateRunId() {
  idCounter += 1;
  return `run_${Date.now()}_${idCounter}`;
}

export function createBaseContext(options = {}) {
  return {
    runId: options.runId || generateRunId(),
    input: options.input,
    state: options.state || {},
    meta: {
      calls: 0,
      retries: 0,
      timeMs: 0,
      tokensUsed: 0,
      costUsd: 0,
      ...(options.meta || {}),
    },
  };
}

export function createEventContext(base, event, payload = {}) {
  return {
    event,
    runId: base.runId,
    timestamp: Date.now(),
    input: base.input,
    state: base.state,
    meta: base.meta,
    ...payload,
  };
}

export function applyPatch(ctx, patch) {
  if (!patch || typeof patch !== "object") {
    return;
  }

  const { target, value } = patch;

  switch (target) {
    case "model.input": {
      if (!ctx.current?.model) ctx.current = { ...(ctx.current || {}), model: {} };
      ctx.current.model.input = value;
      return;
    }
    case "tool.input": {
      if (!ctx.current?.tool) ctx.current = { ...(ctx.current || {}), tool: {} };
      ctx.current.tool.input = value;
      return;
    }
    case "model.output": {
      if (!ctx.current?.model) ctx.current = { ...(ctx.current || {}), model: {} };
      ctx.current.model.output = value;
      return;
    }
    case "tool.output": {
      if (!ctx.current?.tool) ctx.current = { ...(ctx.current || {}), tool: {} };
      ctx.current.tool.output = value;
      return;
    }
    case "state": {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(ctx.state, value);
      } else {
        ctx.state.value = value;
      }
      return;
    }
    default:
      return;
  }
}
