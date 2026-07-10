// ============================================================
// PROJECTS
// To add a new one, copy an object and paste it at the end.
// Required fields: id, code, slug, title, year, location, format, cover, images[]
// images[].orient: "landscape" | "portrait"
// coords: [lat, lng] — where the project appears on the Map view
// Photos live in projects/<folder>/ — use relative urls,
// e.g. { url: "projects/001_ronchamp/01_RONCHAMP.jpg", orient: "portrait" }
// ============================================================

const projects = [
  {
    id: 1,
    code: "001",
    slug: "ronchamp",
    title: "Ronchamp",
    year: 2026,
    location: "France",
    architect: "Le Corbusier",
    format: "Architecture",
    coords: [47.7047, 6.6203],
    description: "It only took a moment in front of one façade to understand what Le Corbusier was searching for here: bringing the building closer to the people who would experience it. He fragments it. Breaks it apart. Creates small moments to inhabit. Staircases, openings, lecterns. Perched on top of the hill, this object could easily feel detached from the landscape, almost imposed upon it. Yet these fragments make it intimate. Approachable. They invite occupation and appropriation. They give a human scale to the great sloping walls, softening what might otherwise feel like a single, monolithic form.",
    cover: "projects/001_ronchamp/01_RONCHAMP.jpg",
    images: [
      { url: "projects/001_ronchamp/01_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/02_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/03_RONCHAMP.jpg", orient: "landscape" },
      { url: "projects/001_ronchamp/04_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/05_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/06_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/07_RONCHAMP.jpg", orient: "portrait" },
      { url: "projects/001_ronchamp/08_RONCHAMP.jpg", orient: "portrait" }
    ]
  },
  {
    id: 2,
    code: "002",
    slug: "la-tourette",
    title: "La Tourette",
    year: 2026,
    location: "France",
    architect: "Le Corbusier",
    format: "Architecture",
    coords: [45.8194, 4.6236], // Éveux, near Lyon
    description: "On such a bright day, all I could think about was how the immense concrete mass that greets you slowly dissolves into slender supports, as if it were fading away just to touch the ground. Surrounded by such an untouched landscape, the contrast between architecture and nature becomes even more intense. The weight of the concrete longs to meet the grass. The scale of the building gradually breaks apart, allowing itself to merge with its surroundings. The grass seems to flow into the building, or perhaps the building simply opens itself to the landscape.",
    cover: "projects/002_LA TOURETTE_2026/09_LA TOURETTE.jpg",
    images: [
      { url: "projects/002_LA TOURETTE_2026/01_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/02_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/03_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/04_LA TOURETTE.jpg", orient: "portrait" },
      { url: "projects/002_LA TOURETTE_2026/05_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/06_LA TOURETTE.jpg", orient: "portrait" },
      { url: "projects/002_LA TOURETTE_2026/07_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/08_LA TOURETTE.jpg", orient: "landscape" },
      { url: "projects/002_LA TOURETTE_2026/09_LA TOURETTE.jpg", orient: "portrait" }
    ]
  },
  {
    id: 3,
    code: "003",
    slug: "les-cols",
    title: "Les Cols",
    year: 2025,
    location: "Olot",
    architect: "RCR Arquitectes",
    format: "Architecture",
    coords: [42.1817, 2.489], // Olot, Girona
    description: "Les Cols Restaurant by RCR Arquitectes",
    cover: "projects/003_LES COLS_2025/01_LES COLS.jpg",
    images: [
      { url: "projects/003_LES COLS_2025/01_LES COLS.jpg", orient: "portrait" },
      { url: "projects/003_LES COLS_2025/02_LES COLS.jpg", orient: "landscape" },
      { url: "projects/003_LES COLS_2025/03_LES COLS.jpg", orient: "landscape" },
      { url: "projects/003_LES COLS_2025/04_LES COLS.jpg", orient: "portrait" },
      { url: "projects/003_LES COLS_2025/05_LES COLS.jpg", orient: "landscape" },
      { url: "projects/003_LES COLS_2025/06_LES COLS.jpg", orient: "landscape" }
    ]
  }
];
