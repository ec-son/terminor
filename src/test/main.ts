import { Cli } from "./../";
import { AppCommand } from "./app.command";
const cli = new Cli(new AppCommand());
cli.run();
