// import { Argument, Option, program } from "commander";
import { Command, program } from "commander";
import { Cli } from "./../";
import { AppCommand } from "./app.command";
const cli = new Cli(AppCommand);
cli.run();

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
