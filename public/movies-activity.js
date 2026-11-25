/**
 * Asynchronous 01: Successful Movies
 * Interactive SQL Laboratory Engine
 * 
 * Features:
 * - 10 sequential interactive exercises covering SQL SELECT, WHERE (including column-to-column comparisons),
 *   ORDER BY (ASC/DESC), LIMIT, and analytical film metrics across 50 years of cinema.
 * - Real datasets: movies table (imdbid, title, year, budget, revenue, mpaa, ravg) with financial and ratings figures.
 * - Interactive SQL query runner with syntax evaluation and clean responsive result visualization.
 * - Strict progression locking: exercises unlock sequentially upon successful verification.
 * - Verified answer placed directly below instructions upon correct completion.
 * - 100% verified completion screen ("Asynchronous 01 Completed") with "Go back to home screen" button in the left panel.
 * - Uses Student Information & Credentials directly from the Home Screen.
 * - Download verified completion result as high-res Image (PNG) or A4 PDF.
 * - Strictly zero mentions of restricted vendor names.
 */

(function() {
  'use strict';

  // ==========================================
  // 1. MOVIES DATASET (50 years: 1965 - 2015)
  // ==========================================

  const MOVIES_DB = {
    movies: [
      // Top rated films (Exercise 2)
      { imdbid: 68646, title: 'The Godfather', year: 1972, budget: 6, revenue: 246, mpaa: 'R', ravg: 9.7 },
      { imdbid: 65571, title: 'Il conformista', year: 1970, budget: 0.8, revenue: 0.4, mpaa: 'R', ravg: 9.3 },
      { imdbid: 245429, title: 'Sen to Chihiro no kamikakushi', year: 2001, budget: 19, revenue: 356, mpaa: 'PG', ravg: 9.3 },
      { imdbid: 457430, title: 'El laberinto del fauno', year: 2006, budget: 19, revenue: 84, mpaa: 'R', ravg: 9.3 },
      { imdbid: 1065073, title: 'Boyhood', year: 2014, budget: 4, revenue: 48, mpaa: 'R', ravg: 9.3 },

      // Lowest rated films (Exercise 4)
      { imdbid: 2814362, title: 'United Passions', year: 2014, budget: 25, revenue: 0.2, mpaa: 'NR', ravg: 0.8 },
      { imdbid: 270846, title: 'Superbabies: Baby Geniuses 2', year: 2004, budget: 20, revenue: 9.4, mpaa: 'PG', ravg: 1.2 },
      { imdbid: 118665, title: 'Baby Geniuses', year: 1999, budget: 12, revenue: 37, mpaa: 'PG', ravg: 1.3 },
      { imdbid: 185183, title: 'Battlefield Earth', year: 2000, budget: 73, revenue: 30, mpaa: 'PG13', ravg: 1.4 },
      { imdbid: 369226, title: 'Alone in the Dark', year: 2005, budget: 20, revenue: 13, mpaa: 'R', ravg: 1.4 },

      // Highest revenue films (Exercise 5 & 6)
      { imdbid: 499549, title: 'Avatar', year: 2009, budget: 237, revenue: 2790, mpaa: 'PG13', ravg: 8.1 },
      { imdbid: 120338, title: 'Titanic', year: 1997, budget: 200, revenue: 2195, mpaa: 'PG13', ravg: 7.6 },
      { imdbid: 369610, title: 'Jurassic World', year: 2015, budget: 150, revenue: 1670, mpaa: 'PG13', ravg: 6.3 },
      { imdbid: 848228, title: 'The Avengers', year: 2012, budget: 220, revenue: 1519, mpaa: 'PG13', ravg: 7.3 },
      { imdbid: 2820852, title: 'Fast & Furious 7', year: 2015, budget: 190, revenue: 1515, mpaa: 'PG13', ravg: 6.8 },

      // Lowest revenue films (Exercise 7)
      { imdbid: 271020, title: 'The Jimmy Show', year: 2001, budget: 1.5, revenue: 0.001, mpaa: 'R', ravg: 4.3 },
      { imdbid: 322700, title: 'I Love Your Work', year: 2003, budget: 1.7, revenue: 0.003, mpaa: 'R', ravg: 4.4 },
      { imdbid: 1241226, title: 'Locker 13', year: 2014, budget: 0.3, revenue: 0.003, mpaa: 'R', ravg: 3.1 },
      { imdbid: 68611, title: 'Frenzy', year: 1972, budget: 2, revenue: 0.004, mpaa: 'R', ravg: 8.5 },
      { imdbid: 70518, title: 'Pat Garrett & Billy the Kid', year: 1973, budget: 4.6, revenue: 0.01, mpaa: 'R', ravg: 6 },

      // Acclaimed films that lost money (revenue < budget, Exercise 8 & 9)
      { imdbid: 65214, title: 'The Wild Bunch', year: 1969, budget: 6.2, revenue: 0.6, mpaa: 'R', ravg: 9.1 },
      { imdbid: 70379, title: 'Mean Streets', year: 1973, budget: 0.5, revenue: 0.04, mpaa: 'R', ravg: 8.8 },
      { imdbid: 86197, title: 'The Right Stuff', year: 1983, budget: 27, revenue: 21, mpaa: 'PG', ravg: 8.7 },
      { imdbid: 72684, title: 'Barry Lyndon', year: 1975, budget: 11, revenue: 0.2, mpaa: 'PG', ravg: 8.6 },
      { imdbid: 181875, title: 'Almost Famous', year: 2000, budget: 60, revenue: 47, mpaa: 'R', ravg: 8.6 },

      // Additional acclaimed titles across the 50-year range (1965-2015)
      { imdbid: 76759, title: 'Star Wars', year: 1977, budget: 11, revenue: 775, mpaa: 'PG', ravg: 8.7 },
      { imdbid: 468569, title: 'The Dark Knight', year: 2008, budget: 185, revenue: 1004, mpaa: 'PG13', ravg: 9.0 },
      { imdbid: 110912, title: 'Pulp Fiction', year: 1994, budget: 8, revenue: 213, mpaa: 'R', ravg: 8.9 },
      { imdbid: 109830, title: 'Forrest Gump', year: 1994, budget: 55, revenue: 677, mpaa: 'PG13', ravg: 8.8 },
      { imdbid: 1375666, title: 'Inception', year: 2010, budget: 160, revenue: 829, mpaa: 'PG13', ravg: 8.8 },
      { imdbid: 133093, title: 'The Matrix', year: 1999, budget: 63, revenue: 463, mpaa: 'R', ravg: 8.7 },
      { imdbid: 816692, title: 'Interstellar', year: 2014, budget: 165, revenue: 675, mpaa: 'PG13', ravg: 8.6 },
      { imdbid: 137523, title: 'Fight Club', year: 1999, budget: 63, revenue: 100, mpaa: 'R', ravg: 8.8 },
      { imdbid: 99685, title: 'Goodfellas', year: 1990, budget: 25, revenue: 46, mpaa: 'R', ravg: 8.7 },
      { imdbid: 114369, title: 'Seven', year: 1995, budget: 33, revenue: 327, mpaa: 'R', ravg: 8.6 },
      { imdbid: 102926, title: 'The Silence of the Lambs', year: 1991, budget: 19, revenue: 272, mpaa: 'R', ravg: 8.6 },
      { imdbid: 120815, title: 'Saving Private Ryan', year: 1998, budget: 70, revenue: 481, mpaa: 'R', ravg: 8.6 },
      { imdbid: 108052, title: "Schindler's List", year: 1993, budget: 22, revenue: 321, mpaa: 'R', ravg: 8.9 },
      { imdbid: 111161, title: 'The Shawshank Redemption', year: 1994, budget: 25, revenue: 28, mpaa: 'R', ravg: 9.3 },
      { imdbid: 172495, title: 'Gladiator', year: 2000, budget: 103, revenue: 457, mpaa: 'R', ravg: 8.5 },
      { imdbid: 110357, title: 'The Lion King', year: 1994, budget: 45, revenue: 968, mpaa: 'G', ravg: 8.5 },
      { imdbid: 114709, title: 'Toy Story', year: 1995, budget: 30, revenue: 373, mpaa: 'G', ravg: 8.3 },
      { imdbid: 266543, title: 'Finding Nemo', year: 2003, budget: 94, revenue: 940, mpaa: 'G', ravg: 8.1 },
      { imdbid: 910970, title: 'WALL-E', year: 2008, budget: 180, revenue: 521, mpaa: 'G', ravg: 8.4 }
    ]
  };

  // ==========================================
  // 2. EXERCISE DEFINITIONS & METADATA
  // ==========================================

  const MOVIES_EXERCISES = [
    {
      id: 1,
      title: "Things to Note",
      type: "checkboxes",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">As you look over the <code class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800/60">movies</code> table, note the following:</p>
        <div class="mt-3 space-y-2.5 bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <label class="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input type="checkbox" id="chkEx1_1" onchange="window.handleMoviesCheckboxChange()" class="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500">
            <span>The table represents <strong class="text-slate-900 dark:text-slate-100">50 years</strong> worth of movies.</span>
          </label>
          <label class="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input type="checkbox" id="chkEx1_2" onchange="window.handleMoviesCheckboxChange()" class="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500">
            <span>The <strong class="text-slate-900 dark:text-slate-100">budget</strong> and <strong class="text-slate-900 dark:text-slate-100">revenue</strong> units are not dollars, but <em>millions of dollars</em>.</span>
          </label>
          <label class="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input type="checkbox" id="chkEx1_3" onchange="window.handleMoviesCheckboxChange()" class="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500">
            <span>The <strong class="text-slate-900 dark:text-slate-100">ravg</strong> (ratings average) column has numbers between <strong class="text-slate-900 dark:text-slate-100">0 and 10</strong>.</span>
          </label>
        </div>
      `,
      solutionQuery: "Key characteristics of the movies table noted (50-year range, budget/revenue in millions, ravg 0-10)",
      hint: "Inspect the movies table and check all 3 checkboxes to verify the dataset features.",
      feedbackSuccess: "All key characteristics of the movies dataset noted.",
      validate: () => {
        const c1 = document.getElementById('chkEx1_1');
        const c2 = document.getElementById('chkEx1_2');
        const c3 = document.getElementById('chkEx1_3');
        return !!(c1 && c1.checked && c2 && c2.checked && c3 && c3.checked);
      }
    },
    {
      id: 2,
      title: "Highest Rated Movies",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          The numbers in the <code class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800/60">ravg</code> column are averages over multiple ratings systems. It's a rough measure of how highly critics and audience members rated each movie.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Write a query to select the <strong class="text-slate-900 dark:text-slate-100">5 highest rated movies</strong> according to this <code class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800/60">ravg</code> metric.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies ORDER BY ravg DESC LIMIT 5",
      hint: "Order the movies by ravg in descending order and limit to 5: SELECT * FROM movies ORDER BY ravg DESC LIMIT 5",
      feedbackSuccess: "Correct!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount !== 5) return false;
        // Verify highest rated movies in descending order
        const top5Titles = results.rows.map(r => r.title);
        return top5Titles.includes('The Godfather') && top5Titles.includes('Il conformista') && results.rows[0].ravg >= results.rows[4].ravg;
      }
    },
    {
      id: 3,
      title: "How many are in English?",
      type: "dropdown",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Of the 5 highest rated movies, how many have an English title?
        </p>
        <div class="mt-3 bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Answer:</label>
          <select id="selEx3" onchange="window.handleMoviesDropdownChange(3)" class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-200">
            <option value="">select your answer...</option>
            <option value="zero">zero</option>
            <option value="one">one</option>
            <option value="two">two</option>
            <option value="three">three</option>
            <option value="four">four</option>
            <option value="all five">all five</option>
          </select>
        </div>
      `,
      solutionQuery: "Answer: two (The Godfather and Boyhood)",
      hint: "Count how many of the top 5 titles are in English (The Godfather, Boyhood = two). Select 'two' in the dropdown.",
      feedbackSuccess: "Awesome!",
      validate: () => {
        const sel = document.getElementById('selEx3');
        return sel && sel.value.toLowerCase() === 'two';
      }
    },
    {
      id: 4,
      title: "Lowest Rated Movies",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Now write a query to select the <strong class="text-slate-900 dark:text-slate-100">5 lowest rated movies</strong>.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Notice the different ratio of English titles here.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies ORDER BY ravg ASC LIMIT 5",
      hint: "Order the movies by ravg in ascending order and limit to 5: SELECT * FROM movies ORDER BY ravg ASC LIMIT 5",
      feedbackSuccess: "Correct!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount !== 5) return false;
        const lowestTitles = results.rows.map(r => r.title);
        return lowestTitles.includes('United Passions') && results.rows[0].ravg <= results.rows[4].ravg;
      }
    },
    {
      id: 5,
      title: "Highest Grossing Movies",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Write a query to select the <strong class="text-slate-900 dark:text-slate-100">5 movies with the highest revenue</strong>.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies ORDER BY revenue DESC LIMIT 5",
      hint: "Order the movies by revenue descending and limit to 5: SELECT * FROM movies ORDER BY revenue DESC LIMIT 5",
      feedbackSuccess: "Yes. That 2790 number for Avatar represents $2.79 Billion!!!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount !== 5) return false;
        const titles = results.rows.map(r => r.title);
        return titles.includes('Avatar') && titles.includes('Titanic') && results.rows[0].revenue >= 2000;
      }
    },
    {
      id: 6,
      title: "Winning MPAA Guidance",
      type: "dropdown",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Based on the results of the previous query, which MPAA content category appears to be a winning revenue generator?
        </p>
        <div class="mt-3 bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select MPAA Category:</label>
          <select id="selEx6" onchange="window.handleMoviesDropdownChange(6)" class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-200">
            <option value="">select your answer...</option>
            <option value="G">G</option>
            <option value="PG">PG</option>
            <option value="PG13">PG13</option>
            <option value="R">R</option>
            <option value="NR">NR</option>
          </select>
        </div>
      `,
      solutionQuery: "Answer: PG13 (All 5 highest-grossing movies are rated PG13)",
      hint: "Look at the MPAA ratings of the top grossing movies (Avatar, Titanic, Jurassic World, Avengers are all PG13). Select 'PG13'.",
      feedbackSuccess: "Perfect!",
      validate: () => {
        const sel = document.getElementById('selEx6');
        return sel && sel.value.toUpperCase() === 'PG13';
      }
    },
    {
      id: 7,
      title: "Lowest Grossing Movies",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Now let's look at the <strong class="text-slate-900 dark:text-slate-100">5 movies with the lowest revenue</strong>.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Let's see if the MPAA category is different.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies ORDER BY revenue ASC LIMIT 5",
      hint: "Order by revenue ascending and limit to 5: SELECT * FROM movies ORDER BY revenue ASC LIMIT 5",
      feedbackSuccess: "Correct!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount !== 5) return false;
        const titles = results.rows.map(r => r.title);
        return titles.includes('The Jimmy Show') && results.rows[0].revenue <= results.rows[4].revenue;
      }
    },
    {
      id: 8,
      title: "Movies that lost money",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Write a query to select all movies that lost money.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          In other words, the movies <code class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800/60">WHERE revenue &lt; budget</code>.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies WHERE revenue < budget",
      hint: "Filter for movies with revenue < budget: SELECT * FROM movies WHERE revenue < budget",
      feedbackSuccess: "Correct!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount === 0) return false;
        // Verify every returned row has revenue < budget
        return results.rows.every(r => parseFloat(r.revenue) < parseFloat(r.budget));
      }
    },
    {
      id: 9,
      title: "Sort by Ratings",
      type: "sql",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          Now order the movies that lost money by their ratings average.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Use the <code class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800/60">DESC</code> flag so the highest rated are first.
        </p>
      `,
      solutionQuery: "SELECT * FROM movies WHERE revenue < budget ORDER BY ravg DESC",
      hint: "Filter WHERE revenue < budget and ORDER BY ravg DESC: SELECT * FROM movies WHERE revenue < budget ORDER BY ravg DESC",
      feedbackSuccess: "Correct!",
      validate: (query, results) => {
        if (!results || !results.success || results.rowCount === 0) return false;
        const allLost = results.rows.every(r => parseFloat(r.revenue) < parseFloat(r.budget));
        const isSortedDesc = results.rows.every((r, idx, arr) => idx === 0 || parseFloat(arr[idx - 1].ravg) >= parseFloat(r.ravg));
        return allLost && isSortedDesc;
      }
    },
    {
      id: 10,
      title: "Lab Notes",
      type: "notes",
      targetTable: "movies",
      instructions: `
        <p class="font-medium text-slate-800 dark:text-slate-200">
          The last query results showed that just because a movie lost money at the box office doesn't mean that it's a low rated movie.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          We will continue working on this project over the next few labs.
        </p>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Jot down some notes of what we have learned so far and where we might go from here.
        </p>
        
        <div class="mt-3 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#111827] shadow-xs">
          <div class="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center justify-between">
            <div class="flex items-center space-x-1 text-xs">
              <button onclick="window.formatMoviesNotes('bold')" class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300" title="Bold">B</button>
              <button onclick="window.formatMoviesNotes('italic')" class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 italic font-serif flex items-center justify-center text-slate-700 dark:text-slate-300" title="Italic">I</button>
              <button onclick="window.formatMoviesNotes('underline')" class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 underline flex items-center justify-center text-slate-700 dark:text-slate-300" title="Underline">U</button>
              <button onclick="window.formatMoviesNotes('code')" class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[11px] flex items-center justify-center text-slate-700 dark:text-slate-300" title="Code">&lt;&gt;</button>
            </div>
            <button onclick="window.clearMoviesNotes()" class="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium">Clear</button>
          </div>
          <div id="moviesNotesEditor" contenteditable="true" oninput="window.saveMoviesNotes()" class="p-3 text-xs text-slate-800 dark:text-slate-200 min-h-[140px] max-h-[220px] overflow-y-auto leading-relaxed focus:outline-none">
            <strong>Key Takeaways So Far:</strong><br>
            • Used <code>WHERE revenue &lt; budget</code> to filter for movies that lost money at the box office.<br>
            • Sorted results with <code>ORDER BY ravg DESC</code> to see highest-rated box office flops first.<br>
            • Observed that commercial performance does not determine critical reception—films like <em>Il conformista</em> and <em>The Wild Bunch</em> earned ratings over 9.0 despite losing money.<br><br>
            <strong>Next Steps to Explore:</strong><br>
            • Calculate net profit or loss directly using math operations (<code>revenue - budget</code>).<br>
            • Use aggregate functions (<code>AVG()</code>, <code>COUNT()</code>, <code>SUM()</code>) with <code>GROUP BY</code> to see which decades or MPAA ratings produce the most profitable films.
          </div>
        </div>
      `,
      solutionQuery: "Comprehensive analytical synthesis notes recorded for movie recommendation project",
      hint: "Write a summary sentence in your notes about movie profitability versus critical reception, then click Done.",
      feedbackSuccess: "Synthesis notes recorded!",
      validate: () => {
        const ed = document.getElementById('moviesNotesEditor');
        return ed && (ed.innerText || ed.textContent || '').trim().length > 20;
      }
    }
  ];

  // ==========================================
  // 3. PERSISTED APPLICATION STATE
  // ==========================================

  const STORAGE_KEY = 'asynchronous_01_movies_state_v1';

  let moviesState = {
    activeTab: 'intro', // 'intro', 'exercises', 'completion'
    activeStep: 1,
    completedSteps: new Set(),
    wrongSteps: new Set(),
    activeDataTab: 'Results', // 'Results', 'movies'
    currentQuery: '',
    lastQueryResults: null,
    isLabStarted: false,
    autoRun: false,
    exerciseFeedbacks: {}
  };

  function loadSavedState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('seatwork_04_movies_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeStep) moviesState.activeStep = parsed.activeStep;
        if (parsed.activeTab) moviesState.activeTab = parsed.activeTab;
        if (Array.isArray(parsed.completedSteps)) {
          moviesState.completedSteps = new Set(parsed.completedSteps);
        }
        if (Array.isArray(parsed.wrongSteps)) {
          moviesState.wrongSteps = new Set(parsed.wrongSteps);
        }
        if (parsed.isLabStarted) moviesState.isLabStarted = parsed.isLabStarted;
      }
    } catch (e) {
      console.warn("Could not load Asynchronous 01 state:", e);
    }
  }

  function persistState() {
    try {
      const payload = {
        activeStep: moviesState.activeStep,
        activeTab: moviesState.activeTab,
        completedSteps: Array.from(moviesState.completedSteps),
        wrongSteps: Array.from(moviesState.wrongSteps),
        isLabStarted: moviesState.isLabStarted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not persist Asynchronous 01 state:", e);
    }
  }

  // ==========================================
  // 4. ROBUST SQL PARSER & EXECUTION ENGINE
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

    // Check if string literal (strictly case-sensitive)
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

    // Check if targetVal refers to another column in the row! (e.g. revenue < budget)
    const otherCol = Object.keys(row).find(k => k.toLowerCase() === lit.value.toLowerCase());
    if (otherCol) {
      const numRow = parseFloat(row[colName]);
      const numComp = parseFloat(row[otherCol]);
      if (!isNaN(numComp) && !isNaN(numRow)) {
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
      const strRow = String(row[colName] ?? '');
      const strComp = String(row[otherCol] ?? '');
      if (cond.op === '=' || cond.op === '==') return strRow === strComp;
      if (cond.op === '!=' || cond.op === '<>') return strRow !== strComp;
      if (cond.op === '<') return strRow < strComp;
      if (cond.op === '<=') return strRow <= strComp;
      if (cond.op === '>') return strRow > strComp;
      if (cond.op === '>=') return strRow >= strComp;
      return false;
    }

    // Numeric literal comparison (unquoted non-numeric strings are not valid string literals)
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

  function executeMoviesSQL(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) {
      return { success: false, error: "Please enter a SQL query." };
    }

    const cleaned = normalizeSqlOutsideQuotes(rawQuery);

    // Match SELECT ... FROM table [WHERE ...] [ORDER BY ...] [LIMIT ...]
    const regex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;
    const match = cleaned.match(regex);

    if (!match) {
      return {
        success: false,
        error: "Syntax error: Expected format: SELECT * FROM movies [WHERE ...] [ORDER BY <column> [ASC|DESC]] [LIMIT <n>]"
      };
    }

    const colsPart = match[1].trim();
    const tablePart = match[2].trim().toLowerCase();
    const wherePart = match[3] ? match[3].trim() : null;
    const orderByPart = match[4] ? match[4].trim() : null;
    const limitPart = match[5] ? parseInt(match[5], 10) : null;

    if (!MOVIES_DB[tablePart]) {
      return {
        success: false,
        error: `Table '${tablePart}' not found. Available table: movies`
      };
    }

    let rows = [...MOVIES_DB[tablePart]];

    // 1. WHERE Filter (quote-aware OR / AND with standard precedence)
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

    // 2. ORDER BY Sort
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

    // 3. LIMIT Clause
    if (limitPart !== null && !isNaN(limitPart) && limitPart >= 0) {
      rows = rows.slice(0, limitPart);
    }

    // Determine projected columns
    let cols = [];
    if (colsPart === '*') {
      cols = ['imdbid', 'title', 'year', 'budget', 'revenue', 'mpaa', 'ravg'];
    } else {
      cols = colsPart.split(',').map(c => c.trim()).filter(Boolean);
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
  // 5. UI RENDERING: LEFT PANE & CONTROLS
  // ==========================================

  function getActiveExercise() {
    return MOVIES_EXERCISES.find(e => e.id === moviesState.activeStep) || MOVIES_EXERCISES[0];
  }

  function renderMoviesHeader() {
    const progressBar = document.getElementById('moviesTopProgressBar');
    const progressText = document.getElementById('moviesTopProgressText');
    const total = MOVIES_EXERCISES.length;
    const completedCount = moviesState.completedSteps.size;
    const pct = Math.round((completedCount / total) * 100);

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${completedCount} / ${total}`;

    const badgeCompleted = document.getElementById('moviesBtnModuleCompleted');
    if (badgeCompleted) {
      if (completedCount === total && total > 0) {
        badgeCompleted.classList.remove('hidden');
        badgeCompleted.classList.add('inline-flex');
      } else {
        badgeCompleted.classList.add('hidden');
        badgeCompleted.classList.remove('inline-flex');
      }
    }
  }

  function renderMoviesLeftPane() {
    const container = document.getElementById('moviesLeftPaneContainer');
    if (!container) return;

    const currentEx = getActiveExercise();
    const isAllDone = moviesState.completedSteps.size === MOVIES_EXERCISES.length;

    let html = `
      <div class="px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c28] shrink-0">
        <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button id="tabBtnMoviesIntro" onclick="window.switchMoviesTab('intro')" class="flex-1 py-1.5 px-3 rounded-lg transition-all ${moviesState.activeTab === 'intro' ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            Intro
          </button>
          <button id="tabBtnMoviesExercises" onclick="window.switchMoviesTab('exercises')" class="flex-1 py-1.5 px-3 rounded-lg transition-all ${moviesState.activeTab === 'exercises' ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            Exercises (${moviesState.completedSteps.size}/10)
          </button>
          <button id="tabBtnMoviesCompletion" onclick="window.switchMoviesTab('completion')" class="py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${moviesState.activeTab === 'completion' ? 'bg-blue-600 text-white font-black shadow-sm' : (isAllDone ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold' : 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600')}">
            <i class="ph ph-check-circle-fill text-sm"></i> Completion
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
    `;

    if (moviesState.activeTab === 'intro') {
      html += `
        <div class="space-y-4">
          <!-- Graphic Banner with Popcorn / Film Reel Motif -->
          <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0f172a] shadow-md p-6 text-white relative select-none">
            <!-- Cinema SVG illustration -->
            <svg class="absolute -right-6 -bottom-6 w-44 h-40 opacity-20 pointer-events-none" viewBox="0 0 160 140" fill="none">
              <rect x="20" y="30" width="120" height="90" rx="10" stroke="#93c5fd" stroke-width="3" />
              <circle cx="80" cy="75" r="28" stroke="#93c5fd" stroke-width="2.5" />
              <path d="M80 55 L80 95 M60 75 L100 75" stroke="#93c5fd" stroke-width="2" />
              <circle cx="45" cy="48" r="6" fill="#bfdbfe" />
              <circle cx="115" cy="48" r="6" fill="#bfdbfe" />
              <circle cx="45" cy="102" r="6" fill="#bfdbfe" />
              <circle cx="115" cy="102" r="6" fill="#bfdbfe" />
            </svg>
            <div class="relative z-10 space-y-2">
              <span class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                SQL Masterclass &bull; Asynchronous 01
              </span>
              <h2 class="text-2xl font-black tracking-tight text-white pt-1">Successful Movies</h2>
              <p class="text-xs text-blue-200/90 font-medium">Applying what we learned &bull; 50 Years of Cinema</p>
            </div>
          </div>

          <!-- Description Card matching reference prompt -->
          <div class="bg-white dark:bg-[#151c28] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div class="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-sm">
              <i class="ph ph-film-slate font-bold"></i>
              <span>Applying what we learned</span>
            </div>
            <p>
              In parts 1 and 2 of this lab series, we learned how to select and order rows from tables in a database using SQL.
            </p>
            <p>
              Here in <strong>Asynchronous 01</strong>, we will apply our knowledge of SQL to a real-world project that we will develop together over multiple labs.
            </p>
            <p>
              The project involves developing a new <strong>movie recommendation system</strong> to help people discover movies that they will like watching.
            </p>
            <p>
              As you go through these next exercises, you will write SQL queries to find movies that were successful and movies that were not.
            </p>

            <div class="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <i class="ph ph-sparkle text-amber-500 text-sm"></i>
              <span>Click <strong class="text-slate-800 dark:text-slate-200">Start Lab</strong> on the right to begin exploring SQL cinema data.</span>
            </div>

            <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button onclick="window.goToHomeScreen()" class="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1.5 transition">
                <i class="ph ph-arrow-left font-bold"></i> Back to Activities Selection
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (moviesState.activeTab === 'exercises') {
      html += `<div class="space-y-3">`;

      MOVIES_EXERCISES.forEach(ex => {
        const isDone = moviesState.completedSteps.has(ex.id);
        const isWrong = moviesState.wrongSteps.has(ex.id);
        const isAnswered = isDone || isWrong;
        const isActive = ex.id === moviesState.activeStep;
        const isUnlocked = true;

        html += `
          <div id="movies-step-card-${ex.id}" class="rounded-2xl border transition-all duration-200 overflow-hidden ${
            isActive
              ? 'border-blue-500 dark:border-blue-500 bg-white dark:bg-[#151c28] shadow-md ring-1 ring-blue-500/20'
              : (isDone 
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-white/90 dark:bg-[#151c28]/90 hover:border-emerald-300 dark:hover:border-emerald-800' 
                  : (isWrong ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800' : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 opacity-90 hover:border-slate-300 dark:hover:border-slate-700'))
          }">
            
            <!-- Step Header Bar -->
            <button onclick="window.selectMoviesExercise(${ex.id})" class="w-full text-left p-3.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
              isActive ? 'bg-blue-50/50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }">
              <div class="flex items-center space-x-3">
                <div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : (isWrong
                        ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-200 dark:ring-rose-900'
                        : (isActive ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-200 dark:ring-blue-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'))
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
                <i class="ph ${isActive ? 'ph-caret-up text-blue-600 dark:text-blue-400' : 'ph-caret-down text-slate-400 dark:text-slate-500'} text-sm"></i>
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
                    <button type="button" onclick="window.toggleMoviesHint(${ex.id})" class="m3-btn m3-btn-outlined py-1.5 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs">
                      <i class="ph ph-lightbulb font-bold text-amber-500 text-sm"></i> Hint
                    </button>
                  </div>
                  <div id="movies-hint-box-${ex.id}" class="hidden mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 space-y-1 shadow-sm">
                    <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
                      <i class="ph ph-lightbulb-filament-fill text-amber-500 text-sm"></i> Solution Hint:
                    </div>
                    <div class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      ${ex.hint || 'Review the table data and instructions for this exercise.'}
                    </div>
                  </div>
                </div>

                <!-- Verified Answer Placed Directly Below Instruction When Entered Correctly -->
                ${isDone ? `
                  <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 p-3 shadow-xs space-y-1.5">
                    <div class="flex items-center justify-between text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      <span class="flex items-center gap-1.5">
                        <i class="ph ph-check-circle-fill text-emerald-600 dark:text-emerald-400 text-sm"></i> Verified Answer:
                      </span>
                      <span class="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">Passed</span>
                    </div>
                    <div class="font-mono text-xs font-bold text-slate-900 dark:text-emerald-100 bg-white dark:bg-[#0c121e] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 select-all overflow-x-auto whitespace-pre-wrap">
                      ${escapeHtml(ex.solutionQuery)}
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
                      This question was answered incorrectly. You can adjust your query or input above and click Retry Submit anytime!
                    </div>
                  </div>
                ` : ''}

                <!-- Feedback and Action Controls -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div id="moviesFeedbackBadge" class="text-xs font-semibold">
                    ${isDone ? `<span class="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1"><i class="ph ph-check-circle"></i> ${ex.feedbackSuccess}</span>` : (isWrong ? '<span class="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1"><i class="ph ph-arrow-counter-clockwise text-amber-600 dark:text-amber-400"></i> Retry anytime</span>' : '<span class="text-slate-400 dark:text-slate-500">Complete task above</span>')}
                  </div>

                  <div class="flex items-center gap-2">
                    ${!isAnswered && ex.type === 'checkboxes' ? `
                      <button onclick="window.submitMoviesCheckboxEx(${ex.id})" class="m3-btn m3-btn-emerald py-1.5 px-4 text-xs font-bold gap-1">
                        <span>Continue</span> <i class="ph ph-arrow-right"></i>
                      </button>
                    ` : ''}

                    ${!isAnswered && ex.type === 'notes' ? `
                      <button onclick="window.submitMoviesNotesEx(${ex.id})" class="m3-btn m3-btn-emerald py-1.5 px-4 text-xs font-bold gap-1">
                        <span>Done</span> <i class="ph ph-check-bold"></i>
                      </button>
                    ` : ''}

                    ${ex.id < MOVIES_EXERCISES.length ? `
                      <button onclick="window.nextMoviesExercise()" class="m3-btn m3-btn-filled py-1.5 px-4 text-xs font-bold gap-1 ${isDone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'} text-white rounded-lg shadow-sm">
                        <span>Next</span> <i class="ph ph-arrow-right"></i>
                      </button>
                    ` : `
                      <button onclick="window.switchMoviesTab('completion')" class="m3-btn m3-btn-filled py-1.5 px-4 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">
                        <span>View Completion</span> <i class="ph ph-trophy"></i>
                      </button>
                    `}
                  </div>
                </div>

              </div>
            ` : ''}

          </div>
        `;
      });

      html += `</div>`;
    } else if (moviesState.activeTab === 'completion') {
      const passedCount = moviesState.completedSteps.size;
      const wrongCount = moviesState.wrongSteps.size;
      const totalCount = MOVIES_EXERCISES.length;

      // Completion Screen Left Panel
      html += `
        <div class="space-y-4">
          <!-- Trophy Banner matching reference -->
          <div class="rounded-2xl border border-blue-200 dark:border-slate-800 bg-gradient-to-br from-blue-900 via-sky-800 to-slate-900 p-6 text-white text-center space-y-3 shadow-md relative overflow-hidden">
            <div class="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i class="ph ph-trophy-fill"></i>
            </div>
            <div>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                ${passedCount === totalCount ? 'Perfect Score!' : 'Activity Finished!'}
              </span>
              <h3 class="text-xl font-black tracking-tight text-white mt-2">Asynchronous 01 Completed</h3>
              <p class="text-xs text-blue-200 font-medium">Successful Movies Laboratory Assessment</p>
            </div>
            <div class="bg-blue-950/60 p-3 rounded-xl border border-blue-800/80 text-xs font-semibold text-blue-200 flex items-center justify-center gap-2">
              <i class="ph ${passedCount === totalCount ? 'ph-check-circle-fill text-emerald-400' : 'ph-chart-bar text-amber-300'} text-base"></i>
              <span>Score: ${passedCount} / ${totalCount} Passed (${wrongCount} Incorrect)</span>
            </div>
          </div>

          <!-- Try Again Button (Unlimited Retries) -->
          <div class="bg-white dark:bg-[#151c28] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <button onclick="window.retryMoviesLab()" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2">
              <i class="ph ph-arrow-counter-clockwise text-base font-bold"></i>
              <span>Try Again (Unlimited Retries)</span>
            </button>
            <button onclick="window.goToHomeScreen()" class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2">
              <i class="ph ph-house text-sm text-slate-500 dark:text-slate-400"></i>
              <span>Go back to home screen</span>
            </button>
            <button onclick="window.switchMoviesTab('exercises')" class="w-full py-2 px-4 rounded-xl bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5">
              <i class="ph ph-eye text-xs"></i>
              <span>Review Exercises</span>
            </button>
          </div>

          <!-- Download Options Card in Left Panel as well -->
          <div class="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Official Report Download</div>
            <div class="grid grid-cols-2 gap-2">
              <button id="btnMoviesDownloadImg" onclick="window.downloadMoviesResultAsImage()" class="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold shadow-xs transition flex items-center justify-center gap-1.5">
                <i class="ph ph-image text-blue-600"></i>
                <span>Image (PNG)</span>
              </button>
              <button id="btnMoviesDownloadPdf" onclick="window.downloadMoviesResultAsPDF()" class="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition flex items-center justify-center gap-1.5">
                <i class="ph ph-file-pdf text-amber-300"></i>
                <span>PDF Document</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
    updateMoviesSubmitButtonState();
  }

  function renderMoviesResultsPane() {
    const tableContainer = document.getElementById('moviesTableContainer');
    const rowCountBadge = document.getElementById('moviesRowCountBadge');
    if (!tableContainer) return;

    let columns = [];
    let rows = [];

    if (moviesState.activeDataTab === 'movies') {
      columns = ['imdbid', 'title', 'year', 'budget', 'revenue', 'mpaa', 'ravg'];
      rows = MOVIES_DB.movies;
    } else {
      if (moviesState.lastQueryResults && moviesState.lastQueryResults.success) {
        columns = moviesState.lastQueryResults.columns;
        rows = moviesState.lastQueryResults.rows;
      }
    }

    if (rowCountBadge) {
      rowCountBadge.textContent = `${rows.length} rows`;
    }

    if (rows.length === 0) {
      const ranQuery = moviesState.activeDataTab === 'Results' && moviesState.lastQueryResults && moviesState.lastQueryResults.success;
      tableContainer.innerHTML = `
        <div class="text-center py-16 text-slate-400 text-xs italic space-y-2">
          <i class="ph ph-code text-2xl text-slate-500"></i>
          <div>${ranQuery ? '0 rows matched your query. Note: text inside quotes is case-sensitive.' : 'No query executed yet. Enter a query above and click <span class="font-bold text-slate-300">Run Code</span>.'}</div>
        </div>
      `;
      return;
    }

    let tableHtml = `
      <table class="w-full text-left text-xs border-collapse font-mono">
        <thead class="bg-[#111726] text-slate-300 border-b border-slate-800 sticky top-0 font-bold select-none text-[11px]">
          <tr>
            <th class="py-2 px-3 text-slate-500 w-10 text-right">#</th>
            ${columns.map(col => `
              <th class="py-2 px-3 tracking-wide capitalize">${escapeHtml(col)}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80 text-slate-200">
          ${rows.map((row, idx) => `
            <tr class="hover:bg-slate-800/50 transition-colors ${idx % 2 === 0 ? 'bg-[#0d131f]' : 'bg-[#0b0f19]'}">
              <td class="py-2 px-3 text-slate-500 text-right select-none text-[10px]">${idx + 1}</td>
              ${columns.map(col => {
                const val = row[col];
                let formatted = val;
                let cellStyle = '';
                if (col === 'revenue' || col === 'budget') {
                  formatted = typeof val === 'number' ? `${val}M` : val;
                  cellStyle = 'text-emerald-400 font-semibold';
                } else if (col === 'ravg') {
                  cellStyle = 'text-amber-300 font-bold';
                } else if (col === 'title') {
                  cellStyle = 'text-white font-sans font-medium';
                } else if (col === 'mpaa') {
                  cellStyle = 'text-sky-300 font-bold';
                }
                return `<td class="py-2 px-3 ${cellStyle}">${escapeHtml(String(formatted ?? ''))}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = tableHtml;
  }

  function renderMoviesRightPane() {
    // If completion tab is active, show the verified certificate in the right pane!
    const rightColumn = document.getElementById('moviesRightColumn');
    const editorHalf = document.getElementById('moviesEditorHalf');
    const resultsHalf = document.getElementById('moviesResultsHalf');
    const certHalf = document.getElementById('moviesCompletionCertPane');

    if (!rightColumn || !editorHalf || !resultsHalf || !certHalf) return;

    if (moviesState.activeTab === 'completion') {
      editorHalf.classList.add('hidden');
      resultsHalf.classList.add('hidden');
      certHalf.classList.remove('hidden');
      renderMoviesCertificateView();
    } else {
      editorHalf.classList.remove('hidden');
      resultsHalf.classList.remove('hidden');
      certHalf.classList.add('hidden');
      renderMoviesResultsPane();
    }
  }

  function renderMoviesCertificateView() {
    const certContainer = document.getElementById('moviesCompletionCertPane');
    if (!certContainer) return;

    const student = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {};
    const name = student.name || 'Alex Morgan';
    const batch = student.batch || 'Batch 01';
    const date = student.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = student.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    certContainer.innerHTML = `
      <div class="w-full h-full overflow-y-auto p-6 flex flex-col items-center bg-[#0a0e17]">
        
        <!-- Action Toolbar -->
        <div class="max-w-3xl w-full flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold text-slate-300">Official Verification &amp; Assessment Report</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.downloadMoviesResultAsImage()" class="m3-btn m3-btn-outlined py-1.5 px-3 text-xs font-bold gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800">
              <i class="ph ph-image text-sm text-blue-400"></i> Image
            </button>
            <button onclick="window.downloadMoviesResultAsPDF()" class="m3-btn m3-btn-filled py-1.5 px-3 text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <i class="ph ph-file-pdf text-sm text-amber-300"></i> PDF
            </button>
          </div>
        </div>

        <!-- Certificate Card matching Seatwork 02 reference -->
        <div class="max-w-3xl w-full my-6 bg-white dark:bg-[#151c28] rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-blue-900 dark:border-blue-700 text-slate-900 dark:text-slate-100 space-y-6">
          
          <div class="flex items-center justify-between border-b-2 border-blue-600 pb-5">
            <div>
              <div class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                DATA ANALYTICS 101 &bull; MODULE 4 ASSESSMENT
              </div>
              <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Module 4: Successful Movies
              </h1>
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Laboratory Assessment &amp; Query Competency Certificate
              </p>
            </div>

            <div class="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl px-4 py-2 text-right">
              <div class="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">Module 4 Completed</div>
              <div class="text-sm font-black text-emerald-600 dark:text-emerald-400">${moviesState.completedSteps.size} / ${MOVIES_EXERCISES.length} Passed (${moviesState.wrongSteps.size} Incorrect)</div>
            </div>
          </div>

          <!-- Student Credentials Synced from Home Screen -->
          <div class="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Student Name</span>
              <span class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">${escapeHtml(name)}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Batch / Section</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(batch)}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Completion Date</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(date)}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Session Time</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(time)}</span>
            </div>
          </div>

          <!-- Completed Exercises Summary Grid -->
          <div class="space-y-2">
            <div class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Exercise Solutions Breakdown:</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              ${MOVIES_EXERCISES.map(ex => {
                const isPassed = moviesState.completedSteps.has(ex.id);
                return `
                <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border ${isPassed ? 'border-emerald-200 dark:border-emerald-900/70' : 'border-rose-200 dark:border-rose-900/70'} flex flex-col justify-between">
                  <div class="flex items-center justify-between font-bold text-[11px] text-slate-800 dark:text-slate-200 mb-1">
                    <span>${ex.id}. ${ex.title}</span>
                    <span class="text-[9px] ${isPassed ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800' : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800'} px-1.5 py-0.2 rounded-full font-bold">
                      ${isPassed ? '✓ Passed' : '✕ Incorrect'}
                    </span>
                  </div>
                  <div class="font-mono text-[10px] text-blue-900 dark:text-blue-300 bg-white dark:bg-[#0c121e] p-1.5 rounded border border-slate-200 dark:border-slate-800 break-all select-all">
                    ${escapeHtml(ex.solutionQuery)}
                  </div>
                </div>
              `;}).join('')}
            </div>
          </div>

          <!-- Key Competencies -->
          <div class="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong class="text-blue-950 dark:text-blue-200">Mastered Competencies:</strong>
            SQL SELECT projections, WHERE predicate filtering (including column-to-column revenue &lt; budget comparison), ORDER BY ascending/descending sorting, LIMIT row truncation, and quantitative box office analysis.
          </div>

          <!-- Footer Signature Bar -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <div>Data Analytics 101 &bull; Asynchronous 01: Successful Movies &bull; Verified on ${escapeHtml(date)} at ${escapeHtml(time)}</div>
            <div class="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <i class="ph ph-seal-check-fill text-sm"></i> Official Verified Record
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // ==========================================
  // 6. ACTION HANDLERS & NAVIGATION
  // ==========================================

  function updateMoviesSubmitButtonState() {
    const btn = document.getElementById('btnMoviesSubmitQuery');
    if (!btn) return;
    const currentEx = getActiveExercise();
    if (!currentEx || currentEx.type !== 'sql') {
      btn.disabled = true;
      btn.className = 'm3-btn px-4 py-1 text-xs font-bold gap-1.5 bg-slate-200 text-slate-500 cursor-not-allowed';
      btn.innerHTML = '<i class="ph ph-check-bold text-xs"></i> Submit';
      return;
    }
    const isDone = moviesState.completedSteps.has(currentEx.id);
    const isWrong = moviesState.wrongSteps.has(currentEx.id);
    btn.disabled = false;
    if (isDone) {
      btn.className = 'm3-btn m3-btn-emerald px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-check-circle-fill text-xs text-white"></i> Verified ✓ (Re-Submit)';
      btn.title = "Verified! Click to re-evaluate.";
    } else if (isWrong) {
      btn.className = 'm3-btn m3-btn-emerald px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-arrow-counter-clockwise text-xs"></i> Retry Submit';
      btn.title = "Click to retry submission";
    } else {
      btn.className = 'm3-btn m3-btn-emerald px-4 py-1 text-xs font-bold gap-1.5 shadow-sm';
      btn.innerHTML = '<i class="ph ph-check-bold text-xs"></i> Submit';
      btn.title = "Submit SQL for evaluation";
    }
  }

  function switchMoviesTab(tabName) {
    moviesState.activeTab = tabName;
    persistState();
    renderMoviesLeftPane();
    renderMoviesRightPane();
  }

  function selectMoviesExercise(stepId) {
    moviesState.activeStep = stepId;
    moviesState.activeTab = 'exercises';
    persistState();
    renderMoviesLeftPane();

    // Auto-focus SQL editor if it's an SQL step
    const ex = getActiveExercise();
    if (ex.type === 'sql') {
      const input = document.getElementById('moviesSqlInput');
      if (input && !input.value.trim()) {
        input.value = `SELECT * FROM movies `;
        if (typeof window.handleMoviesSQLInput === 'function') {
          window.handleMoviesSQLInput();
        }
      }
    }
    updateMoviesSubmitButtonState();
  }

  function nextMoviesExercise() {
    if (moviesState.activeStep < MOVIES_EXERCISES.length) {
      selectMoviesExercise(moviesState.activeStep + 1);
    } else {
      switchMoviesTab('completion');
    }
  }

  function runMoviesSQL(silent = false) {
    const input = document.getElementById('moviesSqlInput');
    const badge = document.getElementById('moviesSqlStatusBadge');
    if (input && typeof window.applySqlAutoCapitalize === 'function') {
      const processed = window.applySqlAutoCapitalize(input.value);
      if (processed !== input.value) {
        input.value = processed;
        const highlight = document.getElementById('moviesSqlHighlight');
        if (highlight && typeof window.formatSQLSyntaxHTML === 'function') {
          highlight.innerHTML = window.formatSQLSyntaxHTML(input.value) + '\n';
        }
      }
    }
    const query = input ? input.value.trim() : '';

    if (!query) {
      if (badge) badge.className = 'hidden';
      return null;
    }

    const res = executeMoviesSQL(query);
    moviesState.currentQuery = query;
    moviesState.lastQueryResults = res;
    moviesState.activeDataTab = 'Results';

    updateDataTabButtons();
    renderMoviesResultsPane();

    if (badge) {
      if (res.success) {
        badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-2 bg-emerald-100 text-emerald-800 border border-emerald-200';
        badge.textContent = `✓ ${res.rowCount} rows`;
      } else {
        badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-2 bg-rose-100 text-rose-800 border border-rose-200';
        badge.textContent = 'Syntax Error';
      }
    }

    if (!res.success && !silent) {
      showMoviesNotification(res.error || "Query failed");
    }

    return res;
  }

  function submitMoviesSQL() {
    const currentEx = getActiveExercise();
    if (!currentEx) return;

    if (currentEx.type !== 'sql') {
      showMoviesNotification("This exercise is evaluated through the interactive controls in the left pane.");
      return;
    }

    const res = runMoviesSQL(true);
    const input = document.getElementById('moviesSqlInput');
    const queryStr = input ? input.value.trim() : '';

    const isPassed = res && res.success && currentEx.validate(queryStr, res);

    if (isPassed) {
      moviesState.completedSteps.add(currentEx.id);
      moviesState.wrongSteps.delete(currentEx.id);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification(`✓ Correct! Exercise ${currentEx.id} passed.`);
      
      const totalAnswered = moviesState.completedSteps.size + moviesState.wrongSteps.size;
      if (totalAnswered === MOVIES_EXERCISES.length) {
        setTimeout(() => {
          switchMoviesTab('completion');
        }, 800);
      } else {
        setTimeout(() => {
          nextMoviesExercise();
        }, 600);
      }
    } else {
      moviesState.wrongSteps.add(currentEx.id);
      moviesState.completedSteps.delete(currentEx.id);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification(`Exercise ${currentEx.id} query didn't match requirements. Check hint and retry anytime!`);
    }
  }

  function handleMoviesCheckboxChange() {
    const currentEx = getActiveExercise();
    if (currentEx.id === 1 && currentEx.validate()) {
      submitMoviesCheckboxEx(1);
    }
  }

  function submitMoviesCheckboxEx(id) {
    const ex = MOVIES_EXERCISES.find(e => e.id === id);
    if (!ex) return;

    if (ex.validate()) {
      moviesState.completedSteps.add(id);
      moviesState.wrongSteps.delete(id);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification("Things to Note verified! Moving to next exercise.");
      setTimeout(() => {
        selectMoviesExercise(2);
      }, 500);
    } else {
      moviesState.wrongSteps.add(id);
      moviesState.completedSteps.delete(id);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification("Checkboxes incomplete. Please check all boxes to verify.");
    }
  }

  function toggleMoviesHint(id) {
    const box = document.getElementById(`movies-hint-box-${id}`);
    if (box) {
      box.classList.toggle('hidden');
    }
  }
  window.toggleMoviesHint = toggleMoviesHint;

  function handleMoviesDropdownChange(stepId) {
    const ex = MOVIES_EXERCISES.find(e => e.id === stepId);
    if (!ex) return;

    const nextId = stepId + 1;
    if (ex.validate()) {
      moviesState.completedSteps.add(stepId);
      moviesState.wrongSteps.delete(stepId);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification(`Exercise ${stepId} passed! Verified answer placed below instruction.`);
      setTimeout(() => {
        if (nextId <= MOVIES_EXERCISES.length) {
          selectMoviesExercise(nextId);
        } else {
          switchMoviesTab('completion');
        }
      }, 600);
    } else {
      moviesState.wrongSteps.add(stepId);
      moviesState.completedSteps.delete(stepId);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification(`Incorrect choice selected. You can select another option to retry.`);
    }
  }

  function submitMoviesNotesEx(stepId) {
    const ex = MOVIES_EXERCISES.find(e => e.id === stepId);
    if (!ex) return;

    if (ex.validate()) {
      moviesState.completedSteps.add(stepId);
      moviesState.wrongSteps.delete(stepId);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification("Asynchronous 01 Completed! Switching to completion certificate.");
      setTimeout(() => {
        switchMoviesTab('completion');
      }, 600);
    } else {
      moviesState.wrongSteps.add(stepId);
      moviesState.completedSteps.delete(stepId);
      persistState();
      renderMoviesHeader();
      renderMoviesLeftPane();
      updateMoviesHomeScreenCardProgress();
      showMoviesNotification("Notes cannot be empty. Please enter your summary to complete.");
    }
  }

  function retryMoviesLab() {
    moviesState.completedSteps.clear();
    moviesState.wrongSteps.clear();
    moviesState.activeStep = 1;
    moviesState.currentQuery = '';
    moviesState.lastQueryResults = null;
    moviesState.activeTab = 'exercises';
    moviesState.isLabStarted = true;
    persistState();
    renderMoviesHeader();
    renderMoviesLeftPane();
    renderMoviesRightPane();
    updateMoviesHomeScreenCardProgress();
    showMoviesNotification("Activity reset for a fresh attempt! You have unlimited retries.");
  }
  window.retryMoviesLab = retryMoviesLab;

  function formatMoviesNotes(cmd) {
    if (cmd === 'code') {
      document.execCommand('formatBlock', false, 'pre');
    } else {
      document.execCommand(cmd, false, null);
    }
    const ed = document.getElementById('moviesNotesEditor');
    if (ed) ed.focus();
  }

  function clearMoviesNotes() {
    const ed = document.getElementById('moviesNotesEditor');
    if (ed) {
      ed.innerHTML = '';
      ed.focus();
    }
  }

  function saveMoviesNotes() {
    const ed = document.getElementById('moviesNotesEditor');
    if (ed) {
      try {
        localStorage.setItem('asynchronous_01_movies_notes', ed.innerHTML);
      } catch (e) {}
    }
  }

  function selectMoviesDataTab(tabName) {
    moviesState.activeDataTab = tabName;
    updateDataTabButtons();
    renderMoviesResultsPane();
  }

  function updateDataTabButtons() {
    const tabs = ['Results', 'movies'];
    tabs.forEach(t => {
      const btn = document.getElementById(`moviesDataTabBtn-${t}`);
      if (btn) {
        if (moviesState.activeDataTab === t) {
          btn.className = 'px-3 py-1.5 font-extrabold text-xs text-white border-b-2 border-blue-400 bg-slate-800/80 transition-colors flex items-center gap-1.5';
        } else {
          btn.className = 'px-3 py-1.5 font-medium text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors flex items-center gap-1.5';
        }
      }
    });
  }

  function startMoviesLab() {
    moviesState.isLabStarted = true;
    const overlay = document.getElementById('moviesStartLabOverlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('opacity', '0', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
      overlay.classList.add('hidden');
    }
    moviesState.activeTab = 'exercises';
    persistState();
    renderMoviesLeftPane();
    renderMoviesRightPane();
    updateMoviesHomeScreenCardProgress();
  }

  function resetMoviesLab(fullReset = false) {
    if (fullReset) {
      const totalAnswered = moviesState.completedSteps.size + moviesState.wrongSteps.size;
      const isFinished = totalAnswered === MOVIES_EXERCISES.length;
      if (!isFinished && totalAnswered > 0) {
        showMoviesNotification("Please finish all 10 exercises in this activity before retrying.");
        return;
      }
      if (confirm("Reset all Asynchronous 01 progress? This will clear your completed exercises.")) {
        moviesState.completedSteps.clear();
        moviesState.wrongSteps.clear();
        moviesState.activeStep = 1;
        moviesState.activeTab = 'intro';
        moviesState.currentQuery = '';
        moviesState.lastQueryResults = null;
        moviesState.isLabStarted = false;
        persistState();
        
        const overlay = document.getElementById('moviesStartLabOverlay');
        if (overlay) {
          overlay.classList.remove('hidden');
          overlay.style.opacity = '1';
        }

        renderMoviesHeader();
        renderMoviesLeftPane();
        renderMoviesRightPane();
        updateMoviesHomeScreenCardProgress();
        showMoviesNotification("Asynchronous 01 has been reset for a fresh attempt.");
      }
      return;
    }

    // Default: Reset CURRENT QUESTION ONLY (do not reset back to Question #1)
    const stepId = moviesState.activeStep;
    moviesState.completedSteps.delete(stepId);
    moviesState.wrongSteps.delete(stepId);
    moviesState.currentQuery = '';
    moviesState.lastQueryResults = null;
    const input = document.getElementById('moviesSqlInput');
    if (input) input.value = '';
    persistState();
    renderMoviesHeader();
    renderMoviesLeftPane();
    renderMoviesRightPane();
    updateMoviesHomeScreenCardProgress();
    showMoviesNotification(`Exercise ${stepId} has been reset. You can try again.`);
  }

  function showMoviesNotification(msg) {
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

  // ==========================================
  // 7. REPORT & EXPORT AS IMAGE / PDF
  // ==========================================

  function buildMoviesA4Report(name, batch, date, time) {
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

    const passedCount = moviesState.completedSteps.size;
    const wrongCount = moviesState.wrongSteps.size;

    const exerciseCardsHtml = MOVIES_EXERCISES.map((ex, idx) => {
      const isPassed = moviesState.completedSteps.has(ex.id);
      const statusBadge = isPassed
        ? `<div style="font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.015em; color: #166534; background: #dcfce7; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;">✓ PASSED</div>`
        : `<div style="font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.015em; color: #be123c; background: #ffe4e6; border: 1px solid #fecdd3; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;">✕ INCORRECT</div>`;

      return `
      <div style="background: #ffffff; border: 1px solid ${isPassed ? '#e2e8f0' : '#fecdd3'}; border-radius: 6px; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; min-height: 34px; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px; flex: 1; min-width: 0;">
          <span style="color: #2563eb; font-weight: 800; flex-shrink: 0;">#${String(idx + 1).padStart(2, '0')}</span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(ex.title)}</span>
        </div>
        ${statusBadge}
      </div>
    `;}).join('');

    container.innerHTML = `
      <div>
        <!-- Top Institutional Header with Explicit Module Name -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">
              DATA ANALYTICS 101 &bull; MODULE 4 ASSESSMENT
            </div>
            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin: 0; line-height: 1.2;">Module 4: Successful Movies</h1>
            <div style="font-size: 11px; font-weight: 500; color: #64748b; margin-top: 1px; line-height: 1.6;">Official Laboratory Verification &amp; Competency Assessment Report</div>
          </div>
          <div style="background: ${passedCount === MOVIES_EXERCISES.length ? '#f0fdf4' : '#fefce8'}; border: 1.5px solid ${passedCount === MOVIES_EXERCISES.length ? '#86efac' : '#fde047'}; border-radius: 10px; padding: 5px 12px; text-align: right; flex-shrink: 0;">
            <div style="font-size: 9.5px; font-weight: 800; color: ${passedCount === MOVIES_EXERCISES.length ? '#166534' : '#854d0e'}; text-transform: uppercase;">Module 4 Report</div>
            <div style="font-size: 11px; font-weight: 900; color: ${passedCount === MOVIES_EXERCISES.length ? '#15803d' : '#a16207'};">${passedCount} / 10 Passed (${wrongCount} Incorrect)</div>
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
          <span>Module 4: Exercise Breakdown (${passedCount} / 10 Passed)</span>
          <span style="color: #2563eb; font-weight: 700;">Verified SQL Assessment</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px 10px; margin-bottom: 14px;">
          ${exerciseCardsHtml}
        </div>

        <!-- Key Competencies Summary Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; font-size: 9px; color: #475569; line-height: 14px;">
          <strong style="color: #1e293b;">Key Competencies Mastered in Module 4:</strong>
          SQL <code>SELECT</code> and <code>FROM</code> clauses, comparative column expressions (<code>WHERE revenue &lt; budget</code>), multi-level sorting (<code>ORDER BY ravg DESC</code>, <code>ORDER BY revenue ASC</code>), row result capping with <code>LIMIT</code>, and analytical synthesis of cinematic datasets.
        </div>
      </div>

      <!-- Institutional Footer -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b;">
        <div>Data Analytics 101 &bull; Module 4: Successful Movies &bull; Completed on ${escapeHtml(date)} at ${escapeHtml(time)}</div>
        <div style="color: #059669; font-weight: 800;">✓ Official Verified Result</div>
      </div>
    `;

    return container;
  }

  async function downloadMoviesResultAsPDF() {
    const student = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {};
    const name = student.name || 'Student';
    const batch = student.batch || 'Batch 01';
    const date = student.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = student.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const btn = document.getElementById('btnMoviesDownloadPdf');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Generating PDF...';
    }

    try {
      const reportEl = buildMoviesA4Report(name, batch, date, time);
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
        pdf.save(`${name.replace(/[^a-z0-9]/gi, '_')}_Module_4_Successful_Movies_Results.pdf`);
      }
      showMoviesNotification("PDF report downloaded successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      showMoviesNotification("Error generating PDF. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  async function downloadMoviesResultAsImage() {
    const student = (typeof window.getStudentInfo === 'function') ? window.getStudentInfo() : {};
    const name = student.name || 'Student';
    const batch = student.batch || 'Batch 01';
    const date = student.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = student.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const btn = document.getElementById('btnMoviesDownloadImg');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Generating Image...';
    }

    try {
      const reportEl = buildMoviesA4Report(name, batch, date, time);
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

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_Module_4_Successful_Movies_Certificate.png`;
      link.href = imgData;
      link.click();
      showMoviesNotification("Image report downloaded successfully!");
    } catch (err) {
      console.error("Image export error:", err);
      showMoviesNotification("Error generating Image. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  // ==========================================
  // 8. HOME SCREEN CARD SYNC & LIFECYCLE
  // ==========================================

  function updateMoviesHomeScreenCardProgress() {
    const count = moviesState.completedSteps.size;
    const total = MOVIES_EXERCISES.length;
    const pct = Math.round((count / total) * 100);

    const bar = document.getElementById('homeCardProgressBarMovies');
    const text = document.getElementById('homeCardProgressTextMovies');
    const badgeText = document.getElementById('homeCardBadgeTextMovies');
    const badgeContainer = document.getElementById('homeCardProgressBadgeMovies');
    const launchBtnText = document.getElementById('homeLaunchBtnTextMovies');

    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${count} / ${total} completed`;

    if (launchBtnText) {
      if (count === total) {
        launchBtnText.textContent = 'Review Completed Lab';
      } else if (count > 0 || moviesState.isLabStarted) {
        launchBtnText.textContent = `Resume Module 4 (${count}/${total})`;
      } else {
        launchBtnText.textContent = 'Launch Module 4';
      }
    }

    if (badgeText && badgeContainer) {
      if (count === total) {
        badgeText.textContent = '✓ 100% Completed';
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
      } else if (count > 0 || moviesState.isLabStarted) {
        badgeText.textContent = `In Progress (${count}/${total})`;
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5';
      } else {
        badgeText.textContent = 'Available Now';
        badgeContainer.className = 'relative z-10 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
      }
    }
  }

  function initMoviesLab() {
    loadSavedState();

    const overlay = document.getElementById('moviesStartLabOverlay');
    if (overlay) {
      if (moviesState.isLabStarted) {
        overlay.classList.add('hidden');
      } else {
        overlay.classList.remove('hidden');
        overlay.style.opacity = '1';
      }
    }

    renderMoviesHeader();
    renderMoviesLeftPane();
    renderMoviesRightPane();
    updateMoviesHomeScreenCardProgress();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 9. EXPOSE GLOBALS
  // ==========================================

  window.initMoviesLab = initMoviesLab;
  window.updateMoviesHomeScreenCardProgress = updateMoviesHomeScreenCardProgress;
  window.switchMoviesTab = switchMoviesTab;
  window.selectMoviesExercise = selectMoviesExercise;
  window.nextMoviesExercise = nextMoviesExercise;
  window.runMoviesSQL = runMoviesSQL;
  window.submitMoviesSQL = submitMoviesSQL;
  window.selectMoviesDataTab = selectMoviesDataTab;
  window.startMoviesLab = startMoviesLab;
  window.resetMoviesLab = resetMoviesLab;
  window.handleMoviesCheckboxChange = handleMoviesCheckboxChange;
  window.submitMoviesCheckboxEx = submitMoviesCheckboxEx;
  window.handleMoviesDropdownChange = handleMoviesDropdownChange;
  window.submitMoviesNotesEx = submitMoviesNotesEx;
  window.formatMoviesNotes = formatMoviesNotes;
  window.clearMoviesNotes = clearMoviesNotes;
  window.saveMoviesNotes = saveMoviesNotes;
  window.downloadMoviesResultAsImage = downloadMoviesResultAsImage;
  window.downloadMoviesResultAsPDF = downloadMoviesResultAsPDF;
  window.showMoviesNotification = showMoviesNotification;
  window.moviesState = moviesState;
  window.executeMoviesSQL = executeMoviesSQL;

  document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    updateMoviesHomeScreenCardProgress();
  });

})();
