import { defaultDomains, defaultSecondLevelDomains, defaultTopLevelDomains } from "./utils/config";

const defaultValues = {
  domains: defaultDomains,
  secondLevelDomains: defaultSecondLevelDomains,
  topLevelDomains: defaultTopLevelDomains,
};

export { suggest, EmailCheckResponse, EmailCheckerOptions } from "./suggest";
export { validate } from "./validate";
export { defaultValues };
