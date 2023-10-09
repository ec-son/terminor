export type ConfigCli = {
  /**
   * Command line arguments.
   */
  argv?: {
    /**
     * The data passed as command line arguments.
     */
    data: readonly string[];

    /**
     * The source of the command line arguments (e.g., "node", "user").
     */
    from?: "node" | "user";
  };

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  requiredArgsFirst?: boolean;

  /**
   * Allows unknown options on the command line. If `true`, no error will be thrown for unknown options.
   */
  allowUnknownOption?: boolean;

  /**
   * Allows excess command arguments on the command line. If `true`, no error will be thrown for excess arguments.
   */
  allowExcessArguments?: boolean;

  /**
   * Displays suggestion of similar commands for unknown commands.
   */
  showSuggestionForUnknownCommand?:
    | boolean
    | {
        /**
         * A custom function to determine similar words for a given word and a list of candidates.
         */
        custormFunctionSimilar?: (
          word: string,
          candidates: string[]
        ) => string[];

        /**
         * A function to display a suggestion message with similar words.
         */
        showSuggestionMessage?: (similarWords: string[]) => void;
      };

  /**
   * Displays suggestion of similar options for unknown options.
   */
  showSuggestionForUnknownOption?:
    | boolean
    | {
        /**
         * A custom function to determine similar words for a given word and a list of candidates.
         */
        custormFunctionSimilar?: (
          word: string,
          candidates: string[]
        ) => string[];

        /**
         * A function to display a suggestion message with similar words.
         */
        showSuggestionMessage?: (similarWords: string[]) => void;
      };

  /**
   * Configuration options for the help command.
   */

  helpConfig?: HelpConfig;
};

export type HelpConfig = {
  /**
   * The size of the window.
   */
  windowSize?: number;

  /**
   * The width of terms.
   */
  termWidth?: number;

  /**
   * The width of the indentation for each item.
   */
  itemIndentWidth?: number;

  /**
   * The width of the separator between the term and description.
   */
  itemSeparatorWidth?: number;

  /**
   * Additional information to display.
   */
  extraInfo?:
    | {
        /**
         * Whether to show the type information.
         */
        showType?: boolean;

        /**
         * Whether to show the default value information.
         */
        showDefaultValue?: boolean;

        /**
         * Whether to show the choice information.
         */
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
