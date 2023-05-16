export interface BaseOptionArgumentInterface {
  name: string; // name of argument
  description?: string; // description of argument
  required?: boolean;
  choices?: any[]; //Only allow argument value to be one of choices.
  default?: any; // Set the default value, and optionally supply the description to be displayed in the help.
  argParse?: (value: string) => any; // Set the custom handler for processing CLI command arguments into argument values.
}
