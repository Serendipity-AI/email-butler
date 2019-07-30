import { defaultDomains, defaultSecondLevelDomains, defaultTopLevelDomains } from "./utils/config";
import { sift4Distance } from "./utils/sift4Distance";

export interface EmailButlerResponse {
  address: string;
  domain: string;
  full: string;
}

export interface EmailButlerOptions {
  domains: string[];
  topLevelDomains: string[];
  secondLevelDomains: string[];
}

const domainThreshold = 2;
const secondLevelThreshold = 2;
const topLevelThreshold = 2;

const findClosestDomain = (domain: string, domains: string[], threshold: number) => {
  let dist;
  let minDist = Infinity;
  let closestDomain: string | undefined;
  if (!domain || !domains) {
    return;
  }
  domains.forEach(currentDomain => {
    if (domain === currentDomain) {
      return domain;
    }
    dist = sift4Distance(domain, currentDomain);
    if (dist < minDist) {
      minDist = dist;
      closestDomain = currentDomain;
    }
  });
  if (minDist <= (threshold || topLevelThreshold) && closestDomain !== undefined) {
    return closestDomain;
  } else {
    return;
  }
};

const encodeEmail = (email: string) => {
  return encodeURI(email)
    .replace("%20", " ")
    .replace("%25", "%")
    .replace("%5E", "^")
    .replace("%60", "`")
    .replace("%7B", "{")
    .replace("%7C", "|")
    .replace("%7D", "}");
};

const splitEmail = (email: string) => {
  const parts = email.trim().split("@");
  if (parts.length < 2) {
    return;
  }
  parts.forEach(part => {
    if (part === "") {
      return;
    }
  });
  const domain = parts.pop();
  if (!domain) {
    return;
  }
  const domainParts = domain.split(".");
  let secondLevelDomain = "";
  let topLevelDomain = "";
  if (domainParts.length === 0) {
    return; // No top-level domain
  } else if (domainParts.length === 1) {
    topLevelDomain = domainParts[0]; // One top-level domain
  } else {
    const [second, ...rest] = domainParts;
    secondLevelDomain = second;
    rest.forEach(domainPart => {
      topLevelDomain += domainPart + ".";
    });
    topLevelDomain = topLevelDomain.substring(0, topLevelDomain.length - 1);
  }
  return {
    address: parts.join("@"),
    domain,
    secondLevelDomain,
    topLevelDomain,
  };
};

export const suggest = (email: string, options?: Partial<EmailButlerOptions>) => {
  const emailParts = splitEmail(encodeEmail(email.toLowerCase()));
  if (!emailParts || !emailParts.domain) {
    return;
  }
  const domains = (options && options.domains) || defaultDomains;
  const topLevelDomains = (options && options.topLevelDomains) || defaultTopLevelDomains;
  const secondLevelDomains = (options && options.secondLevelDomains) || defaultSecondLevelDomains;

  const { domain, secondLevelDomain, topLevelDomain, address } = emailParts;

  if (secondLevelDomains.includes(secondLevelDomain) && topLevelDomains.includes(topLevelDomain)) {
    return; // If the email is a valid 2nd-level + top-level, do not suggest anything.
  }

  let closestDomain = findClosestDomain(domain, domains, domainThreshold);
  if (closestDomain) {
    if (closestDomain === domain) {
      // The email address exactly matches one of the supplied domains; do not return a suggestion.
      return;
    } else {
      // The email address closely matches one of the supplied domains; return a suggestion
      return {
        address,
        domain: closestDomain,
        full: address + "@" + closestDomain,
      };
    }
  }

  // The email address does not closely match one of the supplied domains

  let closestSecondLevelDomain: string | undefined = secondLevelDomain;
  if (!secondLevelDomains.includes(secondLevelDomain)) {
    closestSecondLevelDomain = findClosestDomain(secondLevelDomain, secondLevelDomains, secondLevelThreshold);
  }
  let closestTopLevelDomain: string | undefined = topLevelDomain;
  if (!topLevelDomains.includes(topLevelDomain)) {
    closestTopLevelDomain = findClosestDomain(topLevelDomain, topLevelDomains, topLevelThreshold);
  }

  if (domain) {
    closestDomain = domain;
    let rtrn = false;

    if (closestSecondLevelDomain && closestSecondLevelDomain !== secondLevelDomain) {
      // The email address may have a mispelled second-level domain; return a suggestion
      closestDomain = closestDomain.replace(secondLevelDomain, closestSecondLevelDomain);
      rtrn = true;
    }

    if (closestTopLevelDomain && closestTopLevelDomain !== topLevelDomain && secondLevelDomain !== "") {
      // The email address may have a mispelled top-level domain; return a suggestion
      closestDomain = closestDomain.replace(new RegExp(topLevelDomain + "$"), closestTopLevelDomain);
      rtrn = true;
    }

    if (rtrn) {
      return {
        address,
        domain: closestDomain,
        full: address + "@" + closestDomain,
      };
    }
  }

  /* The email address exactly matches one of the supplied domains, does not closely
   * match any domain and does not appear to simply have a mispelled top-level domain,
   * or is an invalid email address; do not return a suggestion.
   */
  return;
};
