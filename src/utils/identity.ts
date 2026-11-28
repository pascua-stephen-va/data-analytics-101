export function isGmailEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@gmail.com');
}

export function cleanNameField(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 60);
}

export function normalizeIdentitySegment(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function buildStudentIdentityKey(
  firstName: string,
  middleName: string,
  lastName: string,
  batchNumber: string,
): string {
  const b = normalizeIdentitySegment(batchNumber) || 'na';
  const f = normalizeIdentitySegment(firstName);
  const m = normalizeIdentitySegment(middleName) || 'none';
  const l = normalizeIdentitySegment(lastName);
  return `b${b}__${f}__${m}__${l}`.slice(0, 128);
}

export function formatFullName(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null,
): string {
  return [firstName, middleName, lastName]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ');
}

export interface SqlErrorExplanation {
  title: string;
  detail: string;
  tip: string;
}

export function explainSqlError(
  rawError: string,
  query = '',
): SqlErrorExplanation {
  const err = (rawError || '').trim();
  const lowerErr = err.toLowerCase();
  const trimmedQuery = (query || '').trim();
  const upperQuery = trimmedQuery.toUpperCase();

  if (!trimmedQuery) {
    return {
      title: 'Empty SQL Query',
      detail: 'No SQL statement was entered in the editor.',
      tip: 'Start with SELECT followed by the columns and FROM table_name.',
    };
  }

  if (lowerErr.includes('must start with select') || !upperQuery.startsWith('SELECT')) {
    return {
      title: 'Missing SELECT Clause',
      detail: err || 'Every query in this lab must begin with the SELECT keyword.',
      tip: 'Check spelling and start your statement with SELECT (e.g., SELECT * FROM ...).',
    };
  }

  if (lowerErr.includes('missing from') || !upperQuery.includes('FROM')) {
    return {
      title: 'Missing FROM Clause',
      detail: err || 'Your query specifies columns to read, but does not name a table.',
      tip: 'Add FROM followed by a valid table name (check the table tabs below the editor).',
    };
  }

  if (
    lowerErr.includes('does not exist') ||
    lowerErr.includes('unknown table') ||
    lowerErr.includes('not found')
  ) {
    return {
      title: 'Table Not Found',
      detail: err,
      tip: 'Verify the exact table name shown in the data tabs at the bottom of the workspace.',
    };
  }

  if (lowerErr.includes('column') && (lowerErr.includes('not found') || lowerErr.includes('unknown') || lowerErr.includes('invalid'))) {
    return {
      title: 'Unknown Column Name',
      detail: err,
      tip: 'Inspect the table columns in the explorer tab to check exact spelling and underscores.',
    };
  }

  if (lowerErr.includes('where')) {
    return {
      title: 'Invalid WHERE Condition',
      detail: err,
      tip: "Wrap text values in single quotes (e.g., WHERE continent = 'Asia') and check comparison operators (=, >, <, >=, <=, !=).",
    };
  }

  if (lowerErr.includes('order by')) {
    return {
      title: 'Invalid ORDER BY Clause',
      detail: err,
      tip: 'Use ORDER BY column_name ASC or DESC, placed after WHERE and before LIMIT.',
    };
  }

  if (lowerErr.includes('limit')) {
    return {
      title: 'Invalid LIMIT Clause',
      detail: err,
      tip: 'LIMIT must be followed by a positive whole number at the very end of your query (e.g., LIMIT 5).',
    };
  }

  if (lowerErr.includes('quote') || lowerErr.includes('string') || (trimmedQuery.split("'").length - 1) % 2 !== 0) {
    return {
      title: 'Unclosed Text Quote',
      detail: err || 'A string literal appears to be missing its closing single quote.',
      tip: "Make sure every opening single quote ' has a matching closing quote '.",
    };
  }

  if (lowerErr.includes('syntax')) {
    return {
      title: 'SQL Syntax Error',
      detail: err,
      tip: 'Verify clause order: SELECT columns FROM table WHERE condition ORDER BY column LIMIT n.',
    };
  }

  return {
    title: 'Invalid SQL Formula',
    detail: err || 'The SQL engine could not parse your query.',
    tip: 'Double-check keyword spelling, commas between columns, single quotes around text, and clause order.',
  };
}
