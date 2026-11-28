// =========================================================================
// DATA ANALYTICS 101 - COMPREHENSIVE LESSON PLANS & CURRICULUM CONTROLLER
// Module 1 (Excel: 18+ Core Formulas & Features across 4 Chapters)
// Modules 2-4 (SQL: Syntax Breakdowns, Execution Orders & Common Exam Traps)
// 100% Light & Dark Mode Harmonized
// =========================================================================

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // LESSON DATA STORE
  // -----------------------------------------------------------------------
  const LESSON_CURRICULUM = {
    excel: {
      id: 'excel',
      moduleNumber: 1,
      title: 'Module 1: Transforming Data with Excel',
      subtitle: 'Complete Guide: 18 Core Formulas & Analytical Tools in Exact Curriculum Order Across 4 Progressive Chapters',
      color: 'emerald',
      badgeText: '18 Formulas & Core Tools',
      labId: 'transforming_data_with_excel',
      labName: 'Launch Module 1 Excel Lab (19 Exercises)',
      chapters: [
        {
          id: 'ch1',
          number: 1,
          title: 'Text Cleaning, Aggregation & Flash Fill',
          description: 'Master standardizing text casing with UPPER, LOWER, PROPER, purging whitespace with TRIM, calculating totals with SUM, and automating pattern extraction with Flash Fill.',
          topics: [
            {
              id: 'upper',
              name: '= UPPER ()',
              type: 'formula',
              syntax: '=UPPER(text)',
              purpose: 'Converts all letters in a text string to uppercase capital letters.',
              functionDescription: 'Evaluates the text string or cell reference and converts every lowercase alphabetic character (a-z) to its uppercase equivalent (A-Z). Numeric digits, spaces, and punctuation symbols are left unchanged. Returns a text data type.',
              whenToUse: 'Use when preparing dataset keys, normalizing country codes (e.g. "us" to "US"), product SKUs, or customer surnames prior to database ingestion or case-sensitive joins.',
              parameters: [
                { name: 'text', description: 'The text string or cell reference you wish to convert to uppercase.' }
              ],
              example: {
                scenario: 'Standardizing Country Names and Product SKUs',
                input: 'Cell H2 = "united states" | Product SKU = "mountain-100 black"',
                formula: '=UPPER(H2)',
                output: '"UNITED STATES"',
                explanation: 'Scans the text in cell H2 and converts every lowercase letter to standard uppercase formatting, ensuring uniform reporting across international sales.'
              },
              tip: 'Useful before running case-sensitive string matches or generating standardized product codes.'
            },
            {
              id: 'lower',
              name: '= LOWER ()',
              type: 'formula',
              syntax: '=LOWER(text)',
              purpose: 'Converts all letters in a text string to lowercase letters.',
              functionDescription: 'Scans the supplied text string or cell reference and converts every uppercase character (A-Z) to lowercase (a-z). Non-alphabetic symbols, accents, and numbers remain completely intact.',
              whenToUse: 'Essential for sanitizing corporate email addresses, usernames, and database key joins where case mismatch causes lookup failures (#N/A).',
              parameters: [
                { name: 'text', description: 'The text string or cell reference you wish to convert to lowercase.' }
              ],
              example: {
                scenario: 'Generating Standard Corporate Emails and Usernames',
                input: 'Cell B2 = "Sarah.Jenkins@Company.COM"',
                formula: '=LOWER(B2)',
                output: '"sarah.jenkins@company.com"',
                explanation: 'Normalizes mixed-case and all-caps email entries into uniform lowercase addresses for mailing systems and CRM imports.'
              },
              tip: 'Combine with concatenation to generate automated login IDs: =LOWER(LEFT(B2,1) & C2 & "@company.com").'
            },
            {
              id: 'proper',
              name: '= PROPER ()',
              type: 'formula',
              syntax: '=PROPER(text)',
              purpose: 'Capitalizes the first letter in each word and converts all other letters to lowercase.',
              functionDescription: 'Parses the input string and capitalizes the first letter of each distinct word (any character sequence preceded by a space or punctuation) while forcing every subsequent character in that word to lowercase.',
              whenToUse: 'Ideal for fixing haphazardly entered customer names, city names, job titles, and mailing addresses where respondents typed in ALL CAPS or careless lowercase.',
              parameters: [
                { name: 'text', description: 'The text string, formula, or cell reference to format in title case.' }
              ],
              example: {
                scenario: 'Formatting Inconsistent Customer Names for Client Invoices',
                input: 'Cell B2 = "mARcUs cHeN" | City = "vANCOUVER, cAnAdA"',
                formula: '=PROPER(B2)',
                output: '"Marcus Chen"',
                explanation: 'Automatically detects word boundaries and applies proper publication-grade title capitalization.'
              },
              tip: 'Be aware: PROPER capitalizes any letter following a punctuation mark or hyphen (e.g. "O\'Connor" or "Anne-Marie" remains properly formatted).'
            },
            {
              id: 'trim',
              name: '= TRIM ()',
              type: 'formula',
              syntax: '=TRIM(text)',
              purpose: 'Removes all leading, trailing, and duplicate spaces between words, leaving only single spaces.',
              functionDescription: 'Strips all ASCII space characters (code 32) from the far beginning and far end of a string, and reduces any sequence of two or more consecutive spaces between words down to a single space.',
              whenToUse: 'Mandatory first step when importing CSV/ERP exports. Invisible trailing spaces cause VLOOKUP, COUNTIF, and filter criteria to fail silently (#N/A or 0 matches) because "Road Bikes " does not equal "Road Bikes".',
              parameters: [
                { name: 'text', description: 'The cell containing extra whitespace.' }
              ],
              example: {
                scenario: 'Purging Invisible Spaces that Break VLOOKUP and Filters',
                input: 'Cell B2 = "   Road Bikes   " (contains 3 leading & 3 trailing spaces)',
                formula: '=TRIM(B2)',
                output: '"Road Bikes"',
                explanation: 'Strips outer spaces so that "Road Bikes " becomes exactly equal to "Road Bikes" in conditional comparisons.'
              },
              tip: 'Best practice: Nest with other string functions: =PROPER(TRIM(B2)) cleans spacing and casing in one step.'
            },
            {
              id: 'sum',
              name: '= SUM ()',
              type: 'formula',
              syntax: '=SUM(number1, [number2], ...)',
              purpose: 'Adds all numbers in a specified range of cells.',
              functionDescription: 'Calculates the mathematical arithmetic sum of all numeric values across a contiguous or non-contiguous cell range. Text values, empty cells, and logical values in ranges are automatically ignored.',
              whenToUse: 'Tallying sales revenue, order volumes, budget expenditures, and payroll totals across rows or columns.',
              parameters: [
                { name: 'number1', description: 'The first number, cell reference, or continuous range (e.g. R2:R21).' },
                { name: 'number2', description: '[Optional] Additional individual numbers or ranges to sum.' }
              ],
              example: {
                scenario: 'Calculating Total Sales Revenue Across All Transactions',
                input: 'Revenue Column R2:R21 contains sales from $950 to $3,600',
                formula: '=SUM(R2:R21)',
                output: '$34,345.00',
                explanation: 'SUM automatically aggregates all 20 numeric entries in column R while ignoring header labels.'
              },
              tip: 'Shortcut: Select the cell directly beneath a numeric column and press Alt + = (Windows) for instant AutoSum.'
            },
            {
              id: 'flash_fill',
              name: 'Flash Fill (Split Name & Combine Name)',
              type: 'feature',
              shortcut: 'Ctrl + E (Windows) / Data Ribbon > Flash Fill',
              purpose: 'Automatically senses patterns in your typing and instantly splits or merges text columns across datasets.',
              functionDescription: 'Microsoft Excel predictive pattern-recognition engine. Examines the relationship between adjacent columns and your manually typed example in row 1, infers the underlying transformation algorithm, and extrapolates it down all rows in the dataset.',
              whenToUse: 'Use when rapidly splitting compound full names into first/last names, extracting domain names from email lists, or reformatting phone numbers without drafting complex MID/FIND formulas.',
              subsections: [
                {
                  subtitle: 'A. Split Full Customer Name into First Name (Flash_Fill_Data Sheet)',
                  workflow: '1. In the lab workbook, click the dedicated "Flash_Fill_Data" sheet tab at the bottom.\n2. In Column B ("Full Customer Name"), notice 20 customer records starting with "Sarah Jenkins" in row 2.\n3. Select cell C2 ("Extracted First Name"), type the first name pattern "Sarah", and press Enter.\n4. Press Ctrl + E (or click Data Ribbon > Flash Fill). Excel instantly detects the pattern and extracts "Marcus", "Elena", "Amara" across all 20 rows.'
                },
                {
                  subtitle: 'B. Combine First & Last Names into Full Customer Name (Flash_Fill_Data Sheet)',
                  workflow: '1. On the Flash_Fill_Data sheet, Column D provides First Names ("Sarah") and Column E provides Last Names ("Jenkins").\n2. Select cell F2 ("Combined Full Name"), type "Sarah Jenkins", and press Enter.\n3. Press Ctrl + E (or click Data Ribbon > Flash Fill). Excel merges both columns into complete full customer names across all 20 records automatically.'
                }
              ],
              tip: 'Flash Fill outputs static values (not dynamic formulas). The source customer records are present in the dedicated Flash_Fill_Data tab at the bottom of the lab workbook.'
            }
          ]
        },
        {
          id: 'ch2',
          number: 2,
          title: 'Structured Tables, Hyperlinks & Validation',
          description: 'Format data into dynamic Excel Tables, create internal and external file Hyperlinks, highlight duplicates with Conditional Formatting, and control user inputs with Data Validation.',
          topics: [
            {
              id: 'auto_format_table',
              name: 'Auto Format Table (Structured Tables)',
              type: 'feature',
              shortcut: 'Ctrl + T (or Home > Format as Table)',
              purpose: 'Converts a plain cell range into a dynamic, structured Excel Table with built-in sorting, filtering, zebra striping, and auto-expanding formulas.',
              functionDescription: 'Converts a standard rectangular 2D range into a designated ListObject. Enforces column headers, applies alternating row shading (banded rows), mounts header filter controls, and enables structured column formula referencing.',
              whenToUse: 'Universal best practice before performing data analysis. Structured tables automatically expand when new records are added, updating connected charts and pivot tables dynamically.',
              workflow: [
                '1. Click anywhere inside your data set (A1:U21).',
                '2. Press Ctrl + T (or click Home > Format as Table > pick a style).',
                '3. Check "My table has headers" and click OK.',
                '4. Benefits unlocked immediately: Automatic filter arrows on headers, calculated columns that auto-copy down, and structured references like [@[Revenue]] - [@[Cost]].'
              ],
              tip: 'Tables automatically expand when new rows are added at the bottom, updating charts and formulas instantly.'
            },
            {
              id: 'hyperlink_internal',
              name: 'Hyperlink Formula (Within the Table / Sheet Tabs)',
              type: 'formula',
              syntax: '=HYPERLINK("#SheetName!Cell", [friendly_name]) or =HYPERLINK("#Cell", [friendly_name])',
              purpose: 'Creates an interactive clickable link that jumps directly to another sheet tab or cell within the same workbook table.',
              functionDescription: 'Evaluates an intra-workbook destination path prefixed with a pound symbol "#". When clicked, transfers user focus directly to the target tab (e.g. Employee_Master) or cell bookmark (e.g. A20) instantly.',
              whenToUse: 'Building multi-tab executive dashboards, clickable table indexes, or jumping directly from a transaction summary sheet (Bike_Sales) to a master roster sheet (Employee_Master) without hunting through sheet tabs.',
              parameters: [
                { name: 'link_location', description: 'The target destination preceded by "#", formatted as "#SheetName!Cell" (e.g. "#Employee_Master!A1") or "#Cell" (e.g. "#A20").' },
                { name: 'friendly_name', description: 'The clickable label displayed in the cell (e.g. "View Employee Roster" or "Jump to Row 20").' }
              ],
              example: {
                scenario: 'Transferring to Employee Master Sheet from Sales Table',
                input: 'Cell U12 on Bike_Sales sheet references Employee_Master tab at cell A1',
                formula: '=HYPERLINK("#Employee_Master!A1", "View Employee Roster")',
                output: 'Clickable blue link "View Employee Roster"',
                explanation: 'Clicking cell U12 immediately transfers focus to the Employee_Master sheet tab and highlights cell A1.'
              },
              tip: 'CRITICAL RULE: The "#" hashtag is mandatory for intra-workbook and cross-sheet links in Excel. Format: =HYPERLINK("#Sheet_Name!A1", "Label").'
            },
            {
              id: 'hyperlink_external',
              name: 'Hyperlink Formula (Using Another Excel File)',
              type: 'formula',
              syntax: '=HYPERLINK("[FilePath\\Workbook.xlsx]SheetName!Cell", [friendly_name])',
              purpose: 'Creates a clickable link that opens a separate, external Excel workbook on your computer or network.',
              functionDescription: 'Encodes an operating-system or network file path pointing to an external workbook file, targeting a specific sheet and cell inside that external file.',
              whenToUse: 'Linking current transaction sheets to annual external audit ledgers, referencing external supplier rate cards, or linking out to external intranet document servers.',
              parameters: [
                { name: 'link_location', description: 'The path and filename enclosed in square brackets, followed by sheet name and cell (e.g. "[Employee_Roster_2024.xlsx]Sheet1!A1").' },
                { name: 'friendly_name', description: 'The display label (e.g. "Open Employee Master File").' }
              ],
              example: {
                scenario: 'Linking the Bike Sales Workbook to an External Employee Roster File',
                input: 'External file "Employee_Roster_2024.xlsx" located in the same working folder',
                formula: '=HYPERLINK("[Employee_Roster_2024.xlsx]Sheet1!A1", "Open Employee Master File")',
                output: 'Clickable link that launches the external workbook in Excel',
                explanation: 'Provides seamless one-click cross-workbook navigation for audit trails and external master records.'
              },
              tip: 'If both workbooks reside in the same folder, you can omit the drive letter and use relative pathing: "[Sales_Data.xlsx]Sheet1!A1".'
            },
            {
              id: 'conditional_formatting_duplicates',
              name: 'Conditional Formatting & Highlighting Duplicate Data',
              type: 'feature',
              shortcut: 'Home Ribbon > Conditional Formatting > Highlight Cells Rules > Duplicate Values',
              purpose: 'Visually tags duplicate values across customer IDs, emails, or order numbers in soft red or yellow for immediate audit.',
              functionDescription: 'Evaluates the selected cell range against a frequency count array and applies distinctive background and typography styles to any value that appears more than once.',
              whenToUse: 'Spotting duplicate transaction records, identifying returning customers, and cleaning dirty contact lists.',
              workflow: [
                '1. Select the column range you want to audit (e.g. Country column H2:H21).',
                '2. On the Home ribbon, click Conditional Formatting > Highlight Cells Rules > Duplicate Values...',
                '3. Choose the formatting style: "Light Red Fill with Dark Red Text".',
                '4. Click OK. All rows containing recurring values instantly glow red.'
              ],
              tip: 'You can change the dropdown from "Duplicate" to "Unique" to find one-off specialty transactions.'
            },
            {
              id: 'data_validation',
              name: 'Data Validation (Dropdown Lists & Input Rules)',
              type: 'feature',
              shortcut: 'Data Ribbon > Data Tools > Data Validation (Alt + A + V + V)',
              purpose: 'Restricts user data entry to pre-approved dropdown lists, numeric ranges, or dates to prevent typos.',
              functionDescription: 'Applies input filtering constraints to designated worksheet cells. Replaces free-text typing with interactive dropdown pickers or enforces numeric boundaries (e.g. numbers between 1 and 1000).',
              whenToUse: 'Preventing user typos ("Austrlia" vs "Australia", "US" vs "United States") that corrupt reporting and break formulas.',
              workflow: [
                '1. Select the target cells (e.g. Country column H2:H21).',
                '2. Click Data > Data Validation.',
                '3. Under the "Settings" tab, set Allow to: "List".',
                '4. In the Source box, enter comma-separated values: "Australia, Canada, Germany, France, United Kingdom, United States".',
                '5. Click OK. Every cell now features an interactive dropdown arrow.'
              ],
              tip: 'To prevent invalid numbers, choose Allow: "Whole number" and set Between: Minimum 1, Maximum 999.'
            }
          ]
        },
        {
          id: 'ch3',
          number: 3,
          title: 'Conditional Analytics & Decision Logic',
          description: 'Calculate metrics conditionally based on single criteria using COUNTIF and SUMIF, and construct logical branching decision trees using the IF function.',
          topics: [
            {
              id: 'countif',
              name: '= COUNTIF ()',
              type: 'formula',
              syntax: '=COUNTIF(range, criteria)',
              purpose: 'Counts the number of cells in a range that meet a specific single condition.',
              functionDescription: 'Scans every cell within the specified range and increments the counter by 1 each time a cell matches the given criteria. Criteria can be a number, expression, cell reference, text string, or wildcard (*, ?).',
              whenToUse: 'Auditing data volumes (e.g. how many orders from Germany), tallying customer feedback scores, or detecting inventory shortages.',
              parameters: [
                { name: 'range', description: 'The range of cells you want to evaluate (e.g. H2:H21 for Country).' },
                { name: 'criteria', description: 'The condition that defines which cells to count (e.g. "Germany", ">1000", or cell reference).' }
              ],
              example: {
                scenario: 'Counting How Many Orders Were Placed from Germany',
                input: 'H2:H21 contains countries ("Australia", "Germany", "United States", etc.)',
                formula: '=COUNTIF(H2:H21, "Germany")',
                output: '4',
                explanation: 'Scans the 20 orders in column H and counts every row where the country equals "Germany".'
              },
              tip: 'Always enclose text and comparison operators in double quotes (e.g. ">500"). For cell references with operators, use: ">=" & D2.'
            },
            {
              id: 'sumif',
              name: '= SUMIF ()',
              type: 'formula',
              syntax: '=SUMIF(range, criteria, [sum_range])',
              purpose: 'Adds the values in a range that meet a specified single condition.',
              functionDescription: 'Evaluates each cell in range against the criteria. Whenever a match is found, adds the corresponding value in sum_range. If sum_range is omitted, the cells in range itself are summed.',
              whenToUse: 'Calculating total revenue generated by a specific country, department payroll costs, or total sales by product category.',
              parameters: [
                { name: 'range', description: 'The range of cells to evaluate against the criteria (e.g. H2:H21 for Country).' },
                { name: 'criteria', description: 'The condition that determines which cells to add (e.g. "Canada").' },
                { name: 'sum_range', description: '[Optional] The actual cells to sum (e.g. R2:R21 for Revenue).' }
              ],
              example: {
                scenario: 'Calculating Total Sales Revenue Generated Exclusively by Canada',
                input: 'Country in H2:H21, Revenue in R2:R21',
                formula: '=SUMIF(H2:H21, "Canada", R2:R21)',
                output: '$5,300.00',
                explanation: 'Looks in column H for "Canada", and when found, adds the corresponding revenue in column R.'
              },
              tip: 'Common exam trap: Ensure range and sum_range have the exact same number of rows (e.g. H2:H21 and R2:R21).'
            },
            {
              id: 'if',
              name: '= IF ()',
              type: 'formula',
              syntax: '=IF(logical_test, value_if_true, [value_if_false])',
              purpose: 'Evaluates a condition and returns one value if TRUE, and another if FALSE.',
              functionDescription: 'Executes a logical comparison (using =, >, <, >=, <=, <>). If the test evaluates to boolean TRUE, returns value_if_true; otherwise, returns value_if_false. If value_if_false is omitted, returns FALSE.',
              whenToUse: 'Segmenting transactions (High vs Standard Profit), calculating commission tiers, setting compliance flags, or suppressing divide-by-zero errors.',
              parameters: [
                { name: 'logical_test', description: 'A condition that evaluates to TRUE or FALSE (e.g. S2 >= 500).' },
                { name: 'value_if_true', description: 'The value or calculation returned if the test is TRUE.' },
                { name: 'value_if_false', description: 'The value or calculation returned if the test is FALSE.' }
              ],
              example: {
                scenario: 'Classifying Transactions as "High Profit" vs "Standard Profit"',
                input: 'Profit Column S2 = 550',
                formula: '=IF(S2 >= 500, "High Profit", "Standard Profit")',
                output: '"High Profit"',
                explanation: 'Since $550 is greater than or equal to $500, the condition is TRUE and returns "High Profit".'
              },
              tip: 'Nested IF example for tiers: =IF(S2 >= 600, "Tier A", IF(S2 >= 400, "Tier B", "Tier C")).'
            }
          ]
        },
        {
          id: 'ch4',
          number: 4,
          title: 'Visual Dashboarding & Relational Lookups',
          description: 'Render in-cell Data Bars, plot analytical Charts, connect interactive Slicers, and perform vertical cross-table relational joins with VLOOKUP.',
          topics: [
            {
              id: 'data_bars',
              name: 'Conditional Formatting Data Bars',
              type: 'feature',
              shortcut: 'Home Ribbon > Conditional Formatting > Data Bars',
              purpose: 'Displays horizontal proportional colored bars inside table cells, visualizing performance and volume without separate charts.',
              functionDescription: 'Computes the minimum and maximum numeric values across a selected range and renders in-cell horizontal gradient fills proportional to each cell value.',
              whenToUse: 'Executive dashboards and financial scorecards. Allows readers to compare revenue, profit margins, or inventory volumes at a glance directly inside tables.',
              workflow: [
                '1. Select your numeric column (e.g. Revenue column R2:R21 or Profit column S2:S21).',
                '2. Click Home > Conditional Formatting > Data Bars.',
                '3. Choose "Gradient Fill" (e.g. Green or Blue) or "Solid Fill".',
                '4. Each cell now renders an in-cell bar proportional to the highest and lowest values in the column.'
              ],
              tip: 'Click Conditional Formatting > Manage Rules > Edit Rule > check "Show Bar Only" to hide raw numbers and show clean graphical bars.'
            },
            {
              id: 'excel_charts',
              name: 'Excel Charts (Column, Bar & Trend Visualizations)',
              type: 'feature',
              shortcut: 'Insert Ribbon > Charts (Alt + F1 for instant chart)',
              purpose: 'Transforms tabular datasets into clear visual charts (Column, Clustered Bar, Line) to spot trends and top performers.',
              functionDescription: 'Translates selected numeric data series and category labels into graphical coordinate visualizations (Clustered Column, Bar, Line).',
              whenToUse: 'Communicating high-level insights to executive stakeholders, comparing performance across countries, or identifying seasonal sales spikes.',
              workflow: [
                '1. Select your comparison data (e.g. Country in H1:H21 and Revenue in R1:R21).',
                '2. Click Insert > Recommended Charts (or 2-D Clustered Column).',
                '3. Click the Chart Title to rename it: "Total Revenue by Country".',
                '4. Use the Chart Tools to toggle Data Labels and Axis Titles.'
              ],
              tip: 'Sort your source data in descending order before creating a Bar chart so the longest bars appear at the top for maximum clarity.'
            },
            {
              id: 'slicers',
              name: 'Interactive Slicers (Table & Pivot Filtering)',
              type: 'feature',
              shortcut: 'Table Design Ribbon > Insert Slicer',
              purpose: 'Provides interactive, clickable visual filter buttons that dynamically filter Tables and PivotTables with one touch.',
              functionDescription: 'Mounts a visual filtering control connected directly to an Excel Structured Table. Each unique category value appears as an interactive button that toggles row visibility instantly.',
              whenToUse: 'Building interactive executive reporting dashboards. Slicers make the currently applied filter visible to everyone, unlike hidden dropdown arrows in header rows.',
              workflow: [
                '1. Click anywhere inside an Excel Table (created with Ctrl + T).',
                '2. On the ribbon, click the "Table Design" tab > Insert Slicer.',
                '3. In the dialog, check the categories you want to filter by (e.g. "Country").',
                '4. Click OK. Interactive floating slicer panels appear above the sheet.',
                '5. Click "Germany" to filter the table instantly; hold Ctrl to select multiple values.'
              ],
              tip: 'Slicers are vastly superior to traditional dropdown filters for executive dashboards because active filters remain visible at all times.'
            },
            {
              id: 'vlookup',
              name: '= VLOOKUP ()',
              type: 'formula',
              syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
              purpose: 'Searches for a value in the leftmost column of a table, and returns a value in the same row from a specified column.',
              functionDescription: 'Performs a vertical lookup down Column 1 of table_array. Once the row containing lookup_value is matched, counts over col_index_num columns to the right on that exact row and retrieves the cell value. Range_lookup controls exact (FALSE) vs approximate (TRUE) match.',
              whenToUse: 'Relational data joins. Merging employee salaries, product unit prices, tax rates, or customer addresses into transaction tables based on a shared ID without manual copy-pasting.',
              parameters: [
                { name: 'lookup_value', description: 'The value to search for (e.g. Employee ID "1005" or cell reference A2).' },
                { name: 'table_array', description: 'The master reference table range (e.g. $A$2:$F$13). Must be locked with $ signs for drag-down!' },
                { name: 'col_index_num', description: 'The column number in table_array from which to retrieve data (Col 1 is leftmost).' },
                { name: 'range_lookup', description: 'FALSE or 0 for an EXACT MATCH (mandatory for 99% of business lookups); TRUE or 1 for approximate match.' }
              ],
              example: {
                scenario: 'Retrieving Employee #1005\'s Salary from Master Payroll Roster',
                input: 'Lookup ID = "1005" in cell A2. Master Roster table in $A$2:$F$13, where Column 6 is Salary.',
                formula: '=VLOOKUP(1005, A2:F13, 6, FALSE)',
                output: '$92,000',
                explanation: 'VLOOKUP searches column A for "1005", finds David Kim on row 6, moves across to column 6, and extracts $92,000.'
              },
              tip: 'Top 3 VLOOKUP Exam Traps:\n1. The lookup value MUST exist in the leftmost column of table_array.\n2. Always lock table_array with absolute references ($A$2:$F$13) before dragging down.\n3. Always specify FALSE as the 4th argument to avoid incorrect approximate matches.'
            }
          ]
        }
      ]
    },

    sql_world: {
      id: 'sql_world',
      moduleNumber: 2,
      title: 'Module 2: SQL Around the World',
      subtitle: 'Filtering Fundamentals, String Pattern Matching & Relational Clauses',
      color: 'blue',
      badgeText: 'SELECT, WHERE, Operators',
      labId: 'sql_around_the_world',
      labName: 'Launch Module 2 SQL Lab',
      schemaOverview: 'Tables: countries (country, continent, population, area, ccd) • shapes (shape, color, dots, xloc, yloc)',
      sections: [
        {
          title: '1. Core Query Anatomy: SELECT & FROM',
          functionalPurpose: 'FROM specifies the relational table to scan and load into the query engine memory. SELECT specifies the exact column attributes to extract and project into the final output dataset (or "*" to retrieve every column).',
          executionOrder: 'Logical Execution Order: 1. FROM (Scans and accesses the table) -> 2. SELECT (Projects specified column expressions). Note: Even though SELECT is written first syntactically, it executes AFTER the FROM clause.',
          content: 'The foundation of all SQL queries. `SELECT` specifies the columns to retrieve, and `FROM` specifies the table.',
          code: '-- Retrieve specific columns\nSELECT country, continent, population\nFROM countries;\n\n-- Retrieve all columns\nSELECT *\nFROM countries;',
          examPitfalls: 'Exam Pitfall: Omitting commas between column names (e.g. "SELECT country continent FROM countries") causes SQL to treat the second column as an alias ("country AS continent"). Never use double quotes for string values—SQL uses single quotes for text literals.'
        },
        {
          title: '2. Conditional Row Filtering: WHERE Clause',
          functionalPurpose: 'Evaluates a boolean conditional test against every individual candidate row loaded by FROM. Only records evaluating to TRUE survive to downstream processing; rows evaluating to FALSE or NULL are immediately discarded.',
          executionOrder: 'Logical Execution Order: 1. FROM -> 2. WHERE (Row-by-row filtering) -> 3. SELECT (Column projection). Because WHERE executes before SELECT, you cannot filter by column aliases created in SELECT.',
          content: 'The `WHERE` clause filters records so only rows meeting the criteria are returned.',
          code: '-- Exact match on text (enclosed in single quotes)\nSELECT country, population\nFROM countries\nWHERE continent = \'Europe\';\n\n-- Numeric threshold comparison (never quote numbers!)\nSELECT country, population\nFROM countries\nWHERE population >= 100000000;',
          examPitfalls: 'Exam Pitfall: Never quote numeric values (e.g. WHERE population > \'100000000\'). Quoting forces a lexicographical string comparison where "9" is considered greater than "100000000". Use standard comparison operators: =, !=, <, >, <=, >=.'
        },
        {
          title: '3. Advanced Operators: BETWEEN, IN, LIKE & IS NULL',
          functionalPurpose: 'Provides concise boolean predicates: BETWEEN tests closed continuous numerical ranges; IN matches against a discrete list of candidate values; LIKE performs character pattern matching with wildcards (% for any characters, _ for one character); IS NULL checks for unrecorded or missing data.',
          executionOrder: 'Logical Execution Order: Evaluated within the WHERE stage for each candidate row before any projection or sorting takes place.',
          content: 'Combining conditions with specialized filtering operators:',
          code: '-- BETWEEN is inclusive of both lower and upper bounds\nSELECT country, area\nFROM countries\nWHERE area BETWEEN 100000 AND 500000;\n\n-- IN matches any item in a discrete list\nSELECT country, continent\nFROM countries\nWHERE continent IN (\'South America\', \'Oceania\');\n\n-- LIKE with wildcards (% = any characters, _ = 1 character)\nSELECT country\nFROM countries\nWHERE country LIKE \'United%\'; -- Matches "United States", "United Kingdom"',
          examPitfalls: 'Exam Pitfalls:\n1. The NULL Trap: Never write "WHERE capital = NULL". In SQL three-valued logic, NULL equals nothing (not even itself). Always use "IS NULL" or "IS NOT NULL".\n2. The BETWEEN Trap: BETWEEN is inclusive of both endpoints (x BETWEEN 10 AND 50 means x >= 10 AND x <= 50).'
        },
        {
          title: '4. Critical Traps & Pitfalls (Exam Survival Guide)',
          isTrap: true,
          traps: [
            {
              trap: 'The NULL Comparison Trap',
              wrong: 'WHERE capital = NULL  -- WRONG! Never returns any rows',
              correct: 'WHERE capital IS NULL  -- CORRECT! Use IS NULL or IS NOT NULL',
              explanation: 'In SQL, NULL represents unknown data. Nothing can be equal to NULL (not even NULL = NULL), so you must use the special "IS NULL" operator.'
            },
            {
              trap: 'The String Quoting Trap',
              wrong: 'WHERE population > \'1000000\'  -- Risky string comparison\nWHERE continent = Europe      -- Error: unknown column Europe',
              correct: 'WHERE population > 1000000   -- Numbers are never quoted\nWHERE continent = \'Europe\'    -- Strings MUST use single quotes',
              explanation: 'Unquoted text is interpreted by the database engine as a column identifier.'
            },
            {
              trap: 'The BETWEEN Inclusivity Trap',
              wrong: '-- Expecting strict greater-than:\nWHERE population BETWEEN 10 AND 50',
              correct: '-- Remember: BETWEEN 10 AND 50 includes 10 and includes 50!\n-- If you need strict inequality, use: WHERE population > 10 AND population < 50',
              explanation: 'BETWEEN x AND y is always equivalent to: >= x AND <= y.'
            }
          ]
        }
      ]
    },

    sql_ordering: {
      id: 'sql_ordering',
      moduleNumber: 3,
      title: 'Module 3: Ordering and Limiting',
      subtitle: 'Sorting Data, Multi-Column Tiebreakers & Pagination with LIMIT and OFFSET',
      color: 'indigo',
      badgeText: 'ORDER BY, LIMIT, OFFSET',
      labId: 'ordering_and_limiting',
      labName: 'Launch Module 3 Ordering Lab',
      schemaOverview: 'Tables: moons (moon, planet, radius, density) • animals (name, order, sleep_total, awake, brainwt, bodywt) • countries',
      sections: [
        {
          title: '1. Sorting Results with ORDER BY (ASC vs DESC)',
          functionalPurpose: 'Sorts the intermediate query result set in either ascending (ASC, smallest to largest, A to Z) or descending (DESC, largest to smallest, Z to A) order based on one or more column expressions.',
          executionOrder: 'Logical Execution Order: 1. FROM -> 2. WHERE -> 3. SELECT -> 4. ORDER BY (Sorts the projected result rows). Because ORDER BY executes AFTER SELECT, you can sort by calculated aliases defined in SELECT.',
          content: 'By default, SQL returns rows in indeterminate order unless you explicitly specify `ORDER BY`. Default direction is `ASC` (ascending, low-to-high). Use `DESC` for descending (high-to-low).',
          code: '-- Ascending alphabetically (A to Z)\nSELECT moon, planet\nFROM moons\nORDER BY moon ASC;\n\n-- Descending by size (Largest to smallest)\nSELECT moon, radius\nFROM moons\nORDER BY radius DESC;',
          examPitfalls: 'Exam Pitfall: Omitting the sort direction defaults to ASC (ascending). When an exam question asks for the "top 5 largest" or "highest revenue", you must explicitly append DESC, or you will get the smallest records!'
        },
        {
          title: '2. Multi-Column Tiebreakers',
          functionalPurpose: 'Provides deterministic secondary and tertiary sorting when primary sort keys contain identical values. If multiple rows share the same value in Column 1, SQL evaluates Column 2 to establish final rank.',
          executionOrder: 'Logical Execution Order: Evaluated during the ORDER BY stage. The engine checks column 1 first; only ties in column 1 trigger sorting on column 2.',
          content: 'When sorting by a column with duplicate values (e.g. planet or continent), provide secondary columns to break ties deterministically.',
          code: '-- Sort by planet alphabetically, then largest moon first within each planet\nSELECT moon, planet, radius\nFROM moons\nORDER BY planet ASC, radius DESC;',
          examPitfalls: 'Exam Pitfall: Make sure to specify the direction for EACH column separated by commas: "ORDER BY planet ASC, radius DESC". Writing "ORDER BY planet, radius DESC" sorts planet ascending (by default) and radius descending.'
        },
        {
          title: '3. Top-N Slicing and Pagination with LIMIT & OFFSET',
          functionalPurpose: 'LIMIT restricts the maximum row count returned to client applications. OFFSET skips the first m rows before beginning row collection, forming the foundation for database pagination.',
          executionOrder: 'Logical Execution Order: 1. FROM -> 2. WHERE -> 3. SELECT -> 4. ORDER BY -> 5. LIMIT & OFFSET. LIMIT is always the final operation executed in the relational query pipeline.',
          content: '`LIMIT n` restricts the total number of rows returned. `OFFSET m` skips the first m rows (essential for pagination).',
          code: '-- Top 5 largest moons in the solar system\nSELECT moon, planet, radius\nFROM moons\nORDER BY radius DESC\nLIMIT 5;\n\n-- Paginating results: Skip the top 5, fetch the next 5 (Ranks 6 to 10)\nSELECT moon, planet, radius\nFROM moons\nORDER BY radius DESC\nLIMIT 5 OFFSET 5;',
          examPitfalls: 'Exam Pitfalls:\n1. Execution Placement: In SQL syntax, ORDER BY must ALWAYS precede LIMIT. Placing LIMIT before ORDER BY causes a fatal syntax error.\n2. Always pair LIMIT with ORDER BY for deterministic, reproducible results.'
        },
        {
          title: '4. Critical Traps & Pitfalls (Exam Survival Guide)',
          isTrap: true,
          traps: [
            {
              trap: 'The LIMIT Execution Order Trap',
              wrong: 'SELECT moon FROM moons LIMIT 5 ORDER BY radius DESC; -- SYNTAX ERROR',
              correct: 'SELECT moon FROM moons ORDER BY radius DESC LIMIT 5; -- CORRECT',
              explanation: 'In SQL syntax and execution order, ORDER BY must ALWAYS precede LIMIT and OFFSET. The engine must sort the complete dataset first before slicing off the top rows.'
            },
            {
              trap: 'The Unstable Pagination Trap',
              wrong: 'SELECT moon, planet FROM moons ORDER BY planet LIMIT 5 OFFSET 5;',
              correct: 'SELECT moon, planet FROM moons ORDER BY planet, moon LIMIT 5 OFFSET 5;',
              explanation: 'If the sort column has identical duplicate values, the engine may return different rows on different executions unless you include a unique primary key as the final tiebreaker.'
            }
          ]
        }
      ]
    },

    sql_movies: {
      id: 'sql_movies',
      moduleNumber: 4,
      title: 'Module 4: Successful Movies',
      subtitle: 'Multi-Clause Analytical Queries, Financial Thresholds & Critical Rating Evaluations',
      color: 'amber',
      badgeText: 'SELECT, WHERE, Comparisons',
      labId: 'successful_movies',
      labName: 'Launch Module 4 Movies Lab',
      schemaOverview: 'Table: `movies` (imdbid INT, title VARCHAR, year INT, budget FLOAT, revenue FLOAT, mpaa VARCHAR, ravg FLOAT)',
      sections: [
        {
          title: '1. Cinematic Data Exploration: Projections & Scale',
          functionalPurpose: 'Explores a multi-attribute 50-year cinema dataset (1965–2015). Projects release years, titles, weighted audience ratings (ravg), and box office metrics.',
          executionOrder: 'Logical Execution Order: 1. FROM movies -> 2. SELECT title, year, ravg.',
          content: 'The 50-year movies database covers cinema from 1965 to 2015. Important characteristics to keep in mind:\n• `budget` and `revenue` figures are recorded in millions of dollars (e.g., 200 = $200,000,000; 2790 = $2.79B).\n• `ravg` stores weighted average critic & audience ratings on a 0.0 to 10.0 scale.\n• `mpaa` captures content classifications (G, PG, PG13, R, NR).',
          code: '-- Retrieve top 5 critically acclaimed films of all time\nSELECT title, year, ravg\nFROM movies\nORDER BY ravg DESC\nLIMIT 5;',
          examPitfalls: 'CRITICAL SCALE TRAP: In this dataset, all budget and revenue figures are recorded in MILLIONS of dollars (e.g. 200 represents $200M; 1000 represents $1 Billion). Searching for "WHERE revenue > 1000000000" will return zero rows! Use "WHERE revenue > 1000".'
        },
        {
          title: '2. Column-to-Column Financial Comparisons',
          functionalPurpose: 'Executes row-level algebraic and relational comparisons between two distinct numeric attributes in the same record (e.g. testing whether revenue > budget for profit, or revenue < budget for loss).',
          executionOrder: 'Logical Execution Order: Evaluated during the WHERE row-filtering phase for every candidate row.',
          content: 'SQL allows comparing one column against another within the same row. This is essential for determining financial performance, such as whether a film made a box-office profit or suffered a loss.',
          code: '-- Acclaimed cult classics that lost money at the box office (revenue < budget)\nSELECT title, year, budget, revenue, ravg\nFROM movies\nWHERE revenue < budget AND ravg >= 8.5\nORDER BY ravg DESC;',
          examPitfalls: 'Exam Pitfall: Never put quotes around column identifiers in expressions! Writing "WHERE revenue < \'budget\'" compares the revenue number against the literal string "budget" instead of evaluating the column value. Identifiers must remain unquoted.'
        },
        {
          title: '3. Multi-Clause Precision: WHERE, AND/OR, ORDER BY & LIMIT',
          functionalPurpose: 'Constructs complete relational pipelines integrating multi-condition cohort filters, boolean precedence, directional sorting, and top-N window limits.',
          executionOrder: 'Logical Execution Order: 1. FROM -> 2. WHERE -> 3. SELECT -> 4. ORDER BY -> 5. LIMIT.',
          content: 'Combine multiple logical criteria using AND/OR with directional sorting to extract targeted business cohorts.',
          code: '-- Top earning PG-13 blockbusters of the 21st century\nSELECT title, year, budget, revenue\nFROM movies\nWHERE mpaa = \'PG13\' AND year >= 2000\nORDER BY revenue DESC\nLIMIT 8;',
          examPitfalls: 'Exam Pitfall: Boolean operator precedence: AND evaluates before OR. When mixing AND and OR, always enclose the OR clauses in parentheses: WHERE (mpaa = \'PG13\' OR mpaa = \'R\') AND year >= 2010.'
        },
        {
          title: '4. Critical Traps & Pitfalls (Exam Survival Guide)',
          isTrap: true,
          traps: [
            {
              trap: 'The Scale & Units Trap (Millions of Dollars)',
              wrong: 'WHERE revenue > 1000000000  -- WRONG! Never matches (units are in millions)',
              correct: 'WHERE revenue > 1000        -- CORRECT! 1,000 represents $1 Billion in this dataset',
              explanation: 'Always inspect column units before applying numeric filters. In the movies table, figures are denominated in millions.'
            },
            {
              trap: 'The Column-to-Column Comparison Syntax Trap',
              wrong: 'WHERE revenue < "budget"  -- WRONG! Compares revenue to string literal "budget"',
              correct: 'WHERE revenue < budget    -- CORRECT! Unquoted column identifiers compare row values',
              explanation: 'Never quote column names in expressions. Quotes turn identifiers into string literals.'
            },
            {
              trap: 'The Sorting Direction Trap (ASC vs DESC)',
              wrong: '-- Seeking highest-rated movies:\nORDER BY ravg ASC LIMIT 5  -- WRONG! Returns worst-rated movies (0.8, 1.2)',
              correct: 'ORDER BY ravg DESC LIMIT 5 -- CORRECT! DESC sorts from highest (9.7) to lowest',
              explanation: 'Default sort is ASC (lowest first). Always specify DESC when querying top performers or highest metrics.'
            }
          ]
        }
      ]
    }
  };

  // -----------------------------------------------------------------------
  // CONTROLLER STATE
  // -----------------------------------------------------------------------
  let currentActiveTab = 'lessons'; // 'lessons' (default / first) or 'activities'
  let currentModuleId = 'excel';    // 'excel', 'sql_world', 'sql_ordering', 'sql_movies'
  let currentExcelChapterIndex = 0; // 0: Ch1, 1: Ch2, 2: Ch3, 3: Ch4

  // Read saved tab preference (defaults to 'lessons')
  try {
    const saved = localStorage.getItem('da101_portal_tab');
    if (saved === 'activities' || saved === 'lessons') {
      currentActiveTab = saved;
    }
  } catch (e) {}

  // -----------------------------------------------------------------------
  // PORTAL TAB SWITCHER (Curriculum First vs Activities)
  // -----------------------------------------------------------------------
  window.switchPortalTab = function (tabName) {
    if (tabName !== 'lessons' && tabName !== 'activities') tabName = 'lessons';
    currentActiveTab = tabName;
    try {
      localStorage.setItem('da101_portal_tab', tabName);
    } catch (e) {}

    const lessonsBtn = document.getElementById('portalTabBtnLessons');
    const activitiesBtn = document.getElementById('portalTabBtnActivities');
    const curriculumContainer = document.getElementById('portalCurriculumContainer');
    const activitiesContainer = document.getElementById('portalActivitiesContainer');

    if (tabName === 'lessons') {
      if (lessonsBtn) {
        lessonsBtn.className = 'flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer bg-blue-600 text-white shadow-sm';
        lessonsBtn.setAttribute('aria-selected', 'true');
      }
      if (activitiesBtn) {
        activitiesBtn.className = 'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
        activitiesBtn.setAttribute('aria-selected', 'false');
      }
      if (curriculumContainer) curriculumContainer.classList.remove('hidden');
      if (activitiesContainer) activitiesContainer.classList.add('hidden');
    } else {
      if (lessonsBtn) {
        lessonsBtn.className = 'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
        lessonsBtn.setAttribute('aria-selected', 'false');
      }
      if (activitiesBtn) {
        activitiesBtn.className = 'flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer bg-blue-600 text-white shadow-sm';
        activitiesBtn.setAttribute('aria-selected', 'true');
      }
      if (curriculumContainer) curriculumContainer.classList.add('hidden');
      if (activitiesContainer) activitiesContainer.classList.remove('hidden');
    }

    try {
      window.dispatchEvent(new CustomEvent('portaltabchange', { detail: { tab: tabName } }));
      window.dispatchEvent(new CustomEvent('curriculumprogresschange'));
    } catch (e) {}
  };

  // -----------------------------------------------------------------------
  // SELECT CURRICULUM MODULE
  // -----------------------------------------------------------------------
  window.getCurrentCurriculumModule = function () {
    return currentModuleId;
  };

  window.selectCurriculumModule = function (moduleId) {
    if (!LESSON_CURRICULUM[moduleId]) moduleId = 'excel';
    if (typeof window.isModuleAllowedByAccess === 'function' && !window.isModuleAllowedByAccess(moduleId)) {
      const access = window.__DA101_ACCESS__;
      if (access && Array.isArray(access.allowedModules) && access.allowedModules.length > 0) {
        moduleId = access.allowedModules[0];
      } else {
        return;
      }
    }
    currentModuleId = moduleId;
    renderCurriculumModuleNav();
    renderCurriculumModuleContent();
    try {
      window.dispatchEvent(new CustomEvent('curriculummodulechange', { detail: { moduleId: currentModuleId } }));
    } catch (e) {}
  };

  // -----------------------------------------------------------------------
  // SELECT EXCEL CHAPTER
  // -----------------------------------------------------------------------
  window.selectExcelChapter = function (chapterIndex) {
    currentExcelChapterIndex = chapterIndex;
    renderExcelChapterNav();
    renderExcelChapterContent();
  };

  // -----------------------------------------------------------------------
  // COPY FORMULA HELPER
  // -----------------------------------------------------------------------
  window.copyFormulaSnippet = function (text, btnElement) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      if (btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="ph ph-check text-emerald-500 dark:text-emerald-400 font-bold"></i> Copied!';
        setTimeout(() => {
          btnElement.innerHTML = originalHTML;
        }, 2000);
      }
      if (typeof window.showNotification === 'function') {
        window.showNotification('Formula snippet copied to clipboard');
      }
    });
  };

  // -----------------------------------------------------------------------
  // RENDER MODULE NAVIGATION (Harmonized Light & Dark Mode)
  // -----------------------------------------------------------------------
  function renderCurriculumModuleNav() {
    const nav = document.getElementById('curriculumModuleNav');
    if (!nav || nav.dataset.reactMounted === 'true') return;

    const modules = [
      { id: 'excel', label: 'Module 1: Excel Masterclass', badge: '18 Formulas · 4 Ch.', icon: 'ph-file-xls', activeColor: 'emerald' },
      { id: 'sql_world', label: 'Module 2: World SQL', badge: 'SELECT & WHERE', icon: 'ph-globe-hemisphere-west', activeColor: 'blue' },
      { id: 'sql_ordering', label: 'Module 3: Ordering & Limiting', badge: 'ORDER BY & LIMIT', icon: 'ph-sort-ascending', activeColor: 'indigo' },
      { id: 'sql_movies', label: 'Module 4: Successful Movies', badge: 'GROUP BY & Aggregates', icon: 'ph-film-strip', activeColor: 'amber' }
    ];

    nav.innerHTML = modules.map(m => {
      const isActive = m.id === currentModuleId;
      const activeClass = isActive
        ? 'bg-blue-600 text-white shadow-md border-blue-500'
        : 'bg-white dark:bg-[#151c2a] text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs';
      return `
        <button type="button" onclick="selectCurriculumModule('${m.id}')" class="flex-1 min-w-[200px] flex items-center justify-between p-3.5 rounded-2xl transition cursor-pointer text-left ${activeClass}">
          <div class="flex items-center gap-2.5">
            <i class="ph ${m.icon} text-lg"></i>
            <div>
              <div class="text-xs font-extrabold tracking-tight">${m.label}</div>
              <div class="text-[10px] opacity-75 font-medium">${m.badge}</div>
            </div>
          </div>
          ${isActive ? '<i class="ph ph-check-circle-fill text-sm"></i>' : ''}
        </button>
      `;
    }).join('');
  }

  // -----------------------------------------------------------------------
  // RENDER EXCEL CHAPTER NAVIGATION (Harmonized Light & Dark Mode)
  // -----------------------------------------------------------------------
  function renderExcelChapterNav() {
    const nav = document.getElementById('excelChapterNav');
    if (!nav) return;

    const chapters = LESSON_CURRICULUM.excel.chapters;
    nav.innerHTML = chapters.map((ch, idx) => {
      const isActive = idx === currentExcelChapterIndex;
      const activeClass = isActive
        ? 'bg-emerald-600 text-white shadow-sm font-extrabold border-emerald-500'
        : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700/60 shadow-xs';
      return `
        <button type="button" onclick="selectExcelChapter(${idx})" class="px-3.5 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeClass}">
          <span class="w-4 h-4 rounded-full ${isActive ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'} flex items-center justify-center text-[10px] font-bold">${ch.number}</span>
          <span>Ch ${ch.number}: ${ch.title}</span>
        </button>
      `;
    }).join('');
  }

  // -----------------------------------------------------------------------
  // RENDER EXCEL CHAPTER CONTENT (3-Part Pedagogical Breakdown)
  // -----------------------------------------------------------------------
  function renderExcelChapterContent() {
    const container = document.getElementById('excelChapterContentContainer');
    if (!container) return;

    const chapter = LESSON_CURRICULUM.excel.chapters[currentExcelChapterIndex];
    if (!chapter) return;

    let topicsHtml = chapter.topics.map(t => {
      if (t.type === 'feature' && t.subsections) {
        // Flash Fill style
        return `
          <div class="bg-white dark:bg-[#111723] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-800 dark:text-slate-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <i class="ph ph-lightning text-base"></i>
                </div>
                <div>
                  <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">${t.name}</h4>
                  <p class="text-xs text-slate-600 dark:text-slate-400">${t.purpose}</p>
                </div>
              </div>
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">${t.shortcut}</span>
            </div>

            <!-- Part 1: Function Mechanics -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10.5px] font-extrabold uppercase tracking-wide">1. Function &amp; Mechanics</span>
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                ${t.functionDescription || t.purpose}
              </div>
            </div>

            <!-- Part 2: When to Use -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10.5px] font-extrabold uppercase tracking-wide">2. When to Use</span>
              <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                <i class="ph ph-briefcase text-indigo-600 dark:text-indigo-400 text-sm shrink-0 mt-0.5"></i>
                <span>${t.whenToUse || 'Use when splitting or combining text attributes across thousands of rows rapidly without formulas.'}</span>
              </div>
            </div>

            <!-- Part 3: Real-World Scenarios -->
            <div class="space-y-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wide">3. Real-World Scenarios (Flash_Fill_Data Sheet)</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${t.subsections.map(sub => `
                  <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300">${sub.subtitle}</div>
                    <pre class="text-[11px] text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">${sub.workflow}</pre>
                  </div>
                `).join('')}
              </div>
            </div>

            ${t.tip ? `
              <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <i class="ph ph-lightbulb text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5"></i>
                <span><strong>Pro-Tip &amp; Exam Trap:</strong> ${t.tip}</span>
              </div>
            ` : ''}
          </div>
        `;
      } else if (t.type === 'feature' && t.workflow) {
        // Step-by-step Feature (Auto Format Table, Slicers, etc.)
        return `
          <div class="bg-white dark:bg-[#111723] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-800 dark:text-slate-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <i class="ph ph-wrench text-base"></i>
                </div>
                <div>
                  <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">${t.name}</h4>
                  <p class="text-xs text-slate-600 dark:text-slate-400">${t.purpose}</p>
                </div>
              </div>
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">${t.shortcut}</span>
            </div>

            <!-- Part 1: Function Mechanics -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10.5px] font-extrabold uppercase tracking-wide">1. Function &amp; Mechanics</span>
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                ${t.functionDescription || t.purpose}
              </div>
            </div>

            <!-- Part 2: When to Use -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10.5px] font-extrabold uppercase tracking-wide">2. When to Use</span>
              <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                <i class="ph ph-briefcase text-indigo-600 dark:text-indigo-400 text-sm shrink-0 mt-0.5"></i>
                <span>${t.whenToUse || 'Use when building standardized reports and interactive analytical models.'}</span>
              </div>
            </div>

            <!-- Part 3: Step-by-Step Workflow -->
            <div class="space-y-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wide">3. Step-by-Step Practical Workflow</span>
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                ${t.workflow.map(step => `<div class="leading-relaxed">${step}</div>`).join('')}
              </div>
            </div>

            ${t.tip ? `
              <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <i class="ph ph-lightbulb text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5"></i>
                <span><strong>Pro-Tip &amp; Exam Trap:</strong> ${t.tip}</span>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // Standard Formula Block with 3-Part Breakdown
        return `
          <div class="bg-white dark:bg-[#111723] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-800 dark:text-slate-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <i class="ph ph-function text-base"></i>
                </div>
                <div>
                  <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">${t.name}</h4>
                  <p class="text-xs text-slate-600 dark:text-slate-400">${t.purpose}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <code class="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">${t.syntax}</code>
                <button type="button" onclick="copyFormulaSnippet('${t.syntax}', this)" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs" title="Copy syntax">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
            </div>

            <!-- Part 1: Function Mechanics & Parameters -->
            <div class="space-y-2">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10.5px] font-extrabold uppercase tracking-wide">1. Function &amp; Mechanics</span>
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                ${t.functionDescription || t.purpose}
              </div>
              ${t.parameters && t.parameters.length ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  ${t.parameters.map(p => `
                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080d15] border border-slate-200 dark:border-slate-800/80">
                      <span class="font-mono font-bold text-emerald-700 dark:text-emerald-300">${p.name}</span>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-snug">${p.description}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Part 2: When to Use -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10.5px] font-extrabold uppercase tracking-wide">2. When to Use (Workplace Triggers)</span>
              <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                <i class="ph ph-briefcase text-indigo-600 dark:text-indigo-400 text-sm shrink-0 mt-0.5"></i>
                <span>${t.whenToUse || 'Use when analyzing, validating, or extracting key metrics across enterprise spreadsheets.'}</span>
              </div>
            </div>

            <!-- Part 3: Real-World Scenario Card -->
            ${t.example ? `
              <div class="space-y-1.5">
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wide">3. Real-World Scenario</span>
                <div class="p-4 rounded-xl bg-emerald-50/40 dark:bg-[#0b0f17] border border-emerald-200 dark:border-emerald-900/40 space-y-2.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <i class="ph ph-caret-right text-emerald-600 dark:text-emerald-400"></i> ${t.example.scenario}
                    </span>
                    <button type="button" onclick="copyFormulaSnippet('${t.example.formula}', this)" class="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer">
                      <i class="ph ph-copy"></i> Copy Formula
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Input Data</div>
                      <div class="font-mono text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">${t.example.input}</div>
                    </div>
                    <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Applied Formula</div>
                      <div class="font-mono text-emerald-700 dark:text-emerald-300 font-bold text-[11px] mt-0.5">${t.example.formula}</div>
                    </div>
                    <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Evaluated Output</div>
                      <div class="font-mono text-cyan-700 dark:text-cyan-300 font-bold text-[11px] mt-0.5">${t.example.output}</div>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">${t.example.explanation}</p>
                </div>
              </div>
            ` : ''}

            <!-- Pro-Tip / Gotcha -->
            ${t.tip ? `
              <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <i class="ph ph-lightbulb text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5"></i>
                <span><strong>Pro-Tip &amp; Exam Trap:</strong> ${t.tip}</span>
              </div>
            ` : ''}
          </div>
        `;
      }
    }).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Chapter ${chapter.number}: ${chapter.title}</h3>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">${chapter.description}</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 self-start sm:self-auto shrink-0">
            ${chapter.topics.length} Key Tools
          </span>
        </div>

        <div class="space-y-5">
          ${topicsHtml}
        </div>

        <!-- Next Chapter or Launch Lab CTA -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-600 dark:text-slate-400">
            Finished reviewing Chapter ${chapter.number}? Advance to the next chapter or launch the lab.
          </div>
          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            ${currentExcelChapterIndex < 3 ? `
              <button type="button" onclick="selectExcelChapter(${currentExcelChapterIndex + 1})" class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5">
                <span>Next: Chapter ${currentExcelChapterIndex + 2}</span>
                <i class="ph ph-arrow-right"></i>
              </button>
            ` : ''}
            <button type="button" onclick="openActivity('transforming_data_with_excel')" class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2">
              <i class="ph ph-play-fill text-xs"></i>
              <span>Ready for Exam: Launch Excel Lab</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // -----------------------------------------------------------------------
  // FREESTYLE SQL PLAYGROUND ENGINE & CONFIG (Modules 2, 3, 4)
  // -----------------------------------------------------------------------
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const SQL_MODULE_SANDBOX_CONFIG = {
    sql_world: {
      defaultQuery: "SELECT country, continent, population, area FROM countries WHERE continent = 'Asia'",
      runnerName: 'executeWorldSQL',
      tables: [
        {
          name: 'countries',
          description: 'Global demographics and national profiles',
          columns: [
            { name: 'country', type: 'TEXT', desc: 'Nation name (e.g. Australia, Japan)' },
            { name: 'continent', type: 'TEXT', desc: 'Geographic continent (Asia, Europe, etc.)' },
            { name: 'population', type: 'INTEGER', desc: 'Total population count' },
            { name: 'area', type: 'INTEGER', desc: 'Land area in sq km' },
            { name: 'ccd', type: 'TEXT', desc: 'Two-letter ISO country code' }
          ]
        },
        {
          name: 'shapes',
          description: 'Interactive geometry coordinate dataset',
          columns: [
            { name: 'id', type: 'INTEGER', desc: 'Unique shape ID' },
            { name: 'shape', type: 'TEXT', desc: 'Shape type (circle, square, triangle)' },
            { name: 'color', type: 'TEXT', desc: 'Color (red, blue, green)' },
            { name: 'dots', type: 'INTEGER', desc: 'Number of dots' },
            { name: 'xloc', type: 'INTEGER', desc: 'X coordinate location' },
            { name: 'yloc', type: 'INTEGER', desc: 'Y coordinate location' }
          ]
        }
      ],
      starters: [
        {
          label: 'Asia Countries',
          query: "SELECT country, continent, population, area FROM countries WHERE continent = 'Asia'",
          tip: 'Filter for Asian nations'
        },
        {
          label: 'Populous (>50M)',
          query: "SELECT country, continent, population FROM countries WHERE population >= 50000000 ORDER BY population DESC",
          tip: 'Ranked descending by population'
        },
        {
          label: 'Europe (<100K km²)',
          query: "SELECT country, area FROM countries WHERE continent = 'Europe' AND area < 100000 ORDER BY area ASC",
          tip: 'European nations smaller than 100k sq km'
        },
        {
          label: 'Wildcard (United%)',
          query: "SELECT country, continent, population FROM countries WHERE country LIKE 'United%'",
          tip: 'LIKE operator with % wildcard'
        },
        {
          label: 'Shapes (Circles & Dots)',
          query: "SELECT * FROM shapes WHERE shape = 'circle' AND dots >= 4",
          tip: 'Multi-column condition on geometric canvas'
        }
      ]
    },

    sql_ordering: {
      defaultQuery: "SELECT moon, planet, radius FROM moons ORDER BY radius DESC LIMIT 5",
      runnerName: 'executeOrderingSQL',
      tables: [
        {
          name: 'moons',
          description: 'Solar system planetary satellites dataset',
          columns: [
            { name: 'moon', type: 'TEXT', desc: 'Moon / satellite name' },
            { name: 'planet', type: 'TEXT', desc: 'Host parent planet' },
            { name: 'radius', type: 'INTEGER', desc: 'Mean radius in kilometers' },
            { name: 'density', type: 'FLOAT', desc: 'Bulk density in g/cm³' }
          ]
        },
        {
          name: 'animals',
          description: 'Mammalian sleep cycles and physiological metrics',
          columns: [
            { name: 'name', type: 'TEXT', desc: 'Animal species' },
            { name: 'order', type: 'TEXT', desc: 'Biological order classification' },
            { name: 'sleep_total', type: 'FLOAT', desc: 'Daily sleep hours' },
            { name: 'awake', type: 'FLOAT', desc: 'Daily waking hours' },
            { name: 'brainwt', type: 'FLOAT', desc: 'Brain weight in kg' },
            { name: 'bodywt', type: 'FLOAT', desc: 'Body weight in kg' }
          ]
        },
        {
          name: 'countries',
          description: 'Global demographics',
          columns: [
            { name: 'country', type: 'TEXT', desc: 'Nation name' },
            { name: 'continent', type: 'TEXT', desc: 'Continent name' },
            { name: 'population', type: 'INTEGER', desc: 'Population' },
            { name: 'area', type: 'INTEGER', desc: 'Land area in sq km' }
          ]
        }
      ],
      starters: [
        {
          label: 'Top 5 Largest Moons',
          query: "SELECT moon, planet, radius FROM moons ORDER BY radius DESC LIMIT 5",
          tip: 'ORDER BY radius DESC combined with LIMIT 5'
        },
        {
          label: 'Saturn Moons by Density',
          query: "SELECT moon, planet, density FROM moons WHERE planet = 'Saturn' ORDER BY density ASC LIMIT 6",
          tip: 'Filtered by planet and sorted ascending'
        },
        {
          label: 'Top Sleepers (Animals)',
          query: "SELECT name, order, sleep_total FROM animals ORDER BY sleep_total DESC LIMIT 8",
          tip: 'Animals sorted by sleep hours'
        },
        {
          label: 'Lightest Heavy Sleepers',
          query: "SELECT name, bodywt, sleep_total FROM animals WHERE sleep_total > 12 ORDER BY bodywt ASC LIMIT 5",
          tip: 'WHERE filter with ORDER BY and LIMIT'
        },
        {
          label: 'Country Tiebreakers',
          query: "SELECT country, continent, population FROM countries ORDER BY continent ASC, population DESC LIMIT 10",
          tip: 'Multi-column ORDER BY tiebreaker'
        }
      ]
    },

    sql_movies: {
      defaultQuery: "SELECT title, year, ravg FROM movies ORDER BY ravg DESC LIMIT 5",
      runnerName: 'executeMoviesSQL',
      tables: [
        {
          name: 'movies',
          description: '50-year cinema dataset (1965–2015)',
          columns: [
            { name: 'imdbid', type: 'INTEGER', desc: 'IMDb unique identifier' },
            { name: 'title', type: 'TEXT', desc: 'Movie title' },
            { name: 'year', type: 'INTEGER', desc: 'Release year (1965 - 2015)' },
            { name: 'budget', type: 'FLOAT', desc: 'Production budget in $ millions' },
            { name: 'revenue', type: 'FLOAT', desc: 'Box office gross in $ millions' },
            { name: 'mpaa', type: 'TEXT', desc: 'Content rating (G, PG, PG13, R, NR)' },
            { name: 'ravg', type: 'FLOAT', desc: 'Rating score (0.0 to 10.0)' }
          ]
        }
      ],
      starters: [
        {
          label: 'Top 5 Rated Films',
          query: "SELECT title, year, ravg FROM movies ORDER BY ravg DESC LIMIT 5",
          tip: 'Critical acclaim sorted descending'
        },
        {
          label: 'Billion-Dollar Blockbusters',
          query: "SELECT title, year, budget, revenue FROM movies WHERE revenue > 1000 ORDER BY revenue DESC LIMIT 5",
          tip: 'Highest grossing box office hits'
        },
        {
          label: 'Acclaimed Cult Films (Lost Money)',
          query: "SELECT title, year, budget, revenue, ravg FROM movies WHERE revenue < budget AND ravg >= 8.5 ORDER BY ravg DESC",
          tip: 'High rating but box office was less than budget'
        },
        {
          label: 'PG-13 Highest Rated',
          query: "SELECT title, year, mpaa, ravg FROM movies WHERE mpaa = 'PG13' ORDER BY ravg DESC LIMIT 8",
          tip: 'Filtered by MPAA rating and sorted by score'
        },
        {
          label: '21st Century Movies',
          query: "SELECT title, year, revenue FROM movies WHERE year >= 2000 ORDER BY revenue DESC LIMIT 10",
          tip: 'Recent releases sorted by revenue'
        }
      ]
    }
  };

  const sqlPlaygroundState = {
    sql_world: { query: SQL_MODULE_SANDBOX_CONFIG.sql_world.defaultQuery },
    sql_ordering: { query: SQL_MODULE_SANDBOX_CONFIG.sql_ordering.defaultQuery },
    sql_movies: { query: SQL_MODULE_SANDBOX_CONFIG.sql_movies.defaultQuery }
  };

  function renderPlaygroundTable(result) {
    if (!result) {
      return '<div class="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">Click "Run SQL Query" to view live execution results.</div>';
    }
    if (!result.success) {
      return `
        <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs space-y-2">
          <div class="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            <i class="ph ph-warning-circle text-base text-rose-500"></i> Query Execution Error
          </div>
          <p class="font-mono text-[11.5px] leading-relaxed text-rose-800 dark:text-rose-200 whitespace-pre-wrap">${escapeHtml(result.error || 'Syntax or runtime error.')}</p>
          <div class="pt-1.5 text-[10.5px] text-rose-600 dark:text-rose-400/90 border-t border-rose-200 dark:border-rose-900/60">
            <strong>Hint:</strong> Check column spelling against Schema Inspector, wrap strings in single quotes ('Asia'), and verify keywords.
          </div>
        </div>
      `;
    }
    const rows = result.rows || [];
    if (rows.length === 0) {
      return `
        <div class="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <div class="font-bold text-slate-800 dark:text-slate-300 text-sm flex items-center justify-center gap-1.5">
            <i class="ph ph-magnifying-glass text-slate-500"></i> 0 Rows Matched
          </div>
          <p class="text-[11.5px]">The query executed successfully without errors, but no records satisfied your WHERE condition. Note: text inside quotes is case-sensitive.</p>
        </div>
      `;
    }

    const cols = (result.columns && result.columns.length > 0)
      ? result.columns
      : Object.keys(rows[0]);

    let thead = cols.map(c => `
      <th class="px-3 py-2 text-left font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#141b2a] border-b border-slate-200 dark:border-slate-700/80 uppercase tracking-wider sticky top-0 shadow-xs">
        ${escapeHtml(c)}
      </th>
    `).join('');

    let tbody = rows.slice(0, 50).map((r, i) => {
      let cells = cols.map(c => {
        let val = r[c];
        let displayVal;
        if (val === null || val === undefined) {
          displayVal = '<span class="text-slate-400 italic">NULL</span>';
        } else if (typeof val === 'number') {
          displayVal = `<span class="font-mono text-blue-600 dark:text-cyan-300 font-bold">${val.toLocaleString()}</span>`;
        } else {
          displayVal = `<span class="text-slate-800 dark:text-slate-200">${escapeHtml(String(val))}</span>`;
        }
        return `<td class="px-3 py-1.5 text-xs border-b border-slate-200 dark:border-slate-800/60 whitespace-nowrap">${displayVal}</td>`;
      }).join('');
      return `<tr class="${i % 2 === 0 ? 'bg-white dark:bg-[#090d15]' : 'bg-slate-50/70 dark:bg-[#0b101c]'} hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">${cells}</tr>`;
    }).join('');

    let limitNote = rows.length > 50
      ? `<div class="px-3 py-1.5 text-[10.5px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-center">Displaying first 50 of ${rows.length} records</div>`
      : '';

    return `
      <div class="overflow-x-auto max-h-72 border border-slate-200 dark:border-slate-800/90 rounded-xl shadow-inner">
        <table class="w-full text-left border-collapse">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
        ${limitNote}
      </div>
    `;
  }

  function buildSqlSandboxHtml(mod) {
    const cfg = SQL_MODULE_SANDBOX_CONFIG[mod.id] || SQL_MODULE_SANDBOX_CONFIG.sql_world;
    const curQuery = (sqlPlaygroundState[mod.id] && sqlPlaygroundState[mod.id].query) || cfg.defaultQuery;

    // Render Schema Inspector Cards
    const tablesHtml = cfg.tables.map(t => `
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${escapeHtml(t.name)}</span>
            <button type="button" onclick="insertPlaygroundToken('${mod.id}', '${t.name}')" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60 transition" title="Insert table name into query">
              + Insert Table
            </button>
          </div>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 italic">${escapeHtml(t.description)}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${t.columns.map(col => `
            <button type="button" onclick="insertPlaygroundToken('${mod.id}', '${col.name}')" class="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-300 font-mono text-[10.5px] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center gap-1 cursor-pointer" title="${escapeHtml(col.desc || '')}">
              <code>${escapeHtml(col.name)}</code>
              <span class="text-[9.5px] text-slate-400 font-sans font-medium">(${escapeHtml(col.type)})</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Render Quick Starter Query Buttons
    const startersHtml = cfg.starters.map(s => `
      <button type="button" onclick="setAndRunPlaygroundQuery('${mod.id}', \`${s.query.replace(/`/g, '\\`')}\`)" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#101726] hover:bg-slate-200 dark:hover:bg-[#162035] text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 flex items-center gap-1.5 transition cursor-pointer shadow-xs" title="${escapeHtml(s.tip || s.query)}">
        <i class="ph ph-play text-blue-600 dark:text-blue-400 text-xs"></i>
        <span>${escapeHtml(s.label)}</span>
      </button>
    `).join('');

    return `
      <!-- Embedded Freestyle SQL Playground Card -->
      <div class="bg-white dark:bg-[#0c121e] border-2 border-blue-500/30 dark:border-blue-500/40 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl text-slate-800 dark:text-slate-100">
        <!-- Playground Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <i class="ph ph-terminal-window text-2xl"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Freestyle SQL Playground &amp; Results</h4>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">Live Interactive</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Experiment with custom SQL syntax, examine live query results, and test queries before starting the exam.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button type="button" onclick="resetSqlPlayground('${mod.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5" title="Reset to default starter query">
              <i class="ph ph-arrow-counter-clockwise"></i> Reset
            </button>
            <button type="button" onclick="clearSqlPlayground('${mod.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5" title="Clear query editor">
              <i class="ph ph-eraser"></i> Clear
            </button>
          </div>
        </div>

        <!-- Schema & Column Inspector -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#070b12] border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <i class="ph ph-tree-structure text-blue-600 dark:text-blue-400 text-sm"></i>
              <span>Schema &amp; Column Inspector (Click column badge to insert into query)</span>
            </div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">${cfg.tables.length} table(s) available</span>
          </div>
          <div class="grid grid-cols-1 gap-2.5">
            ${tablesHtml}
          </div>
        </div>

        <!-- Quick Starter Query Buttons -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <i class="ph ph-lightning text-amber-500 dark:text-amber-400 text-sm"></i>
              <span>Quick Starter Queries (Click to load &amp; execute)</span>
            </div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">1-Click Templates</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${startersHtml}
          </div>
        </div>

        <!-- Query Editor Textarea -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <label for="sqlPlaygroundText_${mod.id}" class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i class="ph ph-code text-blue-600 dark:text-cyan-400"></i>
              <span>SQL Query Editor</span>
            </label>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">Press <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold">Ctrl + Enter</kbd> to execute</span>
          </div>
          <div class="relative rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#06090f] overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-inner">
            <textarea id="sqlPlaygroundText_${mod.id}" rows="4" class="w-full bg-transparent p-3.5 font-mono text-slate-900 dark:text-cyan-300 text-xs md:text-sm leading-relaxed outline-none resize-y" spellcheck="false" placeholder="Enter your custom SQL query (e.g. SELECT * FROM ...)">${escapeHtml(curQuery)}</textarea>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div class="flex items-center gap-2">
              <button type="button" onclick="runSqlPlayground('${mod.id}')" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2">
                <i class="ph ph-play-fill text-xs"></i>
                <span>Run SQL Query</span>
              </button>
              <button type="button" onclick="formatSqlPlaygroundText('${mod.id}')" class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5" title="Capitalize standard SQL keywords">
                <i class="ph ph-text-aa"></i> Format Keywords
              </button>
            </div>
            <div id="sqlPlaygroundStatus_${mod.id}" class="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Ready to execute</span>
            </div>
          </div>
        </div>

        <!-- Live Results Output Area -->
        <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i class="ph ph-table text-emerald-600 dark:text-emerald-400"></i>
              <span>Execution Results</span>
            </span>
            <span id="sqlPlaygroundResultCount_${mod.id}" class="text-[11px] font-mono text-slate-500 dark:text-slate-400">0 rows returned</span>
          </div>
          <div id="sqlPlaygroundOutput_${mod.id}" class="min-h-[120px] flex flex-col justify-center">
            ${renderPlaygroundTable(null)}
          </div>
        </div>
      </div>
    `;
  }

  window.setAndRunPlaygroundQuery = function (moduleId, query) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    if (textarea) {
      textarea.value = query;
      sqlPlaygroundState[moduleId].query = query;
    }
    window.runSqlPlayground(moduleId);
  };

  window.insertPlaygroundToken = function (moduleId, token) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    textarea.value = `${before} ${token} ${after}`.replace(/\s+/g, ' ');
    textarea.focus();
    sqlPlaygroundState[moduleId].query = textarea.value;
  };

  window.clearSqlPlayground = function (moduleId) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    if (textarea) {
      textarea.value = '';
      textarea.focus();
      sqlPlaygroundState[moduleId].query = '';
    }
  };

  window.resetSqlPlayground = function (moduleId) {
    const cfg = SQL_MODULE_SANDBOX_CONFIG[moduleId] || SQL_MODULE_SANDBOX_CONFIG.sql_world;
    window.setAndRunPlaygroundQuery(moduleId, cfg.defaultQuery);
  };

  window.formatSqlPlaygroundText = function (moduleId) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    if (!textarea) return;
    const keywords = new Set(['SELECT', 'FROM', 'WHERE', 'ORDER', 'GROUP', 'BY', 'HAVING', 'LIMIT', 'OFFSET', 'AND', 'OR', 'NOT', 'BETWEEN', 'IN', 'LIKE', 'IS', 'NULL', 'ASC', 'DESC', 'AS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT']);
    const tokenRegex = /('(?:''|[^'\r\n])*'?|"(?:""|[^"\r\n])*"?|‘[^’\r\n]*’?|“[^”\r\n]*”?|--[^\r\n]*|\/\*[\s\S]*?\*\/)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
    const val = textarea.value.replace(tokenRegex, (match, preservedLiteral, word) => {
      if (preservedLiteral) return preservedLiteral;
      if (word && keywords.has(word.toUpperCase())) return word.toUpperCase();
      return match;
    });
    textarea.value = val;
    sqlPlaygroundState[moduleId].query = val;
  };

  window.runSqlPlayground = function (moduleId) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    const outputContainer = document.getElementById(`sqlPlaygroundOutput_${moduleId}`);
    const countSpan = document.getElementById(`sqlPlaygroundResultCount_${moduleId}`);
    const statusDiv = document.getElementById(`sqlPlaygroundStatus_${moduleId}`);
    if (!textarea || !outputContainer) return;

    const query = textarea.value.trim();
    sqlPlaygroundState[moduleId].query = query;

    if (!query) {
      outputContainer.innerHTML = '<div class="text-xs text-amber-600 dark:text-amber-400 py-4 text-center">Please enter a SQL query to execute.</div>';
      if (countSpan) countSpan.textContent = '0 rows returned';
      return;
    }

    const cfg = SQL_MODULE_SANDBOX_CONFIG[moduleId] || SQL_MODULE_SANDBOX_CONFIG.sql_world;
    const moduleRunner = cfg && cfg.runnerName && typeof window[cfg.runnerName] === 'function'
      ? window[cfg.runnerName]
      : null;
    const runner = window.executeLabQuerySafely;
    const start = performance.now();
    let result;
    if (typeof runner === 'function') {
      result = runner(query, moduleId);
    } else if (moduleRunner) {
      result = moduleRunner(query);
      if (result && result.executionTimeMs === undefined) {
        result.executionTimeMs = Math.max(1, Math.round(performance.now() - start));
      }
    } else {
      result = executeFallbackPlaygroundQuery(query, moduleId);
    }

    outputContainer.innerHTML = renderPlaygroundTable(result);
    if (countSpan) {
      if (result.success && result.rows) {
        countSpan.textContent = `${result.rows.length} row(s) returned`;
      } else {
        countSpan.textContent = '0 rows';
      }
    }
    if (statusDiv) {
      if (result.success) {
        statusDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><i class="ph ph-check-circle-fill"></i> Executed in ${result.executionTimeMs || 4}ms</span>`;
      } else {
        statusDiv.innerHTML = `<span class="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1"><i class="ph ph-x-circle-fill"></i> Syntax Error</span>`;
      }
    }
  };

  function executeFallbackPlaygroundQuery(query, moduleId) {
    if (typeof alasql !== 'undefined') {
      try {
        const start = performance.now();
        const data = alasql(query);
        const elapsed = Math.round(performance.now() - start);
        return {
          success: true,
          rows: Array.isArray(data) ? data : [],
          executionTimeMs: elapsed
        };
      } catch (err) {
        return {
          success: false,
          error: err.message || String(err)
        };
      }
    }
    return {
      success: false,
      error: 'SQL engine is still initializing. Please wait a moment and click Run again.'
    };
  }

  function initSqlPlayground(moduleId) {
    const textarea = document.getElementById(`sqlPlaygroundText_${moduleId}`);
    if (textarea) {
      textarea.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          window.runSqlPlayground(moduleId);
        }
      });
    }
    setTimeout(() => {
      window.runSqlPlayground(moduleId);
    }, 60);
  }

  // -----------------------------------------------------------------------
  // RENDER SQL MODULE CONTENT (Modules 2, 3, 4 - Harmonized Light & Dark)
  // -----------------------------------------------------------------------
  function renderSqlModuleContent(mod) {
    const container = document.getElementById('curriculumModuleDynamicContent');
    if (!container) return;

    let sectionsHtml = mod.sections.map(s => {
      if (s.isTrap) {
        // Common Traps Card
        return `
          <div class="bg-amber-50/60 dark:bg-[#1a1512] border-2 border-amber-400/80 dark:border-amber-600/50 rounded-2xl p-5 md:p-6 space-y-4 shadow-md text-slate-800 dark:text-slate-100">
            <div class="flex items-center gap-3 border-b border-amber-200 dark:border-amber-800/60 pb-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <i class="ph ph-warning-octagon text-xl"></i>
              </div>
              <div>
                <h4 class="text-base font-extrabold text-amber-900 dark:text-amber-200 tracking-tight">${s.title}</h4>
                <p class="text-xs text-amber-700 dark:text-amber-300/80">Avoid these frequent exam traps before running your queries</p>
              </div>
            </div>

            <div class="space-y-4">
              ${s.traps.map(tr => `
                <div class="p-4 rounded-xl bg-white dark:bg-[#0f0d0a] border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div class="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <i class="ph ph-x-circle text-rose-500"></i> ${tr.trap}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div class="p-2.5 rounded-lg bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-900/60 font-mono text-rose-800 dark:text-red-200 text-[11px] whitespace-pre-wrap">
                      <span class="text-rose-600 dark:text-red-400 text-[10px] uppercase font-bold block mb-1">Common Mistake (Wrong)</span>${tr.wrong}
                    </div>
                    <div class="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 font-mono text-emerald-800 dark:text-emerald-200 text-[11px] whitespace-pre-wrap">
                      <span class="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold block mb-1">Correct SQL Syntax</span>${tr.correct}
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">${tr.explanation}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Standard SQL Section with Functional Purpose, Execution Order & Pitfalls
        return `
          <div class="bg-white dark:bg-[#111723] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-800 dark:text-slate-100">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">${s.title}</h4>
              <button type="button" onclick="copyFormulaSnippet(\`${s.code}\`, this)" class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1.5 transition cursor-pointer">
                <i class="ph ph-copy"></i> Copy Query
              </button>
            </div>

            <!-- Part 1: Functional Purpose -->
            ${s.functionalPurpose ? `
              <div class="space-y-1.5">
                <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10.5px] font-extrabold uppercase tracking-wide">1. Functional Purpose</span>
                <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  ${s.functionalPurpose}
                </div>
              </div>
            ` : `
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${s.content}</p>
            `}

            <!-- Part 2: Logical Execution Order -->
            ${s.executionOrder ? `
              <div class="space-y-1.5">
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10.5px] font-extrabold uppercase tracking-wide">2. Logical Execution Order</span>
                <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                  <i class="ph ph-arrows-clockwise text-indigo-600 dark:text-indigo-400 text-sm shrink-0 mt-0.5"></i>
                  <span>${s.executionOrder}</span>
                </div>
              </div>
            ` : ''}

            <!-- Part 3: Concrete Query Code Example -->
            <div class="space-y-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wide">3. Verified Query Example</span>
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#090d15] border border-slate-200 dark:border-slate-800">
                <pre class="text-xs font-mono text-blue-700 dark:text-cyan-300 font-semibold whitespace-pre-wrap leading-relaxed">${s.code}</pre>
              </div>
            </div>

            <!-- Part 4: Exam Pitfall Tips -->
            ${s.examPitfalls ? `
              <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <i class="ph ph-warning-diamond text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5"></i>
                <div class="space-y-1 leading-relaxed">
                  <span class="font-bold">Exam Survival Pitfall:</span>
                  <div>${s.examPitfalls}</div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }
    }).join('');

    const sandboxHtml = buildSqlSandboxHtml(mod);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Module Header Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 dark:from-blue-950/40 via-indigo-50 dark:via-slate-900 to-sky-50 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 shadow-sm">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Lesson Plan &bull; Module ${mod.moduleNumber}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">${mod.badgeText}</span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">${mod.title}</h3>
            <p class="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">${mod.subtitle}</p>
            ${mod.schemaOverview ? `<div class="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">Dataset: ${mod.schemaOverview}</div>` : ''}
          </div>
          <button type="button" onclick="openActivity('${mod.labId}')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0">
            <i class="ph ph-play-fill text-xs"></i>
            <span>${mod.labName}</span>
          </button>
        </div>

        <!-- Sections List -->
        <div class="space-y-5">
          ${sectionsHtml}
        </div>

        <!-- Embedded Interactive Freestyle SQL Sandbox -->
        <div class="pt-2">
          ${sandboxHtml}
        </div>

        <!-- Launch Exam CTA -->
        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#131b2a] border border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 class="text-base font-extrabold text-slate-900 dark:text-white">Completed Module ${mod.moduleNumber} Lesson?</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Test your comprehension in the live in-browser SQL evaluation engine.</p>
          </div>
          <button type="button" onclick="openActivity('${mod.labId}')" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/40 transition cursor-pointer flex items-center gap-2">
            <i class="ph ph-play-fill text-xs"></i>
            <span>Launch Module ${mod.moduleNumber} Lab Exam</span>
          </button>
        </div>
      </div>
    `;

    initSqlPlayground(mod.id);
  }

  // -----------------------------------------------------------------------
  // RENDER DYNAMIC CONTENT BASED ON ACTIVE MODULE
  // -----------------------------------------------------------------------
  function renderCurriculumModuleContent() {
    const excelWrapper = document.getElementById('curriculumExcelWrapper');
    const dynamicContainer = document.getElementById('curriculumModuleDynamicContent');

    if (currentModuleId === 'excel') {
      if (excelWrapper) excelWrapper.classList.remove('hidden');
      if (dynamicContainer) dynamicContainer.classList.add('hidden');
      renderExcelChapterNav();
      renderExcelChapterContent();
    } else {
      if (excelWrapper) excelWrapper.classList.add('hidden');
      if (dynamicContainer) dynamicContainer.classList.remove('hidden');
      renderSqlModuleContent(LESSON_CURRICULUM[currentModuleId]);
    }
  }

  // -----------------------------------------------------------------------
  // IN-LAB LESSON MODAL (Harmonized Light & Dark Mode)
  // -----------------------------------------------------------------------
  window.openLessonPlanModal = function (moduleId) {
    if (!moduleId) moduleId = currentModuleId || 'excel';
    if (typeof window.isModuleAllowedByAccess === 'function' && !window.isModuleAllowedByAccess(moduleId)) {
      return;
    }
    const modal = document.getElementById('inLabLessonPlanModal');
    const modalBody = document.getElementById('inLabLessonPlanModalBody');
    const modalTitle = document.getElementById('inLabLessonPlanModalTitle');
    const modalSubtitle = document.getElementById('inLabLessonPlanModalSubtitle');
    if (!modal || !modalBody) return;

    const mod = LESSON_CURRICULUM[moduleId] || LESSON_CURRICULUM.excel;
    if (modalTitle) modalTitle.textContent = mod.title;
    if (modalSubtitle) modalSubtitle.textContent = mod.subtitle;

    if (moduleId === 'excel') {
      let chaptersHtml = mod.chapters.map((ch, idx) => `
        <div class="space-y-4 pt-4 first:pt-0 border-t border-slate-200 dark:border-slate-800 first:border-0">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs">Chapter ${ch.number}</span>
            <h4 class="text-sm font-extrabold text-slate-900 dark:text-white">${ch.title}</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${ch.topics.map(t => `
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">${t.name}</span>
                  ${t.syntax ? `<code class="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-bold">${t.syntax}</code>` : ''}
                </div>
                <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">${t.functionDescription || t.purpose}</p>
                ${t.example ? `
                  <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[10px] space-y-1">
                    <div class="text-slate-600 dark:text-slate-400">Formula: <code class="text-emerald-700 dark:text-emerald-300 font-bold font-mono">${t.example.formula}</code></div>
                    <div class="text-slate-600 dark:text-slate-400">Result: <span class="text-cyan-700 dark:text-cyan-300 font-mono font-bold">${t.example.output}</span></div>
                  </div>
                ` : ''}
                ${t.tip ? `<div class="text-[10px] text-amber-800 dark:text-amber-300/90 leading-tight">💡 ${t.tip}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
      modalBody.innerHTML = chaptersHtml;
    } else {
      let sectionsHtml = mod.sections.map(s => {
        if (s.isTrap) {
          return `
            <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
              <div class="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <i class="ph ph-warning text-amber-600 dark:text-amber-400 text-sm"></i> ${s.title}
              </div>
              <div class="space-y-2">
                ${s.traps.map(tr => `
                  <div class="p-2.5 rounded-lg bg-white dark:bg-[#0e0c0a] border border-amber-200 dark:border-amber-900/40 text-[11px] space-y-1">
                    <div class="font-bold text-amber-900 dark:text-amber-200">${tr.trap}</div>
                    <div class="text-rose-700 dark:text-red-300 font-mono">Wrong: ${tr.wrong.split('\n')[0]}</div>
                    <div class="text-emerald-700 dark:text-emerald-300 font-mono font-bold">Right: ${tr.correct.split('\n')[0]}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          return `
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <h5 class="text-xs font-bold text-slate-900 dark:text-white">${s.title}</h5>
                <button type="button" onclick="copyFormulaSnippet(\`${s.code}\`, this)" class="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition">
                  <i class="ph ph-copy"></i> Copy
                </button>
              </div>
              <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${s.functionalPurpose || s.content}</p>
              <pre class="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-blue-700 dark:text-cyan-300 whitespace-pre-wrap">${s.code}</pre>
            </div>
          `;
        }
      }).join('');
      modalBody.innerHTML = `<div class="space-y-4">${sectionsHtml}</div>`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeLessonPlanModal = function () {
    const modal = document.getElementById('inLabLessonPlanModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // -----------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // -----------------------------------------------------------------------
  function initCurriculumHub() {
    renderCurriculumModuleNav();
    renderCurriculumModuleContent();
    window.switchPortalTab(currentActiveTab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurriculumHub);
  } else {
    initCurriculumHub();
  }

  window.LESSON_CURRICULUM = LESSON_CURRICULUM;
})();
