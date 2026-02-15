import { createBaseContext } from "./context.js";
import { emit as emitEvent } from "./emit.js";
import { runStep as makeStep } from "./runStep.js";
import { wrapModel as makeModel } from "./wrapModel.js";
import { wrapTool as makeTool } from "./wrapTool.js";

export function createRuntime(options = {}) {
  const runtime = {
    onAsk: options.onAsk,
    baseContext: createBaseContext({ input: options.input }),
    registry: [],
  };

  const api = {
    use(hook) {
      runtime.registry.push({ hook });
      return api;
    },

    on(eventNameOrSpec, hook) {
      if (typeof eventNameOrSpec === "string") {
        runtime.registry.push({ event: eventNameOrSpec, hook });
        return api;
      }

      if (eventNameOrSpec && typeof eventNameOrSpec === "object") {
        runtime.registry.push({
          event: eventNameOrSpec.event,
          match: eventNameOrSpec.match,
          hook,
        });
      }

      return api;
    },

    emit(eventName, payload) {
      return emitEvent(runtime, eventName, payload);
    },

    wrapModel(fn, modelOptions = {}) {
      return makeModel(api, fn, modelOptions);
    },

    wrapTool(toolName, fn) {
      return makeTool(api, toolName, fn);
    },

    runStep(stepId, fn) {
      return makeStep(api, stepId, fn)();
    },

    get state() {
      return runtime.baseContext.state;
    },

    get meta() {
      return runtime.baseContext.meta;
    },

    get runId() {
      return runtime.baseContext.runId;
    },

    get registry() {
      return runtime.registry;
    },

    get baseContext() {
      return runtime.baseContext;
    },

    get onAsk() {
      return runtime.onAsk;
    },
  };

  for (const hook of options.hooks || []) {
    api.use(hook);
  }

  return api;
}

export default createRuntime;
