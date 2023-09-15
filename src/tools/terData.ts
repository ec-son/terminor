type ArgDataType = { name: string; value: any };
type OptDataType = { [key: string]: any };

export class TerData {
  constructor(
    private readonly args?: Array<ArgDataType>,
    private readonly opts?: OptDataType
  ) {}

  /**
   * Retrieve argument value.
   * @param {string} argumentName The name of the argument to retrieve.
   * @returns {ArgDataType | undefined} The value of the argument if found, otherwise undefined.
   */
  getArgument(argumentName: string): ArgDataType | undefined {
    return this.args?.find((value) => value.name === argumentName);
  }

  /**
   * Retrieve an array of all available arguments.
   * @returns {Array<ArgDataType>} An array containing all available arguments.
   */
  getAllArguments(): ArgDataType[] {
    return this.args || [];
  }

  /**
   * Performs the specified action for each available arguments.
   * @param {function} callbackfn A function that accepts up to three arguments.
   * forEachArgument calls the callbackfn function one time for each available arguments.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  forEachArgument(
    callbackfn: (
      value: ArgDataType,
      index: number,
      array: ArgDataType[]
    ) => void,
    thisArg?: any
  ): void | undefined {
    this.args?.forEach(callbackfn, thisArg);
  }

  /**
   * Retrieve option value.
   * @param {string} optionName The name of the option to retrieve.
   * @returns {OptDataType | undefined} The value of the argument if found, otherwise undefined.
   */
  getOption(optionName: string): OptDataType | undefined {
    return this.opts && this.opts[optionName];
  }

  /**
   * Retrieve an array of all available options.
   * @returns {ArgDataType} An array containing all available options.
   */
  getAllOptions(): OptDataType {
    return this.opts || {};
  }
}
