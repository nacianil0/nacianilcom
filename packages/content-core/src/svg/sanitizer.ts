export interface SanitizeResult {
  sanitized: string;
  removals: string[];
}

/**
 * Sanitizes SVG content before commit.
 * Removes: <script>, event handlers (on*), <foreignObject>, dangerous href/xlink:href.
 * Mandatory per §15/§29 — this does NOT replace CSP.
 */
export function sanitizeSvg(input: string): SanitizeResult {
  const removals: string[] = [];
  let svg = input;

  // 1. Remove <script> elements (with or without CDATA, self-closing included)
  svg = svg.replace(/<script[\s\S]*?<\/script\s*>/gi, () => {
    removals.push('<script>');
    return '';
  });
  svg = svg.replace(/<script[^>]*\/\s*>/gi, () => {
    removals.push('<script/>');
    return '';
  });

  // 2. Remove <foreignObject> elements (can contain arbitrary HTML/JS)
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, () => {
    removals.push('<foreignObject>');
    return '';
  });
  svg = svg.replace(/<foreignObject[^>]*\/\s*>/gi, () => {
    removals.push('<foreignObject/>');
    return '';
  });

  // 3. Remove all event handler attributes (on*)
  svg = svg.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>/]+)/gi, (m) => {
    const name = /^on\w+/.exec(m)?.[0] ?? 'on*';
    removals.push(`${name} attribute`);
    return '';
  });

  // 4. Clear dangerous href / xlink:href values
  //    Allowed: relative paths, fragment refs (#id), data:image/*
  //    Blocked: javascript:, data:text/*, data:application/*, http(s)://, //
  const dangerousHref = (val: string): boolean => {
    const v = val.trim();
    return (
      /^javascript:/i.test(v) ||
      /^data:text\//i.test(v) ||
      /^data:application\//i.test(v) ||
      /^https?:\/\//i.test(v) ||
      /^\/\//i.test(v)
    );
  };

  svg = svg.replace(/((?:xlink:)?href)\s*=\s*"([^"]*)"/gi, (m, attr: string, val: string) => {
    if (dangerousHref(val)) {
      removals.push(`${attr}="${val}"`);
      return `${attr}=""`;
    }
    return m;
  });
  svg = svg.replace(/((?:xlink:)?href)\s*=\s*'([^']*)'/gi, (m, attr: string, val: string) => {
    if (dangerousHref(val)) {
      removals.push(`${attr}='${val}'`);
      return `${attr}=''`;
    }
    return m;
  });

  // 5. Strip style attributes / blocks with dangerous CSS
  const dangerousStyle = (s: string): boolean =>
    /javascript:/i.test(s) || /expression\s*\(/i.test(s) || /behavior\s*:/i.test(s);

  svg = svg.replace(/style\s*=\s*"([^"]*)"/gi, (m, s: string) => {
    if (dangerousStyle(s)) {
      removals.push(`style="${s}"`);
      return 'style=""';
    }
    return m;
  });
  svg = svg.replace(/style\s*=\s*'([^']*)'/gi, (m, s: string) => {
    if (dangerousStyle(s)) {
      removals.push(`style='${s}'`);
      return "style=''";
    }
    return m;
  });

  // 6. Remove <?xml-stylesheet?> processing instructions
  svg = svg.replace(/<\?xml-stylesheet[^?]*\?>/gi, () => {
    removals.push('<?xml-stylesheet?>');
    return '';
  });

  return { sanitized: svg, removals };
}
