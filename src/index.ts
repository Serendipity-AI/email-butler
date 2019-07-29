export interface IEmailCheckResponse {
  address: string;
  domain: string;
  full: string;
}

const domainThreshold = 2;
const secondLevelThreshold = 2;
const topLevelThreshold = 2;

const defaultDomains = [
  "msn.com",
  "telus.net",
  "comcast.net",
  "optusnet.com.au",
  "qq.com",
  "sky.com",
  "icloud.com",
  "mac.com",
  "googlemail.com",
  "web.de",
  "gmail.com",
  "aim.com",
  "verizon.net",
  "rocketmail.com",
  "google.com",
  "aol.com",
  "me.com",
  "weforum.org",
];

const secondLevelDomains = ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"];

const topLevelDomains = [
  "com",
  "com.au",
  "com.tw",
  "ca",
  "co.nz",
  "co.uk",
  "de",
  "fr",
  "it",
  "ru",
  "net",
  "org",
  "edu",
  "gov",
  "jp",
  "nl",
  "kr",
  "se",
  "eu",
  "ie",
  "co.il",
  "us",
  "at",
  "be",
  "dk",
  "hk",
  "es",
  "gr",
  "ch",
  "no",
  "cz",
  "in",
  "net",
  "net.au",
  "info",
  "biz",
  "mil",
  "co.jp",
  "sg",
  "hu",
  "uk",
];

const sift4Distance = (s1: string, s2: string, maxOffset?: number) => {
  // sift4: https://siderite.blogspot.com/2014/11/super-fast-and-accurate-string-distance.html
  if (maxOffset === undefined) {
    maxOffset = 5; // default
  }

  if (!s1 || !s1.length) {
    if (!s2) {
      return 0;
    }
    return s2.length;
  }

  if (!s2 || !s2.length) {
    return s1.length;
  }

  const l1 = s1.length;
  const l2 = s2.length;

  let c1 = 0; // cursor for string 1
  let c2 = 0; // cursor for string 2
  let lcss = 0; // largest common subsequence
  let localCs = 0; // local common substring
  let trans = 0; // number of transpositions ('ab' vs 'ba')
  const offsetArr: any[] = []; // offset pair array, for computing the transpositions

  while (c1 < l1 && c2 < l2) {
    if (s1.charAt(c1) === s2.charAt(c2)) {
      localCs++;
      let isTrans = false;
      // see if current match is a transposition
      let i = 0;
      while (i < offsetArr.length) {
        const ofs = offsetArr[i];
        if (c1 <= ofs.c1 || c2 <= ofs.c2) {
          // when two matches cross, the one considered a transposition is the one with the largest difference in offsets
          isTrans = Math.abs(c2 - c1) >= Math.abs(ofs.c2 - ofs.c1);
          if (isTrans) {
            trans++;
          } else {
            if (!ofs.trans) {
              ofs.trans = true;
              trans++;
            }
          }
          break;
        } else {
          if (c1 > ofs.c2 && c2 > ofs.c1) {
            offsetArr.splice(i, 1);
          } else {
            i++;
          }
        }
      }
      offsetArr.push({
        c1,
        c2,
        trans: isTrans,
      });
    } else {
      lcss += localCs;
      localCs = 0;
      if (c1 !== c2) {
        c1 = c2 = Math.min(c1, c2); // using min allows the computation of transpositions
      }
      // if matching characters are found, remove 1 from both cursors (they get incremented at the end of the loop)
      // so that we can have only one code block handling matches
      for (let j = 0; j < maxOffset && (c1 + j < l1 || c2 + j < l2); j++) {
        if (c1 + j < l1 && s1.charAt(c1 + j) === s2.charAt(c2)) {
          c1 += j - 1;
          c2--;
          break;
        }
        if (c2 + j < l2 && s1.charAt(c1) === s2.charAt(c2 + j)) {
          c1--;
          c2 += j - 1;
          break;
        }
      }
    }
    c1++;
    c2++;
    // this covers the case where the last match is on the last token in list, so that it can compute transpositions correctly
    if (c1 >= l1 || c2 >= l2) {
      lcss += localCs;
      localCs = 0;
      c1 = c2 = Math.min(c1, c2);
    }
  }
  lcss += localCs;
  return Math.round(Math.max(l1, l2) - lcss + trans); // add the cost of transpositions to the final result
};

const findClosestDomain = (domain: string, domains: string[], threshold: number) => {
  let dist;
  let minDist = Infinity;
  let closestDomain: string | undefined;

  if (!domain || !domains) {
    return false;
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
    return false;
  }
};

const encodeEmail = (email: string) => {
  let result = encodeURI(email);
  result = result
    .replace("%20", " ")
    .replace("%25", "%")
    .replace("%5E", "^")
    .replace("%60", "`")
    .replace("%7B", "{")
    .replace("%7C", "|")
    .replace("%7D", "}");
  return result;
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
  const domainParts = (domain && domain.split(".")) || [];
  let sld = "";
  let tld = "";
  if (domainParts.length === 0) {
    // The address does not have a top-level domain
    return;
  } else if (domainParts.length === 1) {
    // The address has only a top-level domain (valid under RFC)
    tld = domainParts[0];
  } else {
    // The address has a domain and a top-level domain
    sld = domainParts[0];
    domainParts.forEach(domainPart => {
      tld += domainPart + ".";
    });
    tld = tld.substring(0, tld.length - 1);
  }

  return {
    address: parts.join("@"),
    domain,
    secondLevelDomain: sld,
    topLevelDomain: tld,
  };
};

export const suggest = (email: string) => {
  const emailParts = splitEmail(encodeEmail(email.toLowerCase()));
  if (!emailParts || !emailParts.domain) {
    return;
  }
  if (secondLevelDomains && topLevelDomains) {
    // If the email is a valid 2nd-level + top-level, do not suggest anything.
    if (
      secondLevelDomains.indexOf(emailParts.secondLevelDomain) !== -1 &&
      topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1
    ) {
      return;
    }
  }

  let closestDomain = findClosestDomain(emailParts.domain, defaultDomains, domainThreshold);

  if (closestDomain) {
    if (closestDomain === emailParts.domain) {
      // The email address exactly matches one of the supplied domains; do not return a suggestion.
      return;
    } else {
      // The email address closely matches one of the supplied domains; return a suggestion
      return {
        address: emailParts.address,
        domain: closestDomain,
        full: emailParts.address + "@" + closestDomain,
      };
    }
  }

  // The email address does not closely match one of the supplied domains
  const closestSecondLevelDomain = findClosestDomain(
    emailParts.secondLevelDomain,
    secondLevelDomains,
    secondLevelThreshold,
  );
  const closestTopLevelDomain = findClosestDomain(emailParts.topLevelDomain, topLevelDomains, topLevelThreshold);

  if (emailParts.domain) {
    closestDomain = emailParts.domain;
    let rtrn = false;

    if (closestSecondLevelDomain && closestSecondLevelDomain !== emailParts.secondLevelDomain) {
      // The email address may have a mispelled second-level domain; return a suggestion
      closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
      rtrn = true;
    }

    if (
      closestTopLevelDomain &&
      closestTopLevelDomain !== emailParts.topLevelDomain &&
      emailParts.secondLevelDomain !== ""
    ) {
      // The email address may have a mispelled top-level domain; return a suggestion
      closestDomain = closestDomain.replace(new RegExp(emailParts.topLevelDomain + "$"), closestTopLevelDomain);
      rtrn = true;
    }

    if (rtrn) {
      return {
        address: emailParts.address,
        domain: closestDomain,
        full: emailParts.address + "@" + closestDomain,
      };
    }
  }

  /* The email address exactly matches one of the supplied domains, does not closely
   * match any domain and does not appear to simply have a mispelled top-level domain,
   * or is an invalid email address; do not return a suggestion.
   */
  return;
};
