import { defaultDomains, defaultSecondLevelDomains, defaultTopLevelDomains } from "./utils/config";

const defaultValues = {
  domains: defaultDomains,
  secondLevelDomains: defaultSecondLevelDomains,
  topLevelDomains: defaultTopLevelDomains,
};

export { suggest, EmailButlerResponse, EmailButlerOptions } from "./suggest";
export { validate } from "./validate";
export { defaultValues };
