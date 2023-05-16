// import { Argument, Option, program } from "commander";
import { Command, program } from "commander";
import { Cli } from "./../";
import { AppCommand } from "./app.command";
import { KsError } from "../exceptions/ks-error";
const cli = new Cli(AppCommand);
cli.run();

// choiceVerifing(Date, [12, "rt"]);

// let tt: number = 76
// if (tt instanceof Number) {

// }

// console.log("\x1b[31m%s\x1b[0m", "error: lorem dolor lore");
// red: "\x1b[31m%s\x1b[0m"

// const arg = new Argument("name");
// arg.choices(["asd", "tfe", "lop"]);

// const opt = new Option("-g");
// opt.choices(["aaa", "bbbb", "vd"]);

// program.addArgument(arg);
// program.addOption(opt);

// program.parse();
// error: command-argument value 'aa' is invalid for argument 'name'. Allowed choices are asd, tfe, lop.
// error: option '-g' argument 'undefined' is invalid. Allowed choices are aaa, bbbb, vd.

// const command1 = new Command("command1");
// const command2 = new Command("command2");

// // command1.addCommand(command2);
// // command2.addCommand(command1);
// command2.addCommand(command2);

// program.addCommand(command1);
// program.addCommand(command2);

// program.parse();

// const successMessage = "\x1b[32mSuccess!\x1b[0m";
// console.log(successMessage);

// const dangerMessage = "\x1b[31mDanger!\x1b[0m";
// console.log(dangerMessage);

// const warningMessage = "\x1b[33mWarning!\x1b[0m";
// console.log(warningMessage);

// const infoMessage = "\x1b[36mInfo!\x1b[0m";
// console.log(infoMessage);

//background
// const successMessage = "\x1b[32m\x1b[40mSuccess!\x1b[0m";
// console.log(successMessage);

// const dangerMessage = "\x1b[31m\x1b[41mDanger!\x1b[0m";
// console.log(dangerMessage);

// const warningMessage = "\x1b[33m\x1b[43mWarning!\x1b[0m";
// console.log(warningMessage);

// const infoMessage = "\x1b[36m\x1b[46mInfo!\x1b[0m";
// console.log(infoMessage);

//;;;

// const successMessage = "\x1b[32m\x1b[40m\x1b[1mSuccess!\x1b[0m";
// console.log(successMessage);

// const dangerMessage = "\x1b[31m\x1b[41m\x1b[1mDanger!\x1b[0m";
// console.log(dangerMessage);

// const warningMessage = "\x1b[33m\x1b[43m\x1b[1mWarning!\x1b[0m";
// console.log(warningMessage);

// const infoMessage = "\x1b[36m\x1b[46m\x1b[1mInfo!\x1b[0m";
// console.log(infoMessage);

//aaa

// const successMessage = "\x1b[32m\x1b[47m\x1b[1mSuccess!\x1b[0m";
// console.log(successMessage);

// const dangerMessage = "\x1b[31m\x1b[41m\x1b[1mDanger!\x1b[0m";
// console.log(dangerMessage);

// const warningMessage = "\x1b[33m\x1b[43m\x1b[1mWarning!\x1b[0m";
// console.log(warningMessage);

// const infoMessage = "\x1b[36m\x1b[46m\x1b[1mInfo!\x1b[0m";
// console.log(infoMessage);

//gsdvf
// const successMessage = "\x1b[42mSuccess!\x1b[0m";
// console.log(successMessage);

// const dangerMessage = "\x1b[41mDanger!\x1b[0m";
// console.log(dangerMessage);

// const warningMessage = "\x1b[43mWarning!\x1b[0m";
// console.log(warningMessage);

// const infoMessage = "\x1b[46mInfo!\x1b[0m";
// console.log(infoMessage);
