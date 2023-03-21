// import { Argument, Option, program } from "commander";
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
