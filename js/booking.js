/* ==========================================================================
 booking.js - three-step tour booking
 Step 1 bookDate (calendar and time), Step 2 bookConfirm (details), Step 3 bookDone (confirmation).
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 The choices are kept in S.B, so going back keeps what was typed.
 ========================================================================== */
// stepper(n) draws the 3 progress steps; n is the current one.
function stepper(n) {
  var t = ["Select Date", "Confirm Details", "Confirmation"];
  return (
    '<div class="steps" aria-label="Progress">' +
    t
      .map(function (x, i) {
        return (
          '<div class="' +
          (i + 1 === n ? "cur" : i + 1 < n ? "done" : "") +
          '"><i>' +
          (i + 1 < n ? "&#10003;" : i + 1) +
          "</i><span>" +
          x +
          "</span></div>"
        );
      })
      .join("") +
    "</div>"
  );
}
// sumCard(l) is the side card that summarises the home on every booking step.
function sumCard(l) {
  return (
    '<aside class="sticky"><div class="panel side"><div class="sum"><div class="ph">' +
    scene(l.id - 1) +
    "</div><div><b>" +
    esc(l.t) +
    '</b><div class="tiny">' +
    esc(l.st) +
    '</div><div class="price" style="font-size:16px">' +
    money(l.price) +
    " <small>/ month</small></div></div></div>" +
    '<div class="rate">' +
    stars(l.r) +
    "<span><b>" +
    l.r +
    "</b> (" +
    l.n +
    ')</span></div><div class="school">' +
    ICO.school +
    "<span>" +
    esc(l.sch[0][0]) +
    '</span><span class="chip">Zone ' +
    l.sch[0][3] +
    "/10</span></div>" +
    '<div class="tiny">Landlord: ' +
    esc(l.ll) +
    '</div><span class="chip" style="justify-self:start">Free tour, no payment</span></div></aside>'
  );
}
// fmtDate() gives e.g. "Tue, Dec 2".
function fmtDate(d) {
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}
// slotsFor() makes the day's time slots. Some are "taken" (disabled), picked by a simple formula from the date.
function slotsFor(d) {
  var all = ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"],
    k = d.getDate() + d.getMonth();
  return all.map(function (t, i) {
    return { t: t, off: (i * 7 + k) % 5 === 0 };
  });
}
// Step 1: bookDate() draws the calendar. Days are disabled if past, more than 45 days away, or Sunday.
function bookDate() {
  var l = byId(S.B.id),
    B = S.B;
  if (!B.month) {
    B.month = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  }
  var m = B.month,
    first = new Date(m.getFullYear(), m.getMonth(), 1),
    days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(),
    lim = new Date(TODAY);
  lim.setDate(lim.getDate() + 45);
  var cells = "";
  for (var i = 0; i < first.getDay(); i++) {
    cells += "<span></span>";
  }
  for (var d = 1; d <= days; d++) {
    var dt = new Date(m.getFullYear(), m.getMonth(), d),
      off = dt <= TODAY || dt > lim || dt.getDay() === 0,
      sel = B.date && +B.date === +dt;
    cells +=
      '<button type="button" class="day" data-d="' +
      d +
      '" ' +
      (off ? "disabled" : "") +
      ' aria-pressed="' +
      !!sel +
      '" aria-label="' +
      dt.toDateString() +
      '">' +
      d +
      "</button>";
  }
  var sl = B.date
    ? slotsFor(B.date)
        .map(function (s) {
          return (
            '<button type="button" class="slot" data-t="' +
            s.t +
            '" ' +
            (s.off ? "disabled" : "") +
            ' aria-pressed="' +
            (B.time === s.t) +
            '">' +
            s.t +
            "</button>"
          );
        })
        .join("")
    : '<span class="tiny">Choose a date to see times.</span>';
  $("#app").innerHTML =
    '<div class="page"><div class="crumb"><button class="btn ghost sm" id="bk">' +
    ICO.back +
    " Back to property</button></div>" +
    stepper(1) +
    '<div class="two"><form class="panel form" id="f1" novalidate><h2>Step 1: Select a tour date</h2>' +
    (B.editRef
      ? '<span class="chip" style="justify-self:start">Rescheduling ' + B.editRef + "</span>"
      : "") +
    "" +
    '<div class="cal"><div class="calh"><button type="button" class="iconbtn" id="pm" aria-label="Previous month">&lsaquo;</button><span>' +
    m.toLocaleDateString("en-CA", { month: "long", year: "numeric" }) +
    '</span><button type="button" class="iconbtn" id="nm" aria-label="Next month">&rsaquo;</button></div>' +
    '<div class="grid7"><span class="dow">Su</span><span class="dow">Mo</span><span class="dow">Tu</span><span class="dow">We</span><span class="dow">Th</span><span class="dow">Fr</span><span class="dow">Sa</span>' +
    cells +
    "</div></div>" +
    '<div class="ff"><label>Time slot</label><div class="slots" id="slots">' +
    sl +
    "</div></div>" +
    '<div class="ff"><label for="pcm">Preferred contact method</label><select class="field" id="pcm"><option>Phone call</option><option>Text message</option><option>Email</option></select></div>' +
    '<div class="msg" id="e1" role="alert"></div><button class="btn" type="submit">Continue</button></form>' +
    sumCard(l) +
    "</div></div>";
  // Connect the contact method, back button, month arrows, day buttons, time slots and Continue.
  $("#pcm").value = B.method;
  $("#pcm").onchange = function () {
    B.method = this.value;
  };
  $("#bk").onclick = function () {
    go("property-" + l.id);
  };
  $("#pm").onclick = function () {
    B.month = new Date(m.getFullYear(), m.getMonth() - 1, 1);
    if (B.month < new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)) {
      B.month = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    }
    bookDate();
  };
  $("#nm").onclick = function () {
    B.month = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    bookDate();
  };
  // Clicking a day saves it, clears the time and redraws so the time slots update.
  $(".grid7").onclick = function (e) {
    var d = e.target.dataset && e.target.dataset.d;
    if (!d || e.target.disabled) {
      return;
    }
    B.date = new Date(m.getFullYear(), m.getMonth(), +d);
    B.time = null;
    bookDate();
  };
  $("#slots").onclick = function (e) {
    var t = e.target.dataset && e.target.dataset.t;
    if (!t || e.target.disabled) {
      return;
    }
    B.time = t;
    [].forEach.call($("#slots").children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.t === t));
    });
    $("#e1").innerHTML = "";
  };
  // Continue needs a date and a time.
  $("#f1").onsubmit = function (e) {
    e.preventDefault();
    var er = !B.date ? "Pick a date for your tour." : !B.time ? "Pick a time slot." : "";
    if (er) {
      $("#e1").innerHTML = ICO.warn + " " + er;
      return;
    }
    go("book-confirm");
  };
}
// Step 2: bookConfirm() shows the chosen time, the contact form and the reminder option.
function bookConfirm() {
  var l = byId(S.B.id),
    B = S.B;
  if (!B.date || !B.time) {
    go("book-date");
    return;
  }
  $("#app").innerHTML =
    '<div class="page"><div class="crumb"><button class="btn ghost sm" id="bk">' +
    ICO.back +
    " Back</button></div>" +
    stepper(2) +
    '<div class="two"><form class="panel form" id="f2" novalidate><h2>Step 2: Review and confirm</h2>' +
    '<div class="when"><div><b>' +
    fmtDate(B.date) +
    " at " +
    B.time +
    '</b><div class="tiny">Contact by: ' +
    esc(B.method) +
    '</div></div><button type="button" class="btn ghost sm" id="ed">Edit</button></div>' +
    field("n2", "Full name", "text", B.name, "Your name") +
    '<div class="row2">' +
    field("e2", "Email", "email", B.email, "you@example.com") +
    field("p2", "Phone", "tel", B.phone, "416-555-0123") +
    "</div>" +
    '<div class="ff"><label for="m2">Message to landlord (optional)</label><textarea class="field" id="m2" rows="3" placeholder="Anything the landlord should know?">' +
    esc(B.msg) +
    "</textarea></div>" +
    '<label style="display:flex;gap:10px;align-items:center;font-weight:600"><input type="checkbox" id="r2" ' +
    (B.remind ? "checked" : "") +
    ' style="width:18px;height:18px;accent-color:var(--action)"> Send me a reminder the day before</label>' +
    '<div class="actions"><button type="button" class="btn ghost" id="bb">Back</button><button class="btn grow" type="submit">Send Tour Request</button></div><div class="tiny center">Free tour. No payment needed.</div></form>' +
    sumCard(l) +
    "</div></div>";
  // Check each field when it is left, and now if already filled in.
  wire("n2", "name");
  wire("e2", "email");
  wire("p2", "phone");
  ["n2", "e2", "p2"].forEach(function (id) {
    var k = { n2: "name", e2: "email", p2: "phone" }[id];
    if ($("#" + id).value) {
      vcheck(id, k);
    }
  });
  $("#bk").onclick =
    $("#bb").onclick =
    $("#ed").onclick =
      function () {
        go("book-date");
      };
  // Send Tour Request: validate, then save a tour with a reference like NST-1234.
  // When rescheduling (editRef) the old tour is replaced and marked Rescheduled.
  $("#f2").onsubmit = function (e) {
    e.preventDefault();
    var a = vcheck("n2", "name"),
      b = vcheck("e2", "email"),
      c = vcheck("p2", "phone");
    if (!(a && b && c)) {
      ($("#n2.bad") || $("#e2.bad") || $("#p2.bad")).focus();
      return;
    }
    B.name = $("#n2").value.trim();
    B.email = $("#e2").value.trim();
    B.phone = $("#p2").value.trim();
    B.msg = $("#m2").value;
    B.remind = $("#r2").checked;
    var t = {
      ref: B.editRef || "NST-" + String(1000 + Math.floor(Math.random() * 9000)),
      id: B.id,
      date: B.date.toISOString(),
      time: B.time,
      method: B.method,
      name: B.name,
      email: B.email,
      phone: B.phone,
      msg: B.msg,
      remind: B.remind,
      status: "Requested",
      created: Date.now()
    };
    if (B.editRef) {
      DB.tours = DB.tours.map(function (x) {
        return x.ref === B.editRef ? Object.assign({}, x, t, { status: "Rescheduled" }) : x;
      });
    } else {
      DB.tours.push(t);
    }
    B.ref = t.ref;
    B.editRef = null;
    DB.profile = { name: B.name, email: B.email, phone: B.phone };
    persist();
    go("book-done");
  };
}
// Step 3: bookDone() is the confirmation page with what happens next.
function bookDone() {
  var l = byId(S.B.id),
    B = S.B;
  if (!B.ref) {
    go("book-date");
    return;
  }
  $("#app").innerHTML =
    '<div class="page">' +
    stepper(3) +
    '<div class="two"><div class="panel form"><div class="center" style="display:grid;gap:8px"><div class="okbig">' +
    ICO.check.replace('width="18" height="18"', 'width="44" height="44"') +
    '</div><h2 style="font-size:28px">Tour request sent!</h2><div style="color:var(--muted)">We emailed a copy to ' +
    esc(B.email) +
    "</div></div>" +
    '<div class="when" style="border-style:solid;display:grid;gap:4px"><b>' +
    esc(l.t) +
    "</b><span>" +
    fmtDate(B.date) +
    " at " +
    B.time +
    '</span><span class="tiny">Contact by ' +
    esc(B.method) +
    " &middot; Reference " +
    B.ref +
    "</span></div>" +
    '<div><h3 style="margin-bottom:10px">What happens next</h3><div class="next"><div><i>1</i><span>' +
    esc(l.ll) +
    " reviews your request.</span></div><div><i>2</i><span>You get a reply within 24 hours.</span></div><div><i>3</i><span>The tour is confirmed, or a new time is offered.</span></div></div></div>" +
    '<div class="actions"><button class="btn grow" id="cal">Add to Calendar</button><button class="btn alt grow" id="bs">Back to Search</button></div><div class="center"><a href="#tours" id="rs">Need to change it? Reschedule or cancel</a></div></div>' +
    sumCard(l) +
    "</div></div>";
  // Buttons: calendar (not built), back to search, reschedule or cancel.
  $("#cal").onclick = function () {
    toast("Calendar file is not available in this prototype");
  };
  $("#bs").onclick = function () {
    B.ref = null;
    B.date = null;
    B.time = null;
    go("home");
  };
  $("#rs").onclick = function (e) {
    e.preventDefault();
    B.ref = null;
    go("tours");
  };
}
