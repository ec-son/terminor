type ArgDataType = { name: string; value: any };
type OptDataType = { [key: string]: any };

export class TerData {
  constructor(
    private readonly args?: Array<ArgDataType>,
    private readonly opts?: OptDataType
  ) {}

  getArgument(argumentName: string): ArgDataType | undefined {
    return this.args?.find((value) => value.name === argumentName);
  }

  getAllArguments(): ArgDataType[] | undefined {
    return this.args;
  }

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

  getOption(optionName: string): OptDataType | undefined {
    return this.opts && this.opts[optionName];
  }

  getAllOptions(): OptDataType | undefined {
    return this.opts;
  }
}
