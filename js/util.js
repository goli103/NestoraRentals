/* ==========================================================================
 util.js - small helpers used by every page
 Short DOM lookups, text and money formatting, stars, 
 real photos, icons, toast messages and page navigation.
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 Depends on: data.js (L, PAL, AVATAR).
 ========================================================================== */
// $("#id") finds the first element that matches a CSS selector.
var $ = function (s, r) {
  return (r || document).querySelector(s);
};
// esc() makes text safe to put inside HTML (stops < > & " from being read as code).
var esc = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};
// byId() finds a listing by its id number.
var byId = function (id) {
  return L.filter(function (x) {
    return x.id === id;
  })[0];
};
// money(2450) gives "$2,450".
var money = function (n) {
  return "$" + n.toLocaleString("en-CA");
};
// bedTxt(0) gives "Studio", bedTxt(2) gives "2 bed".
var bedTxt = function (b) {
  return b === 0 ? "Studio" : b + " bed";
};
// zoneScore() is the average school score of a listing, to one decimal.
var zoneScore = function (l) {
  return (
    l.sch.reduce(function (a, s) {
      return a + s[3];
    }, 0) / l.sch.length
  ).toFixed(1);
};
// stars(4.7) builds the star row. CSS reads --p (percent filled) to colour the stars.
function stars(r) {
  return (
    '<span class="stars" style="--p:' +
    ((r / 5) * 100).toFixed(0) +
    '%" role="img" aria-label="' +
    r +
    ' out of 5 stars"></span>'
  );
}
// illus() draws the placeholder room picture as SVG. i picks the colour set, v changes it a little
// so the 3 gallery pictures of one home differ. Used when no real photo exists.
function illus(i, v) {
  var P = PAL[(i + (v || 0)) % PAL.length],
    o = (v || 0) * 14;
  var sky = "";
  for (var k = 0; k < 7; k++) {
    var h = 26 + ((k * 37 + i * 11) % 52);
    sky +=
      '<rect x="' +
      (52 + k * 20) +
      '" y="' +
      (172 - h) +
      '" width="16" height="' +
      h +
      '" fill="' +
      P.bld +
      '" opacity="' +
      (0.55 + (k % 3) * 0.15) +
      '"/>';
  }
  return (
    '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Placeholder illustration of the living room"><rect width="400" height="300" fill="' +
    P.wall +
    '"/><rect y="218" width="400" height="82" fill="' +
    P.floor +
    '"/><rect y="214" width="400" height="6" fill="#00000014"/>' +
    '<rect x="40" y="44" width="150" height="132" rx="4" fill="' +
    P.sky +
    '"/><g>' +
    sky +
    '</g><rect x="40" y="44" width="150" height="132" rx="4" fill="none" stroke="#ffffff" stroke-width="7"/><path d="M115 44v132M40 110h150" stroke="#ffffff" stroke-width="5"/>' +
    '<ellipse cx="270" cy="262" rx="110" ry="20" fill="#00000012"/><rect x="' +
    (196 + o / 4) +
    '" y="176" width="170" height="52" rx="14" fill="' +
    P.sofa +
    '"/><rect x="' +
    (196 + o / 4) +
    '" y="150" width="170" height="40" rx="14" fill="' +
    P.sofa +
    '"/><rect x="' +
    (196 + o / 4) +
    '" y="150" width="170" height="40" rx="14" fill="#ffffff22"/><rect x="' +
    (210 + o / 4) +
    '" y="196" width="60" height="26" rx="8" fill="#ffffff2e"/><rect x="' +
    (286 + o / 4) +
    '" y="196" width="60" height="26" rx="8" fill="#ffffff2e"/>' +
    '<rect x="' +
    (206 + o / 4) +
    '" y="226" width="6" height="14" fill="#4a3b2e"/><rect x="' +
    (350 + o / 4) +
    '" y="226" width="6" height="14" fill="#4a3b2e"/>' +
    '<rect x="24" y="216" width="40" height="30" rx="4" fill="#c58a5b"/><path d="M44 216c-12-18-18-26-8-38 8 10 8 20 8 38zm0 0c8-16 18-22 20-34-12 8-18 18-20 34z" fill="#3f8a5e"/>' +
    '<rect x="368" y="108" width="3" height="112" fill="#555"/><path d="M356 108h28l-6-22h-16z" fill="#f2d98a"/></svg>'
  );
}
// ---- Photos ----
/* Real photos: put files named <listing id>-<number>.jpg in assets/photos (1-1.jpg, 1-2.jpg, 1-3.jpg, 2-1.jpg ...).
   If a photo is missing, the drawn illustration is shown instead. */
// File types tried, in order, for each photo.
var PEXT = ["jpg", "png", "webp", "jpeg"];
// scene() shows photo <id>-<number>.jpg. If the file is missing the browser fires onerror.
function scene(i, v) {
  v = v || 0;
  var id = L[i].id;
  return (
    '<img class="photo" src="assets/photos/' +
    id +
    "-" +
    (v + 1) +
    '.jpg" data-e="0" data-i="' +
    i +
    '" data-v="' +
    v +
    '" alt="Photo of ' +
    esc(L[i].t) +
    '" loading="lazy" onerror="photoNext(this)">'
  );
}
// photoNext() runs on error: tries the next file type (png, webp, jpeg).
// After the last one fails it swaps the photo for the drawn picture.
function photoNext(el) {
  var e = +el.dataset.e + 1,
    i = +el.dataset.i,
    v = +el.dataset.v;
  if (e < PEXT.length) {
    el.dataset.e = e;
    el.src = "assets/photos/" + L[i].id + "-" + (v + 1) + "." + PEXT[e];
  } else {
    el.onerror = null;
    el.outerHTML = illus(i, v);
  }
}
// The round Nestora Agent picture.
function avatarHtml() {
  return '<div class="avatar" id="av"><img src="' + AVATAR + '" alt="Nestora Agent"></div>';
}
// ---- Icons (inline SVG, they take the text colour) ----
var ICO = {
  check:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  heart:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
  school:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9.5"/></svg>',
  warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22zM11 10h2v5h-2zm0 6h2v2h-2z"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
};
// toast() shows a short message at the bottom for 2.6 seconds.
function toast(m) {
  var t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = m;
  document.body.appendChild(t);
  setTimeout(function () {
    t.remove();
  }, 2600);
}
// go("home") changes page. If we are already on that hash, redraw it instead.
function go(h) {
  if (location.hash === "#" + h) {
    route();
  } else {
    location.hash = h;
  }
}
