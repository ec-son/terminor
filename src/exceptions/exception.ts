import { ConfigCli } from "../types/config-cli.type";
import { KsError } from "./ks-error";
import { underline, redBright, gray, cyan } from "ansi-colors";
export default () => {
  process.on("uncaughtException", function (err) {
    if (err instanceof KsError) {
      if (err.message) {
        switch (err.type) {
          case "info":
            throwException("INFO", err.typeError, err.message, {
              commandName: err.commandName,
            });
            break;

          case "warning":
            throwException("WARNING", err.typeError, err.message, {
              commandName: err.commandName,
            });
            break;

          default:
            throwException("ERROR", err.typeError, err.message, {
              commandName: err.commandName,
            });
            break;
        }
      }
    } else throw err;
  });
};

function throwException(
  flag: "ERROR" | "WARNING" | "INFO",
  typeError: string,
  message: string,
  opt?: any
): void {
  if (opt.commandName) {
    console.log("\n" + redBright(underline(`${flag}:`)), gray(typeError), "\n");
    console.log(message);
    console.log(`\nIn the ${cyan(opt.commandName)} class.`);
  } else {
    const configCli = JSON.parse(
      (process.env as any).TERMINOR_CONFIG_CLI
    ) as ConfigCli;
    if (typeof configCli.error === "boolean" && !configCli.error) return;

    if (
      !configCli.error ||
      configCli.error === true ||
      configCli.error.displayErrorType === undefined ||
      configCli.error.displayErrorType
    )
      console.log(
        "\n" + redBright(underline(`${flag}:`)),
        gray(typeError),
        "\n"
      );

    if (
      !configCli.error ||
      configCli.error === true ||
      configCli.error.displayErrorMessage === undefined ||
      configCli.error.displayErrorMessage
    )
      console.log(message);
  }
}
