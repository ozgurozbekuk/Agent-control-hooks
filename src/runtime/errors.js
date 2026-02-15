export class DeniedError extends Error {
  constructor({ event, reason = "Denied by hook" }) {
    super(reason);
    this.name = "DeniedError";
    this.event = event;
    this.reason = reason;
  }
}

export class HookError extends Error {
  constructor({ event, message, cause }) {
    super(message || `Hook failure on event ${event}`);
    this.name = "HookError";
    this.event = event;
    this.cause = cause;
  }
}
