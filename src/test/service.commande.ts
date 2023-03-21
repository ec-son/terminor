import { GenerateCommand } from "./generate.commande";
import { Command, Option } from "../decorators";
import { TextFileCommand } from "./text-file.command";

@Command({
  commandName: "service",
  alias: "s",
  arguments: [
    {
      name: "name",
      type: "string",
      description: "name of service to generatee",
    },
  ],
  // commands: [GenerateCommand],
})
export class ServiceCommand {
  @Option({
    name: "-g, --gen",
    type: "number",
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log(
      "🚀 ~ file: service.commande.ts:23 ~ ServiceCommand ~ handler ~ obj:",
      obj
    );
    console.log("==================================");

    console.log("======================");

    console.log("handler: ", this.gen);
  }
}
