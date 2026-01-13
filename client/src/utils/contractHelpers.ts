export const safeParse = (str: any) => {
  if (!str) return { subject: 'General', party: 'Unknown', summary: 'N/A', expiry: 'N/A' };
  try {
    let parsed = typeof str === 'string' ? JSON.parse(str) : str;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return {
      subject: parsed?.subject || 'General Contract',
      party: parsed?.party || 'Unknown Party',
      summary: parsed?.summary || 'No summary.',
      expiry: parsed?.expiry_date || parsed?.expiry || 'N/A'
    };
  } catch (e) {
    return { subject: 'General', party: 'Unknown', summary: 'N/A', expiry: 'N/A' };
  }
};