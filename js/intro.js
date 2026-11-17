/* ==========================================================================
 intro.js - Nesti welcome video
 Sits in the corner of the Nestora Agent card. Plays once per browser session (muted),
 then waits for a tap. If the video cannot play, the box hides itself.
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 ========================================================================== */
// Path of the video file.
var NESTI = "assets/nesti.mp4";
// SPK = the two small speaker icons: sound off and sound on.
var SPK = {
  off: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 9l5 6M21 9l-5 6" fill="none"/></svg>',
  on: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14" fill="none"/></svg>'
};
// nestiHtml() returns the video box HTML (put inside the agent card by home.js).
function nestiHtml() {
  return (
    '<div class="nv" id="nv"><video id="iv" src="' +
    NESTI +
    '" muted playsinline preload="metadata" aria-label="Nesti introduces the Nestora Agent"></video>' +
    '<button type="button" class="nvp" id="nvp" aria-label="Play welcome video">&#9654;</button><button type="button" class="nvs" id="nvs" aria-pressed="false" aria-label="Turn sound on">' +
    SPK.off +
    "</button></div>"
  );
}
// wireNesti() connects the video. It does nothing if the video box is not on this page.
function wireNesti() {
  var v = document.getElementById("iv"),
    b = document.getElementById("nvp"),
    s = document.getElementById("nvs"),
    box = document.getElementById("nv");
  if (!v) {
    return;
  }
  // seen = has the intro already played in this session? (sessionStorage)
  var seen = false;
  try {
    seen = sessionStorage.getItem("nestora.intro") === "1";
  } catch (e) {}
  // reduce = does the person prefer less motion? Then do not auto-play.
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // mark() remembers the intro has been seen.
  function mark() {
    try {
      sessionStorage.setItem("nestora.intro", "1");
    } catch (e) {}
  }
  // play() restarts the video and shows the controls; if the browser blocks playback it undoes that.
  function play() {
    try {
      v.currentTime = 0;
    } catch (e) {}
    box.classList.add("on");
    var p = v.play();
    if (p && p.catch) {
      p.catch(function () {
        box.classList.remove("on");
      });
    }
  }
  // Play button and sound button (toggles muted, updates the icon and its label).
  b.onclick = play;
  s.onclick = function () {
    v.muted = !v.muted;
    s.innerHTML = v.muted ? SPK.off : SPK.on;
    s.setAttribute("aria-label", v.muted ? "Turn sound on" : "Turn sound off");
    s.setAttribute("aria-pressed", String(!v.muted));
    if (v.paused) {
      play();
    }
  };
  // When it ends: remember it, hide the controls and show a still frame.
  v.addEventListener("ended", function () {
    mark();
    box.classList.remove("on");
    try {
      v.currentTime = 0.1;
    } catch (e) {}
  });
  // If the file is missing or cannot be decoded, hide the whole box.
  v.addEventListener("error", function () {
    box.hidden = true;
  });
  // Show a still frame (not a black box) once the video info has loaded.
  v.addEventListener("loadedmetadata", function () {
    try {
      v.currentTime = 0.1;
    } catch (e) {}
  });
  // replayIntro() is used by the "Replay intro" link on the search page.
  window.replayIntro = play;
  // Auto-play once per session unless reduced motion is on.
  if (!seen && !reduce) {
    play();
  }
}
