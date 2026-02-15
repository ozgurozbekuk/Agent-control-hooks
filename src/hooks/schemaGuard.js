import Ajv from "ajv";

export function schemaGuard(options = {}) {
  const eventName = options.event || "PostModelCall";
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(options.schema || {});

  return async function schemaGuardHook(ctx) {
    if (ctx.event !== eventName) {
      return undefined;
    }

    const output = ctx.current?.model?.output ?? ctx.current?.modelOutput;
    const valid = validate(output);

    if (!valid) {
      const reason = ajv.errorsText(validate.errors, { separator: "; " });
      return {
        decision: "deny",
        reason: `Schema validation failed: ${reason}`,
      };
    }

    return undefined;
  };
}

export default schemaGuard;
