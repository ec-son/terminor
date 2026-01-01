# Terminor

![Build Status](https://img.shields.io/badge/build-passing-4cc61e)
[![npm version](https://badgen.net/npm/v/terminor)](https://www.npmjs.com/package/terminor)
![Size](https://img.shields.io/bundlejs/size/terminor)

> **Terminor** is a lightweight framework for building command-line interfaces (CLI) in Node.js. It provides decorators, a command manager, argument/option parsing, helpers, and utilities to quickly create ergonomic and testable CLIs.

## Table of Contents

- [Installation](#installation)
  - [Use stater-template](#-use-stater-template)
  - [Manuel configuration](#-manuel-configuration)
    - [Quick Start](#quick-start)
- [Advanced Usage]()
  - [Command](#-command)
- [Repository Structure](#--repository-structure)

## Installation

To install Terminor, there are two ways: using stater-template or manual configuration.

### 🔹 Use stater-template

Create your Node.js project:

```bash
npm init create-terminor-app [projectName]
#or
npx create-terminor-app [projectName]
# or
pnpm create create-terminor-app [projectName]
```

After creating your project, navigate to the project directory and run:

```bash
# npm
npm install
# pnpm
pnpm install
# yarn
yarn install
```

After all the dependencies are installed, you can test your CLI:

There are two ways to do this:

- Use the `cli` command

```bash
# npm
npm run cli
npm run cli hello
# pnpm
pnpm cli
pnpm cli hello
# yarn
yarn cli
yarn cli hello

# Hello world!
```

### 🔹 Manual configuration

Install Terminor in your Node.js project:

```bash
# npm
npm install terminor
# pnpm
pnpm add tarminor
# yarn
yarn install
```

#### Quick Start

```ts
// src/commands/app.command.ts
import { App } from "terminor";

@App({ commandName: "my-cli", version: "1.0.0" })
export class MyApp {
  handler() {
    console.log("Hello world!");
  }
}

// src/index.ts

#!/usr/bin/env node

import { Cli } from "terminor";
import { AppCommand } from "./commands/app.command";

const App = new Cli(AppCommand);
App.parse();
```

## Auto-generated Help and Version

The framework prints a user-friendly help message when `--help` is passed. Enrich command and option descriptions to improve the output.

### HelpType

Configuration for the help option (`--help` / `-h`):

| Name          | Type                                                         | Description                                                        |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `alias`       | `string` (optional)                                          | Short alias (e.g., `"-h"`).                                        |
| `description` | `string` (optional)                                          | Description of the help option.                                    |
| `flag`        | `string` (optional)                                          | Long flag (e.g., `"--help"`).                                      |
| `text`        | `string` (optional)                                          | Raw custom help text to display instead of auto-generated output.  |
| `disabled`    | `boolean` (optional)                                         | If true, disables the help option.                                 |
| `addHelpText` | `{ position: 'after' \| 'before'; text: string }` (optional) | Additional text to append before or after the auto-generated help. |

### VersionType

Configuration for the version option (`--version` / `-v`):

| Name             | Type                                                         | Description                                                   |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `alias`          | `string` (optional)                                          | Short alias (e.g., `"-v"`).                                   |
| `description`    | `string` (optional)                                          | Description of the version option.                            |
| `disabled`       | `boolean` (optional)                                         | If true, disables the version option.                         |
| `flag`           | `string` (optional)                                          | Long flag (e.g., `"--version"`).                              |
| `text`           | `string` (optional)                                          | Custom text to display instead of the version number.         |
| `version`        | `string` (optional)                                          | The version string (e.g., `"1.0.0"`).                         |
| `addVersionText` | `{ position: 'after' \| 'before'; text: string }` (optional) | Additional text to append before or after the version output. |

## Advanced Usage

### 🔹 Command

- @App Mark the root application class and registere initialize application-level metadata.
- The `@Command` decorator is used to define a command. A command is an action that can be executed by the user.

```ts
import { Command, Handler } from "terminor";

@Command({
  commandName: "greet",
  alias: "g",
  description: "Greet a user",
  subCommands: ["rollback", "status"],
})
export class GreetCommand {
  @Handler()
  handler() {
    console.log("Hello!");
  }
}
```

Register the command in your application:

```ts
import { App } from "terminor";
import { GreetCommand } from "./commands/greet.command";

@App({
  commandName: "my-cli",
  commands: [GreetCommand],
  subCommands: ["greet"],
})
export class MyApp {
  @Handler()
  handler() {
    console.log("Main app");
  }
}
```

Command properties:

| Property          | Description                                     |
| ----------------- | ----------------------------------------------- |
| commandName       | (required) — the name of the command            |
| alias             | short alias for the command                     |
| description       | description shown in help                       |
| arguments         | array of positional arguments                   |
| subCommands       | array of sub-command names                      |
| usage             | custom usage example                            |
| helpOption        | configure help option                           |
| requiredArgsFirst | enforce required arguments before optional ones |

### 🔹 Option

The `@Option` decorator declares an option on a command. Options are named parameters with flags (e.g., `--name`, `-n`).

```ts
import { Command, Option, Handler } from "terminor";

@Command({
  commandName: "greet",
  description: "Greet a user",
})
export class GreetCommand {
  @Option({
    alias: "n",
    description: "Name of the user",
    default: "World",
  })
  name: string = "World";

  @Option({
    alias: "u",
    description: "Convert to uppercase",
    type: "boolean",
  })
  uppercase: boolean = false;

  @Handler()
  handler() {
    let message = `Hello ${this.name}!`;
    if (this.uppercase) {
      message = message.toUpperCase();
    }
    console.log(message);
  }
}
```

Usage:

```bash
node dist/index.js greet --name Alice
node dist/index.js greet -n Alice -u
```

Option with all properties

```ts
@Option({
  optionName: 'count',
  flag: '--count',
  alias: '-c',
  type: 'number',
  description: 'Number of items to process',
  default: 10,
  required: false,
  choices: [5, 10, 20, 50],
  variadic: false,
  trim: true,
  validator: (value) => value > 0,
  transform: (value) => Math.abs(value),
  onError: (value, errorType) => {
    if (errorType === 'InvalidChoiceError') {
      return 'Count must be 5, 10, 20, or 50.';
    }
  }
})
count!: number;
```

Option properties:

| property    | description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| flag        | long flag name (auto-derived from property name if omitted)                                |
| alias       | short alias (single letter, e.g., `n` becomes `-n`)                                        |
| description | shown in help text                                                                         |
| type        | `'string'`, `'number'`, `'boolean'`, or `'date'` (inferred from property value if omitted) |
| default     | default value if not provided                                                              |
| choices     | array of allowed values                                                                    |
| variadic    | accept multiple values                                                                     |
| required    | mark as required                                                                           |
| validator   | custom validation function                                                                 |
| transform   | custom transformation function                                                             |
| onError     | custom error handler                                                                       |

Example with choices and validation:

```ts
@Option({
  alias: "c",
  description: "Choose a color",
  choices: ["red", "green", "blue"],
  default: "red",
})
color: string = "red";

@Option({
  alias: "p",
  description: "Port number",
  type: "number",
  validator: (value) => {
    if(value > 0 && value < 65536){
      console.log("....")
      terExit()
    }
    validator() // call internal validator
  },
})
port: number = 3000;
```

### 🔹 Argument

Arguments are positional parameters passed to a command. Unlike options, arguments don't require a flag.

```ts
import { Command, Handler, ArgumentData } from "terminor";

@Command({
  commandName: "greet",
  description: "Greet a user",
  arguments: [
    {
      argumentName: "name",
      description: "Name of the user",
      required: true,
    },
  ],
  requiredArgsFirst: true,
})
export class GreetCommand {
  @Handler()
  handler(@ArgumentData("name") name: string) {
    console.log(`Hello ${name}!`);
  }
}
```

Usage:

```bash
node dist/index.js greet Alice
```

Define multiple arguments:

```ts
@Command({
  commandName: "greet",
  arguments: [
    {
      argumentName: "firstName",
      description: "First name",
      required: true,
    },
    {
      argumentName: "lastName",
      description: "Last name",
      required: false,
    },
  ],
})
export class GreetCommand {
  @Handler()
  handler(
    @ArgumentData("firstName") firstName: string,
    @ArgumentData("lastName") lastName: string
  ) {
    console.log(`Hello ${firstName} ${lastName || ""}!`);
  }
}
```

Variadic arguments (accept multiple values):

```ts
@Command({
  commandName: "greet",
  arguments: [
    {
      argumentName: "names",
      description: "Names to greet",
      required: true,
      variadic: true,
    },
  ],
})
export class GreetCommand {
  @Handler()
  handler(@ArgumentData("names") names: string[]) {
    names.forEach((name) => console.log(`Hello ${name}!`));
  }
}
```

Argument properties:

| property     | description                                           |
| ------------ | ----------------------------------------------------- |
| argumentName | (required) — the name of the argument                 |
| description  | description shown in help                             |
| required     | whether the argument is mandatory                     |
| type         | `'string'`, `'number'`, or `'date'` (not `'boolean'`) |
| variadic     | accept multiple values                                |
| default      | default value if not provided                         |
| choices      | array of allowed values                               |
| validator    | custom validation function                            |
| transform    | custom transformation function                        |
| onError      | custom error handler                                  |
| trim         | trim whitespace from values                           |

### Handler

- `Handler()` — registers the main handler (method executed after parsing); can be used with `Handler(trigger, type)` to create option/argument-triggered handlers.
- `PreAction()` — register a method executed before main handlers.
- `PostAction()` — register a method executed after main handlers.

Handler internals

- Handlers are registered in `metadata.handlers` with `on` event (`handler` | `pre_action` | `post_action` | `option` | `argument`), optional `trigger` and `parameters` listing parameter bindings.

Enumeration of handler event types:

| Value           | Description                                            |
| --------------- | ------------------------------------------------------ |
| `"handler"`     | Main handler executed after argument/option parsing.   |
| `"pre_action"`  | Handler executed before the main handler.              |
| `"post_action"` | Handler executed after the main handler.               |
| `"option"`      | Handler triggered when a specific option is present.   |
| `"argument"`    | Handler triggered when a specific argument is present. |

### Parameter decorators

4. Unknown options and excess arguments

```ts
@Handler()
handleName(@ArgumentData('name') name: string) {
  console.log('Name provided:', name);
}
```

- Enable `allowUnknownOption` or `allowExcessArguments` in `ConfigCli` to capture unknown options and excess args. Use `@UnknownOptionData()` or `@ExcessArgumentData()` to receive them inside handlers.

- `ArgumentData(argumentName?: string | string[])` — bind an argument value to a handler parameter. or Parameter decorator to inject a parsed argument value into a method parameter. Useful in handlers.
- `ExcessArgumentData()` — inject array of remaining (excess) positional arguments.
- `OptionData(optionName?: string | string[])` — bind an option value to a handler parameter.
- `UnknownOptionData()` — inject an object `{ [optionName]: value }` with unknown options when `allowUnknownOption` is enabled.

### Error Types

When validation fails, the `onError` callback receives one of these error types:

| Error Type             | Description                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `"InvalidTypeError"`   | The parsed value does not match the declared type (e.g., `"abc"` for a number option). |
| `"InvalidChoiceError"` | The parsed value is not in the `choices` array.                                        |
| `"MissingValueError"`  | A required option/argument was not provided or has no value.                           |

### CLI config

```ts
new Cli(AppRoot).parse({
  allowUnknownOption: false,
  allowExcessArguments: false,
  showSuggestionForUnknownCommand: {
    custormFunctionSimilar: (word, candidates) => {
      // Custom similarity algorithm
      return candidates.filter((c) => c.startsWith(word));
    },
    showSuggestionMessage: (words) => {
      console.error(`Did you mean: ${words.join(", ")}?`);
    },
  },
  helpConfig: {
    termWidth: 40,
    extraInfo: {
      showType: true,
      showDefaultValue: true,
      showChoice: true,
    },
  },
});
```

| property                        | description                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| argv                            | Command line arguments                                                                                        |
| requiredArgsFirst               | Indicates whether all required arguments must precede all optional arguments in the command line order.       |
| allowUnknownOption              | Allows unknown options on the command line. If `true`, no error will be thrown for unknown options.           |
| allowExcessArguments            | Allows excess command arguments on the command line. If `true`, no error will be thrown for excess arguments. |
| showSuggestionForUnknownCommand | Displays suggestion of similar commands for unknown commands.                                                 |
| custormFunctionSimilar          | A custom function to determine similar words for a given word and a list of candidates.                       |
| showSuggestionForUnknownOption  | Displays suggestion of similar options for unknown options.                                                   |
| helpConfig                      | Configuration options for the help.                                                                           |

#### HelpConfig

Configuration for help formatting and display:

| Name                 | Type                                                                                             | Description                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `windowSize`         | `number` (optional)                                                                              | Terminal window width in characters. Defaults to `process.stdout.getWindowSize()[0]`.           |
| `termWidth`          | `number` (optional)                                                                              | Term column width as a percentage (0–100) of `windowSize`. Defaults to 30%.                     |
| `itemIndentWidth`    | `number` (optional)                                                                              | Left indent for each help item (flags, arguments, commands). Defaults to 2 spaces.              |
| `itemSeparatorWidth` | `number` (optional)                                                                              | Space between item and description. Defaults to 2 spaces.                                       |
| `extraInfo`          | `boolean \| { showType?: boolean; showDefaultValue?: boolean; showChoice?: boolean }` (optional) | Control which extra info to display in help. If `boolean`, `true` shows all, `false` hides all. |

## 🔹 Repository Structure

- `src` :
- `src/command` : core runtime (execution, parsing)
- `src/index.ts` :

## Features

- Decorator-based declaration of commands, actions and options
- Automatic argument parsing and validation
- Auto-generated help and application info
- Utilities for formatting flags, validating choices, and suggesting corrections

## Reporting Issues

If you encounter any issues, have questions, or want to contribute to the project, please visit the [GitHub repository](https://github.com/ec-son/terminor/issues) and open an issue.

## License

This project is licensed under the [MIT License](https://github.com/ec-son/terminor/blob/main/LICENSE).
