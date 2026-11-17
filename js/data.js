/* ==========================================================================
 data.js - sample data and the app's shared state
 The 6 listings, their schools, reviews and amenities live here. This is the "database".
 By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
 To add a home, add one more object to L (and a pin to MAPPINS in map-data.js).
 ========================================================================== */
// Path of the Nestora Agent picture.
var AVATAR = "assets/avatar.png";
// TODAY = this morning at midnight; the calendar uses it to disable past days.
var TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
// PAL = colour sets for the drawn placeholder pictures (one per listing).
var PAL = [
  { wall: "#e9eef0", floor: "#c9a886", sky: "#bcd9ea", sofa: "#6f8f86", bld: "#8aa4b5" },
  { wall: "#f1e9de", floor: "#b78f6a", sky: "#cfe0ea", sofa: "#b0705a", bld: "#97a8b4" },
  { wall: "#e6edf2", floor: "#d2b48e", sky: "#c5def0", sofa: "#4c6a8f", bld: "#7f97ad" },
  { wall: "#eceae2", floor: "#a98764", sky: "#d9e6ea", sofa: "#7b8a6a", bld: "#9aa9b0" },
  { wall: "#e8e4ee", floor: "#c4a07c", sky: "#c9dcec", sofa: "#8a6d9a", bld: "#8d9db0" },
  { wall: "#efeee6", floor: "#bb9a76", sky: "#c3dbe6", sofa: "#d0a24a", bld: "#8ea2ad" }
];
// L = the listings.
// id, t=title, st=street, hood=area, price=per month, beds (0 = studio), baths, sqft,
// r=rating, n=review count, avail=available from, ll=landlord, resp=reply time,
// sch=schools [name, level, km away, score out of 10], d=description.
var L = [
  {
    id: 1,
    t: "Sunlit 2-Bed at King West",
    st: "212 King St W",
    hood: "Financial District",
    price: 2450,
    beds: 2,
    baths: 2,
    sqft: 880,
    r: 4.7,
    n: 12,
    avail: "Dec 1",
    ll: "Maya Rossi",
    resp: "1 day",
    sch: [
      ["Harbour Public School", "Elementary", 0.4, 9.1],
      ["King Street Academy", "Elementary", 0.7, 8.6],
      ["Bay Collegiate", "Secondary", 1.1, 8.9]
    ],
    d: "Corner suite with floor-to-ceiling windows, an open kitchen and a quiet bedroom facing the courtyard. Two minutes from the King streetcar."
  },
  {
    id: 2,
    t: "Bright Studio near Yonge and Dundas",
    st: "88 Dundas St E",
    hood: "Yonge and Dundas",
    price: 1650,
    beds: 0,
    baths: 1,
    sqft: 430,
    r: 4.3,
    n: 8,
    avail: "Nov 25",
    ll: "Daniel Osei",
    resp: "2 hours",
    sch: [
      ["Garden Public School", "Elementary", 0.6, 7.8],
      ["Central Tech Prep", "Secondary", 1.3, 8.2],
      ["Church Street School", "Elementary", 0.9, 7.5]
    ],
    d: "Efficient studio with a built-in wardrobe, new appliances and a Murphy bed. Steps from the subway, groceries and campus."
  },
  {
    id: 3,
    t: "Queen West 1-Bed with Balcony",
    st: "45 Queen St W",
    hood: "Queen West",
    price: 1980,
    beds: 1,
    baths: 1,
    sqft: 610,
    r: 4.5,
    n: 19,
    avail: "Dec 15",
    ll: "Priya Nair",
    resp: "1 day",
    sch: [
      ["Kensington Public School", "Elementary", 0.3, 8.4],
      ["Spadina Collegiate", "Secondary", 0.9, 8.0],
      ["Alexandra Park School", "Elementary", 1.2, 7.9]
    ],
    d: "Light-filled one-bedroom with a private balcony, in-suite laundry and a bike room. Cafes and galleries at the door."
  },
  {
    id: 4,
    t: "Annex 2-Bed + Den near the University",
    st: "301 Bloor St W",
    hood: "The Annex",
    price: 2890,
    beds: 2,
    baths: 2,
    sqft: 1040,
    r: 4.8,
    n: 27,
    avail: "Jan 1",
    ll: "Hannah Kim",
    resp: "3 hours",
    sch: [
      ["Palmerston Public School", "Elementary", 0.5, 9.4],
      ["Annex Collegiate", "Secondary", 0.8, 9.0],
      ["Huron Street School", "Elementary", 1.0, 8.7]
    ],
    d: "Two bedrooms plus a den that works as an office. Hardwood floors, a gas range and a shared garden in a quiet building."
  },
  {
    id: 5,
    t: "Waterfront Condo with Lake View",
    st: "15 Lower Jarvis St",
    hood: "Waterfront",
    price: 2300,
    beds: 2,
    baths: 1,
    sqft: 790,
    r: 4.1,
    n: 6,
    avail: "Dec 1",
    ll: "Samuel Cho",
    resp: "1 day",
    sch: [
      ["Lakeside Public School", "Elementary", 0.8, 8.1],
      ["St. Lawrence Academy", "Elementary", 1.0, 8.3],
      ["Harbourfront Collegiate", "Secondary", 1.6, 8.5]
    ],
    d: "Lake-facing two-bedroom with a gym, pool and concierge in the building. Short walk to the waterfront trail."
  },
  {
    id: 6,
    t: "Cabbagetown Townhouse, 3 Bedrooms",
    st: "120 Carlton St",
    hood: "Church and Carlton",
    price: 3400,
    beds: 3,
    baths: 2,
    sqft: 1380,
    r: 4.9,
    n: 15,
    avail: "Jan 15",
    ll: "Olivia Grant",
    resp: "1 day",
    sch: [
      ["Rose Avenue School", "Elementary", 0.4, 9.6],
      ["Jarvis Heritage Collegiate", "Secondary", 1.0, 9.2],
      ["Cabbagetown Montessori", "Elementary", 1.2, 9.0]
    ],
    d: "Three-bedroom townhouse with a private yard, finished basement and parking. Quiet street close to parks and good schools."
  }
];
// AM = every amenity; each listing shows the first 5 to 7.
var AM = [
  "In-suite laundry",
  "Dishwasher",
  "Air conditioning",
  "Bike storage",
  "Pets allowed",
  "Gym",
  "Concierge",
  "Balcony"
];
// REV = the sample reviews shown on every property page.
var REV = [
  ["Aisha K.", "Quick replies and the place matched the listing. Easy move-in."],
  ["Tom R.", "Quiet building and a friendly landlord. Heat and water were sorted on day one."]
];
// SOFF = where the 3 school markers sit around the home on the mini map (x, y offsets).
var SOFF = [
  [-46, -34],
  [58, -22],
  [16, 52]
];
// S = live state of the app (not saved): current filters, sort, chosen listing, map zoom,
// hearted homes, and B = the booking form (listing, date, time, contact details).
var S = {
  q: "",
  beds: "any",
  max: 4000,
  sort: "rec",
  hood: null,
  text: "",
  saved: {},
  sel: null,
  zoom: 0,
  B: {
    id: 1,
    date: null,
    time: null,
    method: "Phone call",
    name: "",
    email: "",
    phone: "",
    msg: "",
    remind: true,
    ref: null,
    month: null
  }
};
