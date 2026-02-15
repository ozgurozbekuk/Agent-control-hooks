export function compose(middlewares = []) {
  if (!Array.isArray(middlewares)) {
    throw new TypeError("Middleware stack must be an array");
  }

  for (const fn of middlewares) {
    if (typeof fn !== "function") {
      throw new TypeError("Middleware must be composed of functions");
    }
  }

  return function run(ctx, next) {
    let index = -1;

    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }

      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;
      if (!fn) return undefined;

      return fn(ctx, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}
