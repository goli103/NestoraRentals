/* ==========================================================================
 pages.js - Saved homes, My Tours, and the nav badges
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 ========================================================================== */
// navBadge() updates the counts next to Saved and My tours, and marks the current page link.
function navBadge() {
  var n = Object.keys(S.saved).filter(function (k) {
      return S.saved[k];
    }).length,
    a = document.querySelector("[data-saved]");
  if (a) {
    a.innerHTML = "Saved" + (n ? ' <span class="badge">' + n + "</span>" : "");
  }
  var t = DB.tours.filter(function (x) {
      return x.status !== "Cancelled";
    }).length,
    b = document.querySelector("[data-tours]");
  if (b) {
    b.innerHTML = "My tours" + (t ? ' <span class="badge">' + t + "</span>" : "");
  }
  [].forEach.call(document.querySelectorAll(".nav a"), function (x) {
    var h = x.getAttribute("href");
    if (h === "#" + (location.hash.slice(1) || "home")) {
      x.setAttribute("aria-current", "page");
    } else {
      x.removeAttribute("aria-current");
    }
  });
}
// saved() draws the Saved homes page (reuses card() from home.js).
function saved() {
  var a = L.filter(function (l) {
    return S.saved[l.id];
  });
  $("#app").innerHTML =
    '<div class="page"><h1 style="font-size:28px;margin-bottom:14px">Saved homes</h1>' +
    (a.length
      ? '<div class="cards grid2">' + a.map(card).join("") + "</div>"
      : '<div class="empty"><b>No saved homes yet.</b><br>Tap the heart on a listing to keep it here.<div style="margin-top:14px"><button class="btn" id="gh">Browse homes</button></div></div>') +
    "</div>";
  if (a.length) {
    bindCards();
  } else {
    $("#gh").onclick = function () {
      go("home");
    };
  }
}
// tours() draws the My Tours page, soonest first.
function tours() {
  var a = DB.tours.slice().sort(function (x, y) {
    return new Date(x.date) - new Date(y.date);
  });
  $("#app").innerHTML =
    '<div class="page"><h1 style="font-size:28px;margin-bottom:14px">My tours</h1>' +
    (a.length
      ? '<div class="tlist">' + a.map(tourRow).join("") + "</div>"
      : '<div class="empty"><b>No tours booked yet.</b><br>Open a home and choose Schedule a Tour.<div style="margin-top:14px"><button class="btn" id="gh">Browse homes</button></div></div>') +
    "</div>";
  if (!a.length) {
    $("#gh").onclick = function () {
      go("home");
    };
  }
  [].forEach.call(document.querySelectorAll("[data-act]"), function (b) {
    b.onclick = function () {
      tourAct(b.dataset.act, b.dataset.ref);
    };
  });
}
// tourRow() is one tour: picture, details, status chip and its buttons
// (Reschedule / Cancel, or the "Cancel this tour?" question).
function tourRow(t) {
  var l = byId(t.id),
    d = new Date(t.date),
    off = t.status === "Cancelled",
    ask = S.cancelAsk === t.ref;
  return (
    '<div class="panel trow' +
    (off ? " off" : "") +
    '"><div class="ph">' +
    scene(l.id - 1) +
    '</div><div class="col" style="min-width:0"><b>' +
    esc(l.t) +
    '</b><span class="tiny">' +
    esc(l.st) +
    "</span><span>" +
    fmtDate(d) +
    " at " +
    t.time +
    '</span><span class="tiny">Contact by ' +
    esc(t.method) +
    " &middot; " +
    t.ref +
    "</span></div>" +
    '<div class="col" style="align-items:flex-end;gap:8px"><span class="chip st-' +
    t.status.toLowerCase() +
    '">' +
    t.status +
    "</span>" +
    (off
      ? ""
      : ask
        ? '<span class="tiny">Cancel this tour?</span><div class="actions"><button class="btn sm" data-act="yes" data-ref="' +
          t.ref +
          '">Yes, cancel</button><button class="btn ghost sm" data-act="keep" data-ref="' +
          t.ref +
          '">Keep it</button></div>'
        : '<div class="actions"><button class="btn alt sm" data-act="re" data-ref="' +
          t.ref +
          '">Reschedule</button><button class="btn ghost sm" data-act="cx" data-ref="' +
          t.ref +
          '">Cancel</button></div>') +
    "</div></div>"
  );
}
// tourAct() handles those buttons. cx = ask to cancel, keep = not cancelling, yes = cancel,
// re = start the booking form again for this tour.
function tourAct(a, ref) {
  var t = DB.tours.filter(function (x) {
    return x.ref === ref;
  })[0];
  if (!t) {
    return;
  }
  if (a === "cx") {
    S.cancelAsk = ref;
    tours();
  } else if (a === "keep") {
    S.cancelAsk = null;
    tours();
  } else if (a === "yes") {
    t.status = "Cancelled";
    S.cancelAsk = null;
    persist();
    tours();
    toast("Tour cancelled");
  } else if (a === "re") {
    var B = S.B;
    B.id = t.id;
    B.editRef = ref;
    B.date = null;
    B.time = null;
    B.method = t.method;
    B.month = null;
    go("book-date");
  }
}
