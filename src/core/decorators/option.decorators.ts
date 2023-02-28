import { DataOption } from "../interfaces";
import { Option as _O, program } from "commander";

export function Option(option: DataOption) {
  return function (target, optName: string) {
    const newOption = new _O(option.name, option.description);
    newOption.required = true;
    program.addOption(newOption);
  };
}
