function toSet(values) {
  return new Set((values || []).map((v) => String(v).toLowerCase()));
}

function matchesDomain(domain, rule) {
  if (rule === "*") return true;
  const r = String(rule).toLowerCase();
  const d = String(domain).toLowerCase();
  return d === r || d.endsWith(`.${r}`);
}

function extractDomain(toolInput) {
  const raw = toolInput?.url || toolInput?.href;
  if (!raw || typeof raw !== "string") return null;

  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function matchesCommand(command, rule) {
  if (!rule) return false;
  if (rule instanceof RegExp) return rule.test(command);
  return String(command).includes(String(rule));
}

export function policy(options = {}) {
  const allowTools = toSet(options.allowTools);
  const denyTools = toSet(options.denyTools);
  const allowDomains = options.allowDomains || null;
  const denyDomains = options.denyDomains || null;
  const denyCommands = options.denyCommands || [];

  return async function policyHook(ctx) {
    if (ctx.event !== "PreToolUse") {
      return undefined;
    }

    const toolName = String(ctx.current?.tool?.name || "").toLowerCase();

    if (denyTools.has(toolName)) {
      return { decision: "deny", reason: `Tool denied by policy: ${toolName}` };
    }

    if (allowTools.size > 0 && !allowTools.has(toolName)) {
      return { decision: "deny", reason: `Tool not allowed by policy: ${toolName}` };
    }

    const domain = extractDomain(ctx.current?.tool?.input);
    if (domain && denyDomains?.some((rule) => matchesDomain(domain, rule))) {
      return { decision: "deny", reason: `Domain denied by policy: ${domain}` };
    }

    if (domain && allowDomains?.length > 0 && !allowDomains.some((rule) => matchesDomain(domain, rule))) {
      return { decision: "deny", reason: `Domain not allowed by policy: ${domain}` };
    }

    const command = ctx.current?.tool?.input?.command;
    if (toolName === "shell" && typeof command === "string") {
      const hit = denyCommands.find((rule) => matchesCommand(command, rule));
      if (hit) {
        return { decision: "deny", reason: `Shell command denied by policy: ${command}` };
      }
    }

    return undefined;
  };
}

export default policy;
