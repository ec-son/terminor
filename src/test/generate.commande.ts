import { TextFileCommand } from "./text-file.command";
import { ServiceCommand } from "./service.commande";
import { Command, Option } from "../decorators";

@Command({
  commandName: "generate",
  alias: "g",
  arguments: [
    {
      name: "filename",
      type: "string",
      description: "Filename to generate",
    },
  ],
  subCommands: ["service"],
})
export class GenerateCommand {
  @Option({
    name: "-g, --gen",
    type: "number",
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log("I'am at Generate Command");
    console.log(obj);
  }
}
