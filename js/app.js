/* ==========================================================================
 app.js - router and start-up
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 The address after # decides the page: #home, #property-3, #book-date, #book-confirm,
 #book-done, #saved, #tours. Each page is drawn by a function from another file.
 ========================================================================== */
// route() reads the hash and draws the matching page. Runs at start and on every hash change.
function route() {
  var h = location.hash.slice(1) || "home",
    m;
  closeLayer();
  window.scrollTo(0, 0);
  if (h === "home") {
    home();
  } else if ((m = h.match(/^property-(\d+)$/))) {
    property(+m[1]);
  } else if (h === "book-date") {
    bookDate();
  } else if (h === "book-confirm") {
    bookConfirm();
  } else if (h === "book-done") {
    bookDone();
  } else if (h === "saved") {
    saved();
  } else if (h === "tours") {
    tours();
  } else {
    home();
  }
  document.title = "Nestora";
  navBadge();
}
// Run route() whenever the address hash changes (links, back button, go()).
window.addEventListener("hashchange", route);
// Click the logo to go home.
$("#logo").onclick = function () {
  go("home");
};
// Sign in is out of scope for this version, so it only shows a message.
$("#signin").onclick = function () {
  toast("Sign in is not part of this version");
};
// Keyboard: Enter on a focused card opens it like a click.
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("card")) {
    e.target.click();
  }
});
// Put the Toronto map into the hidden <svg id="basemap">; other maps reuse it with <use>.
document.getElementById("basemap").innerHTML = MAP_SVG;
// Draw the first page.
route();
