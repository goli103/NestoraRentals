/* ==========================================================================
 agent.js - Nestora Agent
 Turns a sentence into a search query, runs it on the search database, and explains the result.
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 Depends on: db.js, home.js (sync), util.js.
 ========================================================================== */
// HOODS: words that point to an area. If the sentence has one of them, filter to that area.
var HOODS = {
  "Financial District": ["king", "financial", "bay street", "bay st"],
  "Yonge and Dundas": ["dundas", "yonge"],
  "Queen West": ["queen", "kensington"],
  "The Annex": ["annex", "bloor", "university", "u of t", "uoft"],
  Waterfront: ["waterfront", "harbour", "lake", "jarvis"],
  "Church and Carlton": ["cabbagetown", "carlton", "church"]
};
// parseLocal() = the rule-based "brain". Reads the sentence and fills in a query:
// beds, max price, sort, area and leftover keywords.
function parseLocal(q) {
  var s = q.toLowerCase(),
    o = { beds: "any", max: 4000, sort: "rec", hood: null, text: "" };
  // "studio" or "bachelor" means 0 bedrooms.
  if (/studio|bachelor/.test(s)) {
    o.beds = 0;
  }
  // "2 bed", "2-bedroom", "2br" -> 2 bedrooms (3 or more counts as 3+).
  var m = s.match(/(\d)\s*[- ]?\s*(bed|br|bdrm|bedroom)/);
  if (m) {
    o.beds = +m[1] >= 3 ? 3 : +m[1];
  }
  // Number words too: "two bedroom".
  var w = { one: 1, two: 2, three: 3 };
  m = s.match(/\b(one|two|three)\s*[- ]?\s*(bed|bedroom)/);
  if (m) {
    o.beds = w[m[1]] >= 3 ? 3 : w[m[1]];
  }
  // Price: "under $2500", "max 2,000" or just "$2500". Kept between 1500 and 4000 (the slider range).
  var p =
    s.match(/(?:under|below|max|less than|up to|within|<)\s*\$?\s*([\d,]{3,5})/) ||
    s.match(/\$\s*([\d,]{3,5})/);
  if (p) {
    o.max = Math.max(1500, Math.min(4000, +p[1].replace(/,/g, "")));
  }
  // Sort: mentions of school, cheap or rated change the order of results.
  if (/school/.test(s)) {
    o.sort = "school";
  } else if (/cheap|affordable|lowest|cheapest/.test(s)) {
    o.sort = "lo";
  } else if (/best rated|top rated|highest rated/.test(s)) {
    o.sort = "rate";
  }
  // Area: first area whose words appear in the sentence.
  Object.keys(HOODS).some(function (h) {
    if (
      HOODS[h].some(function (k) {
        return s.indexOf(k) >= 0;
      })
    ) {
      o.hood = h;
      return true;
    }
  });
  // Remove the parts already understood (beds, price, area) so only real keywords remain.
  var rest = s
    .replace(/(\d|one|two|three)\s*[- ]?\s*(bedroom|bdrm|bed|br)s?/g, " ")
    .replace(/(under|below|max|less than|up to|within|<)\s*\$?\s*[\d,]{3,5}/g, " ")
    .replace(/\$\s*[\d,]{3,5}/g, " ");
  if (o.hood) {
    HOODS[o.hood].forEach(function (k) {
      rest = rest.split(k).join(" ");
    });
  }
  // What is left becomes the keyword text for the search.
  o.text = tokens(rest).join(" ");
  return o;
}
// agentBrain() returns a Promise with the query. If NESTORA_AGENT_URL is set it asks that server
// (Claude); if the server fails it falls back to parseLocal. Without a URL it waits 0.6s so it feels like thinking.
function agentBrain(q) {
  if (window.NESTORA_AGENT_URL) {
    return fetch(window.NESTORA_AGENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q })
    })
      .then(function (r) {
        if (!r.ok) {
          throw new Error("agent " + r.status);
        }
        return r.json();
      })
      .then(function (o) {
        return Object.assign(parseLocal(""), o);
      })
      .catch(function () {
        return parseLocal(q);
      });
  }
  return new Promise(function (res) {
    setTimeout(function () {
      res(parseLocal(q));
    }, 600);
  });
}
// describe() lists what was understood, as short phrases, for the reply sentence.
function describe(o) {
  var b = [];
  if (o.beds !== "any") {
    b.push(o.beds === 0 ? "studios" : o.beds === 3 ? "3+ bedrooms" : o.beds + " bedrooms");
  }
  if (o.max < 4000) {
    b.push("under " + money(o.max));
  }
  if (o.hood) {
    b.push("in " + o.hood);
  }
  if (o.text) {
    b.push('keywords "' + o.text + '"');
  }
  if (o.sort === "school") {
    b.push("best school zones first");
  } else if (o.sort === "lo") {
    b.push("lowest price first");
  } else if (o.sort === "rate") {
    b.push("top rated first");
  }
  return b;
}
// Avatar states and their labels. AVT is the timer that moves the avatar between states.
var AVT = null,
  AVN = {
    idle: "Idle",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    happy: "Happy"
  };
// setAv() switches the avatar look (CSS class st-idle, st-listening...) and its label.
function setAv(st) {
  var av = $("#av"),
    l = $("#avst");
  if (!av) {
    return;
  }
  av.className = "avatar st-" + st;
  if (l) {
    l.textContent = AVN[st];
  }
}
// wireAgent() connects the avatar to the input box and the Play sequence button.
function wireAgent() {
  var q = $("#aq");
  if (!q) {
    return;
  }
  setAv("idle");
  // Typing in the box = listening; leaving it = idle.
  q.onfocus = q.oninput = function () {
    if (!AVT) {
      setAv("listening");
    }
  };
  q.onblur = function () {
    if (!AVT) {
      setAv("idle");
    }
  };
  // Play sequence: steps through every state, 1.4 seconds each, as a demo.
  $("#aplay").onclick = function () {
    var seq = ["idle", "listening", "thinking", "speaking", "happy", "idle"],
      i = 0;
    clearTimeout(AVT);
    (function step() {
      setAv(seq[i]);
      i++;
      if (i < seq.length) {
        AVT = setTimeout(step, 1400);
      } else {
        AVT = null;
      }
    })();
  };
}
// after() runs a function later and cancels any earlier timer.
function after(ms, f) {
  clearTimeout(AVT);
  AVT = setTimeout(function () {
    AVT = null;
    f();
  }, ms);
}
// ask() is the whole agent flow: thinking -> search -> speaking -> happy or idle.
// It applies the query to the filters, then writes the answer in the reply box.
function ask(q) {
  var r = $("#areply");
  clearTimeout(AVT);
  AVT = 1;
  setAv("thinking");
  $("#say").textContent = "Looking through listings...";
  r.hidden = true;
  agentBrain(q).then(function (o) {
    S.beds = o.beds;
    S.max = o.max;
    S.sort = o.sort;
    S.hood = o.hood;
    S.text = o.text;
    S.sel = null;
    sync();
    var a = results(),
      b = describe(o);
    AVT = null;
    setAv("speaking");
    $("#say").textContent = "Here is what I found.";
    r.hidden = false;
    var fin = function (good) {
      after(1800, function () {
        setAv(good ? "happy" : "idle");
        after(2200, function () {
          setAv("idle");
        });
      });
    };
    if (!b.length) {
      r.textContent =
        'I could not pick out a size, price or area, so I am showing every home. Try something like "2-bed in the Annex under $3000".';
      fin(false);
      return;
    }
    if (!a.length) {
      r.textContent =
        "No homes found for " +
        b.join(", ") +
        ". Try a higher budget, fewer bedrooms, or remove a keyword.";
      fin(false);
      return;
    }
    var t = a[0];
    S.sel = t.id;
    sync();
    r.innerHTML =
      "Showing " +
      a.length +
      (a.length === 1 ? " home" : " homes") +
      ": " +
      esc(b.join(", ")) +
      ".<br><b>Top match:</b> " +
      esc(t.t) +
      " at " +
      money(t.price) +
      ", rated " +
      t.r +
      ", with " +
      esc(t.sch[0][0]) +
      " " +
      t.sch[0][2] +
      " km away (school score " +
      t.sch[0][3] +
      "/10).";
    fin(true);
  });
}
// countHtml() writes "6 homes found" above the cards, with a Clear button when an area or keyword is active.
function countHtml(a) {
  var c = $("#cnt");
  if (!c) {
    return;
  }
  var f = [];
  if (S.hood) {
    f.push(S.hood);
  }
  if (S.text) {
    f.push('"' + S.text + '"');
  }
  c.innerHTML =
    a.length +
    (a.length === 1 ? " home" : " homes") +
    " found" +
    (f.length
      ? ' <span class="tiny" style="font-weight:500">for ' +
        esc(f.join(" + ")) +
        '</span> <button class="btn ghost sm" id="clr" type="button">Clear</button>'
      : "");
  var x = $("#clr");
  if (x) {
    x.onclick = function () {
      S.hood = null;
      S.text = "";
      sync();
    };
  }
}
