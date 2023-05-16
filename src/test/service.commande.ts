import { GenerateCommand } from "./generate.commande";
import { Command, Option } from "../decorators";
import { TextFileCommand } from "./text-file.command";

@Command({
  commandName: "service",
  alias: "s",
  arguments: [
    {
      name: "name",
      type: String,
      description: "name of service to generatee",
    },
  ],
  subCommands: ["generate"],
})
export class ServiceCommand {
  @Option({
    name: "-g, --gen",
    type: Number,
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log("I'am at Service Command");
    console.log(obj);
  }
}
