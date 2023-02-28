interface OptionErrorType {
  type?: "error" | "warning" | "info";
}
export class KsError extends Error {
  constructor(public message: string, obj?: OptionErrorType) {
    super(message);
  }
}
