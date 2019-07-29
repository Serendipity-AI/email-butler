export const sift4Distance = (s1: string, s2: string, maxOffset?: number) => {
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
