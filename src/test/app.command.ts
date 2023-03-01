import { App, Option } from "..";

@App({
  description: "New command cli",
  commandName: "new-cli",
  arguments: [
    {
      name: "name",
      description: "The name of the command",
      // required: true,
      type: "string",
    },
    {
      name: "file",
      description: "The name of the command",
      // required: true,
      type: "string",
    },
  ],
})
export class AppCommand {
  @Option({
    name: "-n, --name",
    description: "The name of the command",
    type: "number",
    required: true,
  })
  private name;
  handler(obj) {
    console.log("==================================");
    console.log(
      "🚀 ~ file: app.comand.ts:18 ~ AppComponent ~ handler ~ obj:",
      obj
    );
    console.log("name option: ", this.name);
    console.log("======================");

    // console.log("handler: ", this.name1);
  }
  init() {
    // console.log("init");
  }
}
