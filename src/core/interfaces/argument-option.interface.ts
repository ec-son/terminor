export interface ArgumentOption {
  name: string; // name of argument
  description?: string; // description of argument
  required?: boolean;
  type?: "string" | "number" | "float" | "date";
  choices?: any[]; //Only allow argument value to be one of choices.
  defeault?: any; // Set the default value, and optionally supply the description to be displayed in the help.
  argParse?: (value: string) => any; // Set the custom handler for processing CLI command arguments into argument values.
}
