export interface BaseOptionArgumentInterface {
  /**
   * Description of the argument.
   */
  description?: string;

  /**
   * Indicates whether the argument is required.
   */
  required?: boolean;

  /**
   * Only allow the argument value to be one of the choices.
   */
  choices?: any[];

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   */
  default?: any;

  /**
   * Indicates whether the argument accepts multiple values.
   */
  variadic?: boolean;

  /**
   * Indicates whether the value should be trimmed.
   */
  trim?: boolean;

  /**
   * Set the custom validator
   * @param {*} value The value to be validated.
   * @param validator Calls the built-in validator function
   * @returns {boolean|void} Returns boolean value indicating the validation value. If the result is false, the program will be exited.
   */
  validator?: (value: any, validator: () => void) => boolean | void;

  /**
   * Set the custom transform
   * @param value The value to be transformed.
   * @param transform Calls the built-in transform function
   * @returns Returns transformed value
   */
  transform?: (value: any, transform: () => any) => any;

  /**
   * Handles errors that occur during validation.
   * @param value The value that caused the error.
   * @param {string} errorType The type of error that occurred.
   * @returns {string | void} Returns an error message.
   * @example
   * // You can use console.log() and call terExit() function to terminate the program.
   *   onError(value, errorType) {
   *     if (errorType === "MissingValueError") {
   *       console.log("Missing value for required option 'name'");
   *       terExit();
   *    }
   *   },
   */
  onError?: (value: any, errorType: ErrorArgType) => string | void;
}

/**
 * Represents the types of errors that can occur during validation.
 */
type ErrorArgType =
  | "InvalidTypeError"
  | "InvalidChoiceError"
  | "MissingValueError";
