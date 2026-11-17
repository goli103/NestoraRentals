/* Search database. Listings live in data.js. This file builds a small search index and answers queries.
   Query shape: { beds: "any"|0|1|2|3, max: number, hood: string|null, text: string, sort: "rec"|"lo"|"hi"|"rate"|"school" }
   By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027 */
// Words ignored when searching the free text (they do not help find a home).
var STOP = {
  one: 1,
  two: 1,
  three: 1,
  a: 1,
  an: 1,
  the: 1,
  in: 1,
  on: 1,
  at: 1,
  near: 1,
  with: 1,
  for: 1,
  and: 1,
  or: 1,
  of: 1,
  to: 1,
  me: 1,
  my: 1,
  find: 1,
  show: 1,
  want: 1,
  need: 1,
  looking: 1,
  look: 1,
  apartment: 1,
  apartments: 1,
  home: 1,
  homes: 1,
  place: 1,
  house: 1,
  rent: 1,
  rental: 1,
  under: 1,
  below: 1,
  max: 1,
  less: 1,
  than: 1,
  bed: 1,
  beds: 1,
  bedroom: 1,
  bedrooms: 1,
  bdrm: 1,
  studio: 1,
  downtown: 1,
  good: 1,
  best: 1,
  cheap: 1,
  per: 1,
  month: 1,
  that: 1,
  has: 1,
  have: 1,
  is: 1,
  are: 1,
  some: 1,
  any: 1,
  please: 1,
  schools: 1,
  school: 1,
  top: 1,
  rated: 1,
  highest: 1,
  lowest: 1,
  price: 1,
  affordable: 1,
  can: 1,
  you: 1,
  i: 1,
  get: 1,
  list: 1
};
// amOf() is the amenity list for a listing (5 to 7 of them, picked by its id).
function amOf(l) {
  return AM.slice(0, 5 + (l.id % 3));
}
// INDEX holds one lowercase string per listing (title, address, area, description, amenities,
// schools, landlord) so keyword search is a quick indexOf.
var INDEX = L.map(function (l) {
  var txt = [
    l.t,
    l.st,
    l.hood,
    l.d,
    amOf(l).join(" "),
    l.sch
      .map(function (s) {
        return s[0];
      })
      .join(" "),
    l.ll
  ]
    .join(" ")
    .toLowerCase();
  return { id: l.id, txt: txt };
});
// tokens() cuts a sentence into useful keywords: lowercase, no punctuation, drops short words,
// stop words and plain numbers.
function tokens(q) {
  return (q || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length > 2 && !STOP[w] && !/^\d+$/.test(w);
    });
}
// searchListings() applies, in order: bedrooms, max price, area, keywords. Then sorts.
// hit = how many keywords matched; more matches rank higher when sort is "rec".
function searchListings(q) {
  var tk = tokens(q.text),
    out = [];
  L.forEach(function (l, i) {
    if (q.beds !== "any" && q.beds !== undefined) {
      if (q.beds === 3 ? l.beds < 3 : l.beds !== q.beds) {
        return;
      }
    }
    if (q.max && l.price > q.max) {
      return;
    }
    if (q.hood && l.hood !== q.hood) {
      return;
    }
    var hit = 0;
    if (tk.length) {
      tk.forEach(function (w) {
        if (INDEX[i].txt.indexOf(w) >= 0) {
          hit++;
        }
      });
      if (!hit) {
        return;
      }
    }
    out.push({ l: l, hit: hit });
  });
  out.sort(function (a, b) {
    if (q.sort === "lo") {
      return a.l.price - b.l.price;
    }
    if (q.sort === "hi") {
      return b.l.price - a.l.price;
    }
    if (q.sort === "rate") {
      return b.l.r - a.l.r;
    }
    if (q.sort === "school") {
      return zoneScore(b.l) - zoneScore(a.l);
    }
    return b.hit - a.hit || b.l.r - a.l.r;
  });
  return out.map(function (x) {
    return x.l;
  });
}
// results() runs the search with the filters currently on screen (S).
function results() {
  return searchListings({ beds: S.beds, max: S.max, hood: S.hood, text: S.text, sort: S.sort });
}
