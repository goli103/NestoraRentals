/* ==========================================================================
 test.js - facilitator panel for usability sessions
 Task list, timer, click and error counts, JSON export. Hidden from testers;
 the facilitator shows it with Alt+Shift+T .
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 Results are kept in localStorage under "nestora.test.v1".
 ========================================================================== */
// The tasks the tester is asked to do. Edit the wording here.
var TASKS = [
  "Find a 2-bedroom home under $2,500 near good schools.",
  "Check how good the schools are around one of the homes.",
  "Ask the landlord if the home is still available.",
  "Book a tour for a weekday afternoon.",
  "Find your confirmation and say what happens next.",
  "Change or cancel your tour."
];
// S.log counts every click and every form error since the page opened.
S.log = { clicks: 0, errors: 0, t0: Date.now() };
// TS = test state: participant id, results of finished tasks, and the task currently running.
var TK = "nestora.test.v1",
  TS = (function () {
    try {
      return JSON.parse(localStorage.getItem(TK)) || { pid: "P1", res: [], run: null };
    } catch (e) {
      return { pid: "P1", res: [], run: null };
    }
  })();
// tsave() stores TS.
function tsave() {
  try {
    localStorage.setItem(TK, JSON.stringify(TS));
  } catch (e) {}
}
// Count every click on the page (capture phase so nothing can stop it).
document.addEventListener(
  "click",
  function () {
    S.log.clicks++;
  },
  true
);
// tpanel(open) draws or hides the panel.
function tpanel(open) {
  var p = document.getElementById("tpanel");
  if (!open) {
    p.hidden = true;
    return;
  }
  p.hidden = false;
  // One row per task: Start/Redo, or Done / Needed help / Gave up while it runs, plus the last result.
  var rows = TASKS.map(function (t, i) {
    var r = TS.res.filter(function (x) {
        return x.task === i;
      })[0],
      run = TS.run && TS.run.task === i;
    return (
      '<li class="tt"><div><b>Task ' +
      (i + 1) +
      ".</b> " +
      esc(t) +
      '</div><div class="actions">' +
      (run
        ? '<span class="tiny" id="tmr"></span><button class="btn sm" data-r="ok">Done</button><button class="btn alt sm" data-r="help">Needed help</button><button class="btn ghost sm" data-r="quit">Gave up</button>'
        : '<button class="btn alt sm" data-s="' +
          i +
          '"' +
          (TS.run ? " disabled" : "") +
          ">" +
          (r ? "Redo" : "Start") +
          "</button>") +
      (r && !run
        ? '<span class="chip st-' +
          (r.result === "ok" ? "requested" : r.result === "help" ? "rescheduled" : "cancelled") +
          '">' +
          r.result +
          " &middot; " +
          r.sec +
          "s &middot; " +
          r.clicks +
          " clicks &middot; " +
          r.errors +
          " errors</span>"
        : "") +
      "</div></li>"
    );
  }).join("");
  // The panel: participant box, task list, export, copy and reset buttons.
  p.innerHTML =
    '<div class="mh"><h2 style="font-size:18px">Facilitator panel</h2><button class="iconbtn" id="tx" aria-label="Close panel">&times;</button></div><label class="lb" for="pid">Participant</label><input class="field" id="pid" value="' +
    esc(TS.pid) +
    '"><ol class="tl">' +
    rows +
    "</ol>" +
    '<div class="actions"><button class="btn sm" id="texp">Export results</button><button class="btn ghost sm" id="tcopy">Copy</button><button class="btn ghost sm" id="treset">Reset app data</button></div><div class="tiny" id="tmsg">Reset clears saved homes, tours and test results in this browser.</div>';
  // Close button and participant id.
  $("#tx").onclick = function () {
    tpanel(false);
  };
  $("#pid").oninput = function () {
    TS.pid = this.value;
    tsave();
  };
  // Start: remember the time and the click and error counts at this moment.
  [].forEach.call(p.querySelectorAll("[data-s]"), function (b) {
    b.onclick = function () {
      TS.run = { task: +b.dataset.s, t: Date.now(), c: S.log.clicks, e: S.log.errors };
      tsave();
      tpanel(true);
    };
  });
  // Done / Needed help / Gave up: save seconds, clicks and errors used by that task.
  [].forEach.call(p.querySelectorAll("[data-r]"), function (b) {
    b.onclick = function () {
      var r = TS.run;
      TS.res = TS.res.filter(function (x) {
        return x.task !== r.task;
      });
      TS.res.push({
        task: r.task,
        result: b.dataset.r,
        sec: Math.round((Date.now() - r.t) / 1000),
        clicks: S.log.clicks - r.c,
        errors: S.log.errors - r.e
      });
      TS.run = null;
      tsave();
      tpanel(true);
    };
  });
  // json() builds the export text.
  var json = function () {
    return JSON.stringify(
      {
        participant: TS.pid,
        exported: new Date().toISOString(),
        tasks: TS.res
          .sort(function (a, b) {
            return a.task - b.task;
          })
          .map(function (r) {
            return Object.assign({ description: TASKS[r.task] }, r);
          })
      },
      null,
      2
    );
  };
  // Export results downloads a .json file.
  $("#texp").onclick = function () {
    try {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json()], { type: "application/json" }));
      a.download = "nestora-test-" + TS.pid + ".json";
      a.click();
    } catch (e) {
      $("#tmsg").textContent = "Download not available here. Use Copy.";
    }
  };
  // Copy puts the same JSON on the clipboard.
  $("#tcopy").onclick = function () {
    try {
      navigator.clipboard.writeText(json()).then(
        function () {
          $("#tmsg").textContent = "Copied.";
        },
        function () {
          $("#tmsg").textContent = "Copy blocked by the browser.";
        }
      );
    } catch (e) {
      $("#tmsg").textContent = "Copy blocked by the browser.";
    }
  };
  // Reset clears all saved data after a second click to confirm.
  $("#treset").onclick = function () {
    if (this.dataset.sure) {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem(TK);
      } catch (e) {}
      location.hash = "home";
      location.reload();
    } else {
      this.dataset.sure = 1;
      this.textContent = "Click again to confirm";
    }
  };
}
// Update the running task's timer twice a second.
setInterval(function () {
  var el = document.getElementById("tmr");
  if (el && TS.run) {
    var s = Math.round((Date.now() - TS.run.t) / 1000);
    el.textContent = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
}, 500);
// ---- Showing and hiding the Test mode button ----
/* The Test mode button is hidden from testers. The facilitator shows or hides it with Alt+Shift+T (Option+Shift+T on Mac). */
// FK remembers in localStorage whether the button is shown. tb = the button.
var FK = "nestora.fac",
  tb = document.getElementById("tbtn");
// facShow() shows or hides the button (and closes the panel when hiding).
function facShow(on) {
  tb.hidden = !on;
  if (!on) {
    tpanel(false);
  }
  try {
    localStorage.setItem(FK, on ? "1" : "0");
  } catch (e) {}
}
try {
  facShow(localStorage.getItem(FK) === "1");
} catch (e) {
  facShow(false);
}
// Alt+Shift+T toggles the button.
document.addEventListener("keydown", function (e) {
  if (e.altKey && e.shiftKey && e.code === "KeyT") {
    e.preventDefault();
    facShow(tb.hidden);
  }
});
// Clicking the button opens or closes the panel.
tb.onclick = function () {
  tpanel(document.getElementById("tpanel").hidden);
};
