export function wrapModel(runtime, fn, options = {}) {
  const modelName = options.name || fn.name || "model";

  return async function runModel(modelInput) {
    const start = Date.now();
    const current = {
      model: { name: modelName, input: modelInput },
    };

    await runtime.emit("PreModelCall", { current });

    try {
      const output = await fn(current.model.input);
      current.model.output = output;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("PostModelCall", { current });
      return current.model.output;
    } catch (error) {
      current.error = error;
      current.durationMs = Date.now() - start;
      runtime.baseContext.meta.timeMs += current.durationMs;

      await runtime.emit("ModelCallError", { current, error });
      throw error;
    }
  };
}
