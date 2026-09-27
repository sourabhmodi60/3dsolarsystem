import { CelestialBody, QuizQuestion } from '../types/solarSystem';

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'star',
    orderFromSun: 0,
    radius: 12.0,
    realDiameterKm: 1392700,
    distanceFromSunAU: 0,
    orbitalRadius: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.003,
    axialTilt: 7.25,
    color: '#FFB800',
    atmosphereColor: '#FFA500',
    hasAtmosphere: true,
    moons: [],
    temperature: '5,500 °C (10,000 °F) at surface',
    temperatureKidDesc: 'Super blazing hot! Hotter than millions of toasters!',
    dayLength: '27 Earth days (at equator)',
    yearLength: '230 million Earth years to orbit the galaxy',
    gravity: '28 times Earth gravity',
    tagline: 'The glowing heart of our Solar System',
    description: 'The Sun is a giant, glowing ball of hot gas and plasma at the very center of our solar system. It gives us all our light, warmth, and energy that allows life to thrive on Earth!',
    speechText: 'Hello explorer! I am the Sun, a huge glowing star at the center of our solar system! Over one million Earths could fit inside me! My powerful gravity holds all the planets, asteroids, and comets in orbit around me.',
    funFacts: [
      'The Sun is so massive that it accounts for 99.8% of all the mass in the entire solar system!',
      'Light from the Sun takes about 8 minutes and 20 seconds to travel all the way to Earth.',
      'Without the Sun, Earth would be a pitch-black frozen ice ball drifting in space!'
    ],
    kidQuizClues: [
      'I am at the center of the solar system',
      'I am a star, not a planet',
      'I provide light and warmth to Earth'
    ],
    category: 'star'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    orderFromSun: 1,
    radius: 1.4,
    realDiameterKm: 4879,
    distanceFromSunAU: 0.39,
    orbitalRadius: 24,
    orbitalSpeed: 0.04,
    rotationSpeed: 0.002,
    axialTilt: 0.034,
    color: '#A0A0A0',
    moons: [],
    temperature: '-180 °C to 430 °C (-290 °F to 800 °F)',
    temperatureKidDesc: 'Boiling hot during daytime, freezing cold during nighttime!',
    dayLength: '59 Earth days',
    yearLength: '88 Earth days',
    gravity: '38% of Earth gravity',
    tagline: 'The speedy, cratered rock closest to the Sun',
    description: 'Mercury is the smallest planet and the closest to the Sun. Its surface is covered with thousands of impact craters, looking very much like our Moon!',
    speechText: 'I am Mercury, the smallest planet and closest neighbor to the Sun! Because I am so close, I zip around the Sun in just 88 days, faster than any other planet! But I spin so slowly that one day on me takes almost two months!',
    funFacts: [
      'Mercury is the fastest planet in our solar system, speeding at 47 kilometers every single second!',
      'Even though it is closest to the Sun, Venus is actually hotter because Mercury has no thick atmosphere to trap heat.',
      'You could jump almost 3 times higher on Mercury than on Earth!'
    ],
    kidQuizClues: [
      'I am the closest planet to the Sun',
      'I am the smallest planet',
      'I have lots of craters and no moons'
    ],
    category: 'inner-planet'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    orderFromSun: 2,
    radius: 2.8,
    realDiameterKm: 12104,
    distanceFromSunAU: 0.72,
    orbitalRadius: 36,
    orbitalSpeed: 0.015,
    rotationSpeed: -0.001, // rotates backwards!
    axialTilt: 177.3,
    color: '#E3BB76',
    atmosphereColor: '#F5DEB3',
    hasAtmosphere: true,
    moons: [],
    temperature: '465 °C (870 °F)',
    temperatureKidDesc: 'Hot enough to melt solid lead! The hottest planet of all!',
    dayLength: '243 Earth days (spins backwards!)',
    yearLength: '225 Earth days',
    gravity: '90% of Earth gravity',
    tagline: 'Earth’s scorching twin that spins backwards',
    description: 'Venus is often called Earth’s twin sister because it is almost the exact same size. However, it is wrapped in thick, choking clouds of sulfuric acid that trap heat like a giant greenhouse!',
    speechText: 'Welcome to Venus, the hottest planet in the whole solar system! Thick yellow clouds trap the Sun\'s heat like a super-powered blanket. Fun fact: I spin backwards, so the Sun rises in the west and sets in the east!',
    funFacts: [
      'A day on Venus is actually longer than its whole year! It takes 243 Earth days to rotate once, but only 225 days to orbit the Sun.',
      'Venus is the second brightest natural object in the night sky after the Moon, often called the Morning Star or Evening Star.',
      'Scientists have found thousands of volcanoes all across the surface of Venus!'
    ],
    kidQuizClues: [
      'I am the hottest planet in the solar system',
      'I spin backwards compared to most planets',
      'I am covered in thick yellowish clouds'
    ],
    category: 'inner-planet'
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    orderFromSun: 3,
    radius: 3.0,
    realDiameterKm: 12742,
    distanceFromSunAU: 1.0,
    orbitalRadius: 50,
    orbitalSpeed: 0.01,
    rotationSpeed: 0.015,
    axialTilt: 23.44,
    color: '#2B82C9',
    atmosphereColor: '#60A5FA',
    hasAtmosphere: true,
    hasClouds: true,
    moons: [
      {
        id: 'moon',
        name: 'The Moon (Luna)',
        radius: 0.9,
        distance: 7.2,
        orbitalSpeed: 0.04,
        color: '#F1F5F9',
        description: 'Earth’s only natural satellite. It shines brightly in our night sky with silvery highlands, dark ancient lava plains, and crater rays from giant asteroid impacts!',
        speechText: 'Hello there! I am the Moon, Earth’s closest neighbor in the universe! Humans can see my bright craters and dark maria from Earth. Neil Armstrong and eleven other brave Apollo astronauts walked right here on my powdery gray regolith!',
        funFact: 'Because the Moon has no atmosphere, wind, or rain, astronaut footprints will remain preserved on the lunar surface for millions of years!'
      }
    ],
    temperature: '15 °C (59 °F) average',
    temperatureKidDesc: 'Just right! The Goldilocks planet where water stays liquid!',
    dayLength: '24 hours',
    yearLength: '365.25 days',
    gravity: '9.8 m/s² (1.0 g)',
    tagline: 'The Blue Oasis of Life',
    description: 'Earth is our home planet! It is the third rock from the Sun and the only place in the entire known universe where life has been discovered, filled with blue oceans, green continents, and white swirling clouds.',
    speechText: 'Look around! This is Earth, our wonderful home! Over 70 percent of my surface is covered by sparkling blue oceans. We have fresh air to breathe, fluffy clouds, green forests, and millions of amazing species of animals, plants, and humans!',
    funFacts: [
      'Earth is the only planet not named after a Roman or Greek god or goddess.',
      'Our atmosphere protects us from meteoroids, burning most of them up before they hit the ground as shooting stars!',
      'Earth’s tilt gives us our four wonderful seasons: Spring, Summer, Autumn, and Winter!'
    ],
    kidQuizClues: [
      'I have liquid water oceans and living creatures',
      'I am the third planet from the Sun',
      'I have one moon named Luna'
    ],
    category: 'inner-planet'
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    orderFromSun: 4,
    radius: 1.9,
    realDiameterKm: 6779,
    distanceFromSunAU: 1.52,
    orbitalRadius: 66,
    orbitalSpeed: 0.008,
    rotationSpeed: 0.014,
    axialTilt: 25.19,
    color: '#C1440E',
    atmosphereColor: '#E07A5F',
    hasAtmosphere: true,
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        radius: 0.35,
        distance: 3.2,
        orbitalSpeed: 0.08,
        color: '#8D7B68',
        description: 'The larger of Mars’s two potato-shaped moons. It orbits so close that it zips around Mars three times every day!',
        speechText: 'I am Phobos! I look like a giant space potato. I orbit Mars so fast that I rise in the west and set in the east!',
        funFact: 'Phobos is slowly spiraling closer to Mars and in 50 million years may break apart into a ring!'
      },
      {
        id: 'deimos',
        name: 'Deimos',
        radius: 0.25,
        distance: 4.8,
        orbitalSpeed: 0.03,
        color: '#A99985',
        description: 'The smaller outer moon of Mars, covered in a smooth layer of space dust.',
        speechText: 'I am Deimos, the tinier baby moon of Mars. From Mars, I look like a bright star wandering across the sky!',
        funFact: 'Deimos is only about 12 kilometers across, small enough to fit inside a medium-sized city!'
      }
    ],
    temperature: '-65 °C (-85 °F) average',
    temperatureKidDesc: 'Very chilly and desert-dry! Wear a super thermal spacesuit!',
    dayLength: '24 hours and 37 minutes (a "sol")',
    yearLength: '687 Earth days',
    gravity: '38% of Earth gravity',
    tagline: 'The Red Planet of Rovers and Volcanoes',
    description: 'Mars is covered with reddish iron-oxide dust (rust!). It is home to Olympus Mons, the largest volcano in the solar system, and Valles Marineris, a canyon that stretches as wide as the entire United States!',
    speechText: 'Greetings from Mars, the famous Red Planet! My soil is rich in iron minerals that have rusted over time, giving me a bright rusty orange glow. NASA rovers like Curiosity and Perseverance are driving on my surface right now looking for ancient water!',
    funFacts: [
      'Mars has Olympus Mons, a volcano three times taller than Mount Everest! It is so tall that its peak pokes out of Mars\'s atmosphere.',
      'Sunsets on Mars are actually blue! The fine dust scatters red light and lets blue light through.',
      'Mars has giant white polar ice caps made of water ice and frozen carbon dioxide (dry ice).'
    ],
    kidQuizClues: [
      'I am known as the Red Planet',
      'I have the biggest volcano in the solar system, Olympus Mons',
      'NASA rovers like Perseverance are exploring my surface'
    ],
    category: 'inner-planet'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    orderFromSun: 5,
    radius: 6.8,
    realDiameterKm: 139820,
    distanceFromSunAU: 5.2,
    orbitalRadius: 90,
    orbitalSpeed: 0.004,
    rotationSpeed: 0.035, // fastest rotating planet!
    axialTilt: 3.13,
    color: '#D4A373',
    atmosphereColor: '#E6CCB2',
    hasAtmosphere: true,
    moons: [
      {
        id: 'io',
        name: 'Io',
        radius: 0.5,
        distance: 8.5,
        orbitalSpeed: 0.09,
        color: '#E9C46A',
        description: 'The most volcanic world in the solar system, with over 400 active volcanoes spewing sulfur!',
        speechText: 'I am Io! I look like a cheesy pizza because I have hundreds of active volcanoes erupting hot sulfur fountains into space!',
        funFact: 'Io’s volcanoes shoot sulfur plumes over 300 miles high into the vacuum of space!'
      },
      {
        id: 'europa',
        name: 'Europa',
        radius: 0.45,
        distance: 10.5,
        orbitalSpeed: 0.065,
        color: '#E0E7FF',
        description: 'Covered in a smooth crust of water ice with a deep warm liquid ocean underneath that might harbor life!',
        speechText: 'I am Europa, an icy jewel! Under my frozen cracked surface lies an ocean with twice as much liquid water as all Earth’s oceans combined!',
        funFact: 'Scientists believe Europa is one of the best places in the solar system to search for alien aquatic life!'
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        radius: 0.65,
        distance: 12.8,
        orbitalSpeed: 0.045,
        color: '#9CA3AF',
        description: 'The largest moon in the entire solar system—even bigger than the planet Mercury!',
        speechText: 'I am Ganymede, the king of all moons! I am so huge that I am bigger than planet Mercury and dwarf planet Pluto, and I have my own magnetic field!',
        funFact: 'Ganymede is the only moon in the solar system known to produce its own magnetic field.'
      },
      {
        id: 'callisto',
        name: 'Callisto',
        radius: 0.6,
        distance: 15.2,
        orbitalSpeed: 0.03,
        color: '#6B7280',
        description: 'An ancient, heavily cratered ball of rock and ice that has barely changed in 4 billion years.',
        speechText: 'I am Callisto, the most heavily cratered object in the solar system. Every bump on my face is a scar from a meteorite impact!',
        funFact: 'Callisto has the oldest, most crater-battered landscape in the entire solar system.'
      }
    ],
    temperature: '-110 °C (-166 °F)',
    temperatureKidDesc: 'Freezing cold upper clouds, but sizzling hot deep inside!',
    dayLength: '9 hours and 56 minutes (fastest day!)',
    yearLength: '12 Earth years',
    gravity: '2.4 times Earth gravity',
    tagline: 'The King of Planets with the Great Red Spot',
    description: 'Jupiter is the largest planet in our solar system. It is a gigantic gas giant made mostly of hydrogen and helium, featuring dynamic storm belts and the famous Great Red Spot, a storm larger than Earth that has raged for hundreds of years!',
    speechText: 'Behold Jupiter, the giant king of planets! I am so huge that more than 1,300 Earths could fit inside my swirling belly! My famous Great Red Spot is a monster storm that is bigger than the entire planet Earth and has been spinning for centuries!',
    funFacts: [
      'Jupiter has the shortest day of all planets: it spins on its axis once every 10 hours!',
      'Jupiter has 95 officially recognized moons, making it like a mini solar system of its own.',
      'Jupiter’s strong gravity acts like a giant cosmic vacuum cleaner, attracting comets and protecting Earth from collisions!'
    ],
    kidQuizClues: [
      'I am the largest planet in the solar system',
      'I have a giant storm called the Great Red Spot',
      'I have 95 moons, including volcanic Io and icy Europa'
    ],
    category: 'outer-gas-giant'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    orderFromSun: 6,
    radius: 5.8,
    realDiameterKm: 116460,
    distanceFromSunAU: 9.58,
    orbitalRadius: 116,
    orbitalSpeed: 0.0028,
    rotationSpeed: 0.03,
    axialTilt: 26.73,
    color: '#E0C097',
    atmosphereColor: '#F3E9D2',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadius: 7.5,
    ringOuterRadius: 13.5,
    ringColor: '#D8C3A5',
    moons: [
      {
        id: 'titan',
        name: 'Titan',
        radius: 0.62,
        distance: 14.5,
        orbitalSpeed: 0.04,
        color: '#F59E0B',
        description: 'The second largest moon in the solar system. It has a dense orange atmosphere, rivers, and lakes of liquid methane!',
        speechText: 'I am Titan, Saturn’s biggest moon! I am the only moon with a thick atmosphere and real flowing rivers and lakes, but made of liquid natural gas instead of water!',
        funFact: 'Titan’s atmosphere is so thick and gravity so low that if you strapped on fake wings, you could fly by flapping your arms!'
      },
      {
        id: 'enceladus',
        name: 'Enceladus',
        radius: 0.35,
        distance: 10.0,
        orbitalSpeed: 0.06,
        color: '#FFFFFF',
        description: 'A brilliant white moon with ice geysers that blast water vapor and organic molecules into Saturn’s rings!',
        speechText: 'I am Enceladus, a shiny ice moon! Giant geysers at my south pole shoot fountains of icy water high into space, creating one of Saturn’s rings!',
        funFact: 'Enceladus reflects almost 100% of the sunlight that hits it, making it the most reflective body in the solar system.'
      }
    ],
    temperature: '-140 °C (-220 °F)',
    temperatureKidDesc: 'Extremely freezing cold gas giant surrounded by sparkling icy rings!',
    dayLength: '10 hours and 33 minutes',
    yearLength: '29.4 Earth years',
    gravity: '106% of Earth gravity',
    tagline: 'The Ringed Jewel of the Solar System',
    description: 'Saturn is world-famous for its dazzling system of rings made of billions of chunks of ice and rock. Like Jupiter, it is a giant ball of hydrogen and helium with no solid ground to stand on!',
    speechText: 'Hello there, I am Saturn, the ringed beauty of the solar system! My dazzling rings stretch for thousands of miles, but they are made of billions of sparkling pieces of clean water ice, ranging from tiny dust grains to house-sized icebergs!',
    funFacts: [
      'Saturn is the only planet in our solar system whose average density is less than water—if you had a bathtub big enough, Saturn would float!',
      'Saturn’s rings are up to 282,000 kilometers wide, but only about 10 to 30 meters thick—thinner than a sheet of paper compared to its width!',
      'Saturn has over 140 known moons, more than any other planet!'
    ],
    kidQuizClues: [
      'I have the most spectacular, dazzling rings',
      'I am light enough that I would float in water',
      'My largest moon Titan has lakes of liquid methane'
    ],
    category: 'outer-gas-giant'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    orderFromSun: 7,
    radius: 4.0,
    realDiameterKm: 50724,
    distanceFromSunAU: 19.2,
    orbitalRadius: 142,
    orbitalSpeed: 0.0018,
    rotationSpeed: -0.02, // rotates backwards & on its side!
    axialTilt: 97.77,
    color: '#70D6FF',
    atmosphereColor: '#A0E8AF',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadius: 5.0,
    ringOuterRadius: 6.8,
    ringColor: '#80B0C0',
    moons: [
      {
        id: 'titania',
        name: 'Titania',
        radius: 0.4,
        distance: 8.5,
        orbitalSpeed: 0.05,
        color: '#D1D5DB',
        description: 'The largest moon of Uranus, crisscrossed by massive canyons and fault valleys.',
        speechText: 'I am Titania, Queen of Uranus’s moons! I am covered in gigantic canyons and icy cliffs.',
        funFact: 'Titania was named after the Queen of the Fairies in Shakespeare’s A Midsummer Night’s Dream!'
      },
      {
        id: 'miranda',
        name: 'Miranda',
        radius: 0.3,
        distance: 6.0,
        orbitalSpeed: 0.08,
        color: '#9CA3AF',
        description: 'A bizarre moon with patchwork cliffs up to 20 kilometers high—the tallest cliff in the solar system (Verona Rupes)!',
        speechText: 'I am Miranda! I look like a Frankenstein jigsaw puzzle of shattered ice and huge cliffs!',
        funFact: 'Miranda features Verona Rupes, a cliff so high that a jump from the top would take over 10 minutes to reach the bottom!'
      }
    ],
    temperature: '-195 °C (-320 °F)',
    temperatureKidDesc: 'The coldest planetary atmosphere in the solar system!',
    dayLength: '17 hours and 14 minutes',
    yearLength: '84 Earth years',
    gravity: '89% of Earth gravity',
    tagline: 'The Sideways Ice Giant',
    description: 'Uranus is a pale cyan-blue ice giant that rotates completely on its side! Millions of years ago, a massive planet-sized object likely smashed into Uranus and knocked it over!',
    speechText: 'Greetings from Uranus! I am a cold ice giant, and I am unique because I roll around the Sun completely tilted on my side, like a rolling bowling ball! Methane gas in my atmosphere absorbs red light and gives me my pretty aquamarine cyan color.',
    funFacts: [
      'Because Uranus rolls on its side, each pole gets 42 years of continuous sunlight followed by 42 years of dark winter!',
      'Uranus was the first planet discovered using a modern telescope, by William Herschel in 1781.',
      'Uranus has 13 faint dark rings that circle around it vertically!'
    ],
    kidQuizClues: [
      'I roll around the Sun on my side like a barrel',
      'I am a pale cyan blue ice giant',
      'My seasons last 42 years each'
    ],
    category: 'ice-giant'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    orderFromSun: 8,
    radius: 3.9,
    realDiameterKm: 49244,
    distanceFromSunAU: 30.05,
    orbitalRadius: 168,
    orbitalSpeed: 0.0014,
    rotationSpeed: 0.022,
    axialTilt: 28.32,
    color: '#274BDB',
    atmosphereColor: '#4361EE',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadius: 4.8,
    ringOuterRadius: 6.2,
    ringColor: '#4A6FA5',
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        radius: 0.55,
        distance: 8.0,
        orbitalSpeed: -0.05, // orbits backwards (retrograde)
        color: '#E0E7FF',
        description: 'Neptune’s largest moon, which orbits backwards! It has nitrogen geysers that erupt black soot into the sky.',
        speechText: 'I am Triton! I was captured by Neptune\'s gravity from the outer Kuiper belt. I am one of the coldest places in the universe, with liquid nitrogen geysers!',
        funFact: 'Triton is the only large moon in the solar system that orbits in the opposite direction of its planet’s rotation!'
      }
    ],
    temperature: '-200 °C (-330 °F)',
    temperatureKidDesc: 'Deep frozen ice world with the fastest supersonic hurricane winds in the solar system!',
    dayLength: '16 hours and 6 minutes',
    yearLength: '165 Earth years',
    gravity: '110% of Earth gravity',
    tagline: 'The Windy Deep Blue Giant',
    description: 'Neptune is the most distant major planet from the Sun. It is a brilliant azure blue ice giant with supersonic winds that whip clouds across the planet at over 2,000 kilometers per hour!',
    speechText: 'Brrr, welcome to Neptune! I am the eighth and farthest official planet from the Sun. My deep vivid blue color comes from methane in my frigid atmosphere. Hold onto your space hat: my howling winds are the fastest in the solar system, blowing up to 1,200 miles per hour!',
    funFacts: [
      'Neptune was discovered using mathematical calculations before anyone ever saw it through a telescope!',
      'It takes Neptune 165 Earth years to complete just one single orbit around the Sun.',
      'Neptune has a giant dark storm called the Great Dark Spot, similar to Jupiter’s storm!'
    ],
    kidQuizClues: [
      'I am the farthest planet from the Sun',
      'I have the fastest supersonic hurricane winds',
      'I am deep royal blue with a retrograde moon named Triton'
    ],
    category: 'ice-giant'
  },
  // Dwarf planets:
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf-planet',
    orderFromSun: 9,
    radius: 1.1,
    realDiameterKm: 2376,
    distanceFromSunAU: 39.48,
    orbitalRadius: 196,
    orbitalSpeed: 0.001,
    rotationSpeed: -0.003,
    axialTilt: 122.53,
    color: '#CDB49B',
    atmosphereColor: '#D4C3B3',
    hasAtmosphere: false,
    moons: [
      {
        id: 'charon',
        name: 'Charon',
        radius: 0.55,
        distance: 3.5,
        orbitalSpeed: 0.02,
        color: '#9CA3AF',
        description: 'Pluto’s massive companion moon. They orbit each other like a dancing double dwarf planet system!',
        speechText: 'I am Charon! I am so big compared to Pluto that we spin around a point in space between us like two cosmic ice skaters holding hands!',
        funFact: 'Pluto and Charon are tidally locked, meaning the same sides always face each other forever!'
      }
    ],
    temperature: '-230 °C (-380 °F)',
    temperatureKidDesc: 'Ultra freezing cold! Even nitrogen gas freezes solid like snow!',
    dayLength: '153 hours (6.4 Earth days)',
    yearLength: '248 Earth years',
    gravity: '6% of Earth gravity',
    tagline: 'The Beloved Heart-Shaped Ice Dwarf',
    description: 'Pluto was considered the ninth planet until 2006, when it was classified as a dwarf planet. When NASA\'s New Horizons spacecraft flew past in 2015, it revealed a breathtaking heart-shaped glacier named Tombaugh Regio and tall ice mountains!',
    speechText: 'Hello friend! I am Pluto, the famous dwarf planet with a giant heart! In 2015, the New Horizons spaceship took my picture and showed my huge heart-shaped glacier made of nitrogen ice. Even though I am small, I am beloved by millions of kids and scientists all over Earth!',
    funFacts: [
      'Pluto has a giant glacier called Tombaugh Regio that looks just like a giant white Valentine heart!',
      'Pluto is smaller than Earth’s Moon, but it has five moons of its own: Charon, Nix, Hydra, Kerberos, and Styx.',
      'Sometimes Pluto’s oval-shaped orbit brings it closer to the Sun than Neptune!'
    ],
    kidQuizClues: [
      'I have a giant heart-shaped nitrogen ice glacier',
      'I was reclassified as a dwarf planet in 2006',
      'My largest moon is Charon'
    ],
    category: 'dwarf-planet'
  },
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'dwarf-planet',
    orderFromSun: 4.5,
    radius: 0.9,
    realDiameterKm: 946,
    distanceFromSunAU: 2.77,
    orbitalRadius: 78,
    orbitalSpeed: 0.006,
    rotationSpeed: 0.015,
    axialTilt: 4.0,
    color: '#8A8680',
    moons: [],
    temperature: '-105 °C (-157 °F)',
    temperatureKidDesc: 'Cold rocky world hiding between Mars and Jupiter!',
    dayLength: '9 hours and 4 minutes',
    yearLength: '4.6 Earth years',
    gravity: '3% of Earth gravity',
    tagline: 'The Queen of the Asteroid Belt',
    description: 'Ceres is the closest dwarf planet to Earth and the only one located in the asteroid belt between Mars and Jupiter. It makes up a full third of all the mass in the asteroid belt!',
    speechText: 'Greetings! I am Ceres, the largest object in the asteroid belt between Mars and Jupiter! Scientists discovered mysterious bright glowing salt patches in my Occator Crater and believe I might have a salty underground ocean!',
    funFacts: [
      'Ceres was the first asteroid ever discovered, spotted on New Year’s Day in 1801 by Giuseppe Piazzi.',
      'Ceres contains mysterious bright white spots inside Occator Crater made of magnesium sulfate and sodium carbonate salts.',
      'Ceres is round like a ball because its gravity is strong enough to pull it into a spherical shape.'
    ],
    kidQuizClues: [
      'I am the only dwarf planet in the inner asteroid belt',
      'I have glowing bright spots in my Occator Crater',
      'I live between the orbits of Mars and Jupiter'
    ],
    category: 'dwarf-planet'
  },
  {
    id: 'haumea',
    name: 'Haumea',
    type: 'dwarf-planet',
    orderFromSun: 10,
    radius: 0.95,
    realDiameterKm: 1632, // triaxial ellipsoid!
    distanceFromSunAU: 43.1,
    orbitalRadius: 215,
    orbitalSpeed: 0.0008,
    rotationSpeed: 0.06, // spins in 4 hours!
    axialTilt: 28.2,
    color: '#C4CCD4',
    hasRings: true,
    ringInnerRadius: 1.5,
    ringOuterRadius: 2.1,
    ringColor: '#93A8B8',
    moons: [
      {
        id: 'hiiaka',
        name: 'Hi’iaka',
        radius: 0.25,
        distance: 3.0,
        orbitalSpeed: 0.03,
        color: '#E2E8F0',
        description: 'The outer moon of Haumea, thought to be a piece blasted off in a giant collision.',
        speechText: 'I am Hi’iaka, named after the Hawaiian goddess of hula dancers!',
        funFact: 'Hi’iaka has an icy surface of pure water ice.'
      }
    ],
    temperature: '-240 °C (-400 °F)',
    temperatureKidDesc: 'Spins like a dizzy football in the freezing deep freeze of space!',
    dayLength: '3.9 hours (super fast!)',
    yearLength: '284 Earth years',
    gravity: '4% of Earth gravity',
    tagline: 'The Football-Shaped Speed Spinner',
    description: 'Haumea is one of the strangest worlds in space! It rotates so fast (a full turn every 4 hours!) that centrifugal force stretched it out into the shape of an American football or rugby ball. It even has its own icy ring!',
    speechText: 'Aloha! I am Haumea, named after the Hawaiian goddess of childbearing. I spin so wildly fast—once every four hours—that my equator stretched out into an elongated football shape! I even have my own cool dark ring!',
    funFacts: [
      'Haumea is shaped like a giant egg or rugby ball rather than a sphere because of its extreme rotation speed.',
      'In 2017, astronomers discovered that Haumea has a ring circling around it, the first Kuiper belt object found with a ring.',
      'A day on Haumea is under 4 hours, making it one of the fastest rotating large objects in the solar system!'
    ],
    kidQuizClues: [
      'I am stretched out in the shape of a football or egg',
      'I spin around in less than 4 hours',
      'I am named after a Hawaiian goddess'
    ],
    category: 'dwarf-planet'
  },
  {
    id: 'makemake',
    name: 'Makemake',
    type: 'dwarf-planet',
    orderFromSun: 11,
    radius: 0.9,
    realDiameterKm: 1430,
    distanceFromSunAU: 45.8,
    orbitalRadius: 232,
    orbitalSpeed: 0.0007,
    rotationSpeed: 0.008,
    axialTilt: 29.0,
    color: '#D48C6A',
    moons: [
      {
        id: 'mk2',
        name: 'MK2',
        radius: 0.18,
        distance: 2.5,
        orbitalSpeed: 0.02,
        color: '#475569',
        description: 'A tiny, dark moon orbiting Makemake discovered by the Hubble Space Telescope in 2016.',
        speechText: 'I am MK2, Makemake’s little dark moon! I am as dark as charcoal.',
        funFact: 'MK2 is about 1,300 times fainter than Makemake itself!'
      }
    ],
    temperature: '-240 °C (-400 °F)',
    temperatureKidDesc: 'Frozen methane reddish world far beyond Neptune!',
    dayLength: '22.5 hours',
    yearLength: '305 Earth years',
    gravity: '5% of Earth gravity',
    tagline: 'The Reddish Ice World of Easter Island',
    description: 'Makemake is a reddish-orange dwarf planet discovered near Easter in 2005. It is covered in frozen methane and ethane snow and is the second brightest object in the Kuiper belt after Pluto.',
    speechText: 'Hello from Makemake! I was named after the creator god of the Rapa Nui people of Easter Island. My surface is covered in frozen reddish methane frost, and I am the second brightest object in the faraway Kuiper belt!',
    funFacts: [
      'Makemake was nicknamed "Easterbunny" by its discoverers because it was discovered shortly after Easter Sunday in 2005!',
      'Makemake has no thick atmosphere like Pluto, but may form a temporary atmosphere when it gets closer to the Sun.',
      'It takes over 300 years for Makemake to circle the Sun just one time!'
    ],
    kidQuizClues: [
      'I was named after the creator god of Easter Island',
      'My temporary nickname was Easterbunny',
      'I am covered in reddish-brown methane frost'
    ],
    category: 'dwarf-planet'
  },
  {
    id: 'eris',
    name: 'Eris',
    type: 'dwarf-planet',
    orderFromSun: 12,
    radius: 1.05,
    realDiameterKm: 2326,
    distanceFromSunAU: 67.7,
    orbitalRadius: 252,
    orbitalSpeed: 0.0005,
    rotationSpeed: 0.007,
    axialTilt: 44.0,
    color: '#ECEBF4',
    moons: [
      {
        id: 'dysnomia',
        name: 'Dysnomia',
        radius: 0.28,
        distance: 3.2,
        orbitalSpeed: 0.015,
        color: '#CBD5E1',
        description: 'The moon of Eris, named after the daughter of Eris in Greek mythology.',
        speechText: 'I am Dysnomia, the faithful companion moon of icy Eris!',
        funFact: 'Dysnomia takes about 16 days to complete a single orbit around Eris.'
      }
    ],
    temperature: '-243 °C (-405 °F)',
    temperatureKidDesc: 'Nearly as cold as absolute zero! Shivering on the edge of the solar system!',
    dayLength: '25.9 hours',
    yearLength: '557 Earth years',
    gravity: '8% of Earth gravity',
    tagline: 'The Heavyweight Ice Queen at the Frontier',
    description: 'Eris is one of the most massive known dwarf planets. Its discovery in 2005 led scientists to create the definition of "dwarf planet". It is covered in brilliant white frozen nitrogen frost!',
    speechText: 'I am Eris, the most distant dwarf planet! I am so massive that my discovery prompted astronomers around the world to hold a big debate in 2006 and officially create the category of dwarf planets. I am covered in dazzling white ice snow!',
    funFacts: [
      'Eris is almost the same size as Pluto, but it is 27% more massive and denser!',
      'Because Eris is so far away, it takes 557 Earth years to complete just one orbit around the Sun.',
      'Eris is currently about three times farther from the Sun than Pluto!'
    ],
    kidQuizClues: [
      'I am the most distant dwarf planet in our explorer',
      'My discovery led to the new definition of dwarf planets in 2006',
      'I take 557 years to orbit the Sun'
    ],
    category: 'dwarf-planet'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    targetBodyId: 'earth',
    question: 'Which planet is our home and has liquid water oceans and air we can breathe?',
    speechPrompt: 'Question 1: Which planet is our home, with liquid water oceans and air we can breathe?',
    options: [
      { id: 'mars', name: 'Mars' },
      { id: 'earth', name: 'Earth' },
      { id: 'venus', name: 'Venus' },
      { id: 'jupiter', name: 'Jupiter' }
    ],
    correctAnswerId: 'earth',
    explanation: 'Awesome job! Earth is our home planet, the only known place in the universe with living creatures and liquid water oceans!'
  },
  {
    id: 'q2',
    targetBodyId: 'saturn',
    question: 'Which giant planet is famous for having the most magnificent, sparkling icy rings?',
    speechPrompt: 'Question 2: Which giant planet is famous for having the most magnificent, sparkling icy rings?',
    options: [
      { id: 'saturn', name: 'Saturn' },
      { id: 'mercury', name: 'Mercury' },
      { id: 'neptune', name: 'Neptune' },
      { id: 'uranus', name: 'Uranus' }
    ],
    correctAnswerId: 'saturn',
    explanation: 'Correct! Saturn’s glorious rings are made of billions of pieces of clean water ice and rock!'
  },
  {
    id: 'q3',
    targetBodyId: 'mars',
    question: 'Which world is called the "Red Planet" and has the giant volcano Olympus Mons?',
    speechPrompt: 'Question 3: Which world is called the Red Planet and has the giant volcano Olympus Mons?',
    options: [
      { id: 'venus', name: 'Venus' },
      { id: 'jupiter', name: 'Jupiter' },
      { id: 'mars', name: 'Mars' },
      { id: 'pluto', name: 'Pluto' }
    ],
    correctAnswerId: 'mars',
    explanation: 'Bingo! Mars is red because of rusted iron dust, and Olympus Mons is three times taller than Mount Everest!'
  },
  {
    id: 'q4',
    targetBodyId: 'jupiter',
    question: 'What is the largest planet in our solar system, with a monster storm called the Great Red Spot?',
    speechPrompt: 'Question 4: What is the largest planet in our solar system, with a monster storm called the Great Red Spot?',
    options: [
      { id: 'sun', name: 'The Sun' },
      { id: 'jupiter', name: 'Jupiter' },
      { id: 'saturn', name: 'Saturn' },
      { id: 'earth', name: 'Earth' }
    ],
    correctAnswerId: 'jupiter',
    explanation: 'Super star! Jupiter is the biggest planet of all—over 1,300 Earths could fit inside it!'
  },
  {
    id: 'q5',
    targetBodyId: 'pluto',
    question: 'Which dwarf planet has a giant white glacier shaped like a Valentine heart?',
    speechPrompt: 'Question 5: Which dwarf planet has a giant white glacier shaped like a Valentine heart?',
    options: [
      { id: 'ceres', name: 'Ceres' },
      { id: 'pluto', name: 'Pluto' },
      { id: 'haumea', name: 'Haumea' },
      { id: 'mercury', name: 'Mercury' }
    ],
    correctAnswerId: 'pluto',
    explanation: 'You got it! Pluto has a giant nitrogen-ice glacier named Tombaugh Regio that looks just like a giant heart!'
  },
  {
    id: 'q6',
    targetBodyId: 'venus',
    question: 'Which planet is the hottest in the whole solar system and spins backwards?',
    speechPrompt: 'Question 6: Which planet is the hottest in the whole solar system and spins backwards?',
    options: [
      { id: 'mercury', name: 'Mercury' },
      { id: 'venus', name: 'Venus' },
      { id: 'mars', name: 'Mars' },
      { id: 'sun', name: 'The Sun' }
    ],
    correctAnswerId: 'venus',
    explanation: 'Spot on! Venus has thick greenhouse clouds of sulfuric acid that trap heat up to 465 degrees Celsius!'
  },
  {
    id: 'q7',
    targetBodyId: 'uranus',
    question: 'Which cyan blue ice giant rolls around the Sun tilted sideways like a bowling ball?',
    speechPrompt: 'Question 7: Which cyan blue ice giant rolls around the Sun tilted sideways like a bowling ball?',
    options: [
      { id: 'neptune', name: 'Neptune' },
      { id: 'saturn', name: 'Saturn' },
      { id: 'uranus', name: 'Uranus' },
      { id: 'earth', name: 'Earth' }
    ],
    correctAnswerId: 'uranus',
    explanation: 'Fantastic! Uranus has a tilt of 98 degrees, so it rolls along on its side!'
  },
  {
    id: 'q8',
    targetBodyId: 'haumea',
    question: 'Which dwarf planet spins so fast (in under 4 hours) that it got stretched into a rugby football shape?',
    speechPrompt: 'Question 8: Which dwarf planet spins so fast that it got stretched into a rugby football shape?',
    options: [
      { id: 'haumea', name: 'Haumea' },
      { id: 'ceres', name: 'Ceres' },
      { id: 'makemake', name: 'Makemake' },
      { id: 'eris', name: 'Eris' }
    ],
    correctAnswerId: 'haumea',
    explanation: 'Brilliant! Haumea spins at dizzying speeds, stretching it into an egg-like ellipsoid!'
  }
];
