export function wrapTool(runtime, toolName, fn) {
  return async function runTool(toolInput) {
    const start = Date.now();
    const current = {
      tool: { name: toolName, input: toolInput },
    };

    await runtime.emit("PreToolUse", { current });

    try {
      const output = await fn(current.tool.input);
      current.tool.output = output;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("PostToolUse", { current });
      return current.tool.output;
    } catch (error) {
      current.error = error;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("ToolUseError", { current, error });
      throw error;
    }
  };
}
