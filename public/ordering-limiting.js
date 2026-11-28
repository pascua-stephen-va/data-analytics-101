/**
 * Seatwork 03: Ordering and Limiting
 * Interactive SQL Laboratory Engine
 * 
 * Features:
 * - 10 sequential interactive exercises covering ORDER BY, ASC, DESC, LIMIT, and multi-clause filtering
 * - Real datasets: moons (solar system moons), animals (mammal sleep dataset), countries (global demographics)
 * - Interactive SQL query runner with syntax evaluation and result visualization (Table & World Map)
 * - Strict progression locking: exercises unlock sequentially upon successful verification
 * - 100% verified completion screen with bonus practice problems
 * - Official Laboratory Verification & Assessment Report download as high-res PNG Image and standard A4 PDF
 * - Strictly zero references to any restricted third-party academies/vendors
 */

(function() {
  'use strict';

  // ==========================================
  // 1. DATASETS
  // ==========================================

  const ORDERING_DB = {
    moons: [
      { moon: 'Euporie', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Orthosie', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Sponde', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Kale', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Pasithee', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Mneme', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Thelxinoe', planet: 'Jupiter', radius: 1, density: 2.6 },
      { moon: 'Helike', planet: 'Jupiter', radius: 2, density: 2.6 },
      { moon: 'Hermippe', planet: 'Jupiter', radius: 2, density: 2.6 },
      { moon: 'Ananke', planet: 'Jupiter', radius: 14, density: 2.6 },
      { moon: 'Carme', planet: 'Jupiter', radius: 23, density: 2.6 },
      { moon: 'Pasiphae', planet: 'Jupiter', radius: 30, density: 2.6 },
      { moon: 'Sinope', planet: 'Jupiter', radius: 19, density: 2.6 },
      { moon: 'Lysithea', planet: 'Jupiter', radius: 18, density: 2.6 },
      { moon: 'Elara', planet: 'Jupiter', radius: 43, density: 2.6 },
      { moon: 'Leda', planet: 'Jupiter', radius: 10, density: 2.6 },
      { moon: 'Adrastea', planet: 'Jupiter', radius: 8, density: 3.0 },
      { moon: 'Metis', planet: 'Jupiter', radius: 22, density: 3.0 },
      { moon: 'Thebe', planet: 'Jupiter', radius: 49, density: 1.5 },
      { moon: 'Amalthea', planet: 'Jupiter', radius: 84, density: 0.9 },
      { moon: 'Himalia', planet: 'Jupiter', radius: 85, density: 2.6 },
      { moon: 'Io', planet: 'Jupiter', radius: 1822, density: 3.5 },
      { moon: 'Europa', planet: 'Jupiter', radius: 1561, density: 3.0 },
      { moon: 'Ganymede', planet: 'Jupiter', radius: 2631, density: 1.9 },
      { moon: 'Callisto', planet: 'Jupiter', radius: 2410, density: 1.8 },
      { moon: 'Moon', planet: 'Earth', radius: 1738, density: 3.3 },
      { moon: 'Phobos', planet: 'Mars', radius: 11, density: 1.9 },
      { moon: 'Deimos', planet: 'Mars', radius: 6, density: 1.5 },
      { moon: 'Titan', planet: 'Saturn', radius: 2575, density: 1.9 },
      { moon: 'Rhea', planet: 'Saturn', radius: 764, density: 1.2 },
      { moon: 'Iapetus', planet: 'Saturn', radius: 736, density: 1.1 },
      { moon: 'Dione', planet: 'Saturn', radius: 562, density: 1.5 },
      { moon: 'Tethys', planet: 'Saturn', radius: 533, density: 1.0 },
      { moon: 'Enceladus', planet: 'Saturn', radius: 252, density: 1.6 },
      { moon: 'Mimas', planet: 'Saturn', radius: 198, density: 1.2 },
      { moon: 'Hyperion', planet: 'Saturn', radius: 135, density: 0.5 },
      { moon: 'Phoebe', planet: 'Saturn', radius: 107, density: 1.6 },
      { moon: 'Janus', planet: 'Saturn', radius: 89, density: 0.6 },
      { moon: 'Epimetheus', planet: 'Saturn', radius: 58, density: 0.6 },
      { moon: 'Prometheus', planet: 'Saturn', radius: 43, density: 0.5 },
      { moon: 'Pandora', planet: 'Saturn', radius: 41, density: 0.5 },
      { moon: 'Helene', planet: 'Saturn', radius: 18, density: 0.5 },
      { moon: 'Telesto', planet: 'Saturn', radius: 12, density: 0.5 },
      { moon: 'Calypso', planet: 'Saturn', radius: 11, density: 0.5 },
      { moon: 'Atlas', planet: 'Saturn', radius: 15, density: 0.5 },
      { moon: 'Pan', planet: 'Saturn', radius: 14, density: 0.5 },
      { moon: 'Titania', planet: 'Uranus', radius: 789, density: 1.7 },
      { moon: 'Oberon', planet: 'Uranus', radius: 761, density: 1.6 },
      { moon: 'Umbriel', planet: 'Uranus', radius: 585, density: 1.5 },
      { moon: 'Ariel', planet: 'Uranus', radius: 579, density: 1.6 },
      { moon: 'Miranda', planet: 'Uranus', radius: 236, density: 1.2 },
      { moon: 'Puck', planet: 'Uranus', radius: 81, density: 1.3 },
      { moon: 'Portia', planet: 'Uranus', radius: 68, density: 1.3 },
      { moon: 'Juliet', planet: 'Uranus', radius: 47, density: 1.3 },
      { moon: 'Belinda', planet: 'Uranus', radius: 45, density: 1.3 },
      { moon: 'Cressida', planet: 'Uranus', radius: 41, density: 1.3 },
      { moon: 'Rosalind', planet: 'Uranus', radius: 36, density: 1.3 },
      { moon: 'Desdemona', planet: 'Uranus', radius: 32, density: 1.3 },
      { moon: 'Bianca', planet: 'Uranus', radius: 27, density: 1.3 },
      { moon: 'Ophelia', planet: 'Uranus', radius: 21, density: 1.3 },
      { moon: 'Cordelia', planet: 'Uranus', radius: 20, density: 1.3 },
      { moon: 'Triton', planet: 'Neptune', radius: 1353, density: 2.1 },
      { moon: 'Proteus', planet: 'Neptune', radius: 210, density: 1.3 },
      { moon: 'Nereid', planet: 'Neptune', radius: 170, density: 1.5 },
      { moon: 'Larissa', planet: 'Neptune', radius: 97, density: 1.2 },
      { moon: 'Galatea', planet: 'Neptune', radius: 88, density: 1.2 },
      { moon: 'Despina', planet: 'Neptune', radius: 75, density: 1.2 },
      { moon: 'Thalassa', planet: 'Neptune', radius: 41, density: 1.2 },
      { moon: 'Naiad', planet: 'Neptune', radius: 33, density: 1.2 },
      { moon: 'Charon', planet: 'Pluto', radius: 606, density: 1.7 },
      { moon: 'Hydra', planet: 'Pluto', radius: 31, density: 0.8 },
      { moon: 'Nix', planet: 'Pluto', radius: 23, density: 2.1 }
    ],

    animals: [
      { animal: 'Giraffe', diet: 'herbivore', hours_sleep: 1.9, weight: 899.995 },
      { animal: 'Pilot whale', diet: 'carnivore', hours_sleep: 2.7, weight: 800 },
      { animal: 'Horse', diet: 'herbivore', hours_sleep: 2.9, weight: 521 },
      { animal: 'Roe deer', diet: 'herbivore', hours_sleep: 3, weight: 14.8 },
      { animal: 'African elephant', diet: 'herbivore', hours_sleep: 3.3, weight: 6654 },
      { animal: 'Caspian seal', diet: 'carnivore', hours_sleep: 3.5, weight: 86 },
      { animal: 'Sheep', diet: 'herbivore', hours_sleep: 3.8, weight: 55.5 },
      { animal: 'Asian elephant', diet: 'herbivore', hours_sleep: 3.9, weight: 2547 },
      { animal: 'Cow', diet: 'herbivore', hours_sleep: 4.0, weight: 465 },
      { animal: 'Bottle-nosed dolphin', diet: 'carnivore', hours_sleep: 5.2, weight: 173.33 },
      { animal: 'Goat', diet: 'herbivore', hours_sleep: 5.3, weight: 27.66 },
      { animal: 'Gray seal', diet: 'carnivore', hours_sleep: 6.2, weight: 85 },
      { animal: 'Human', diet: 'omnivore', hours_sleep: 8.0, weight: 62 },
      { animal: 'Pig', diet: 'omnivore', hours_sleep: 8.4, weight: 192.5 },
      { animal: 'Rabbit', diet: 'herbivore', hours_sleep: 8.4, weight: 2.5 },
      { animal: 'Chimpanzee', diet: 'omnivore', hours_sleep: 9.7, weight: 52.2 },
      { animal: 'Red fox', diet: 'carnivore', hours_sleep: 9.8, weight: 4.23 },
      { animal: 'Dog', diet: 'carnivore', hours_sleep: 10.1, weight: 14 },
      { animal: 'Jaguar', diet: 'carnivore', hours_sleep: 10.8, weight: 100 },
      { animal: 'Cheetah', diet: 'carnivore', hours_sleep: 12.1, weight: 50 },
      { animal: 'Cat', diet: 'carnivore', hours_sleep: 12.5, weight: 3.3 },
      { animal: 'Lion', diet: 'carnivore', hours_sleep: 13.5, weight: 161.5 },
      { animal: 'Sloth', diet: 'herbivore', hours_sleep: 14.4, weight: 4.2 },
      { animal: 'Koala', diet: 'herbivore', hours_sleep: 14.5, weight: 4.5 },
      { animal: 'Tiger', diet: 'carnivore', hours_sleep: 15.8, weight: 162.5 },
      { animal: 'Opossum', diet: 'omnivore', hours_sleep: 18.0, weight: 1.7 },
      { animal: 'Giant armadillo', diet: 'insectivore', hours_sleep: 18.1, weight: 60 },
      { animal: 'Little brown bat', diet: 'insectivore', hours_sleep: 19.9, weight: 0.01 }
    ],

    countries: [
      // Top 10 Largest Area & Demographic leaders
      { ccd: 'RU', country: 'Russian Federation', continent: 'Europe', population: 144478000, area: 17075400 },
      { ccd: 'AQ', country: 'Antarctica', continent: 'Antarctica', population: 1000, area: 13120000 },
      { ccd: 'CA', country: 'Canada', continent: 'North America', population: 37058000, area: 9970610 },
      { ccd: 'CN', country: 'China', continent: 'Asia', population: 1392730000, area: 9572900 },
      { ccd: 'US', country: 'United States', continent: 'North America', population: 326688000, area: 9363520 },
      { ccd: 'BR', country: 'Brazil', continent: 'South America', population: 209469000, area: 8547403 },
      { ccd: 'AU', country: 'Australia', continent: 'Oceania', population: 24983000, area: 7741220 },
      { ccd: 'IN', country: 'India', continent: 'Asia', population: 1352617000, area: 3287263 },
      { ccd: 'AR', country: 'Argentina', continent: 'South America', population: 44495000, area: 2780400 },
      { ccd: 'KZ', country: 'Kazakhstan', continent: 'Asia', population: 18272000, area: 2724900 },

      // Additional Population leaders
      { ccd: 'ID', country: 'Indonesia', continent: 'Asia', population: 267663000, area: 1904569 },
      { ccd: 'PK', country: 'Pakistan', continent: 'Asia', population: 212215000, area: 796095 },
      { ccd: 'NG', country: 'Nigeria', continent: 'Africa', population: 195875000, area: 923768 },
      { ccd: 'BD', country: 'Bangladesh', continent: 'Asia', population: 161356000, area: 143998 },
      { ccd: 'JP', country: 'Japan', continent: 'Asia', population: 126529000, area: 377829 },
      { ccd: 'MX', country: 'Mexico', continent: 'North America', population: 126191000, area: 1964375 },
      { ccd: 'PH', country: 'Philippines', continent: 'Asia', population: 106651000, area: 300000 },
      { ccd: 'VN', country: 'Vietnam', continent: 'Asia', population: 95540000, area: 331210 },
      { ccd: 'DE', country: 'Germany', continent: 'Europe', population: 82928000, area: 357022 },
      { ccd: 'TR', country: 'Turkey', continent: 'Asia', population: 82320000, area: 783562 },

      // Africa (including 5 largest area)
      { ccd: 'DZ', country: 'Algeria', continent: 'Africa', population: 42228000, area: 2381741 },
      { ccd: 'CD', country: 'Democratic Republic of Congo', continent: 'Africa', population: 84068000, area: 2345409 },
      { ccd: 'SD', country: 'Sudan', continent: 'Africa', population: 41802000, area: 1886068 },
      { ccd: 'LY', country: 'Libya', continent: 'Africa', population: 6679000, area: 1759540 },
      { ccd: 'TD', country: 'Chad', continent: 'Africa', population: 15478000, area: 1284000 },
      { ccd: 'NE', country: 'Niger', continent: 'Africa', population: 22443000, area: 1267000 },
      { ccd: 'AO', country: 'Angola', continent: 'Africa', population: 30810000, area: 1246700 },
      { ccd: 'ML', country: 'Mali', continent: 'Africa', population: 19078000, area: 1240192 },
      { ccd: 'ZA', country: 'South Africa', continent: 'Africa', population: 57780000, area: 1221037 },
      { ccd: 'ET', country: 'Ethiopia', continent: 'Africa', population: 109224000, area: 1104300 },
      { ccd: 'EG', country: 'Egypt', continent: 'Africa', population: 98424000, area: 1002450 },
      { ccd: 'TZ', country: 'Tanzania', continent: 'Africa', population: 56318000, area: 947303 },
      { ccd: 'KE', country: 'Kenya', continent: 'Africa', population: 51393000, area: 580367 },

      // South America (including smallest area with pop > 10000)
      { ccd: 'GF', country: 'French Guiana', continent: 'South America', population: 291000, area: 90000 },
      { ccd: 'SR', country: 'Suriname', continent: 'South America', population: 576000, area: 163265 },
      { ccd: 'UY', country: 'Uruguay', continent: 'South America', population: 3449000, area: 175016 },
      { ccd: 'GY', country: 'Guyana', continent: 'South America', population: 779000, area: 214969 },
      { ccd: 'EC', country: 'Ecuador', continent: 'South America', population: 17084000, area: 283561 },
      { ccd: 'PY', country: 'Paraguay', continent: 'South America', population: 6956000, area: 406752 },
      { ccd: 'CL', country: 'Chile', continent: 'South America', population: 18729000, area: 756102 },
      { ccd: 'BO', country: 'Bolivia', continent: 'South America', population: 11353000, area: 1098581 },
      { ccd: 'CO', country: 'Colombia', continent: 'South America', population: 49649000, area: 1141748 },
      { ccd: 'PE', country: 'Peru', continent: 'South America', population: 32510000, area: 1285216 },
      { ccd: 'VE', country: 'Venezuela', continent: 'South America', population: 28870000, area: 916445 },
      { ccd: 'FK', country: 'Falkland Islands', continent: 'South America', population: 3000, area: 12173 },

      // Europe & Other Nations
      { ccd: 'FR', country: 'France', continent: 'Europe', population: 66987000, area: 551695 },
      { ccd: 'GB', country: 'United Kingdom', continent: 'Europe', population: 66489000, area: 242495 },
      { ccd: 'IT', country: 'Italy', continent: 'Europe', population: 60431000, area: 301340 },
      { ccd: 'ES', country: 'Spain', continent: 'Europe', population: 46723000, area: 505992 },
      { ccd: 'UA', country: 'Ukraine', continent: 'Europe', population: 41983000, area: 603500 },
      { ccd: 'PL', country: 'Poland', continent: 'Europe', population: 37978000, area: 312685 },
      { ccd: 'NZ', country: 'New Zealand', continent: 'Oceania', population: 4885000, area: 270467 }
    ]
  };

  // ==========================================
  // 2. EXERCISE SPECIFICATIONS
  // ==========================================

  const ORDERING_EXERCISES = [
    {
      id: 1,
      title: "Ordering",
      instructions: "Let's order the <strong>moons</strong> in our solar system by their <strong>radius</strong>. To do this, type the following into the SQL Editor:<br><div class='font-mono text-sky-300 font-bold bg-slate-900/90 px-3 py-2 rounded-lg my-2.5 border border-slate-700 select-all'>SELECT * FROM moons ORDER BY radius</div>As usual, click the <strong>submit button</strong>.",
      targetTable: "moons",
      solutionQuery: "SELECT * FROM moons ORDER BY radius",
      hint: "Use ORDER BY radius on the moons table: SELECT * FROM moons ORDER BY radius",
      previewType: "table",
      previewCols: ["moon", "planet", "radius", "density"],
      previewRows: [
        { moon: "Euporie", planet: "Jupiter", radius: 1, density: 2.6 },
        { moon: "Orthosie", planet: "Jupiter", radius: 1, density: 2.6 },
        { moon: "Sponde", planet: "Jupiter", radius: 1, density: 2.6 },
        { moon: "Kale", planet: "Jupiter", radius: 1, density: 2.6 },
        { moon: "Pasithee", planet: "Jupiter", radius: 1, density: 2.6 },
        { moon: "Mneme", planet: "Jupiter", radius: 1, density: 2.6 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length === 0) return false;
        if (res.table !== 'moons') return false;
        // Verify radius is ascending and has full table
        if (res.rows.length < 30) return false;
        const r1 = Number(res.rows[0].radius);
        const rLast = Number(res.rows[res.rows.length - 1].radius);
        return r1 <= 2 && rLast >= 2000;
      }
    },
    {
      id: 2,
      title: "Descending Order",
      instructions: "By default the <code>ORDER BY</code> phrase sorts things in ascending order, which is <strong>smallest first</strong>. If we want to sort from <strong>biggest to smallest</strong>, we can add the <code>DESC</code> flag, which stands for <strong>descending</strong>:<br><div class='font-mono text-sky-300 font-bold bg-slate-900/90 px-3 py-2 rounded-lg my-2.5 border border-slate-700 select-all'>SELECT * FROM moons ORDER BY radius DESC</div>Enter this query and notice that we now get the biggest moons first.",
      targetTable: "moons",
      solutionQuery: "SELECT * FROM moons ORDER BY radius DESC",
      hint: "Add DESC after radius to sort descending (largest first): SELECT * FROM moons ORDER BY radius DESC",
      previewType: "table",
      previewCols: ["moon", "planet", "radius", "density"],
      previewRows: [
        { moon: "Ganymede", planet: "Jupiter", radius: 2631, density: 1.9 },
        { moon: "Titan", planet: "Saturn", radius: 2575, density: 1.9 },
        { moon: "Callisto", planet: "Jupiter", radius: 2410, density: 1.8 },
        { moon: "Io", planet: "Jupiter", radius: 1822, density: 3.5 },
        { moon: "Moon", planet: "Earth", radius: 1738, density: 3.3 },
        { moon: "Europa", planet: "Jupiter", radius: 1561, density: 3.0 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length === 0) return false;
        if (res.table !== 'moons') return false;
        if (res.rows.length < 30) return false;
        const r1 = Number(res.rows[0].radius);
        const r2 = Number(res.rows[1].radius);
        const rLast = Number(res.rows[res.rows.length - 1].radius);
        return r1 === 2631 && r2 === 2575 && rLast <= 2;
      }
    },
    {
      id: 3,
      title: "Top 3",
      instructions: "So far, we've been ordering and returning all rows. But sometimes we want to limit how many rows are returned. For this, we can use the <code>LIMIT</code> keyword:<br><div class='font-mono text-sky-300 font-bold bg-slate-900/90 px-3 py-2 rounded-lg my-2.5 border border-slate-700 select-all'>SELECT * FROM moons ORDER BY radius DESC LIMIT 3</div>This will show only the top 3 largest moons. Try it!",
      targetTable: "moons",
      solutionQuery: "SELECT * FROM moons ORDER BY radius DESC LIMIT 3",
      hint: "Use ORDER BY radius DESC LIMIT 3 to only return the 3 largest moons.",
      previewType: "table",
      previewCols: ["moon", "planet", "radius", "density"],
      previewRows: [
        { moon: "Ganymede", planet: "Jupiter", radius: 2631, density: 1.9 },
        { moon: "Titan", planet: "Saturn", radius: 2575, density: 1.9 },
        { moon: "Callisto", planet: "Jupiter", radius: 2410, density: 1.8 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 3) return false;
        if (res.table !== 'moons') return false;
        const names = res.rows.map(r => r.moon);
        return names.includes('Ganymede') && names.includes('Titan') && names.includes('Callisto');
      }
    },
    {
      id: 4,
      title: "Ten Largest Countries",
      instructions: "Let's use the <strong>countries</strong> table to visualize these queries.<br><br>Write a query to select the <strong>top 10 largest countries by area</strong>.",
      targetTable: "countries",
      solutionQuery: "SELECT * FROM countries ORDER BY area DESC LIMIT 10",
      hint: "Query the countries table ordered by area DESC with LIMIT 10: SELECT * FROM countries ORDER BY area DESC LIMIT 10",
      previewType: "map",
      previewCodes: ['RU', 'AQ', 'CA', 'CN', 'US', 'BR', 'AU', 'IN', 'AR', 'KZ'],
      mapLabel: "Top 10 Area Nations Highlighted",
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 10) return false;
        if (res.table !== 'countries') return false;
        const codes = res.rows.map(r => (r.ccd || '').toUpperCase());
        return codes.includes('RU') && codes.includes('CA') && codes.includes('CN') && codes.includes('US') && codes.includes('BR');
      }
    },
    {
      id: 5,
      title: "Ten Largest Populations",
      instructions: "How about the <strong>top 10 largest countries by population</strong>? Is it the same list? Run the query to find out.",
      targetTable: "countries",
      solutionQuery: "SELECT * FROM countries ORDER BY population DESC LIMIT 10",
      hint: "Sort by population descending and limit to 10: SELECT * FROM countries ORDER BY population DESC LIMIT 10",
      previewType: "map",
      previewCodes: ['CN', 'IN', 'US', 'ID', 'PK', 'BR', 'NG', 'BD', 'RU', 'JP'],
      mapLabel: "Top 10 Populated Nations Highlighted",
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 10) return false;
        if (res.table !== 'countries') return false;
        const codes = res.rows.map(r => (r.ccd || '').toUpperCase());
        return codes.includes('CN') && codes.includes('IN') && codes.includes('US') && codes.includes('ID') && codes.includes('PK');
      }
    },
    {
      id: 6,
      title: "Four Shortest Sleepers",
      instructions: "Let's use the <strong>animals</strong> table to practice ordering.<br><br>Write a query to select the <strong>4 animals who sleep the least</strong>, displayed in ascending order by hours of sleep.<br><br><span class='text-xs text-slate-400 italic'>To order from smallest first, either remove the <code>DESC</code> flag or use the <code>ASC</code> (ascending) flag.</span>",
      targetTable: "animals",
      solutionQuery: "SELECT * FROM animals ORDER BY hours_sleep ASC LIMIT 4",
      hint: "Sort the animals table by hours_sleep in ascending order (ASC) and limit to 4: SELECT * FROM animals ORDER BY hours_sleep ASC LIMIT 4",
      previewType: "table",
      previewCols: ["animal", "diet", "hours_sleep", "weight"],
      previewRows: [
        { animal: "Giraffe", diet: "herbivore", hours_sleep: 1.9, weight: 899.995 },
        { animal: "Pilot whale", diet: "carnivore", hours_sleep: 2.7, weight: 800 },
        { animal: "Horse", diet: "herbivore", hours_sleep: 2.9, weight: 521 },
        { animal: "Roe deer", diet: "herbivore", hours_sleep: 3, weight: 14.8 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 4) return false;
        if (res.table !== 'animals') return false;
        const names = res.rows.map(r => r.animal);
        return names.includes('Giraffe') && names.includes('Pilot whale') && names.includes('Horse') && names.includes('Roe deer');
      }
    },
    {
      id: 7,
      title: "Least Lazy Carnivores",
      instructions: "Now let's add in a <code>WHERE</code> clause.<br><br>Select the <strong>3 carnivores who sleep the least</strong>. In other words, <code>WHERE diet = 'carnivore'</code>.<br><br><span class='text-amber-300 font-semibold text-xs'>Note:</span> SQL requires you to put the <code>WHERE</code> clause <strong>before</strong> the <code>ORDER BY</code> clause.",
      targetTable: "animals",
      solutionQuery: "SELECT * FROM animals WHERE diet = 'carnivore' ORDER BY hours_sleep ASC LIMIT 3",
      hint: "Filter for carnivores first with WHERE diet = 'carnivore', then sort by hours_sleep ASC LIMIT 3: SELECT * FROM animals WHERE diet = 'carnivore' ORDER BY hours_sleep ASC LIMIT 3",
      previewType: "table",
      previewCols: ["animal", "diet", "hours_sleep", "weight"],
      previewRows: [
        { animal: "Pilot whale", diet: "carnivore", hours_sleep: 2.7, weight: 800 },
        { animal: "Caspian seal", diet: "carnivore", hours_sleep: 3.5, weight: 86 },
        { animal: "Bottle-nosed dolphin", diet: "carnivore", hours_sleep: 5.2, weight: 173.33 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 3) return false;
        if (res.table !== 'animals') return false;
        const hasQuotedCarnivore = (q || '').includes("'carnivore'") || (q || '').includes('"carnivore"');
        const names = res.rows.map(r => r.animal);
        const allCarnivore = res.rows.every(r => (r.diet || '') === 'carnivore');
        return hasQuotedCarnivore && allCarnivore && names.includes('Pilot whale') && names.includes('Caspian seal') && names.includes('Bottle-nosed dolphin');
      }
    },
    {
      id: 8,
      title: "Largest Moons of Saturn",
      instructions: "<span class='text-amber-300 font-semibold text-xs'>Note:</span> SQL requires you to put the <code>ORDER BY</code> clause before the <code>LIMIT</code> clause.<br><br>What are the <strong>3 largest radius moons of Saturn</strong>?",
      targetTable: "moons",
      solutionQuery: "SELECT * FROM moons WHERE planet = 'Saturn' ORDER BY radius DESC LIMIT 3",
      hint: "Filter for Saturn's moons first with WHERE planet = 'Saturn', then ORDER BY radius DESC LIMIT 3: SELECT * FROM moons WHERE planet = 'Saturn' ORDER BY radius DESC LIMIT 3",
      previewType: "table",
      previewCols: ["moon", "planet", "radius", "density"],
      previewRows: [
        { moon: "Titan", planet: "Saturn", radius: 2575, density: 1.9 },
        { moon: "Rhea", planet: "Saturn", radius: 764, density: 1.2 },
        { moon: "Iapetus", planet: "Saturn", radius: 736, density: 1.1 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 3) return false;
        if (res.table !== 'moons') return false;
        const hasQuotedSaturn = (q || '').includes("'Saturn'") || (q || '').includes('"Saturn"');
        const allSaturn = res.rows.every(r => (r.planet || '') === 'Saturn');
        const names = res.rows.map(r => r.moon);
        return hasQuotedSaturn && allSaturn && names[0] === 'Titan' && names[1] === 'Rhea' && names[2] === 'Iapetus';
      }
    },
    {
      id: 9,
      title: "Largest Countries of Africa",
      instructions: "Select the <strong>5 largest area countries of Africa</strong>.",
      targetTable: "countries",
      solutionQuery: "SELECT * FROM countries WHERE continent = 'Africa' ORDER BY area DESC LIMIT 5",
      hint: "Filter for Africa first: WHERE continent = 'Africa', then ORDER BY area DESC LIMIT 5: SELECT * FROM countries WHERE continent = 'Africa' ORDER BY area DESC LIMIT 5",
      previewType: "table",
      previewCols: ["ccd", "country", "continent", "population", "area"],
      previewRows: [
        { ccd: "DZ", country: "Algeria", continent: "Africa", population: 42228000, area: 2381741 },
        { ccd: "CD", country: "Democratic Republic of Congo", continent: "Africa", population: 84068000, area: 2345409 },
        { ccd: "SD", country: "Sudan", continent: "Africa", population: 41802000, area: 1886068 },
        { ccd: "LY", country: "Libya", continent: "Africa", population: 6679000, area: 1759540 },
        { ccd: "TD", country: "Chad", continent: "Africa", population: 15478000, area: 1284000 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 5) return false;
        if (res.table !== 'countries') return false;
        const hasQuotedAfrica = (q || '').includes("'Africa'") || (q || '').includes('"Africa"');
        const allAfrica = res.rows.every(r => (r.continent || '') === 'Africa');
        const codes = res.rows.map(r => (r.ccd || '').toUpperCase());
        return hasQuotedAfrica && allAfrica && codes[0] === 'DZ' && codes[1] === 'CD' && codes[2] === 'SD' && codes[3] === 'LY' && codes[4] === 'TD';
      }
    },
    {
      id: 10,
      title: "Challenge Problem",
      instructions: "Select the <strong>6 smallest countries of South America</strong> that have a <strong>population greater than 10 thousand</strong>.<br><br><span class='text-sky-300 font-semibold text-xs'>Hint:</span> Remember that we can use <code>AND</code> in the <code>WHERE</code> clause.",
      targetTable: "countries",
      solutionQuery: "SELECT * FROM countries WHERE continent = 'South America' AND population > 10000 ORDER BY area ASC LIMIT 6",
      hint: "Combine WHERE continent = 'South America' AND population > 10000 with ORDER BY area ASC LIMIT 6",
      previewType: "table",
      previewCols: ["ccd", "country", "continent", "population", "area"],
      previewRows: [
        { ccd: "GF", country: "French Guiana", continent: "South America", population: 291000, area: 90000 },
        { ccd: "SR", country: "Suriname", continent: "South America", population: 576000, area: 163265 },
        { ccd: "UY", country: "Uruguay", continent: "South America", population: 3449000, area: 175016 },
        { ccd: "GY", country: "Guyana", continent: "South America", population: 779000, area: 214969 },
        { ccd: "EC", country: "Ecuador", continent: "South America", population: 17084000, area: 283561 },
        { ccd: "PY", country: "Paraguay", continent: "South America", population: 6956000, area: 406752 }
      ],
      checkQuery: function(q, res) {
        if (!res || !res.rows || res.rows.length !== 6) return false;
        if (res.table !== 'countries') return false;
        const hasQuotedSA = (q || '').includes("'South America'") || (q || '').includes('"South America"');
        const allSA = res.rows.every(r => (r.continent || '') === 'South America');
        const allPop = res.rows.every(r => Number(r.population) > 10000);
        const codes = res.rows.map(r => (r.ccd || '').toUpperCase());
        return hasQuotedSA && allSA && allPop && codes.includes('GF') && codes.includes('SR') && codes.includes('UY') && codes.includes('GY') && codes.includes('EC') && codes.includes('PY');
      }
    }
  ];

  // ==========================================
  // 3. STATE MANAGEMENT & STORAGE
  // ==========================================

  const STORAGE_KEY = 'seatwork03_ordering_limiting_state';

  let orderingState = {
    activeStep: 1,
    completedSteps: new Set(),
    wrongSteps: new Set(),
    activeTab: 'intro', // 'intro', 'exercises', 'completion'
    currentQuery: '',
    lastQueryResults: null,
    lastQueriedTable: 'moons',
    activeDataTab: 'moons', // 'Results', 'countries', 'animals', 'moons'
    viewMode: 'table', // 'table' | 'picture'
    isLabStarted: false,
    submittedQueries: {},
    updatedAt: 0,
    completedAt: null
  };

  function resetOrderingStateInMemory() {
    orderingState.completedSteps = new Set();
    orderingState.wrongSteps = new Set();
    orderingState.activeStep = 1;
    orderingState.activeTab = 'intro';
    orderingState.currentQuery = '';
    orderingState.lastQueryResults = null;
    orderingState.isLabStarted = false;
    orderingState.submittedQueries = {};
    orderingState.updatedAt = 0;
    orderingState.completedAt = null;
  }

  function loadSavedState() {
    resetOrderingStateInMemory();
    try {
      const store = window.__DA101_STORAGE__;
      const raw = store ? store.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.completedSteps)) {
          orderingState.completedSteps = new Set(parsed.completedSteps);
        }
        if (Array.isArray(parsed.wrongSteps)) {
          orderingState.wrongSteps = new Set(parsed.wrongSteps);
        }
        if (typeof parsed.activeStep === 'number') {
          orderingState.activeStep = Math.min(Math.max(parsed.activeStep, 1), 10);
        }
        if (parsed.activeTab) {
          orderingState.activeTab = parsed.activeTab;
        }
        if (typeof parsed.isLabStarted === 'boolean') {
          orderingState.isLabStarted = parsed.isLabStarted;
        }
        if (parsed.submittedQueries && typeof parsed.submittedQueries === 'object') {
          orderingState.submittedQueries = parsed.submittedQueries;
        }
        if (typeof parsed.updatedAt === 'number') {
          orderingState.updatedAt = parsed.updatedAt;
        }
        if (typeof parsed.completedAt === 'number') {
          orderingState.completedAt = parsed.completedAt;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved Seatwork 03 state:", e);
    }
  }

  function persistState(isSubmit = false) {
    try {
      const store = window.__DA101_STORAGE__;
      if (!store || !store.getUid()) return;
      const now = Date.now();
      const allDone = orderingState.completedSteps.size >= ORDERING_EXERCISES.length && ORDERING_EXERCISES.length > 0;
      if (allDone) {
        if (!orderingState.completedAt) orderingState.completedAt = now;
      } else {
        orderingState.completedAt = null;
      }
      orderingState.updatedAt = now;

      const payload = {
        activeStep: orderingState.activeStep,
        completedSteps: Array.from(orderingState.completedSteps),
        wrongSteps: Array.from(orderingState.wrongSteps),
        activeTab: orderingState.activeTab,
        isLabStarted: orderingState.isLabStarted,
        submittedQueries: orderingState.submittedQueries || {},
        updatedAt: now,
        completedAt: orderingState.completedAt
      };
      store.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (isSubmit) {
        store.notifySubmit('sql_ordering');
      }
    } catch (e) {
      console.warn("Failed to persist Seatwork 03 state:", e);
    }
  }

  // ==========================================
  // 4. ROBUST SQL PARSER & ENGINE
  // ==========================================

  function normalizeSqlOutsideQuotes(rawQuery) {
    const trimmed = rawQuery.trim().replace(/;+$/, '');
    return trimmed.replace(/('(?:''|[^'])*'|"(?:""|[^"])*"|‘[^’]*’|“[^”]*”)|\s+/g, (match, quoted) => {
      if (quoted) return quoted;
      return ' ';
    });
  }

  function splitSqlOutsideQuotes(str, delimiterKeywordOrChar) {
    const parts = [];
    let current = '';
    let quoteChar = null;
    let i = 0;
    const isComma = delimiterKeywordOrChar === ',';
    const kwRegex = isComma ? null : new RegExp(`^\\s+${delimiterKeywordOrChar}\\s+`, 'i');
    while (i < str.length) {
      const ch = str[i];
      if (quoteChar) {
        current += ch;
        if ((quoteChar === "'" && ch === "'") ||
            (quoteChar === '"' && ch === '"') ||
            (quoteChar === '‘' && ch === '’') ||
            (quoteChar === '“' && ch === '”')) {
          if ((quoteChar === "'" || quoteChar === '"') && str[i + 1] === quoteChar) {
            current += str[i + 1];
            i += 2;
            continue;
          }
          quoteChar = null;
        }
        i++;
      } else if (ch === "'" || ch === '"' || ch === '‘' || ch === '“') {
        quoteChar = ch;
        current += ch;
        i++;
      } else if (isComma && ch === ',') {
        parts.push(current.trim());
        current = '';
        i++;
      } else if (!isComma) {
        const rest = str.slice(i);
        const m = rest.match(kwRegex);
        if (m) {
          parts.push(current.trim());
          current = '';
          i += m[0].length;
        } else {
          current += ch;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function unwrapSqlQuotedLiteral(raw) {
    const s = raw.trim();
    if ((s.startsWith("'") && s.endsWith("'") && s.length >= 2) ||
        (s.startsWith('"') && s.endsWith('"') && s.length >= 2)) {
      const q = s[0];
      return { isQuoted: true, value: s.slice(1, -1).replace(new RegExp(q + q, 'g'), q) };
    }
    if ((s.startsWith('‘') && s.endsWith('’') && s.length >= 2) ||
        (s.startsWith('“') && s.endsWith('”') && s.length >= 2)) {
      return { isQuoted: true, value: s.slice(1, -1) };
    }
    return { isQuoted: false, value: s };
  }

  function parseCondition(condStr) {
    const trimmed = condStr.trim();

    const likeMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+(NOT\s+)?LIKE\s+(.+)$/i);
    if (likeMatch) {
      return {
        type: 'like',
        col: likeMatch[1],
        isNot: Boolean(likeMatch[2]),
        rawVal: likeMatch[3].trim()
      };
    }

    const inMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+(NOT\s+)?IN\s*\((.+)\)$/i);
    if (inMatch) {
      return {
        type: 'in',
        col: inMatch[1],
        isNot: Boolean(inMatch[2]),
        rawList: inMatch[3].trim()
      };
    }

    const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*(>=|<=|!=|<>|==|=|<|>)\s*(.+)$/);
    if (!match) return null;
    return {
      type: 'cmp',
      col: match[1],
      op: match[2],
      rawVal: match[3].trim()
    };
  }

  function evaluateRowCondition(row, cond) {
    const colName = Object.keys(row).find(k => k.toLowerCase() === cond.col.toLowerCase());
    if (!colName) return false;

    if (cond.type === 'like') {
      const lit = unwrapSqlQuotedLiteral(cond.rawVal);
      if (!lit.isQuoted) return false;
      const val = String(row[colName] ?? '');
      const escapedPattern = lit.value
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/%/g, '.*')
        .replace(/_/g, '.');
      const matched = new RegExp(`^${escapedPattern}$`).test(val);
      return cond.isNot ? !matched : matched;
    }

    if (cond.type === 'in') {
      const items = splitSqlOutsideQuotes(cond.rawList, ',');
      const rowVal = String(row[colName] ?? '');
      const rowNum = parseFloat(row[colName]);
      const matched = items.some(item => {
        const lit = unwrapSqlQuotedLiteral(item);
        if (lit.isQuoted) return rowVal === lit.value;
        if (/^-?\d+(\.\d+)?$/.test(lit.value) && !isNaN(rowNum)) {
          return rowNum === parseFloat(lit.value);
        }
        return false;
      });
      return cond.isNot ? !matched : matched;
    }

    const lit = unwrapSqlQuotedLiteral(cond.rawVal);
    if (lit.isQuoted) {
      const rowVal = String(row[colName] ?? '');
      if (cond.op === '=' || cond.op === '==') return rowVal === lit.value;
      if (cond.op === '!=' || cond.op === '<>') return rowVal !== lit.value;
      if (cond.op === '<') return rowVal < lit.value;
      if (cond.op === '<=') return rowVal <= lit.value;
      if (cond.op === '>') return rowVal > lit.value;
      if (cond.op === '>=') return rowVal >= lit.value;
      return false;
    }

    const otherCol = Object.keys(row).find(k => k.toLowerCase() === lit.value.toLowerCase());
    if (otherCol) {
      const numRow = parseFloat(row[colName]);
      const numOther = parseFloat(row[otherCol]);
      if (!isNaN(numRow) && !isNaN(numOther)) {
        switch (cond.op) {
          case '=':
          case '==': return numRow === numOther;
          case '!=':
          case '<>': return numRow !== numOther;
          case '<': return numRow < numOther;
          case '<=': return numRow <= numOther;
          case '>': return numRow > numOther;
          case '>=': return numRow >= numOther;
          default: return false;
        }
      }
      const strRow = String(row[colName] ?? '');
      const strOther = String(row[otherCol] ?? '');
      if (cond.op === '=' || cond.op === '==') return strRow === strOther;
      if (cond.op === '!=' || cond.op === '<>') return strRow !== strOther;
      if (cond.op === '<') return strRow < strOther;
      if (cond.op === '<=') return strRow <= strOther;
      if (cond.op === '>') return strRow > strOther;
      if (cond.op === '>=') return strRow >= strOther;
      return false;
    }

    if (!/^-?\d+(\.\d+)?$/.test(lit.value)) return false;
    const numComp = parseFloat(lit.value);
    const numRow = parseFloat(row[colName]);
    if (isNaN(numComp) || isNaN(numRow)) return false;

    switch (cond.op) {
      case '=':
      case '==': return numRow === numComp;
      case '!=':
      case '<>': return numRow !== numComp;
      case '<': return numRow < numComp;
      case '<=': return numRow <= numComp;
      case '>': return numRow > numComp;
      case '>=': return numRow >= numComp;
      default: return false;
    }
  }

  function executeOrderingSQL(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) {
      return { success: false, error: "Please enter a SQL query." };
    }

    const cleaned = normalizeSqlOutsideQuotes(rawQuery);

    // Match SELECT ... FROM table [WHERE ...] [ORDER BY ...] [LIMIT ...]
    // Using non-greedy and bounded clauses
    const regex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;
    const match = cleaned.match(regex);

    if (!match) {
      return {
        success: false,
        error: "Syntax error: Expected format: SELECT * FROM <table> [WHERE ...] [ORDER BY <column> [ASC|DESC]] [LIMIT <n>]"
      };
    }

    const colsPart = match[1].trim();
    const tablePart = match[2].trim().toLowerCase();
    const wherePart = match[3] ? match[3].trim() : null;
    const orderByPart = match[4] ? match[4].trim() : null;
    const limitPart = match[5] ? parseInt(match[5], 10) : null;

    if (!ORDERING_DB[tablePart]) {
      return {
        success: false,
        error: `Table '${tablePart}' not found. Available tables: moons, animals, countries`
      };
    }

    let rows = [...ORDERING_DB[tablePart]];

    // 1. Filter with WHERE (quote-aware OR / AND with standard precedence)
    if (wherePart) {
      const orBranches = splitSqlOutsideQuotes(wherePart, 'OR');
      const parsedBranches = orBranches.map(branch =>
        splitSqlOutsideQuotes(branch, 'AND').map(parseCondition)
      );
      if (parsedBranches.some(branch => branch.length === 0 || branch.some(c => !c))) {
        return { success: false, error: "Malformed WHERE clause condition" };
      }
      rows = rows.filter(r =>
        parsedBranches.some(branch => branch.every(c => evaluateRowCondition(r, c)))
      );
    }

    // 2. Sort with ORDER BY
    if (orderByPart) {
      const orderDirectives = orderByPart.split(',').map(s => s.trim()).filter(Boolean);
      rows.sort((a, b) => {
        for (const dirStr of orderDirectives) {
          const parts = dirStr.split(/\s+/);
          const colNameRaw = parts[0];
          const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

          const actualColA = Object.keys(a).find(k => k.toLowerCase() === colNameRaw.toLowerCase());
          const actualColB = Object.keys(b).find(k => k.toLowerCase() === colNameRaw.toLowerCase());

          if (!actualColA || !actualColB) continue;

          let valA = a[actualColA];
          let valB = b[actualColB];

          const numA = parseFloat(valA);
          const numB = parseFloat(valB);

          let cmp = 0;
          if (!isNaN(numA) && !isNaN(numB)) {
            cmp = numA - numB;
          } else {
            cmp = String(valA || '').localeCompare(String(valB || ''));
          }

          if (cmp !== 0) {
            return isDesc ? -cmp : cmp;
          }
        }
        return 0;
      });
    }

    // 3. Slice with LIMIT
    if (limitPart !== null && !isNaN(limitPart) && limitPart >= 0) {
      rows = rows.slice(0, limitPart);
    }

    // 4. Column projection
    let cols;
    if (colsPart !== '*') {
      const requestedCols = colsPart.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      const sampleRow = ORDERING_DB[tablePart][0] || {};
      const resolvedCols = requestedCols
        .map(col => Object.keys(sampleRow).find(k => k.toLowerCase() === col))
        .filter(Boolean);
      if (resolvedCols.length > 0) {
        rows = rows.map(row => {
          const projected = {};
          resolvedCols.forEach(k => { projected[k] = row[k]; });
          return projected;
        });
        cols = resolvedCols;
      } else {
        cols = (rows.length > 0) ? Object.keys(rows[0]) : Object.keys(sampleRow);
      }
    } else {
      cols = (rows.length > 0) ? Object.keys(rows[0]) : (ORDERING_DB[tablePart][0] ? Object.keys(ORDERING_DB[tablePart][0]) : []);
    }

    return {
      success: true,
      table: tablePart,
      rows: rows,
      columns: cols,
      rowCount: rows.length
    };
  }

  // ==========================================
  // 5. SVG WORLD MAP RENDERING (For Geo Visualizer)
  // ==========================================

  function renderOrderingWorldMap(selectedRows) {
    if (typeof window.renderWorldMapSVG === 'function') {
      const svg = window.renderWorldMapSVG(selectedRows);
      if (svg) {
        svg.setAttribute("class", "w-full h-full select-none");
        svg.style.borderRadius = "12px";
        return svg;
      }
    }

    const selectedCodes = new Set((selectedRows || []).map(r => (r.ccd || '').toUpperCase()));
    const continents = window.CONTINENT_PATHS || [
      { name: "North America", d: "M 120 70 L 290 70 L 310 130 L 260 180 L 220 220 L 190 190 L 140 180 L 110 120 Z" },
      { name: "South America", d: "M 285 240 L 370 260 L 400 340 L 360 450 L 320 450 L 280 320 Z" },
      { name: "Europe", d: "M 480 80 L 600 75 L 590 145 L 530 160 L 470 140 Z" },
      { name: "Africa", d: "M 470 170 L 590 170 L 630 260 L 570 410 L 510 410 L 460 270 Z" },
      { name: "Asia", d: "M 600 65 L 890 65 L 880 180 L 820 280 L 730 290 L 680 230 L 600 160 Z" },
      { name: "Australia", d: "M 790 320 L 910 320 L 900 420 L 800 420 Z" },
      { name: "Antarctica", d: "M 100 460 L 900 460 L 890 495 L 110 495 Z" }
    ];

    const mapDataList = (window.COUNTRY_MAP_DATA && window.COUNTRY_MAP_DATA.length > 0) ? window.COUNTRY_MAP_DATA : [
      { ccd: 'RU', x: 700, y: 105, r: 13, name: "Russia" },
      { ccd: 'CA', x: 230, y: 100, r: 12, name: "Canada" },
      { ccd: 'CN', x: 740, y: 195, r: 11, name: "China" },
      { ccd: 'US', x: 230, y: 175, r: 11, name: "United States" },
      { ccd: 'BR', x: 375, y: 350, r: 11, name: "Brazil" },
      { ccd: 'AU', x: 865, y: 395, r: 10, name: "Australia" },
      { ccd: 'IN', x: 710, y: 240, r: 9, name: "India" },
      { ccd: 'AR', x: 345, y: 430, r: 8, name: "Argentina" },
      { ccd: 'KZ', x: 680, y: 145, r: 8, name: "Kazakhstan" },
      { ccd: 'DZ', x: 505, y: 220, r: 8, name: "Algeria" },
      { ccd: 'CD', x: 560, y: 315, r: 7, name: "DR Congo" },
      { ccd: 'SD', x: 590, y: 250, r: 6, name: "Sudan" },
      { ccd: 'LY', x: 545, y: 215, r: 7, name: "Libya" },
      { ccd: 'TD', x: 545, y: 250, r: 6, name: "Chad" },
      { ccd: 'ID', x: 800, y: 315, r: 8, name: "Indonesia" },
      { ccd: 'PK', x: 670, y: 220, r: 6, name: "Pakistan" },
      { ccd: 'NG', x: 520, y: 275, r: 7, name: "Nigeria" },
      { ccd: 'BD', x: 742, y: 235, r: 5, name: "Bangladesh" },
      { ccd: 'JP', x: 855, y: 195, r: 6, name: "Japan" },
      { ccd: 'AQ', x: 500, y: 480, r: 9, name: "Antarctica" }
    ];

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1000 500");
    svg.setAttribute("class", "w-full h-full select-none");
    svg.style.backgroundColor = "#080e1b";
    svg.style.borderRadius = "12px";

    // Defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <radialGradient id="orderingOceanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#111c33" />
        <stop offset="100%" stop-color="#070c18" />
      </radialGradient>
      <filter id="orderingGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    svg.appendChild(defs);

    // Ocean bg
    const ocean = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    ocean.setAttribute("width", "1000");
    ocean.setAttribute("height", "500");
    ocean.setAttribute("fill", "url(#orderingOceanGlow)");
    svg.appendChild(ocean);

    // Graticules
    const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gridGroup.setAttribute("stroke", "rgba(56, 189, 248, 0.08)");
    gridGroup.setAttribute("stroke-width", "0.8");
    gridGroup.setAttribute("stroke-dasharray", "4,4");
    [100, 200, 300, 400].forEach(y => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", y);
      line.setAttribute("x2", "1000");
      line.setAttribute("y2", y);
      gridGroup.appendChild(line);
    });
    [200, 400, 600, 800].forEach(x => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", "0");
      line.setAttribute("x2", x);
      line.setAttribute("y2", "500");
      gridGroup.appendChild(line);
    });
    svg.appendChild(gridGroup);

    // Continents
    const continentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    continents.forEach(cont => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", cont.d);
      p.setAttribute("fill", "#1e293b");
      p.setAttribute("fill-opacity", "0.75");
      p.setAttribute("stroke", "#334155");
      p.setAttribute("stroke-width", "1.2");
      continentGroup.appendChild(p);
    });
    svg.appendChild(continentGroup);

    // Countries
    const nationsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    mapDataList.forEach(cData => {
      const isSelected = selectedCodes.has((cData.ccd || '').toUpperCase());
      const cGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

      if (isSelected) {
        const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulse.setAttribute("cx", cData.x);
        pulse.setAttribute("cy", cData.y);
        pulse.setAttribute("r", (cData.r || 4.5) + 6);
        pulse.setAttribute("fill", "rgba(34, 197, 94, 0.35)");
        cGroup.appendChild(pulse);
      }

      const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      marker.setAttribute("cx", cData.x);
      marker.setAttribute("cy", cData.y);
      marker.setAttribute("r", isSelected ? (cData.r || 4.5) : Math.max((cData.r || 4.5) - 1.5, 2.5));
      marker.setAttribute("fill", isSelected ? "#22c55e" : "#475569");
      marker.setAttribute("stroke", isSelected ? "#ffffff" : "#1e293b");
      marker.setAttribute("stroke-width", isSelected ? "2" : "0.8");
      cGroup.appendChild(marker);

      nationsGroup.appendChild(cGroup);
    });
    svg.appendChild(nationsGroup);

    return svg;
  }

  // ==========================================
  // 6. UI RENDERING & COMPONENT LIFECYCLE
  // ==========================================

  function getActiveExercise() {
    return ORDERING_EXERCISES.find(e => e.id === orderingState.activeStep) || ORDERING_EXERCISES[0];
  }

  function renderOrderingHeader() {
    const headerTitle = document.getElementById('orderingHeaderTitle');
    const progressBar = document.getElementById('orderingTopProgressBar');
    const progressText = document.getElementById('orderingTopProgressText');
    const badge100 = document.getElementById('orderingBtn100Top');
    const badgeCompleted = document.getElementById('orderingBtnModuleCompleted');

    const total = ORDERING_EXERCISES.length;
    const completedCount = orderingState.completedSteps.size;
    const pct = Math.round((completedCount / total) * 100);

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${completedCount} / ${total}`;

    if (completedCount === total && total > 0) {
      if (badge100) badge100.classList.remove('hidden');
      if (badgeCompleted) {
        badgeCompleted.classList.remove('hidden');
        badgeCompleted.classList.add('inline-flex');
      }
    } else {
      if (badge100) badge100.classList.add('hidden');
      if (badgeCompleted) {
        badgeCompleted.classList.add('hidden');
        badgeCompleted.classList.remove('inline-flex');
      }
    }
  }

  function renderOrderingLeftPane() {
    const container = document.getElementById('orderingLeftPaneContainer');
    if (!container) return;

    const currentEx = getActiveExercise();
    const isAllDone = orderingState.completedSteps.size === ORDERING_EXERCISES.length;

    // Tabs navigation
    let html = `
      <div class="px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141f] shrink-0">
        <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button id="tabBtnOrderingIntro" onclick="window.switchOrderingTab('intro')" class="flex-1 py-1.5 px-3 rounded-lg transition-all ${orderingState.activeTab === 'intro' ? 'bg-white dark:bg-[#1e293b] text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            Intro
          </button>
          <button id="tabBtnOrderingExercises" onclick="window.switchOrderingTab('exercises')" class="flex-1 py-1.5 px-3 rounded-lg transition-all ${orderingState.activeTab === 'exercises' ? 'bg-white dark:bg-[#1e293b] text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            Exercises (${orderingState.completedSteps.size}/10)
          </button>
          <button id="tabBtnOrderingCompletion" onclick="window.switchOrderingTab('completion')" class="py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${orderingState.activeTab === 'completion' ? 'bg-indigo-600 text-white font-black shadow-sm' : (isAllDone ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold' : 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600')}">
            <i class="ph ph-check-circle-fill text-sm"></i> Completion
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
    `;

    if (orderingState.activeTab === 'intro') {
      html += `
        <div class="space-y-4">
          <!-- Graphic Banner with serene nature/zen stones feel matching Image 1 -->
          <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-900 via-sky-800 to-slate-900 shadow-md p-6 text-white relative">
            <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-500/20 blur-2xl"></div>
            <div class="relative z-10 space-y-2">
              <span class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                SQL Masterclass &bull; Module 3
              </span>
              <h2 class="text-2xl font-black tracking-tight text-white pt-1">Ordering and Limiting</h2>
              <p class="text-xs text-sky-200/90 font-medium">ORDER BY &bull; ASC / DESC &bull; LIMIT</p>
            </div>
          </div>

          <!-- Description Card -->
          <div class="bg-white dark:bg-[#151c28] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div class="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-extrabold text-sm">
              <i class="ph ph-sparkle-fill"></i>
              <span>ORDER BY and LIMIT</span>
            </div>
            <p>
              In <strong>Part 1</strong>, we learned the basics of selecting rows from a table using the <strong>FROM</strong> and <strong>WHERE</strong> keywords.
            </p>
            <p>
              Sometimes you want to sort the results, or limit how many rows you get back. This is what we will learn how to do here in <strong>Part 2</strong>.
            </p>
            <p>
              The <code class="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold border border-indigo-200/80 dark:border-indigo-800/60">ORDER BY</code> phrase allows us to sort the results, either in ascending or descending order.
            </p>
            <p>
              The <code class="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold border border-indigo-200/80 dark:border-indigo-800/60">LIMIT</code> keyword gives us a way to limit how many rows we get back.
            </p>
            <p class="font-medium text-slate-900 dark:text-slate-100 pt-1">
              Enough talk! Let's see how this works by going through the <a onclick="window.switchOrderingTab('exercises')" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline cursor-pointer">exercises</a>.
            </p>
          </div>

          <!-- Start Lab CTA -->
          <div class="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/50 rounded-2xl p-5 border border-sky-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <div class="font-black text-slate-900 dark:text-slate-100 text-sm">Ready to begin?</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">10 hands-on SQL exercises with instant feedback</div>
            </div>
            <button onclick="window.switchOrderingTab('exercises'); window.selectOrderingExercise(1);" class="m3-btn m3-btn-filled py-2.5 px-5 text-xs font-black gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
              <i class="ph ph-play-fill text-sm"></i>
              <span>Start Lab</span>
            </button>
          </div>
        </div>
      `;
    } else if (orderingState.activeTab === 'exercises') {
      html += `<div class="space-y-3">`;

      ORDERING_EXERCISES.forEach(ex => {
        const isDone = orderingState.completedSteps.has(ex.id);
        const isWrong = orderingState.wrongSteps.has(ex.id);
        const isAnswered = isDone || isWrong;
        const isActive = ex.id === orderingState.activeStep;
        const isUnlocked = true;

        html += `
          <div id="ordering-step-card-${ex.id}" class="rounded-2xl border transition-all duration-200 overflow-hidden ${
            isActive
              ? 'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-[#151c28] shadow-md ring-1 ring-indigo-500/20 dark:ring-indigo-500/30'
              : (isDone 
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-white/90 dark:bg-[#151c28]/90 hover:border-emerald-300 dark:hover:border-emerald-800' 
                  : (isWrong 
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#111827] opacity-90 hover:border-slate-300 dark:hover:border-slate-700'))
          }">
            
            <!-- Step Header Bar -->
            <button onclick="window.selectOrderingExercise(${ex.id})" class="w-full text-left p-3.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
              isActive ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }">
              <div class="flex items-center space-x-3">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : (isWrong
                        ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-200 dark:ring-rose-900'
                        : (isActive ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700'))
                }">
                  ${isDone ? '<i class="ph ph-check font-bold"></i>' : (isWrong ? '<i class="ph ph-x font-bold"></i>' : ex.id)}
                </div>
                <div>
                  <div class="font-extrabold text-xs text-slate-900 dark:text-slate-100">${ex.id}. ${ex.title}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">table: ${ex.targetTable}</div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                ${isDone ? '<span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"><i class="ph ph-check-circle-fill"></i> Passed</span>' : ''}
                ${isWrong ? '<span class="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1"><i class="ph ph-x-circle-fill"></i> Incorrect</span>' : ''}
                <i class="ph ${isActive ? 'ph-caret-up text-indigo-600 dark:text-indigo-400 font-bold text-base' : 'ph-caret-down text-slate-400 dark:text-slate-500'} text-sm"></i>
              </div>
            </button>

            <!-- Expanded Body -->
            ${isActive ? `
              <div class="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div class="leading-relaxed">
                  ${ex.instructions}
                </div>

                <!-- Interactive Hint Toggle Button and Hint Box -->
                <div class="pt-1">
                  <div class="flex items-center justify-between">
                    <button type="button" onclick="window.toggleOrderingHint(${ex.id})" class="m3-btn m3-btn-outlined py-1.5 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs">
                      <i class="ph ph-lightbulb font-bold text-amber-500 text-sm"></i> Hint
                    </button>
                  </div>
                  <div id="ordering-hint-box-${ex.id}" class="hidden mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 space-y-1 shadow-sm">
                    <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
                      <i class="ph ph-lightbulb-filament-fill text-amber-500 text-sm"></i> Solution Hint:
                    </div>
                    <div class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      ${ex.hint || 'Review the instructions and SQL syntax for this task.'}
                    </div>
                  </div>
                </div>

                <!-- Verified Answer Placed Directly Below Instruction When Entered Correctly -->
                ${isDone ? `
                  <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 p-3 shadow-xs space-y-1.5">
                    <div class="flex items-center justify-between text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      <span class="flex items-center gap-1.5">
                        <i class="ph ph-check-circle-fill text-emerald-600 dark:text-emerald-400 text-sm"></i> Correct Answer:
                      </span>
                      <span class="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">Verified</span>
                    </div>
                    <div class="font-mono text-xs font-bold text-slate-900 dark:text-emerald-100 bg-white dark:bg-[#0c121e] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 select-all overflow-x-auto whitespace-pre-wrap">
                      ${ex.solutionQuery}
                    </div>
                  </div>
                ` : ''}

                <!-- Incorrect Answer Warning Banner -->
                ${isWrong ? `
                  <div class="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3 space-y-1">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <i class="ph ph-arrow-counter-clockwise text-amber-600 dark:text-amber-400 text-sm"></i>
                      <span>Needs Revision — Retry anytime</span>
                    </div>
                    <div class="text-[11px] text-amber-900 dark:text-amber-200/90 font-medium">
                      This question was answered incorrectly. You can adjust your query in the editor and click Retry Submit anytime!
                    </div>
                  </div>
                ` : ''}

                <!-- Preview / Visualization helper -->
                ${ex.previewType === 'table' && ex.previewRows ? `
                  <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 overflow-hidden shadow-inner">
                    <div class="px-3 py-1.5 bg-slate-200/60 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Target Table Preview</span>
                      <span class="font-mono">${ex.targetTable}</span>
                    </div>
                    <div class="overflow-x-auto max-h-36">
                      <table class="w-full text-left text-[11px] font-mono">
                        <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 font-bold">
                          <tr>
                            ${ex.previewCols.map(c => `<th class="p-1.5">${c}</th>`).join('')}
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
                          ${ex.previewRows.map(r => `
                            <tr>
                              ${ex.previewCols.map(c => `<td class="p-1.5 text-slate-700 dark:text-slate-300">${r[c]}</td>`).join('')}
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ` : ''}

                ${ex.previewType === 'map' ? `
                  <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#080e1b] overflow-hidden shadow-inner p-2 space-y-1.5">
                    <div class="flex items-center justify-between text-[10px] font-bold text-sky-400 px-1">
                      <span>${ex.mapLabel || 'World Atlas Visualizer'}</span>
                      <span class="text-emerald-400 font-mono text-[9px]">10 Selected Nations</span>
                    </div>
                    <div id="orderingMiniMapSlot-${ex.id}" class="w-full h-36 rounded-lg overflow-hidden border border-slate-800"></div>
                  </div>
                ` : ''}

                <!-- Status Feedback -->
                ${isDone ? `
                  <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <i class="ph ph-check-bold text-xs"></i>
                      <span>Correct!</span>
                    </div>
                    <button onclick="window.nextOrderingExercise()" class="m3-btn py-1.5 px-4 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">
                      <span>${ex.id === 10 ? 'View Completion' : 'Next'}</span>
                      <i class="ph ph-arrow-right font-bold"></i>
                    </button>
                  </div>
                ` : (isWrong ? `
                  <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div class="text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                      <i class="ph ph-x-bold text-xs"></i>
                      <span>Incorrect — Retry anytime</span>
                    </div>
                    <button onclick="window.nextOrderingExercise()" class="m3-btn py-1.5 px-4 text-xs font-bold gap-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg shadow-sm">
                      <span>${ex.id === 10 ? 'View Completion' : 'Next'}</span>
                      <i class="ph ph-arrow-right font-bold"></i>
                    </button>
                  </div>
                ` : `
                  <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Enter your query in the editor and click Submit.
                    </div>
                    <button onclick="window.nextOrderingExercise()" class="m3-btn py-1.5 px-4 text-xs font-bold gap-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg shadow-sm">
                      <span>${ex.id === 10 ? 'View Completion' : 'Next'}</span>
                      <i class="ph ph-arrow-right font-bold"></i>
                    </button>
                  </div>
                `)}
              </div>
            ` : ''}

          </div>
        `;
      });

      html += `</div>`;
    } else if (orderingState.activeTab === 'completion') {
      const studentInfo = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {
        name: "Student",
        batch: "Batch 01",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      html += `
        <div class="space-y-4">
          <!-- Completion Header Banner -->
          <div class="rounded-2xl border border-indigo-200 dark:border-slate-800 bg-gradient-to-b from-indigo-50 via-white to-sky-50/50 dark:from-slate-900 dark:via-[#151c28] dark:to-indigo-950/40 p-6 text-center shadow-md space-y-3">
            <div class="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md ring-4 ring-indigo-200 dark:ring-indigo-900">
              <i class="ph ph-check-fat-fill"></i>
            </div>
            <div>
              <div class="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Module 3: Ordering and Limiting Completed</div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Way to Go!</h2>
              <p class="text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">${orderingState.completedSteps.size} / ${ORDERING_EXERCISES.length} Exercises Passed (${orderingState.wrongSteps.size} Incorrect)</p>
            </div>

            <!-- Download Buttons in Completion Banner -->
            <div class="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button id="btnOrderingDownloadImg" onclick="window.downloadOrderingResultAsImage()" class="m3-btn py-2.5 px-4 text-xs font-black gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
                <i class="ph ph-image text-sm"></i>
                <span>Download as Image</span>
              </button>
              <button id="btnOrderingDownloadPdf" onclick="window.downloadOrderingResultAsPDF()" class="m3-btn py-2.5 px-4 text-xs font-black gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
                <i class="ph ph-file-pdf text-sm text-rose-400"></i>
                <span>Download as PDF</span>
              </button>
            </div>

            <!-- Retry Activity Button (Unlimited Retries) -->
            <div class="pt-2">
              <button onclick="window.retryOrderingLab()" class="w-full m3-btn py-2.5 px-4 text-xs font-black gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition">
                <i class="ph ph-arrows-clockwise text-base font-bold"></i>
                <span>Try Again (Unlimited Retries)</span>
              </button>
            </div>
          </div>

          <!-- Go Back to Home Screen Button (Requested in completion left panel) -->
          <div>
            <button onclick="window.goToHomeScreen()" class="w-full m3-btn py-3 px-4 text-xs font-black gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition">
              <i class="ph ph-house-line text-base font-bold text-indigo-600 dark:text-indigo-400"></i>
              <span>Go back to home screen</span>
            </button>
          </div>

          <!-- Student Profile & Verification (Using Home Screen info, no input fields) -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c28] p-4 shadow-sm space-y-2">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Student Profile &amp; Verification</div>
              <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">${orderingState.completedSteps.size} / ${ORDERING_EXERCISES.length} Passed</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Student Name</div>
                <div class="font-bold text-slate-800 dark:text-slate-200 pt-0.5">${escapeHtml(studentInfo.name || 'Student')}</div>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Batch / Section</div>
                <div class="font-bold text-slate-800 dark:text-slate-200 pt-0.5">${escapeHtml(studentInfo.batch || 'Batch 01')}</div>
              </div>
            </div>
          </div>

          <!-- Bonus Questions Card from Image 12 -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c28] p-5 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
              <i class="ph ph-lightbulb-fill text-amber-500 text-sm"></i>
              <span>Bonus Practice Problems</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Here are a few bonus problems if you are itching for more practice:
            </p>
            <ol class="list-decimal pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 font-medium">
              <li>Write a query to find the largest moons in our solar system that have a density less than 1.</li>
              <li>Use SQL to find the heaviest animals that sleep at least 12 hours a day.</li>
              <li>Find the two smallest area countries that have a population of at least 20 million.</li>
            </ol>
          </div>
        </div>
      `;
    }

    html += `</div>`;

    if (orderingState.activeTab === 'exercises') {
      html += `
        <!-- Unified Sticky Footer: Prev / Progress / Next -->
        <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f18]/95 backdrop-blur-sm shrink-0 flex items-center justify-between select-none">
          <button onclick="window.prevOrderingExercise()" class="m3-btn m3-btn-outlined py-1.5 px-3 text-xs font-bold gap-1 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed ${orderingState.activeStep <= 1 ? 'opacity-40 cursor-not-allowed' : ''}" ${orderingState.activeStep <= 1 ? 'disabled' : ''}>
            <i class="ph ph-arrow-left font-bold"></i> Previous
          </button>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span class="font-mono text-slate-800 dark:text-slate-200 font-bold">${orderingState.completedSteps.size}</span> of ${ORDERING_EXERCISES.length} completed
          </div>
          <button onclick="window.nextOrderingExercise()" class="m3-btn m3-btn-filled py-1.5 px-3.5 text-xs font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm">
            ${orderingState.activeStep >= ORDERING_EXERCISES.length ? 'View Completion' : 'Next'} <i class="ph ph-arrow-right font-bold"></i>
          </button>
        </div>
      `;
    }

    container.innerHTML = html;

    // Render mini map if exercise has map preview and is expanded
    if (orderingState.activeTab === 'exercises') {
      const activeEx = getActiveExercise();
      if (activeEx.previewType === 'map') {
        setTimeout(() => {
          const mapSlot = document.getElementById(`orderingMiniMapSlot-${activeEx.id}`);
          if (mapSlot) {
            mapSlot.innerHTML = '';
            const filtered = ORDERING_DB.countries.filter(c => activeEx.previewCodes.includes((c.ccd || '').toUpperCase()));
            const svg = renderOrderingWorldMap(filtered);
            mapSlot.appendChild(svg);
          }
        }, 50);
      }
    }
  }

  function renderOrderingResultsPane() {
    const tableContainer = document.getElementById('orderingTableResultContainer');
    const rowCountBadge = document.getElementById('orderingRowCountBadge');
    const pictureView = document.getElementById('orderingPictureView');
    const tableView = document.getElementById('orderingTableView');
    const viewToggle = document.getElementById('orderingViewModeToggleGroup');

    if (!tableContainer) return;

    let targetData = [];
    let cols = [];

    if (orderingState.activeDataTab === 'Results') {
      if (orderingState.lastQueryResults && orderingState.lastQueryResults.rows) {
        targetData = orderingState.lastQueryResults.rows;
        cols = orderingState.lastQueryResults.columns || [];
      } else {
        targetData = [];
        cols = [];
      }
    } else {
      targetData = ORDERING_DB[orderingState.activeDataTab] || [];
      cols = targetData[0] ? Object.keys(targetData[0]) : [];
    }

    // Update row count badge
    if (rowCountBadge) {
      rowCountBadge.textContent = `${targetData.length} row${targetData.length === 1 ? '' : 's'}`;
    }

    // Show/hide picture/table toggle: only relevant for countries
    const isCountriesTab = (orderingState.activeDataTab === 'countries') || (orderingState.activeDataTab === 'Results' && orderingState.lastQueriedTable === 'countries');
    if (viewToggle) {
      if (isCountriesTab) {
        viewToggle.classList.remove('hidden');
      } else {
        viewToggle.classList.add('hidden');
      }
    }

    // Toggle Picture View / Table View
    if (isCountriesTab && orderingState.viewMode === 'picture') {
      if (tableView) tableView.classList.add('hidden');
      if (pictureView) {
        pictureView.classList.remove('hidden');
        pictureView.innerHTML = '';
        const mapSvg = renderOrderingWorldMap(targetData);
        pictureView.appendChild(mapSvg);
      }
      return;
    }

    // Standard Table View
    if (pictureView) pictureView.classList.add('hidden');
    if (tableView) tableView.classList.remove('hidden');

    if (targetData.length === 0) {
      const ranQuery = orderingState.activeDataTab === 'Results' && orderingState.lastQueryResults && orderingState.lastQueryResults.success;
      tableContainer.innerHTML = `
        <div class="h-44 flex flex-col items-center justify-center text-slate-400 space-y-2 p-6 text-center">
          <i class="ph ph-brackets-curly text-3xl opacity-40"></i>
          <div class="font-bold text-xs text-slate-300">${ranQuery ? '0 rows matched your query' : 'No records returned'}</div>
          <div class="text-[11px] text-slate-500">${ranQuery ? 'No records satisfied your WHERE condition. Note: text inside quotes is case-sensitive.' : 'Run or submit a SQL query to view result rows.'}</div>
        </div>
      `;
      return;
    }

    let tableHtml = `
      <table class="w-full text-left text-xs font-mono border-collapse select-text">
        <thead class="bg-slate-900 text-slate-300 border-b border-slate-800 sticky top-0 z-10 font-bold">
          <tr>
            <th class="py-2 px-3 text-[10px] text-slate-500 select-none w-10 text-center">#</th>
            ${cols.map(col => `
              <th class="py-2 px-3 text-[11px] text-sky-300 uppercase tracking-wider font-semibold border-r border-slate-800/60 last:border-r-0">
                ${col}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 bg-[#0f172a] text-slate-200">
          ${targetData.map((row, idx) => `
            <tr class="hover:bg-slate-800/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-900/30' : ''}">
              <td class="py-1.5 px-3 text-[10px] text-slate-500 select-none text-center">${idx + 1}</td>
              ${cols.map(col => `
                <td class="py-1.5 px-3 text-[11px] font-mono text-slate-200 border-r border-slate-800/40 last:border-r-0">
                  ${formatCellValue(row[col])}
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = tableHtml;
  }

  function formatCellValue(val) {
    if (val === null || val === undefined) return '<span class="text-slate-500 italic">null</span>';
    if (typeof val === 'number') {
      return `<span class="text-amber-300 font-semibold">${val.toLocaleString()}</span>`;
    }
    return escapeHtml(String(val));
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 7. REPORT & EXPORT AS IMAGE / PDF
  // ==========================================

  function buildOrderingA4Report(name, batch, date, time) {
    const container = document.createElement('div');
    container.style.width = '794px';
    container.style.height = '1123px';
    container.style.boxSizing = 'border-box';
    container.style.padding = '28px 32px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#1e293b';
    container.style.fontFamily = "'Inter', 'Plus Jakarta Sans', sans-serif";
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'space-between';

    const passedCount = orderingState.completedSteps.size;
    const wrongCount = orderingState.wrongSteps.size;
    const isComplete = (passedCount + wrongCount) >= ORDERING_EXERCISES.length;

    const exerciseCardsHtml = ORDERING_EXERCISES.map((ex, idx) => {
      const isPassed = orderingState.completedSteps.has(ex.id);
      const isWrong = orderingState.wrongSteps.has(ex.id);
      const statusBadge = isPassed
        ? `<div style="font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.015em; color: #166534; background: #dcfce7; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;">✓ PASSED</div>`
        : (isWrong
          ? `<div style="font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.015em; color: #be123c; background: #ffe4e6; border: 1px solid #fecdd3; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;">✕ INCORRECT</div>`
          : `<div style="font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.015em; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;">— UNANSWERED</div>`);

      return `
      <div style="background: #ffffff; border: 1px solid ${isPassed ? '#e2e8f0' : (isWrong ? '#fecdd3' : '#e2e8f0')}; border-radius: 6px; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; min-height: 34px; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px; flex: 1; min-width: 0;">
          <span style="color: #4f46e5; font-weight: 800; flex-shrink: 0;">#${String(idx + 1).padStart(2, '0')}</span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(ex.title)}</span>
        </div>
        ${statusBadge}
      </div>
    `;}).join('');

    container.innerHTML = `
      <div>
        <!-- Top Institutional Header with Explicit Module Name -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #4f46e5; padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 600; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">
              DATA ANALYTICS 101 &bull; MODULE 3 ASSESSMENT
            </div>
            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin: 0; line-height: 1.2;">Module 3: Ordering and Limiting</h1>
            <div style="font-size: 11px; font-weight: 500; color: #64748b; margin-top: 1px; line-height: 1.6;">Official Laboratory Verification &amp; Competency Assessment Report</div>
          </div>
          <div style="background: ${isComplete ? '#f0fdf4' : '#fefce8'}; border: 1.5px solid ${isComplete ? '#86efac' : '#fde047'}; border-radius: 10px; padding: 5px 12px; text-align: right; flex-shrink: 0;">
            <div style="font-size: 9.5px; font-weight: 800; color: ${isComplete ? '#166534' : '#854d0e'}; text-transform: uppercase;">STATUS: ${isComplete ? 'COMPLETED' : 'INCOMPLETE'}</div>
            <div style="font-size: 11px; font-weight: 900; color: ${isComplete ? '#15803d' : '#a16207'};">${passedCount} / 10 Passed (${wrongCount} Incorrect)</div>
          </div>
        </div>

        <!-- Student Information Bar -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 12px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 10.5px;">
          <div><span style="color: #64748b; font-weight: 600; font-size: 9px; display: block; text-transform: uppercase;">Student Name</span> <strong style="color: #0f172a; font-size: 11px;">${escapeHtml(name || 'Student')}</strong></div>
          <div><span style="color: #64748b; font-weight: 600; font-size: 9px; display: block; text-transform: uppercase;">Cohort / Batch</span> <strong style="color: #0f172a; font-size: 11px;">${escapeHtml(batch || 'N/A')}</strong></div>
          <div><span style="color: #64748b; font-weight: 600; font-size: 9px; display: block; text-transform: uppercase;">Assessment Date</span> <strong style="color: #0f172a; font-size: 11px;">${escapeHtml(date)}</strong></div>
          <div><span style="color: #64748b; font-weight: 600; font-size: 9px; display: block; text-transform: uppercase;">Session Time</span> <strong style="color: #0f172a; font-size: 11px;">${escapeHtml(time)}</strong></div>
        </div>

        <div style="font-size: 10px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>Module 3: Exercise Breakdown (${passedCount} / 10 Passed)</span>
          <span style="color: #4f46e5; font-weight: 700;">Verified SQL Assessment</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px 10px; margin-bottom: 14px;">
          ${exerciseCardsHtml}
        </div>

        <!-- Key Competencies Summary Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; font-size: 9px; color: #475569; line-height: 14px;">
          <strong style="color: #1e293b;">Key Competencies Mastered in Module 3:</strong>
          <code>ORDER BY</code> ascending and descending flags (<code>ASC</code>/<code>DESC</code>), row result truncation using <code>LIMIT</code>, multi-clause syntax ordering (<code>WHERE</code> before <code>ORDER BY</code> before <code>LIMIT</code>), and complex predicate filtering on celestial and demographic tables.
        </div>
      </div>

      <!-- Institutional Footer -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b;">
        <div>Data Analytics 101 &bull; Module 3: Ordering and Limiting &bull; Completed on ${escapeHtml(date)} at ${escapeHtml(time)}</div>
        <div style="text-align: right;">
          <span style="font-family: monospace; font-weight: 700; color: #0f172a; margin-right: 8px;">Verify: ${escapeHtml(typeof window.getModuleVerificationCode === 'function' ? window.getModuleVerificationCode('sql_ordering') : '')}</span>
          <span style="color: #059669; font-weight: 800;">✓ Official Verified Result</span>
        </div>
      </div>
    `;

    return container;
  }

  async function downloadOrderingResultAsPDF() {
    const student = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {};
    const name = student.name || 'Student';
    const batch = student.batch || 'Batch 01';
    const date = student.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = student.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const btn = document.getElementById('btnOrderingDownloadPdf');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Generating PDF...';
    }

    try {
      const reportEl = buildOrderingA4Report(name, batch, date, time);
      reportEl.style.position = 'absolute';
      reportEl.style.left = '0';
      reportEl.style.top = '0';
      reportEl.style.zIndex = '-99999';
      reportEl.style.opacity = '1';
      reportEl.style.pointerEvents = 'none';
      document.body.appendChild(reportEl);

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      });
      document.body.removeChild(reportEl);

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const JsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);

      if (JsPDF) {
        const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        pdf.save(`${name.replace(/[^a-z0-9]/gi, '_')}_Module_3_Ordering_and_Limiting_Results.pdf`);
      }
      showOrderingNotification("PDF report downloaded successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      showOrderingNotification("Error generating PDF. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  async function downloadOrderingResultAsImage() {
    const student = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {};
    const name = student.name || 'Student';
    const batch = student.batch || 'Batch 01';
    const date = student.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = student.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const btn = document.getElementById('btnOrderingDownloadImg');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Generating Image...';
    }

    try {
      const reportEl = buildOrderingA4Report(name, batch, date, time);
      reportEl.style.position = 'absolute';
      reportEl.style.left = '0';
      reportEl.style.top = '0';
      reportEl.style.zIndex = '-99999';
      reportEl.style.opacity = '1';
      reportEl.style.pointerEvents = 'none';
      document.body.appendChild(reportEl);

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      });
      document.body.removeChild(reportEl);

      const link = document.createElement('a');
      link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_Module_3_Ordering_and_Limiting_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showOrderingNotification("PNG image downloaded successfully!");
    } catch (err) {
      console.error("Image export error:", err);
      showOrderingNotification("Error generating Image. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  // ==========================================
  // 8. CONTROLLER ACTIONS & DISPATCHERS
  // ==========================================

  function switchOrderingTab(tabName) {
    if (tabName === 'completion') {
      const isAllDone = (orderingState.completedSteps.size + orderingState.wrongSteps.size) === ORDERING_EXERCISES.length;
      if (!isAllDone) {
        showOrderingNotification("Complete all 10 exercises to unlock the completion certificate.");
        return;
      }
    }
    orderingState.activeTab = tabName;
    persistState();
    renderOrderingLeftPane();
  }

  function updateOrderingSubmitButtonState() {
    const btn = document.getElementById('btnOrderingSubmitQuery');
    if (!btn) return;
    const isDone = orderingState.completedSteps.has(orderingState.activeStep);
    const isWrong = orderingState.wrongSteps.has(orderingState.activeStep);

    btn.disabled = false;
    if (isDone) {
      btn.className = 'm3-btn m3-btn-submit-green px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-check-circle-fill text-xs text-white"></i> Verified ✓ (Re-Submit)';
    } else if (isWrong) {
      btn.className = 'm3-btn m3-btn-submit-green px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-arrow-counter-clockwise text-xs"></i> Retry Submit';
    } else {
      btn.className = 'm3-btn m3-btn-submit-green px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-arrow-right-bold text-xs"></i> Submit';
    }
  }
  window.updateOrderingSubmitButtonState = updateOrderingSubmitButtonState;

  function selectOrderingExercise(id) {
    orderingState.activeStep = id;
    orderingState.activeTab = 'exercises';
    persistState();

    // Auto switch editor table tab to the exercise's target table
    const ex = getActiveExercise();
    if (ex && ex.targetTable) {
      orderingState.activeDataTab = ex.targetTable;
      updateDataTabButtons();
    }

    const savedQuery = orderingState.submittedQueries && orderingState.submittedQueries[String(id)];
    const input = document.getElementById('orderingSqlInput');
    if (input && typeof savedQuery === 'string' && savedQuery.trim()) {
      input.value = savedQuery;
    }

    renderOrderingLeftPane();
    renderOrderingResultsPane();
    updateOrderingSubmitButtonState();
    if (typeof window.handleOrderingSQLInput === 'function') {
      window.handleOrderingSQLInput();
    }
  }

  function nextOrderingExercise() {
    if (orderingState.activeStep < ORDERING_EXERCISES.length) {
      selectOrderingExercise(orderingState.activeStep + 1);
    } else {
      switchOrderingTab('completion');
    }
  }
  window.nextOrderingExercise = nextOrderingExercise;

  function prevOrderingExercise() {
    if (orderingState.activeStep > 1) {
      selectOrderingExercise(orderingState.activeStep - 1);
    }
  }
  window.prevOrderingExercise = prevOrderingExercise;

  function formatOrderingSQL() {
    const input = document.getElementById('orderingSqlInput');
    if (!input) return;
    if (typeof window.formatSqlString === 'function') {
      input.value = window.formatSqlString(input.value);
    }
    if (typeof window.handleOrderingSQLInput === 'function') {
      window.handleOrderingSQLInput();
    }
  }
  window.formatOrderingSQL = formatOrderingSQL;

  function runOrderingSQL(silent = false) {
    const input = document.getElementById('orderingSqlInput');
    const badge = document.getElementById('orderingSqlStatusBadge');
    if (input && typeof window.applySqlAutoCapitalize === 'function') {
      const processed = window.applySqlAutoCapitalize(input.value);
      if (processed !== input.value) {
        input.value = processed;
        const highlight = document.getElementById('orderingSqlHighlight');
        if (highlight && typeof window.formatSQLSyntaxHTML === 'function') {
          highlight.innerHTML = window.formatSQLSyntaxHTML(input.value) + '\n';
        }
      }
    }
    const query = input ? input.value.trim() : '';

    if (!query) {
      if (badge) badge.className = 'hidden';
      if (!silent) showOrderingNotification("Please type a SQL query to run.");
      return null;
    }

    const res = executeOrderingSQL(query);
    if (res.success) {
      if (badge) {
        badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        badge.textContent = 'Valid SQL';
      }
      orderingState.lastQueryResults = res;
      orderingState.lastQueriedTable = res.table;
      orderingState.activeDataTab = 'Results';
      updateDataTabButtons();
      renderOrderingResultsPane();
      return res;
    } else {
      if (badge) {
        badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-2 bg-rose-500/20 text-rose-300 border border-rose-500/30';
        badge.textContent = 'Syntax Error';
      }
      if (!silent) {
        window.dispatchEvent(new CustomEvent('da101sqlerror', {
          detail: { error: res.error || 'Query is invalid.', query, moduleLabel: 'Module 3 · Ordering & Limiting' }
        }));
      }
      return null;
    }
  }

  function submitOrderingSQL() {
    const currentEx = getActiveExercise();
    if (!currentEx) return;

    const input = document.getElementById('orderingSqlInput');
    const queryStr = input ? input.value.trim() : '';
    if (queryStr) {
      orderingState.submittedQueries = orderingState.submittedQueries || {};
      orderingState.submittedQueries[String(currentEx.id)] = queryStr;
    }
    const checkSyntax = queryStr ? executeOrderingSQL(queryStr) : { success: false, error: 'Please type a SQL query before submitting.' };
    const res = runOrderingSQL(true);

    if (!res) {
      // Syntax error or empty query - mark as wrong, allow retry
      orderingState.wrongSteps.add(currentEx.id);
      orderingState.completedSteps.delete(currentEx.id);
      persistState(true);
      renderOrderingHeader();
      renderOrderingLeftPane();
      updateOrderingSubmitButtonState();
      updateOrderingHomeScreenCardProgress();
      window.dispatchEvent(new CustomEvent('da101sqlerror', {
        detail: { error: checkSyntax.error || `Exercise ${currentEx.id} query has a syntax error.`, query: queryStr, moduleLabel: 'Module 3 · Ordering & Limiting' }
      }));
      return;
    }

    const isValid = currentEx.checkQuery(queryStr, res);
    if (isValid) {
      orderingState.completedSteps.add(currentEx.id);
      orderingState.wrongSteps.delete(currentEx.id);
      persistState(true);
      renderOrderingHeader();
      renderOrderingLeftPane();
      updateOrderingSubmitButtonState();
      updateOrderingHomeScreenCardProgress();
      showOrderingNotification(`✓ Correct! Exercise ${currentEx.id} completed.`);

      const isAllDone = (orderingState.completedSteps.size + orderingState.wrongSteps.size) === ORDERING_EXERCISES.length;
      if (isAllDone) {
        setTimeout(() => {
          switchOrderingTab('completion');
        }, 800);
      } else {
        setTimeout(() => {
          nextOrderingExercise();
        }, 600);
      }
    } else {
      orderingState.wrongSteps.add(currentEx.id);
      orderingState.completedSteps.delete(currentEx.id);
      persistState(true);
      renderOrderingHeader();
      renderOrderingLeftPane();
      updateOrderingSubmitButtonState();
      updateOrderingHomeScreenCardProgress();
      showOrderingNotification(`Exercise ${currentEx.id} query didn't return expected results. Check hint and retry!`);
    }
  }

  function selectOrderingDataTab(tabName) {
    orderingState.activeDataTab = tabName;
    updateDataTabButtons();
    renderOrderingResultsPane();
  }

  function setOrderingViewMode(mode) {
    orderingState.viewMode = mode;
    const btnTable = document.getElementById('btnOrderingViewTable');
    const btnPicture = document.getElementById('btnOrderingViewPicture');
    if (btnTable && btnPicture) {
      if (mode === 'table') {
        btnTable.className = 'm3-segmented-btn active py-1 px-3 text-xs font-bold bg-indigo-600 text-white rounded-md';
        btnPicture.className = 'm3-segmented-btn py-1 px-3 text-xs font-semibold text-slate-400 hover:text-white rounded-md';
      } else {
        btnPicture.className = 'm3-segmented-btn active py-1 px-3 text-xs font-bold bg-indigo-600 text-white rounded-md';
        btnTable.className = 'm3-segmented-btn py-1 px-3 text-xs font-semibold text-slate-400 hover:text-white rounded-md';
      }
    }
    renderOrderingResultsPane();
  }

  function updateDataTabButtons() {
    const tabs = ['Results', 'countries', 'animals', 'moons'];
    tabs.forEach(t => {
      const btn = document.getElementById(`orderingDataTabBtn-${t}`);
      if (btn) {
        if (orderingState.activeDataTab === t) {
          btn.className = 'm3-tab-rounded m3-tab-rounded-active px-3 py-1 text-xs font-bold transition-colors flex items-center gap-1.5';
        } else {
          btn.className = 'm3-tab-rounded px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5';
        }
      }
    });
  }

  function toggleOrderingHint(id) {
    if (window.__DA101_ACCESS__ && window.__DA101_ACCESS__.examMode === 'exam') return;
    const box = document.getElementById(`ordering-hint-box-${id}`);
    if (box) {
      box.classList.toggle('hidden');
    }
  }
  window.toggleOrderingHint = toggleOrderingHint;

  window.reloadOrderingStateFromStorage = function () {
    loadSavedState();
    const input = document.getElementById('orderingSqlInput');
    const savedQuery = orderingState.submittedQueries && orderingState.submittedQueries[String(orderingState.activeStep)];
    if (input) input.value = typeof savedQuery === 'string' ? savedQuery : '';
    try {
      renderOrderingHeader();
      renderOrderingLeftPane();
      renderOrderingRightPane();
      renderOrderingResultsPane();
      updateOrderingSubmitButtonState();
      updateOrderingHomeScreenCardProgress();
      if (typeof window.handleOrderingSQLInput === 'function') {
        window.handleOrderingSQLInput();
      }
    } catch (e) {}
  };

  function retryOrderingLab() {
    orderingState.completedSteps.clear();
    orderingState.wrongSteps.clear();
    orderingState.submittedQueries = {};
    orderingState.completedAt = null;
    orderingState.activeStep = 1;
    orderingState.activeTab = 'exercises';
    orderingState.currentQuery = '';
    orderingState.lastQueryResults = null;
    persistState(true);
    renderOrderingHeader();
    renderOrderingLeftPane();
    renderOrderingResultsPane();
    updateOrderingSubmitButtonState();
    updateOrderingHomeScreenCardProgress();
    showOrderingNotification("Activity reset for a fresh attempt! You have unlimited retries.");
  }
  window.retryOrderingLab = retryOrderingLab;

  function resetOrderingLab(fullReset = false) {
    if (fullReset) {
      if (confirm("Reset all Module 3 progress? This will clear your completed exercises.")) {
        retryOrderingLab();
        showOrderingNotification("Module 3 has been reset.");
      }
      return;
    }

    // Default: Reset CURRENT QUESTION ONLY (do not reset back to Question #1)
    const currentEx = getActiveExercise();
    if (!currentEx) return;
    orderingState.completedSteps.delete(currentEx.id);
    orderingState.wrongSteps.delete(currentEx.id);
    orderingState.currentQuery = '';
    orderingState.lastQueryResults = null;
    const input = document.getElementById('orderingSqlInput');
    if (input) input.value = '';
    persistState();
    renderOrderingHeader();
    renderOrderingLeftPane();
    renderOrderingRightPane();
    updateOrderingSubmitButtonState();
    updateOrderingHomeScreenCardProgress();
    showOrderingNotification(`Exercise ${currentEx.id} has been reset. You can try again.`);
  }

  function showOrderingNotification(msg) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(msg);
      return;
    }
    let toast = document.getElementById('labToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'labToast';
      toast.className = 'fixed bottom-5 right-5 z-50 bg-[#161c28] text-white text-xs px-5 py-3.5 rounded-[22px] shadow-2xl border border-slate-700/80 transition-all duration-300 transform translate-y-3 opacity-0 pointer-events-none flex items-center gap-3 m3-spring';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph ph-info text-amber-400 text-lg"></i><span class="font-medium">${msg}</span>`;
    toast.classList.remove('translate-y-3', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      toast.classList.add('translate-y-3', 'opacity-0', 'pointer-events-none');
    }, 3500);
  }

  function updateOrderingHomeScreenCardProgress() {
    const count = orderingState.completedSteps.size;
    const wrongCount = orderingState.wrongSteps.size;
    const total = ORDERING_EXERCISES.length;
    const totalAnswered = count + wrongCount;
    const pct = Math.round((totalAnswered / total) * 100);

    const bar = document.getElementById('homeCardProgressBarOrdering');
    const text = document.getElementById('homeCardProgressTextOrdering');
    const badgeText = document.getElementById('homeCardBadgeTextOrdering');
    const badgeContainer = document.getElementById('homeCardProgressBadgeOrdering');
    const launchBtnText = document.getElementById('homeLaunchBtnTextOrdering');

    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${count} passed / ${totalAnswered} completed`;

    if (launchBtnText) {
      if (totalAnswered === total) {
        launchBtnText.textContent = 'Review Completed Lab';
      } else if (totalAnswered > 0) {
        launchBtnText.textContent = `Resume Module 3 (${totalAnswered}/${total})`;
      } else {
        launchBtnText.textContent = 'Launch Module 3';
      }
    }

    if (badgeText && badgeContainer) {
      if (totalAnswered === total) {
        badgeText.textContent = count === total ? '✓ 100% Passed' : `Finished (${count}/${total} Passed)`;
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
      } else if (totalAnswered > 0) {
        badgeText.textContent = `In Progress (${totalAnswered}/${total})`;
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5';
      } else {
        badgeText.textContent = 'Available Now';
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('curriculumprogresschange'));
    } catch (e) {}
  }

  function startOrderingLab() {
    orderingState.isLabStarted = true;
    const overlay = document.getElementById('orderingStartLabOverlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('opacity', '0', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
      overlay.classList.add('hidden');
    }
    orderingState.activeTab = 'exercises';
    persistState();
    renderOrderingLeftPane();
    renderOrderingResultsPane();
    updateOrderingHomeScreenCardProgress();
  }

  function initOrderingLab() {
    loadSavedState();

    const overlay = document.getElementById('orderingStartLabOverlay');
    if (overlay) {
      if (orderingState.isLabStarted) {
        overlay.style.setProperty('display', 'none', 'important');
        overlay.style.setProperty('opacity', '0', 'important');
        overlay.style.setProperty('pointer-events', 'none', 'important');
        overlay.classList.add('hidden');
      } else {
        overlay.classList.remove('hidden');
        overlay.style.removeProperty('display');
        overlay.style.setProperty('opacity', '1', 'important');
        overlay.style.setProperty('pointer-events', 'auto', 'important');
      }
    }

    renderOrderingHeader();
    renderOrderingLeftPane();
    renderOrderingResultsPane();
    updateOrderingHomeScreenCardProgress();
    if (typeof window.handleOrderingSQLInput === 'function') {
      window.handleOrderingSQLInput();
    }
  }

  // ==========================================
  // 9. EXPOSE GLOBALS
  // ==========================================

  window.initOrderingLab = initOrderingLab;
  window.startOrderingLab = startOrderingLab;
  window.updateOrderingHomeScreenCardProgress = updateOrderingHomeScreenCardProgress;
  window.switchOrderingTab = switchOrderingTab;
  window.selectOrderingExercise = selectOrderingExercise;
  window.nextOrderingExercise = nextOrderingExercise;
  window.runOrderingSQL = runOrderingSQL;
  window.submitOrderingSQL = submitOrderingSQL;
  window.selectOrderingDataTab = selectOrderingDataTab;
  window.setOrderingViewMode = setOrderingViewMode;
  window.resetOrderingLab = resetOrderingLab;
  window.downloadOrderingResultAsImage = downloadOrderingResultAsImage;
  window.downloadOrderingResultAsPDF = downloadOrderingResultAsPDF;
  window.showOrderingNotification = showOrderingNotification;
  window.orderingState = orderingState;
  window.executeOrderingSQL = executeOrderingSQL;

  // Auto init card progress on load
  document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    updateOrderingHomeScreenCardProgress();
  });

})();
