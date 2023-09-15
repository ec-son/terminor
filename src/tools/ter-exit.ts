import { KsError } from "../exceptions/ks-error";

/**
 * Exits the program
 * @returns {void}
 */
export function terExit() {
  // throw new KsError("");
  process.exit();
}
