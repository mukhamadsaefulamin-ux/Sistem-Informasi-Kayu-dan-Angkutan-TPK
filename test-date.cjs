const parseDate = (d) => {
  if (!d) return '';
  d = d.replace(/\//g, '-');
  const parts = d.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return d; // YYYY-MM-DD
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD-MM-YYYY
  }
  return d;
}
console.log(parseDate("28-07-2026"));
console.log(parseDate("2026-07-28"));
console.log(parseDate("28/07/2026"));
