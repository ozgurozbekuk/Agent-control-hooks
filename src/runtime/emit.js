import { compose } from "./compose.js";
import { applyPatch, createEventContext } from "./context.js";
import { DeniedError, HookError } from "./errors.js";
import { matches } from "./match.js";

async function resolveDecision(runtime, ctx, decisionResult) {
  if (!decisionResult || typeof decisionResult !== "object") {
    return;
  }

  const { decision, reason, patch } = decisionResult;

  if (!decision || decision === "allow") {
    return;
  }

  if (decision === "mutate") {
    applyPatch(ctx, patch);
    return;
  }

  if (decision === "ask") {
    if (typeof runtime.onAsk === "function") {
      const askResult = await runtime.onAsk(ctx);
      if (askResult?.ok) return;
      throw new DeniedError({
        event: ctx.event,
        reason: askResult?.reason || reason || "Ask was not approved",
      });
    }

    throw new DeniedError({
      event: ctx.event,
      reason: reason || "Ask is not supported in this runtime",
    });
  }

  if (decision === "deny") {
    throw new DeniedError({ event: ctx.event, reason });
  }
}

function wrapHook(runtime, hook) {
  return async function hookMiddleware(ctx, next) {
    let nextCalled = false;
    const result = await hook(ctx, async () => {
      nextCalled = true;
      return next();
    });

    await resolveDecision(runtime, ctx, result);

    if (!nextCalled) {
      return next();
    }

    return undefined;
  };
}

export async function emit(runtime, eventName, payload = {}) {
  const ctx = createEventContext(runtime.baseContext, eventName, payload);

  const middlewares = runtime.registry
    .filter((entry) => !entry.event || entry.event === eventName)
    .filter((entry) => matches(entry.match, ctx))
    .map((entry) => wrapHook(runtime, entry.hook));

  try {
    const runner = compose(middlewares);
    await runner(ctx, async () => undefined);
    return ctx;
  } catch (error) {
    if (error instanceof DeniedError) {
      throw error;
    }

    throw new HookError({
      event: eventName,
      message: error?.message,
      cause: error,
    });
  }
}
