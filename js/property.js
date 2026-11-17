/* ==========================================================================
 property.js - property page and the Contact Landlord pop-up
 Also holds the shared form helpers (field, V, vcheck, wire) used by the booking page.
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 ========================================================================== */
// mini() draws the small school map: the home pin plus numbered school markers.
function mini(l) {
  var p = MAPPINS[l.id - 1],
    pins = "";
  var sc = l.sch
    .map(function (s, i) {
      var x = p[0] + SOFF[i][0],
        y = p[1] + SOFF[i][1];
      return (
        '<g class="spin" transform="translate(' +
        x +
        " " +
        y +
        ')"><circle r="6"/><text y="-10" text-anchor="middle">' +
        (i + 1) +
        "</text></g>"
      );
    })
    .join("");
  return (
    '<svg viewBox="' +
    (p[0] - 120) +
    " " +
    (p[1] - 90) +
    ' 240 180" role="img" aria-label="Map of nearby schools"><use href="#basemap"/>' +
    sc +
    '<g transform="translate(' +
    p[0] +
    " " +
    p[1] +
    ')"><path d="M0 0C-8-10-11-14-11-19a11 11 0 0122 0c0 5-3 9-11 19z" fill="var(--action)" stroke="#fff" stroke-width="2"/><circle cy="-19" r="4" fill="#fff"/></g></svg>'
  );
}
// property(id) draws the page for one listing. Unknown id goes back home.
function property(id) {
  var l = byId(id);
  if (!l) {
    go("home");
    return;
  }
  S.B.id = id;
  // Rows for the school list.
  var sch = l.sch
    .map(function (s, i) {
      return (
        '<div class="srow"><div><b>' +
        (i + 1) +
        ". " +
        esc(s[0]) +
        '</b><div class="tiny">' +
        s[1] +
        " &middot; " +
        s[2] +
        ' km</div></div><div class="score">' +
        s[3] +
        "/10</div></div>"
      );
    })
    .join("");
  // Page layout: gallery, key details, about, amenities, school locator, reviews, and the side card.
  $("#app").innerHTML =
    '<div class="page"><div class="crumb"><button class="btn ghost sm" id="bk">' +
    ICO.back +
    ' Back to results</button><span class="spacer"></span><button class="btn ghost sm" id="sv" aria-pressed="' +
    !!S.saved[id] +
    '">' +
    (S.saved[id] ? "Saved" : "Save") +
    "</button></div>" +
    '<div class="two"><div><div class="gal"><div>' +
    scene(id - 1) +
    "</div><div>" +
    scene(id - 1, 1) +
    "</div><div>" +
    scene(id - 1, 2) +
    "</div></div>" +
    '<div style="margin-top:18px"><span class="chip">' +
    ICO.shield +
    ' Verified listing</span><h1 style="font-size:28px;margin:8px 0 4px">' +
    esc(l.t) +
    '</h1><div class="facts" style="color:var(--muted)">' +
    esc(l.st) +
    ", " +
    esc(l.hood) +
    ", Toronto</div>" +
    '<div class="rate" style="margin-top:8px">' +
    stars(l.r) +
    "<span><b>" +
    l.r +
    "</b> &middot; " +
    l.n +
    " reviews</span></div></div>" +
    '<div class="sec"><h2>Key details</h2><div class="kd"><div><b>' +
    bedTxt(l.beds) +
    "</b><span>Bedrooms</span></div><div><b>" +
    l.baths +
    "</b><span>Bathrooms</span></div><div><b>" +
    l.sqft +
    "</b><span>Square feet</span></div><div><b>" +
    l.avail +
    "</b><span>Available from</span></div></div></div>" +
    '<div class="sec"><h2>About this home</h2><p style="margin:0;max-width:65ch">' +
    esc(l.d) +
    "</p></div>" +
    '<div class="sec"><h2>Amenities</h2><div class="am">' +
    AM.slice(0, 5 + (id % 3))
      .map(function (a) {
        return "<span>" + a + "</span>";
      })
      .join("") +
    "</div></div>" +
    '<div class="sec"><h2>School locator</h2><div class="sl"><div class="mini">' +
    mini(l) +
    '</div><div><div class="zone"><span>School zone score</span><span>' +
    zoneScore(l) +
    " / 10</span></div>" +
    sch +
    "</div></div></div>" +
    '<div class="sec"><h2>Reviews</h2>' +
    REV.map(function (r) {
      return (
        '<div class="rev"><div class="rate">' +
        stars(5) +
        "<b>" +
        r[0] +
        '</b></div><p style="margin:6px 0 0">' +
        r[1] +
        "</p></div>"
      );
    }).join("") +
    '<p class="tiny">Sample reviews for the prototype.</p></div></div>' +
    '<aside class="sticky"><div class="panel side"><div><div class="price" style="font-size:26px">' +
    money(l.price) +
    ' <small>/ month</small></div><div class="tiny">Available from ' +
    l.avail +
    "</div></div>" +
    '<button class="btn" id="tour">Schedule a Tour</button><button class="btn alt" id="contact">Contact Landlord</button><div class="tiny center">Tours are free. No payment needed.</div>' +
    '<div class="who" style="border:0;padding:0"><div class="ava">' +
    l.ll
      .split(" ")
      .map(function (x) {
        return x[0];
      })
      .join("") +
    "</div><div><b>" +
    esc(l.ll) +
    '</b><div class="tiny">Usually replies within ' +
    l.resp +
    "</div></div></div></div></aside></div></div>";
  // Buttons: back, save/unsave, Schedule a Tour (opens booking), Contact Landlord (opens the pop-up).
  $("#bk").onclick = function () {
    go("home");
  };
  $("#sv").onclick = function () {
    S.saved[id] = !S.saved[id];
    persist();
    navBadge();
    this.textContent = S.saved[id] ? "Saved" : "Save";
    toast(S.saved[id] ? "Saved to your list" : "Removed from saved");
  };
  $("#tour").onclick = function () {
    go("book-date");
  };
  $("#contact").onclick = function () {
    contactModal(l);
  };
}

// ---------- Contact Landlord pop-up and form helpers ----------
/* ---------- CONTACT MODAL ---------- */
// field() builds one labelled input with an error line and a green tick.
function field(id, label, type, val, ph, hint) {
  return (
    '<div class="ff"><label for="' +
    id +
    '">' +
    label +
    '</label><div class="tick"><input class="field" id="' +
    id +
    '" type="' +
    type +
    '" value="' +
    esc(val || "") +
    '" placeholder="' +
    (ph || "") +
    '" autocomplete="' +
    (type === "email" ? "email" : type === "tel" ? "tel" : "name") +
    '" aria-describedby="' +
    id +
    '-m"><span class="ok">' +
    ICO.check +
    '</span></div><div class="msg" id="' +
    id +
    '-m" role="alert"></div></div>'
  );
}
// V = validation rules. Each returns "" if fine, or the error message to show.
var V = {
  name: function (v) {
    return v.trim().length >= 2 ? "" : "Enter your full name";
  },
  email: function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? ""
      : "Enter an email like name@example.com";
  },
  phone: function (v) {
    var d = v.replace(/\D/g, "");
    if (d.length === 11 && d[0] === "1") {
      d = d.slice(1);
    }
    return d.length === 10 ? "" : "Enter a valid 10-digit phone number";
  }
};
// vcheck() checks one field, shows or clears its error, counts errors for the facilitator, returns true if valid.
function vcheck(id, kind) {
  var el = $("#" + id),
    m = $("#" + id + "-m"),
    e = V[kind](el.value);
  el.classList.toggle("bad", !!e);
  el.setAttribute("aria-invalid", String(!!e));
  if (e && S.log) {
    S.log.errors++;
  }
  m.innerHTML = e ? ICO.warn + " " + esc(e) : "";
  el.parentNode.classList.toggle("valid", !e && el.value.trim() !== "");
  return !e;
}
// wire() checks a field when you leave it, and re-checks while typing once it showed an error.
function wire(id, kind) {
  var el = $("#" + id);
  el.onblur = function () {
    vcheck(id, kind);
  };
  el.oninput = function () {
    if (el.classList.contains("bad")) {
      vcheck(id, kind);
    }
  };
}
// closeLayer() closes the pop-up and gives focus back to the button that opened it.
function closeLayer() {
  $("#layer").innerHTML = "";
  document.onkeydown = null;
  if (S._f) {
    try {
      S._f.focus();
    } catch (e) {}
  }
}
// contactModal() opens the pop-up. S._f remembers the focused button.
function contactModal(l) {
  S._f = document.activeElement;
  $("#layer").innerHTML =
    '<div class="scrim" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="mh"><h2 id="mt">Contact Landlord</h2><button class="iconbtn" id="x" aria-label="Close">&times;</button></div>' +
    '<div class="who"><div class="ava">' +
    l.ll
      .split(" ")
      .map(function (x) {
        return x[0];
      })
      .join("") +
    "</div><div><b>" +
    esc(l.ll) +
    '</b><div class="tiny">Usually replies within ' +
    l.resp +
    '</div></div></div><form id="cf" novalidate style="display:grid;gap:14px">' +
    field("cn", "Your name", "text", S.B.name, "Full name") +
    field("ce", "Email", "email", S.B.email, "you@example.com") +
    '<div class="ff"><label for="cm">Message</label><textarea class="field" id="cm" rows="4">Hi, I am interested in ' +
    esc(l.t) +
    " (" +
    esc(l.st) +
    "). Is it still available?</textarea></div>" +
    '<label style="display:flex;gap:10px;align-items:center;font-weight:600"><input type="checkbox" id="ct" style="width:18px;height:18px;accent-color:var(--action)"> I would also like to book a tour</label>' +
    '<div class="actions"><button type="button" class="btn ghost" id="cc">Cancel</button><button class="btn grow" type="submit">Send Message</button></div></form></div></div>';
  // Connect: validation, close buttons, click outside to close, Escape to close.
  wire("cn", "name");
  wire("ce", "email");
  $("#cn").focus();
  $("#x").onclick = $("#cc").onclick = closeLayer;
  $("#scrim").onclick = function (e) {
    if (e.target.id === "scrim") {
      closeLayer();
    }
  };
  document.onkeydown = function (e) {
    if (e.key === "Escape") {
      closeLayer();
    }
  };
  // Send: validate; if OK, save the message and the contact details, then show "Message sent".
  $("#cf").onsubmit = function (e) {
    e.preventDefault();
    var a = vcheck("cn", "name"),
      b = vcheck("ce", "email");
    if (!(a && b)) {
      ($("#cn.bad") || $("#ce.bad")).focus();
      return;
    }
    S.B.name = $("#cn").value.trim();
    S.B.email = $("#ce").value.trim();
    var tour = $("#ct").checked;
    DB.msgs.push({
      id: l.id,
      at: Date.now(),
      name: S.B.name,
      email: S.B.email,
      text: $("#cm").value
    });
    DB.profile = { name: S.B.name, email: S.B.email, phone: S.B.phone };
    persist();
    $(".modal").innerHTML =
      '<div class="center" style="display:grid;gap:12px;padding:10px 0"><div class="okbig">' +
      ICO.check.replace('width="18" height="18"', 'width="40" height="40"') +
      '</div><h2>Message sent</h2><p style="margin:0;color:var(--muted)">' +
      esc(l.ll) +
      " usually replies within " +
      l.resp +
      ". We will email " +
      esc(S.B.email) +
      ".</p>" +
      '<div class="actions" style="justify-content:center">' +
      (tour ? '<button class="btn" id="pt">Pick a tour time</button>' : "") +
      '<button class="btn ' +
      (tour ? "ghost" : "") +
      '" id="dn">Done</button></div></div>';
    $("#dn").onclick = closeLayer;
    if (tour) {
      $("#pt").onclick = function () {
        closeLayer();
        go("book-date");
      };
    }
  };
}
