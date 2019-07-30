import { defaultDomains, defaultSecondLevelDomains, defaultTopLevelDomains } from "./config";

const defaultValues = {
  domains: defaultDomains,
  secondLevelDomains: defaultSecondLevelDomains,
  topLevelDomains: defaultTopLevelDomains,
};

export { suggest } from "./suggest";
export { validate } from "./validate";
export { defaultValues };
