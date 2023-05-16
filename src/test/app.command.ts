import { GenerateCommand } from "./generate.commande";
import { ServiceCommand } from "./service.commande";
import { TextFileCommand } from "./text-file.command";
import { App, Command, Option } from "../decorators";

@App({
  description: "New command cli",
  commandName: "new-cli",
  arguments: [
    {
      name: "name",
      description: "The name of the command",
      // required: true,
      type: String,
      // choices: ["asd", "cfd", "bds"],
      default: "12",
    },
    {
      name: "file",
      description: "The name of the command",
      // required: true,
      type: String,
    },
  ],
  subCommands: ["generate", "text-file", "service"],
  commands: [
    TextFileCommand,
    ServiceCommand,
    GenerateCommand,
    // ServiceCommand,
    // ServiceCommand,
    // TextFileCommand,
  ],
})
export class AppCommand {
  @Option({
    name: "-n, --name",
    description: "The name of the command",
    type: Number,
    required: true,
    // choices: [1, 2, 3],
    default: 31,
  })
  private name;
  handler(obj) {
    console.log("==================================");
    console.log("I'am at App Command");
    console.log(obj);
  }
  init() {
    // console.log("init");
  }
}
