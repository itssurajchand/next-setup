import { utils } from "./utils";

const getParsedJson = (stringifiedJson: any): Record<string, any> => {
  if (stringifiedJson && utils.isJson(stringifiedJson)) {
    return JSON.parse(stringifiedJson);
  }

  return {};
};

export { getParsedJson };
