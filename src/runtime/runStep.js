export function runStep(runtime, stepId, fn) {
  return async function executeStep(...args) {
    const start = Date.now();
    const current = { stepId };

    await runtime.emit("PreStep", { current });

    try {
      const result = await fn(...args);
      current.output = result;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("PostStep", { current });
      return current.output;
    } catch (error) {
      current.error = error;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("StepError", { current, error });
      throw error;
    }
  };
}
