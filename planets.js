/**
 * Solar System Explorer - Complete Canonical Dataset & STEM Quiz Bank
 */

const CELESTIAL_DATA = [
  {
    id: "sun",
    name: "The Sun",
    type: "Yellow Dwarf Star (G2V)",
    tagline: "The gravitational anchor and heart of our solar system",
    description: "The Sun contains 99.86% of all mass in the Solar System. It generates energy via nuclear fusion at its core, converting hydrogen into helium at temperatures exceeding 15 million degrees Celsius.",
    diameter: "1,392,700 km",
    distanceFromSun: "0 km (Center)",
    avgTemp: "5,500°C (Surface) / 15,000,000°C (Core)",
    orbitalPeriod: "230 Million Years (Galactic Orbit)",
    moons: "0 (Host to 8 Planets & Asteroids)",
    visualColor: 0xffaa00,
    sizeRadius: 9.5,
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.002,
    facts: [
      "About 1.3 million Earths could fit inside the Sun.",
      "Light from the Sun takes roughly 8 minutes and 20 seconds to reach Earth.",
      "The solar wind emitted by the Sun creates auroras across planetary atmospheres."
    ]
  },
  {
    id: "mercury",
    name: "Mercury",
    type: "Terrestrial (Inner Planet)",
    tagline: "The smallest planet and closest to the Sun",
    description: "Mercury is a rocky world covered with impact craters, resembling Earth's Moon. Because it lacks a significant atmosphere to retain heat, it experiences extreme temperature swings.",
    diameter: "4,879 km",
    distanceFromSun: "57.9 Million km",
    avgTemp: "Day: 430°C | Night: -180°C",
    orbitalPeriod: "88 Earth Days",
    moons: "0",
    visualColor: 0x8c8c8c,
    sizeRadius: 1.2,
    orbitRadius: 22,
    orbitSpeed: 0.04,
    rotationSpeed: 0.005,
    facts: [
      "A year on Mercury is only 88 Earth days, but one solar day equals 176 Earth days.",
      "Mercury has a massive iron core that makes up about 75% of its total diameter.",
      "Despite being nearest to the Sun, Venus is hotter due to greenhouse gas trapping."
    ]
  },
  {
    id: "venus",
    name: "Venus",
    type: "Terrestrial (Inner Planet)",
    tagline: "Earth's toxic twin with runaway greenhouse heat",
    description: "Venus has a thick atmosphere composed predominantly of carbon dioxide with clouds of sulfuric acid. Surface atmospheric pressure is 92 times greater than Earth's.",
    diameter: "12,104 km",
    distanceFromSun: "108.2 Million km",
    avgTemp: "465°C (Hottest in Solar System)",
    orbitalPeriod: "225 Earth Days",
    moons: "0",
    visualColor: 0xe3bb76,
    sizeRadius: 2.2,
    orbitRadius: 32,
    orbitSpeed: 0.03,
    rotationSpeed: -0.002,
    facts: [
      "Venus rotates backwards (clockwise) compared to most other planets.",
      "Its rotational day is longer than its orbital year: 243 Earth days to rotate vs 225 days to orbit.",
      "Surface temperatures are high enough to melt lead."
    ]
  },
  {
    id: "earth",
    name: "Earth",
    type: "Terrestrial (Inner Planet)",
    tagline: "Our home and the only known haven for life",
    description: "Earth resides squarely in the habitable 'Goldilocks Zone'. It is the only known celestial body to sustain liquid surface oceans, an active dynamo magnetic shield, and an oxygen-rich atmosphere.",
    diameter: "12,742 km",
    distanceFromSun: "149.6 Million km (1 AU)",
    avgTemp: "15°C",
    orbitalPeriod: "365.25 Days",
    moons: "1 (The Moon)",
    visualColor: 0x2e6cd4,
    sizeRadius: 2.4,
    orbitRadius: 44,
    orbitSpeed: 0.022,
    rotationSpeed: 0.015,
    facts: [
      "Oceans cover roughly 71% of Earth's surface.",
      "Earth's magnetic shield (magnetosphere) protects us from solar flare radiation.",
      "The atmosphere consists of 78% nitrogen, 21% oxygen, and 1% trace gases."
    ]
  },
  {
    id: "moon",
    name: "The Moon (Luna)",
    type: "Natural Satellite",
    tagline: "Earth's sole natural satellite and tidal driver",
    description: "The Moon is Earth's only natural satellite. It is in synchronous rotation with Earth, always showing the same face, and its gravitational pull creates oceanic tides.",
    diameter: "3,474 km",
    distanceFromSun: "149.6 Million km (Orbits Earth)",
    avgTemp: "-130°C to 120°C",
    orbitalPeriod: "27.3 Earth Days",
    moons: "0",
    visualColor: 0xd0d0d0,
    sizeRadius: 0.65,
    orbitRadius: 44, // Tracks Earth
    facts: [
      "The Moon is the fifth-largest natural satellite in the solar system.",
      "Neil Armstrong and Buzz Aldrin were the first humans to land on it in 1969.",
      "It is drifting away from Earth at roughly 3.8 cm per year."
    ]
  },
  {
    id: "iss",
    name: "ISS (Space Station)",
    type: "Artificial Satellite",
    tagline: "Humanity's microgravity orbital laboratory",
    description: "The International Space Station is the largest modular space station in Low Earth Orbit, continually inhabited by international crews conducting cutting-edge scientific research.",
    diameter: "109 meters (Solar Array Width)",
    distanceFromSun: "Orbits ~400 km above Earth",
    avgTemp: "-150°C to 120°C (Exterior)",
    orbitalPeriod: "92 Minutes (~16 orbits/day)",
    moons: "0",
    visualColor: 0x00ffff,
    sizeRadius: 0.35,
    orbitRadius: 44,
    facts: [
      "Travels at approximately 28,000 km/h (7.6 km/s).",
      "Astronauts aboard experience 16 sunrises and sunsets every 24 hours.",
      "Powered by 1 acre of high-efficiency solar arrays."
    ]
  },
  {
    id: "mars",
    name: "Mars",
    type: "Terrestrial (Inner Planet)",
    tagline: "The Red Planet of oxidized iron dust and ancient rivers",
    description: "Mars gets its reddish hue from oxidized iron minerals across its surface. It features extreme geological relics, including Olympus Mons and Valles Marineris.",
    diameter: "6,779 km",
    distanceFromSun: "227.9 Million km",
    avgTemp: "-63°C",
    orbitalPeriod: "687 Earth Days",
    moons: "2 (Phobos & Deimos)",
    visualColor: 0xc1440e,
    sizeRadius: 1.6,
    orbitRadius: 56,
    orbitSpeed: 0.018,
    rotationSpeed: 0.014,
    facts: [
      "Olympus Mons stands three times taller than Mount Everest.",
      "Liquid water flowed across the Martian surface billions of years ago.",
      "A Martian day (a 'sol') is 24 hours and 37 minutes long."
    ]
  },
  {
    id: "asteroid_belt",
    name: "Main Asteroid Belt",
    type: "Circumstellar Debris Ring",
    tagline: "Millions of ancient rocky protoplanet remnants",
    description: "Located in the gap between Mars and Jupiter. It consists of millions of rocky, carbonaceous, and metallic fragments left over from the early solar system, dominated by the dwarf planet Ceres.",
    diameter: "Spans ~150 Million km in width",
    distanceFromSun: "329 - 478 Million km (2.2 - 3.2 AU)",
    avgTemp: "-73°C to -108°C",
    orbitalPeriod: "3 to 6 Earth Years",
    moons: "Many asteroids have their own mini-moons",
    visualColor: 0xaa9988,
    sizeRadius: 2.0,
    orbitRadius: 66,
    facts: [
      "Contains the dwarf planet Ceres, which holds a third of the belt's total mass.",
      "Despite the movies, the average distance between asteroids is roughly 1 million km.",
      "Jupiter's massive gravity prevented these rocks from coalescing into a planet."
    ]
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "Gas Giant (Outer Planet)",
    tagline: "The solar system's king of mass and storms",
    description: "Jupiter contains more mass than all other planets combined. Lacking a solid surface, it consists primarily of swirling hydrogen and helium gas with a persistent Great Red Spot storm.",
    diameter: "139,820 km",
    distanceFromSun: "778.5 Million km",
    avgTemp: "-110°C",
    orbitalPeriod: "11.86 Earth Years",
    moons: "95 Confirmed (Io, Europa, Ganymede, Callisto)",
    visualColor: 0xd39c7e,
    sizeRadius: 5.5,
    orbitRadius: 78,
    orbitSpeed: 0.012,
    rotationSpeed: 0.03,
    facts: [
      "Jupiter completes a full axial rotation in under 10 hours.",
      "Its moon Ganymede is larger than the planet Mercury.",
      "Jupiter deflects comets away from inner terrestrial orbits."
    ]
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "Gas Giant (Outer Planet)",
    tagline: "The jewel of the solar system adorned with icy rings",
    description: "Saturn is a low-density gas giant recognized for its broad ring system composed of billions of chunks of water ice, dust, and rock fragments.",
    diameter: "116,460 km",
    distanceFromSun: "1.43 Billion km",
    avgTemp: "-140°C",
    orbitalPeriod: "29.45 Earth Years",
    moons: "146 Confirmed (Titan, Enceladus, Mimas)",
    visualColor: 0xdfd195,
    sizeRadius: 4.6,
    orbitRadius: 98,
    orbitSpeed: 0.009,
    rotationSpeed: 0.028,
    hasRings: true,
    facts: [
      "Saturn has an average density lower than liquid water (0.687 g/cm³).",
      "Its moon Titan has a dense nitrogen atmosphere and liquid methane lakes.",
      "The rings span 282,000 km across, yet average only 10 to 30 meters thick."
    ]
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "Ice Giant (Outer Planet)",
    tagline: "The sideways-spinning cyan ice giant",
    description: "Uranus is an ice giant composed of water, ammonia, and methane ices over a small rocky core. It rotates tilted almost 98 degrees on its side.",
    diameter: "50,724 km",
    distanceFromSun: "2.87 Billion km",
    avgTemp: "-195°C",
    orbitalPeriod: "84 Earth Years",
    moons: "28 Confirmed (Titania, Oberon, Miranda)",
    visualColor: 0x6fe5e8,
    sizeRadius: 3.2,
    orbitRadius: 116,
    orbitSpeed: 0.006,
    rotationSpeed: -0.018,
    facts: [
      "Because Uranus rolls sideways, its poles experience 42 years of continuous sunlight and 42 years of darkness.",
      "It was the first planet discovered using a modern telescope (1781).",
      "Atmospheric methane absorbs red light, giving Uranus its cyan tint."
    ]
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "Ice Giant (Outer Planet)",
    tagline: "The blue frontier whipped by supersonic winds",
    description: "Neptune is the most distant major planet in the solar system. Driven by internal heat, its atmosphere generates supersonic winds exceeding 2,100 km/h.",
    diameter: "49,244 km",
    distanceFromSun: "4.50 Billion km",
    avgTemp: "-200°C",
    orbitalPeriod: "164.8 Earth Years",
    moons: "16 Confirmed (Triton)",
    visualColor: 0x274687,
    sizeRadius: 3.1,
    orbitRadius: 132,
    orbitSpeed: 0.004,
    rotationSpeed: 0.02,
    facts: [
      "Neptune's discovery was mathematically predicted before direct observation.",
      "Its moon Triton orbits backwards (retrograde) and features active nitrogen geysers.",
      "One orbital year on Neptune equals nearly 165 Earth years."
    ]
  },
  {
    id: "kuiper_belt",
    name: "Kuiper Belt",
    type: "Outer Frozen Disk",
    tagline: "The deep icy realm beyond Neptune's border",
    description: "A vast ring of icy debris, cometary nuclei, and dwarf planets including Pluto, Haumea, and Makemake extending beyond Neptune out to 50 AU.",
    diameter: "Extends from 30 AU to 50 AU",
    distanceFromSun: "4.5 to 7.5 Billion km",
    avgTemp: "-220°C",
    orbitalPeriod: "200 to 300+ Earth Years",
    moons: "Hosts multiple dwarf planet moon systems",
    visualColor: 0x5588cc,
    sizeRadius: 3.0,
    orbitRadius: 148,
    facts: [
      "Home to famous dwarf planets like Pluto and Arrokoth.",
      "Contains millions of icy bodies that serve as the origin of short-period comets.",
      "Estimated to contain thousands of times more ice than the Asteroid Belt has rock."
    ]
  },
  {
    id: "comet",
    name: "Halley-Type Comet",
    type: "Periodic Icy Celestial Body",
    tagline: "A cosmic snowball on an eccentric solar trajectory",
    description: "Comets are cosmic snowballs of frozen gases, rock, and dust. As their elliptical orbits bring them close to the Sun, solar radiation vaporizes ice, forming a glowing coma and a massive tail.",
    diameter: "~11 km (Nucleus)",
    distanceFromSun: "Variable (Elliptical: 0.6 AU to 35 AU)",
    avgTemp: "Varies from -200°C to +100°C near perihelion",
    orbitalPeriod: "75 to 76 Earth Years",
    moons: "0",
    visualColor: 0x00ffff,
    sizeRadius: 0.8,
    orbitRadius: 120,
    facts: [
      "A comet's tail always points directly away from the Sun due to solar wind pressure.",
      "Comet tails can stretch for hundreds of millions of kilometers across space.",
      "Cometary dust left along their orbital paths produces Earth's meteor showers."
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "Which planet has the highest surface temperature in the Solar System?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    answer: 1,
    explanation: "Venus is the hottest planet (approx. 465°C) due to runaway greenhouse warming caused by its thick CO2 atmosphere."
  },
  {
    question: "What celestial body accounts for roughly 99.86% of the Solar System's total mass?",
    options: ["Jupiter", "Earth", "The Sun", "Saturn"],
    answer: 2,
    explanation: "The Sun contains 99.86% of all matter in our Solar System."
  },
  {
    question: "Which of the following is considered an 'Inner Planet' (Terrestrial Planet)?",
    options: ["Mars", "Jupiter", "Uranus", "Neptune"],
    answer: 0,
    explanation: "The four inner terrestrial planets are Mercury, Venus, Earth, and Mars. They are composed mostly of rock and metal."
  },
  {
    question: "Which planet rotates on its side with an axial tilt of nearly 98 degrees?",
    options: ["Saturn", "Neptune", "Uranus", "Mars"],
    answer: 2,
    explanation: "Uranus rotates virtually on its side, likely caused by an ancient collision with an Earth-sized protoplanet."
  },
  {
    question: "What is the primary difference between planetary 'Rotation' and 'Revolution'?",
    options: [
      "Rotation is moving around the Sun; Revolution is spinning on an axis",
      "Rotation is spinning on an internal axis; Revolution is orbital travel around the Sun",
      "Rotation creates years; Revolution creates day and night",
      "Both terms mean exactly the same physical motion"
    ],
    answer: 1,
    explanation: "Rotation is the spin of a planet around its own axis (creating days). Revolution is its orbital path around the Sun (creating years)."
  },
  {
    question: "Which planet has a density so low that it could hypothetically float in water?",
    options: ["Saturn", "Neptune", "Mercury", "Venus"],
    answer: 0,
    explanation: "Saturn has an average density of roughly 0.687 g/cm³, which is less dense than liquid water (1.0 g/cm³)."
  },
  {
    question: "What separates the Inner Terrestrial Planets from the Outer Gas & Ice Giants?",
    options: ["The Kuiper Belt", "The Oort Cloud", "The Main Asteroid Belt", "Van Allen Radiation Belts"],
    answer: 2,
    explanation: "The Main Asteroid Belt, located between Mars and Jupiter, divides the rocky inner planets from the outer giant planets."
  },
  {
    question: "Why is Mars commonly referred to as the 'Red Planet'?",
    options: [
      "Active volcanoes erupt red lava constantly",
      "Its atmosphere is pure red neon gas",
      "Iron oxide (rust) covers its surface rocks and soil",
      "It is extremely hot and glowing"
    ],
    answer: 2,
    explanation: "Mars appears red because of ubiquitous iron oxide minerals (rust) covering its surface and suspended in its atmosphere."
  },
  {
    question: "Which moon is the largest in the Solar System, even exceeding the planet Mercury in size?",
    options: ["Titan", "Europa", "Ganymede", "Triton"],
    answer: 2,
    explanation: "Jupiter's moon Ganymede has a diameter of 5,268 km, making it larger than Mercury (4,879 km)."
  },
  {
    question: "How long does it take for sunlight to travel across space and reach Earth?",
    options: ["Instantaneous", "About 8 minutes and 20 seconds", "1 hour", "24 hours"],
    answer: 1,
    explanation: "Traveling at the speed of light (300,000 km/s), solar photons take roughly 8 minutes and 20 seconds to reach 1 AU (Earth)."
  },
  {
    question: "Which planet is famous for the Great Red Spot, a massive storm larger than Earth?",
    options: ["Neptune", "Saturn", "Mars", "Jupiter"],
    answer: 3,
    explanation: "Jupiter's Great Red Spot is an enormous high-pressure anticyclonic storm that has raged for centuries."
  },
  {
    question: "Which planet's orbital year is the shortest, clocking in at only 88 Earth days?",
    options: ["Mercury", "Venus", "Mars", "Neptune"],
    answer: 0,
    explanation: "Being closest to the Sun's gravity well, Mercury moves fastest along the shortest orbital track, taking only 88 Earth days."
  },
  {
    question: "What are Saturn's rings primarily composed of?",
    options: [
      "Solid sheets of iron and titanium",
      "Liquid hydrogen and neon gas",
      "Billions of particles of water ice, dust, and rock",
      "Glowing radioactive plasma"
    ],
    answer: 2,
    explanation: "Saturn's rings are over 99% pure water ice particles mixed with dust, ranging from sand grains to boulder sizes."
  },
  {
    question: "What atmospheric gas is responsible for the striking blue hues of Uranus and Neptune?",
    options: ["Carbon Monoxide", "Methane", "Argon", "Sulfur Dioxide"],
    answer: 1,
    explanation: "Methane in the upper atmospheres of Uranus and Neptune absorbs red wavelengths of light and reflects back vibrant blues and cyans."
  },
  {
    question: "Which is the only planet not named after a Greek or Roman deity?",
    options: ["Uranus", "Neptune", "Earth", "Mars"],
    answer: 2,
    explanation: "The name 'Earth' derives from Germanic and Old English words ('eorþe' / 'ertha'), meaning the ground or soil."
  },
  {
    question: "What lies in the broad orbital gap between Mars and Jupiter?",
    options: ["Kuiper Belt", "Main Asteroid Belt", "Oort Cloud", "Van Allen Belts"],
    answer: 1,
    explanation: "The Main Asteroid Belt is located between Mars and Jupiter, containing millions of rocky bodies including the dwarf planet Ceres."
  },
  {
    question: "What spectral stellar classification does our Sun belong to?",
    options: ["Red Supergiant", "Blue Hypergiant", "Yellow Dwarf (G2V)", "White Dwarf"],
    answer: 2,
    explanation: "Our Sun is a G-type main-sequence star, informally referred to as a Yellow Dwarf."
  },
  {
    question: "Which galaxy is the closest large spiral neighbor to our Milky Way?",
    options: ["Triangulum Galaxy", "Andromeda Galaxy", "Sombrero Galaxy", "Whirlpool Galaxy"],
    answer: 1,
    explanation: "Andromeda (M31) is the closest major spiral galaxy to the Milky Way, located about 2.5 million light-years away."
  },
  {
    question: "What causes a comet's tail to always point away from the Sun?",
    options: [
      "Gravitational pull of distant stars",
      "Solar radiation pressure and the solar wind",
      "Planetary magnetic fields",
      "The comet's forward momentum"
    ],
    answer: 1,
    explanation: "Solar radiation and the solar wind push gas and dust away from the comet's nucleus, causing the tail to consistently point away from the Sun."
  },
  {
    question: "What is the largest artificial (human-made) satellite currently orbiting the Earth?",
    options: ["Hubble Space Telescope", "International Space Station (ISS)", "James Webb Space Telescope", "Voyager 1"],
    answer: 1,
    explanation: "The International Space Station (ISS) is the largest artificial habitable structure in space, spanning the dimensions of an entire football field."
  }
];
