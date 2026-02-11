/** Turn a summary value (string, array, or object) into a single display string. */
function summaryToString(summary: unknown): string {
  if (summary == null) return 'No summary.';
  if (typeof summary === 'string') return summary;
  if (Array.isArray(summary)) {
    const parts = summary.map((s) => (typeof s === 'string' ? s : summaryToString(s)));
    return parts.join('\n\n') || 'No summary.';
  }
  if (typeof summary === 'object') {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(summary)) {
      if (value == null || value === '') continue;
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (typeof value === 'string') lines.push(`**${label}**\n${value}`);
      else if (Array.isArray(value)) {
        const items = value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
        lines.push(`**${label}**\n${items.map((i) => `- ${i}`).join('\n')}`);
      } else if (typeof value === 'object') lines.push(`**${label}**\n${summaryToString(value)}`);
      else lines.push(`**${label}**\n${String(value)}`);
    }
    return lines.join('\n\n') || 'No summary.';
  }
  return String(summary);
}

function oneSentence(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0].trim();
  return '';
}

function num(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/[^0-9.-]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}
function bool(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const v = val.toLowerCase().trim();
    if (['true', '1', 'yes', 'signed', 'executed'].includes(v)) return true;
    if (['false', '0', 'no', 'unsigned', 'draft', 'pending'].includes(v)) return false;
  }
  return false;
}

/** Parse is_signed: default true only when clearly missing; treat unsigned/draft/false as false. */
function isSigned(val: unknown): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const v = val.toLowerCase().trim();
    if (['false', '0', 'no', 'unsigned', 'draft', 'pending', 'not signed', 'not executed'].includes(v)) return false;
    if (['true', '1', 'yes', 'signed', 'executed'].includes(v)) return true;
  }
  return true;
}

/** If summary/conclusion mention draft/unsigned, treat as not signed (fallback when backend misses it). */
function textSuggestsUnsigned(summary: string, conclusion: string): boolean {
  const combined = `${summary} ${conclusion}`.toLowerCase();
  const hints = ['draft', 'unsigned', 'pending signature', 'not signed', 'not executed', 'to be signed', 'for signature'];
  return hints.some((h) => combined.includes(h));
}
function riskFlags(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  return [];
}

/** Human-readable label for a risk flag key. */
export const RISK_FLAG_LABELS: Record<string, string> = {
  auto_renewal: 'Auto renewal',
  exit_penalty: 'Exit penalty',
  non_compete: 'Non-compete',
  long_commitment: 'Long commitment',
  price_increase: 'Price increase',
};
export function riskFlagLabel(flag: string): string {
  return RISK_FLAG_LABELS[flag] || flag.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const safeParse = (str: any) => {
  if (!str) return { subject: 'General', party: 'Unknown', summary: 'N/A', conclusion: '', expiry: 'N/A', annual_value: 0, has_auto_renewal: false, notice_period_days: 0, risk_flags: [] as string[], is_signed: true, risk_flags_note: '' };
  try {
    let parsed = typeof str === 'string' ? JSON.parse(str) : str;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    const summaryStr = summaryToString(parsed?.summary);
    const conclusion = oneSentence(parsed?.conclusion ?? parsed?.bottom_line);
    return {
      subject: parsed?.subject || 'General Contract',
      party: parsed?.party || 'Unknown Party',
      summary: summaryStr,
      conclusion,
      expiry: parsed?.expiry_date || parsed?.expiry || 'N/A',
      annual_value: num(parsed?.annual_value),
      has_auto_renewal: bool(parsed?.has_auto_renewal),
      notice_period_days: num(parsed?.notice_period_days),
      risk_flags: riskFlags(parsed?.risk_flags),
      is_signed: (() => {
        const fromField = isSigned(parsed?.is_signed ?? parsed?.signed ?? parsed?.execution_status);
        const summaryStr = summaryToString(parsed?.summary);
        const conclusionStr = oneSentence(parsed?.conclusion ?? parsed?.bottom_line);
        if (fromField === false) return false;
        if (textSuggestsUnsigned(summaryStr, conclusionStr)) return false;
        return fromField;
      })(),
      risk_flags_note: typeof parsed?.risk_flags_note === 'string' ? parsed.risk_flags_note.trim() : '',
    };
  } catch (e) {
    return { subject: 'General', party: 'Unknown', summary: 'N/A', conclusion: '', expiry: 'N/A', annual_value: 0, has_auto_renewal: false, notice_period_days: 0, risk_flags: [] as string[], is_signed: true, risk_flags_note: '' };
  }
};