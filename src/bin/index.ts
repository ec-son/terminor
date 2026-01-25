#!/usr/bin/env node

import { Cli } from "../core";
import { AppCommand } from "./command";

const App = new Cli(AppCommand);
App.parse({
  helpConfig: {
    extraInfo: false,
  },
});
