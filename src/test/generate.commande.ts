import { Command, Option } from "../decorators";

@Command({
  commandName: "generate",
})
export class GenerateCommand {
  @Option({
    name: "-g, --gen",
    type: "number",
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log(
      "🚀 ~ file: app.comand.ts:18 ~ AppComponent ~ handler ~ obj:",
      obj
    );

    console.log("======================");

    console.log("handler: ", this.gen);
  }
}
