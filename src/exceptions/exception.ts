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
  console.log("\n" + redBright(underline(`${flag}:`)), gray(typeError), "\n");
  console.log(message);
  if (opt.commandName) console.log(`\nIn the ${cyan(opt.commandName)} class.`);
}
