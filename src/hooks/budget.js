function deny(reason) {
  return { decision: "deny", reason };
}

function shouldCount(event) {
  return event === "PreModelCall" || event === "PreToolUse" || event === "PreStep";
}

export function budget(options = {}) {
  return async function budgetHook(ctx) {
    const {
      maxTokens,
      maxCalls,
      maxCostUsd,
      maxTimeMs,
    } = options;

    if (shouldCount(ctx.event)) {
      ctx.meta.calls = (ctx.meta.calls || 0) + 1;
    }

    if (typeof maxCalls === "number" && ctx.meta.calls > maxCalls) {
      return deny(`Call budget exceeded: ${ctx.meta.calls} > ${maxCalls}`);
    }

    if (typeof maxTokens === "number" && (ctx.meta.tokensUsed || 0) > maxTokens) {
      return deny(`Token budget exceeded: ${ctx.meta.tokensUsed} > ${maxTokens}`);
    }

    if (typeof maxCostUsd === "number" && (ctx.meta.costUsd || 0) > maxCostUsd) {
      return deny(`Cost budget exceeded: ${ctx.meta.costUsd} > ${maxCostUsd}`);
    }

    if (typeof maxTimeMs === "number" && (ctx.meta.timeMs || 0) > maxTimeMs) {
      return deny(`Time budget exceeded: ${ctx.meta.timeMs}ms > ${maxTimeMs}ms`);
    }

    return undefined;
  };
}

export default budget;
