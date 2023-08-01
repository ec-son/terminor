interface OptionErrorType {
  type?: "error" | "warning" | "info";
  errorType?:
    | "CommandInitializationError"
    | "InvalidTypeError"
    | "InvalidChoiceError"
    | "InvalidTypeError"
    | "InvalidDefaultValueError"
    | "UndefinedOptionNameError"
    | "MethodNotFoundError"
    | "MissingValueError"
    | "DuplicateItemError";
  commandName?: string;
}
export class KsError extends Error {
  constructor(public message: string, private opt?: OptionErrorType) {
    super(message);
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
