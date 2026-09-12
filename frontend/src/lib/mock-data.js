export const circulationTrend = [
  { m: "Feb", checkouts: 412, returns: 388 },
  { m: "Mar", checkouts: 468, returns: 440 },
  { m: "Apr", checkouts: 401, returns: 415 },
  { m: "May", checkouts: 522, returns: 489 },
  { m: "Jun", checkouts: 560, returns: 531 },
  { m: "Jul", checkouts: 601, returns: 574 },
  { m: "Aug", checkouts: 489, returns: 502 },
];

export const genreSplit = [
  { name: "Fiction", value: 34 },
  { name: "Non-fiction", value: 22 },
  { name: "Sci-Fi & Fantasy", value: 18 },
  { name: "Children's", value: 14 },
  { name: "Reference", value: 12 },
];

export const branchLoad = [
  { name: "Central", value: 812 },
  { name: "Eastside", value: 431 },
  { name: "Riverside", value: 388 },
  { name: "Uptown", value: 265 },
];

export const recentActivity = [
  { who: "Maria Solis", action: "checked out", what: "The Overstory", time: "8 min ago", type: "checkout" },
  { who: "System", action: "flagged overdue", what: "12 loans at Eastside", time: "22 min ago", type: "alert" },
  { who: "Jonah Weiss", action: "paid fine", what: "$4.50 — Riverside", time: "41 min ago", type: "payment" },
  { who: "Priya Nair", action: "reserved", what: "Klara and the Sun", time: "1 hr ago", type: "reservation" },
  { who: "Admin (You)", action: "added branch", what: "Uptown Annex", time: "3 hr ago", type: "admin" },
];

export const CURRENT_MEMBER = { name: "Maria Solis", email: "maria.solis@mail.com", branch: "Central", id: "U-1045" };

export const users = [
  { id: "U-1042", name: "Priya Nair", email: "priya.nair@mail.com", role: "Member", branch: "Central", status: "Active", joined: "2023-11-02" },
  { id: "U-1043", name: "Jonah Weiss", email: "jonah.w@mail.com", role: "Member", branch: "Riverside", status: "Active", joined: "2024-01-14" },
  { id: "S-0231", name: "Grace Lindqvist", email: "grace.l@library.org", role: "Librarian", branch: "Central", status: "Active", joined: "2021-06-19" },
  { id: "U-1044", name: "Marcus Ade", email: "marcus.ade@mail.com", role: "Member", branch: "Eastside", status: "Suspended", joined: "2022-09-30" },
  { id: "S-0232", name: "Tomas Reyes", email: "tomas.r@library.org", role: "Librarian", branch: "Uptown", status: "Active", joined: "2022-02-11" },
  { id: "U-1045", name: "Maria Solis", email: "maria.solis@mail.com", role: "Member", branch: "Central", status: "Active", joined: "2024-03-08" },
  { id: "A-0001", name: "You", email: "admin@library.org", role: "Admin", branch: "All", status: "Active", joined: "2019-01-01" },
];

export const roleDefs = [
  { name: "Admin", desc: "Full system access, configuration, and audit visibility." },
  { name: "Librarian", desc: "Day-to-day circulation, catalog, and member support." },
  { name: "Member", desc: "Self-service search, loans, reservations, and payments." },
];
export const permissionMatrix = [
  "Manage users", "Manage roles", "Configure branches", "Edit catalog",
  "Manage inventory", "Check-out / check-in", "Waive fines", "View reports", "View audit logs",
];
export const permGrant = {
  Admin: permissionMatrix.reduce((a, p) => ({ ...a, [p]: true }), {}),
  Librarian: { "Manage users": false, "Manage roles": false, "Configure branches": false, "Edit catalog": true, "Manage inventory": true, "Check-out / check-in": true, "Waive fines": true, "View reports": true, "View audit logs": false },
  Member: permissionMatrix.reduce((a, p) => ({ ...a, [p]: false }), {}),
};

export const branches = [
  {
    name: "Central Library",
    address: "220 Founders Ave",
    phone: "(555) 010-2200",
    email: "central@fernbridge.lib",
    hours: "8:00–21:00",
    capacity: 480,
    staff: 14,
    status: "Open",
    services: ["Free Wi-Fi", "Study rooms", "Children's corner", "Meeting rooms", "Printing"],
    schedule: [
      { day: "Mon – Thu", hours: "8:00 – 21:00" },
      { day: "Friday", hours: "8:00 – 18:00" },
      { day: "Saturday", hours: "9:00 – 17:00" },
      { day: "Sunday", hours: "Closed" },
    ],
  },
  {
    name: "Eastside Branch",
    address: "77 Millbrook Rd",
    phone: "(555) 010-2300",
    email: "eastside@fernbridge.lib",
    hours: "9:00–19:00",
    capacity: 160,
    staff: 6,
    status: "Open",
    services: ["Free Wi-Fi", "Quiet study", "Teen room", "Hold pickup"],
    schedule: [
      { day: "Mon – Fri", hours: "9:00 – 19:00" },
      { day: "Saturday", hours: "10:00 – 16:00" },
      { day: "Sunday", hours: "Closed" },
    ],
  },
  {
    name: "Riverside Branch",
    address: "5 Harbor Walk",
    phone: "(555) 010-2400",
    email: "riverside@fernbridge.lib",
    hours: "9:00–19:00",
    capacity: 140,
    staff: 5,
    status: "Open",
    services: ["Free Wi-Fi", "Community room", "Book club kits", "Kids' storytime"],
    schedule: [
      { day: "Mon – Thu", hours: "9:00 – 19:00" },
      { day: "Friday", hours: "9:00 – 17:00" },
      { day: "Saturday", hours: "10:00 – 15:00" },
      { day: "Sunday", hours: "Closed" },
    ],
  },
  {
    name: "Uptown Annex",
    address: "312 Crescent St",
    phone: "(555) 010-2500",
    email: "uptown@fernbridge.lib",
    hours: "10:00–18:00",
    capacity: 90,
    staff: 3,
    status: "Renovation",
    services: ["Free Wi-Fi", "Hold pickup only"],
    schedule: [{ day: "Temporarily", hours: "Reopening soon — hold pickup only" }],
  },
];

export const catalog = [
  {
    call: "813.6 STE",
    title: "The Overstory",
    author: "Richard Powers",
    genre: "Fiction",
    year: 2018,
    copies: 6,
    available: 2,
    featured: true,
    desc: "Winner of the 2019 Pulitzer Prize for Fiction — nine strangers, brought together by trees, find their lives entwined in a sweeping story about the natural world and our place in it.",
    shelves: [
      { branch: "Central Library", total: 3, avail: 1 },
      { branch: "Eastside Branch", total: 1, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
      { branch: "Uptown Annex", total: 1, avail: 0 },
    ],
  },
  {
    call: "823.92 ISH",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Sci-Fi",
    year: 2021,
    copies: 4,
    available: 0,
    desc: "From the Nobel Prize–winning author of Never Let Me Go — an artificial friend named Klara watches the world from a shop window, waiting for the girl who will one day choose her.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 0 },
      { branch: "Eastside Branch", total: 1, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 0 },
    ],
  },
  {
    call: "153.42 KAH",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Non-fiction",
    year: 2011,
    copies: 5,
    available: 3,
    featured: true,
    desc: "Nobel laureate Daniel Kahneman maps the two systems that drive how we think — the fast, intuitive System 1 and the slow, deliberate System 2 — and how they shape our judgments.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 1 },
      { branch: "Eastside Branch", total: 1, avail: 1 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
      { branch: "Uptown Annex", total: 1, avail: 0 },
    ],
  },
  {
    call: "j813 GAI",
    title: "The Girl Who Drank the Moon",
    author: "Kelly Barnhill",
    genre: "Children's",
    genreShort: true,
    year: 2016,
    copies: 3,
    available: 1,
    desc: "Newbery Medal winner — every year the people of the Protectorate leave a baby for the witch in the forest. But Xan is kind, and the girl she accidentally enchants will change everything.",
    shelves: [
      { branch: "Central Library", total: 1, avail: 0 },
      { branch: "Eastside Branch", total: 1, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
    ],
  },
  {
    call: "R 031 BRI",
    title: "World Almanac 2026",
    author: "Britannica Ed.",
    genre: "Reference",
    year: 2025,
    copies: 2,
    available: 2,
    desc: "The essential one-volume reference — facts, statistics, and timelines across science, history, sports, geography, and more, fully updated for 2026.",
    shelves: [
      { branch: "Central Library", total: 1, avail: 1 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
    ],
  },
  {
    call: "813.54 ATW",
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    genre: "Fiction",
    year: 1985,
    copies: 4,
    available: 1,
    desc: "Atwood's chilling dystopian classic — in the Republic of Gilead, women are stripped of their rights, and Offred must survive a world she never chose.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 0 },
      { branch: "Eastside Branch", total: 1, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
    ],
  },
  {
    call: "813.52 FIT",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    year: 1925,
    copies: 5,
    available: 3,
    desc: "Fitzgerald's masterpiece of the Jazz Age — a portrait of wealth, longing, and the American dream, seen through the eyes of Nick Carraway.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 1 },
      { branch: "Eastside Branch", total: 1, avail: 1 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
      { branch: "Uptown Annex", total: 1, avail: 0 },
    ],
  },
  {
    call: "612.82 HAR",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-fiction",
    year: 2011,
    copies: 4,
    available: 2,
    featured: true,
    desc: "A bold account of humankind's rise — from the Stone Age to the age of algorithms — and a provocative look at where our species is headed next.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 1 },
      { branch: "Eastside Branch", total: 1, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
    ],
  },
  {
    call: "813.6 HER",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    year: 1965,
    copies: 6,
    available: 1,
    desc: "Herbert's epic of desert power and destiny — on the arid planet Arrakis, young Paul Atreides is thrust into a struggle for the most valuable substance in the universe.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 0 },
      { branch: "Eastside Branch", total: 2, avail: 0 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
      { branch: "Uptown Annex", total: 1, avail: 0 },
    ],
  },
  {
    call: "j813 ROW",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    genre: "Children's",
    genreShort: true,
    year: 1997,
    copies: 6,
    available: 2,
    desc: "The book that started it all — an orphaned boy discovers he is a wizard and steps into the hidden world of Hogwarts School of Witchcraft and Wizardry.",
    shelves: [
      { branch: "Central Library", total: 2, avail: 0 },
      { branch: "Eastside Branch", total: 2, avail: 1 },
      { branch: "Riverside Branch", total: 1, avail: 1 },
      { branch: "Uptown Annex", total: 1, avail: 0 },
    ],
  },
];

export const inventory = [
  { branch: "Central", totalCopies: 18420, checkedOut: 2110, lost: 34, lowStock: 6 },
  { branch: "Eastside", totalCopies: 6210, checkedOut: 890, lost: 11, lowStock: 3 },
  { branch: "Riverside", totalCopies: 5540, checkedOut: 760, lost: 9, lowStock: 2 },
  { branch: "Uptown", totalCopies: 3120, checkedOut: 340, lost: 4, lowStock: 5 },
];

export const loans = [
  { member: "Maria Solis", title: "The Overstory", checked: "2026-07-29", due: "2026-08-12", status: "On time" },
  { member: "Priya Nair", title: "Educated", checked: "2026-07-18", due: "2026-08-01", status: "Overdue" },
  { member: "Jonah Weiss", title: "Sapiens", checked: "2026-08-02", due: "2026-08-16", status: "On time" },
  { member: "Marcus Ade", title: "Dune", checked: "2026-07-10", due: "2026-07-24", status: "Overdue" },
];

export const fines = [
  { member: "Priya Nair", reason: "Overdue — Educated", amount: 3.5, status: "Unpaid" },
  { member: "Marcus Ade", reason: "Overdue — Dune", amount: 7.0, status: "Unpaid" },
  { member: "Jonah Weiss", reason: "Damaged item", amount: 12.0, status: "Paid" },
  { member: "Maria Solis", reason: "Overdue — Circe", amount: 1.5, status: "Paid" },
];

export const reservations = [
  { member: "Priya Nair", title: "Klara and the Sun", position: 1, status: "Ready for pickup" },
  { member: "Tomas Reyes", title: "Klara and the Sun", position: 2, status: "Waiting" },
  { member: "Grace Lindqvist", title: "Fourth Wing", position: 1, status: "Waiting" },
];

export const notifTemplates = [
  { name: "Due date reminder", trigger: "2 days before due", enabled: true },
  { name: "Overdue notice", trigger: "1 day after due, then weekly", enabled: true },
  { name: "Reservation ready", trigger: "On hold shelf placement", enabled: true },
  { name: "Fine issued", trigger: "On fine creation", enabled: false },
  { name: "Branch closure alert", trigger: "Manual / scheduled", enabled: true },
];

export const reports = [
  { name: "Monthly Circulation Report", desc: "Checkouts, returns, and renewals by branch." },
  { name: "Fines & Payments Summary", desc: "Collected, waived, and outstanding balances." },
  { name: "Inventory & Loss Report", desc: "Stock levels, shrinkage, and low-stock items." },
  { name: "Member Activity Report", desc: "New registrations and engagement trends." },
];

export const auditLogs = [
  { time: "2026-08-08 09:14", user: "Admin (You)", action: "Updated fine rate to $0.25/day", ip: "10.4.2.18" },
  { time: "2026-08-08 08:52", user: "Grace Lindqvist", action: "Waived fine for Jonah Weiss", ip: "10.4.5.61" },
  { time: "2026-08-07 17:30", user: "Tomas Reyes", action: "Checked in 'Dune' (Uptown)", ip: "10.4.7.02" },
  { time: "2026-08-07 15:02", user: "Admin (You)", action: "Added branch 'Uptown Annex'", ip: "10.4.2.18" },
  { time: "2026-08-06 11:47", user: "Grace Lindqvist", action: "Edited catalog entry 813.6 STE", ip: "10.4.5.61" },
];
