/* ==========================================================================
 home.js - search page
 Agent card, filters, result cards, map pins and the pin pop-up.
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 ========================================================================== */
// home() draws the whole search page, then connects every control.
function home() {
  $("#app").innerHTML =
    '<div class="home"><section aria-label="Search and results">' +
    '<div class="panel agent"><div>' +
    avatarHtml() +
    '</div><div><h2>Nestora Agent <span class="avst" id="avst">Idle</span></h2></div>' +
    nestiHtml() +
    '<div class="say" id="say" style="grid-column:1/-1">Hi, I\'m Nestora Agent. Describe the home you want in your own words.</div>' +
    '<form id="aform"><input class="field" id="aq" type="text" placeholder="2-bed apartment downtown under $2500" aria-label="Ask the Nestora Agent" autocomplete="off"><button class="btn" type="submit">Ask</button></form>' +
    '<div class="chips" id="achips"></div><div class="chips"><button type="button" id="aplay" class="play">&#9654; Play sequence</button></div><div class="reply" id="areply" hidden></div></div>' +
    '<div class="panel filters"><div class="frow"><label class="lb" style="min-width:64px">Bedrooms</label><div class="seg" id="bseg" role="group" aria-label="Bedrooms"></div></div>' +
    '<div><div class="frow" style="justify-content:space-between"><label class="lb" for="mx">Max price per month</label><b id="mxv"></b></div><input id="mx" type="range" min="1500" max="4000" step="50"></div></div>' +
    '<div class="resbar"><b id="cnt"></b><label class="tiny">Sort <select id="sort" aria-label="Sort results"><option value="rec">Recommended</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option><option value="rate">Top rated</option><option value="school">Best school zone</option></select></label></div>' +
    '<div class="cards" id="cards"></div></section>' +
    '<aside class="mapbox" aria-label="Map of results"><svg id="map" viewBox="0 0 640 720" preserveAspectRatio="xMidYMid slice"><use href="#basemap"/><g id="pins"></g></svg>' +
    '<div class="mapctl"><button id="zi" aria-label="Zoom in">+</button><button id="zo" aria-label="Zoom out">&minus;</button></div>' +
    '<div class="attr">Neighbourhoods: City of Toronto open data. Streets approximate.</div><div id="pop"></div></aside></div>' +
   '<p class="foot"> Our High Fidelity Prototype with sample listings, schools and ratings. Photos  are samples from real world but with a different name .<a class="replay" href="sus.html" target="_blank" rel="noopener">Take the usability survey (SUS)</a></p>';
  // Example questions shown under the agent box.
  var ch = ["2-bed downtown under $2500", "studio under 1800", "best schools, 3 bedrooms"];
  $("#achips").innerHTML = ch
    .map(function (c) {
      return '<button type="button">' + esc(c) + "</button>";
    })
    .join("");
  // Clicking an example fills the box and asks the agent.
  $("#achips").onclick = function (e) {
    if (e.target.tagName === "BUTTON") {
      $("#aq").value = e.target.textContent;
      ask(e.target.textContent);
    }
  };
  // Submitting the question: empty box = red outline; otherwise ask the agent.
  $("#aform").onsubmit = function (e) {
    e.preventDefault();
    var v = $("#aq").value.trim();
    if (!v) {
      $("#aq").classList.add("bad");
      $("#aq").focus();
      return;
    }
    $("#aq").classList.remove("bad");
    ask(v);
  };
  // Bedroom buttons: value "any", 0 (studio), 1, 2, 3 (3 or more).
  var bs = [
    ["any", "Any"],
    [0, "Studio"],
    [1, "1"],
    [2, "2"],
    [3, "3+"]
  ];
  $("#bseg").innerHTML = bs
    .map(function (b) {
      return '<button type="button" data-b="' + b[0] + '">' + b[1] + "</button>";
    })
    .join("");
  $("#bseg").onclick = function (e) {
    var b = e.target.dataset && e.target.dataset.b;
    if (b === undefined) {
      return;
    }
    S.beds = b === "any" ? "any" : +b;
    sync();
  };
  // Price slider, sort menu and map zoom buttons all change S and redraw.
  $("#mx").oninput = function () {
    S.max = +this.value;
    sync();
  };
  $("#sort").onchange = function () {
    S.sort = this.value;
    sync();
  };
  $("#zi").onclick = function () {
    S.zoom = Math.min(2, S.zoom + 1);
    applyZoom();
  };
  $("#zo").onclick = function () {
    S.zoom = Math.max(0, S.zoom - 1);
    applyZoom();
  };
  // First draw, then connect the agent and the Nesti video.
  sync();
  applyZoom();
  wireAgent();
  wireNesti();
  $("#rp").onclick = function () {
    if (window.replayIntro) {
      replayIntro();
    }
  };
}
// applyZoom() changes the map's viewBox: zoom 0 = whole city, 2 = close.
function applyZoom() {
  var z = [1, 1.5, 2.2][S.zoom],
    w = 640 / z,
    h = 720 / z,
    cx = 330,
    cy = 380;
  $("#map").setAttribute("viewBox", cx - w / 2 + " " + (cy - h / 2) + " " + w + " " + h);
}
// sync() is the redraw: updates the controls, runs the search, redraws cards, pins and pop-up.
// Call it after ANY change to the filters.
function sync() {
  $("#mx").value = S.max;
  $("#mxv").textContent = money(S.max);
  $("#sort").value = S.sort;
  [].forEach.call($("#bseg").children, function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.b === String(S.beds)));
  });
  var a = results();
  countHtml(a);
  if (
    S.sel &&
    !a.some(function (x) {
      return x.id === S.sel;
    })
  ) {
    S.sel = null;
  }
  $("#cards").innerHTML = a.length
    ? a.map(card).join("")
    : '<div class="empty"><b>No homes match yet.</b><br>Raise the maximum price or choose a different number of bedrooms.</div>';
  bindCards();
  drawPins(a);
  popup();
}
// card() builds one result card as HTML (picture, price, title, facts, stars, school).
function card(l) {
  var sv = !!S.saved[l.id];
  return (
    '<div class="card' +
    (S.sel === l.id ? " on" : "") +
    '" data-id="' +
    l.id +
    '" role="link" tabindex="0" aria-label="' +
    esc(l.t) +
    ", " +
    money(l.price) +
    ' per month"><div class="ph">' +
    scene(l.id - 1) +
    '<button class="heart" aria-label="Save" aria-pressed="' +
    sv +
    '" type="button">' +
    ICO.heart +
    "</button></div>" +
    '<div class="col"><div class="price">' +
    money(l.price) +
    ' <small>/ month</small> <span class="chip" style="margin-left:6px;vertical-align:2px">' +
    ICO.shield +
    " Verified</span></div><h3>" +
    esc(l.t) +
    '</h3><div class="facts">' +
    bedTxt(l.beds) +
    " &middot; " +
    l.baths +
    " bath &middot; " +
    l.sqft +
    " sqft &middot; " +
    esc(l.hood) +
    "</div>" +
    '<div class="rate">' +
    stars(l.r) +
    "<span><b>" +
    l.r +
    "</b> (" +
    l.n +
    " reviews)</span></div>" +
    '<div class="school">' +
    ICO.school +
    "<span>" +
    esc(l.sch[0][0]) +
    " &middot; " +
    l.sch[0][2] +
    ' km</span><span class="chip">Zone ' +
    l.sch[0][3] +
    "/10</span></div></div></div>"
  );
}
// drawPins() puts one price pin on the map for each result. Clicking a pin selects the home,
// highlights its card and scrolls to it (on wide screens).
function drawPins(a) {
  var g = "";
  a.forEach(function (l) {
    var p = MAPPINS[l.id - 1],
      t = money(l.price),
      w = t.length * 7.4 + 14;
    g +=
      '<g class="pin' +
      (S.sel === l.id ? " on" : "") +
      '" data-id="' +
      l.id +
      '" transform="translate(' +
      p[0] +
      " " +
      p[1] +
      ')" tabindex="0" role="button" aria-label="' +
      esc(l.t) +
      " " +
      t +
      '"><rect x="' +
      -w / 2 +
      '" y="-30" width="' +
      w +
      '" height="22" rx="11"/><path class="tail" d="M-5 -9L0 0L5 -9z"/><text y="-14.5">' +
      t +
      "</text></g>";
  });
  $("#pins").innerHTML = g;
  [].forEach.call(document.querySelectorAll(".pin"), function (n) {
    var id = +n.dataset.id;
    n.onclick = function () {
      S.sel = id;
      hl(id);
      popup();
      [].forEach.call(document.querySelectorAll(".card"), function (c) {
        c.classList.toggle("on", +c.dataset.id === id);
      });
      var c = $('.card[data-id="' + id + '"]');
      if (c && window.innerWidth > 1000) {
        c.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    n.onkeydown = function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        n.onclick();
      }
    };
  });
}
// hl() highlights one pin.
function hl(id) {
  [].forEach.call(document.querySelectorAll(".pin"), function (n) {
    n.classList.toggle("on", +n.dataset.id === id);
  });
}
// popup() shows the small card over the map for the selected home.
function popup() {
  var p = $("#pop");
  if (!p) {
    return;
  }
  var l = S.sel && byId(S.sel);
  if (!l) {
    p.innerHTML = "";
    return;
  }
  p.innerHTML =
    '<div class="panel pop"><div class="ph">' +
    scene(l.id - 1) +
    '</div><div class="col" style="min-width:0"><b>' +
    money(l.price) +
    ' / month</b><span class="tiny">' +
    esc(l.t) +
    '</span><span class="rate">' +
    stars(l.r) +
    "<b>" +
    l.r +
    '</b></span></div><button class="btn sm" id="pv">View</button></div>';
  $("#pv").onclick = function () {
    go("property-" + l.id);
  };
}

// bindCards() makes cards clickable: the heart saves or removes a home, anywhere else opens the property.
// Hovering a card highlights its pin.
function bindCards() {
  [].forEach.call(document.querySelectorAll(".card"), function (c) {
    var id = +c.dataset.id;
    c.onclick = function (e) {
      var h = e.target.closest(".heart");
      if (h) {
        e.stopPropagation();
        S.saved[id] = !S.saved[id];
        h.setAttribute("aria-pressed", String(!!S.saved[id]));
        persist();
        navBadge();
        toast(S.saved[id] ? "Saved to your list" : "Removed from saved");
        if (location.hash === "#saved" && !S.saved[id]) {
          saved();
        }
        return;
      }
      go("property-" + id);
    };
    c.onmouseenter = function () {
      if (document.querySelector(".pin")) {
        hl(id);
      }
    };
    c.onmouseleave = function () {
      if (document.querySelector(".pin")) {
        hl(S.sel);
      }
    };
  });
}
