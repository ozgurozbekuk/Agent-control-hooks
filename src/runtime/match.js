function isRegex(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

function getMatchTarget(ctx) {
  const event = ctx?.event || "";

  if (event.includes("Tool") || event === "PreToolUse" || event === "PostToolUse" || event === "ToolUseError") {
    return ctx?.current?.tool?.name;
  }

  if (event.includes("Model") || event === "PreModelCall" || event === "PostModelCall" || event === "ModelCallError") {
    return ctx?.current?.model?.name;
  }

  if (event.includes("Step") || event === "PreStep" || event === "PostStep" || event === "StepError") {
    return ctx?.current?.stepId;
  }

  return undefined;
}

export function matches(matcher, ctx) {
  if (matcher === undefined || matcher === null) {
    return true;
  }

  const target = getMatchTarget(ctx);
  if (target === undefined || target === null) {
    return false;
  }

  if (typeof matcher === "string") {
    return target === matcher;
  }

  if (isRegex(matcher)) {
    return matcher.test(String(target));
  }

  return false;
}
