interface OptionErrorType {
  type?: "error" | "warning" | "info";
  errorType?:
    | "CommandInitializationError"
    | "CommandNotFoundError"
    | "InvalidTypeError"
    | "InvalidChoiceError"
    | "InvalidTypeError"
    | "InvalidDefaultValueError"
    | "UndefinedOptionNameError"
    | "MethodNotFoundError"
    | "MissingValueError"
    | "DuplicateItemError"
    | "UnknownOptionError"
    | "UnknownCommandError"
    | "UnknownArgumentError";
  commandName?: string;
}
export class KsError extends Error {
  constructor(message: string | string[], private opt?: OptionErrorType) {
    if (!Array.isArray(message)) message = [message];
    super(message.join("\n"));
  }

  get type() {
    return this.opt?.type || "info";
  }

  get typeError() {
    return this.opt?.errorType || "error";
  }

  get commandName() {
    return this.opt?.commandName;
  }
}
