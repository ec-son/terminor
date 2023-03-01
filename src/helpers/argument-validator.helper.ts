export const argumentValidator = (value: any, argument: any) => {
  switch (argument.type) {
    case "number":
      if (!Number.isInteger(parseInt(value)))
        throw new Error(`'${argument.name}' argument must be a number`);
      value = parseInt(value);
      break;
    case "float":
      if (!Number.isInteger(parseInt(value)))
        throw new Error(`'${argument.name}' argument must be a float`);
      value = parseFloat(value);
      break;
    case "date":
      if (!/^.+[\/|\-].+$/.test(value) || Number.isNaN(Date.parse(value)))
        throw new Error(`'${argument.name}' argument must be a date`);
      value = new Date(value);
      break;
  }

  if (argument.argParse) return argument.argParse(value);
  return value;
};
