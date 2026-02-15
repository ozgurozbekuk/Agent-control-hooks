function describeCurrent(ctx) {
  if (ctx.current?.model?.name) return `model=${ctx.current.model.name}`;
  if (ctx.current?.tool?.name) return `tool=${ctx.current.tool.name}`;
  if (ctx.current?.stepId) return `step=${ctx.current.stepId}`;
  return "";
}

export function logging() {
  return async function loggingHook(ctx, next) {
    const start = Date.now();
    const descriptor = describeCurrent(ctx);
    const prefix = descriptor ? `${ctx.event} ${descriptor}` : ctx.event;

    console.log(`[hookable] ${prefix}`);

    const result = await next();

    const durationMs = ctx.current?.durationMs ?? Date.now() - start;
    if (ctx.event.startsWith("Post") || ctx.event.endsWith("Error")) {
      console.log(`[hookable] ${ctx.event} done durationMs=${durationMs}`);
    }

    return result;
  };
}

export default logging;
