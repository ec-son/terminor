export type ConfigCli = {
  argv?: {
    data: readonly string[];
    from?: "node" | "user";
  };

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  requiredArgsFirst?: boolean;

  /**
   * Allows unknown options on the command line. If `true`, no error will be thrown
   * for unknown options.
   */
  allowUnknownOption?: boolean;

  /**
   * Allows excess command-arguments on the command line. If `true`, no error will be thrown
   * for excess arguments.
   */
  allowExcessArguments?: boolean;

  /**
   * Displays suggestion of similar commands for unknown commands.
   */
  showSuggestionForUnknownCommand?:
    | boolean
    | {
        custormFunctionSimilar?: (
          word: string,
          candidates: string[]
        ) => string[];
        showSuggestionMessage?: (similarWords: string[]) => void;
      };

  /**
   * Displays suggestion of similar options for unknown options.
   */
  showSuggestionForUnknownOption?:
    | boolean
    | {
        custormFunctionSimilar?: (
          word: string,
          candidates: string[]
        ) => string[];
        showSuggestionMessage?: (similarWords: string[]) => void;
      };
  helpConfig?: HelpConfig;
};

export type HelpConfig = {
  windowSize?: number;
  itemWidth?: number;
  itemIndentWidth?: number;

  /**
   * space between term and description
   */
  itemSeparatorWidth?: number;
  extraInfo?:
    | {
        showType?: boolean;
        showDefaultValue?: boolean;
        showChoice?: boolean;
      }
    | boolean;
};

export type EventType =
  | "handler"
  | "post_action"
  | "pre_action"
  | "option"
  | "argument";
