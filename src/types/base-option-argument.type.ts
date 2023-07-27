export interface BaseOptionArgumentInterface {
  /**
   * @property {string} description - description of argument
   */
  description?: string;
  /**
   * @property {string} required -
   */
  required?: boolean;
  /**
   * @property {Array} choices - Only allow argument value to be one of choices.
   */
  choices?: any[];
  /**
   * @property Set the default value, and optionally supply the description to be displayed in the help.
   */
  default?: any;
  /**
   * Set the custom validator
   * @param {*} value - The value to be validated.
   * @param validator - Calls the built-in validator function
   * @returns {boolean|void} Returns boolean value indicating the validation value. If the result is false, the program will be exited.
   */
  validator?: (value: any, validator: () => void) => boolean | void;
  /**
   * Set the custom transform
   * @param value - The value to be
   * @param transform - Calls the built-in transform function
   * @returns - Returns transformed value
   */
  transform?: (value: any, transform: () => any) => any;
  /**
   *
   * @param value
   * @param {string} errorType - Error type
   * @returns {string | void} Returns error message.
   * @example
   * // You can use console.log() and call terExit() function to terminate the program.
   *   onError(value, errorType) {
   *     if (errorType === "MissingValueError") {
   *       console.log("Missing value for required option 'name'");
   *       terExit();
   *    }
   *   },
   */
  onError?: (value: any, errorType: ErrorArgType) => string | void; //
}

type ErrorArgType =
  | "InvalidTypeError"
  | "InvalidChoiceError"
  | "MissingValueError";
