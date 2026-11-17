/* ==========================================================================
 store.js - saving data in the browser
 Everything is kept in localStorage, so it stays after a refresh. There is no server:
 one tester, one browser. Depends on: data.js (S).
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 ========================================================================== */
// Name of the saved record in localStorage. Change "v1" if the saved shape ever changes.
var KEY = "nestora.v1";
// Reads saved data. If nothing is saved (or it is broken or an old version), starts with an empty record.
// saved = hearted homes, tours = booked tours, msgs = messages to landlords, profile = name/email/phone.
function loadDB() {
  try {
    var r = JSON.parse(localStorage.getItem(KEY) || "null");
    if (r && r.v === 1) {
      return r;
    }
  } catch (e) {}
  return { v: 1, saved: {}, tours: [], msgs: [], profile: {} };
}
// DB is the saved record held in memory while the app runs.
var DB = loadDB();
// Writes DB back to localStorage. Call this after every change you want to keep.
function persist() {
  DB.saved = S.saved;
  try {
    localStorage.setItem(KEY, JSON.stringify(DB));
  } catch (e) {}
}
// Copy the saved hearts into the live state S, so the hearts show on the cards.
S.saved = DB.saved;
// Pre-fill the booking form with the name, email and phone from last time.
if (DB.profile) {
  S.B.name = DB.profile.name || "";
  S.B.email = DB.profile.email || "";
  S.B.phone = DB.profile.phone || "";
}
