export type CsvCell = boolean | null | number | string | undefined;

function escapeCsvCell(value: CsvCell) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  const escapedText = text.replace(/"/g, '""');
  const shouldQuote =
    escapedText.includes(",") ||
    escapedText.includes('"') ||
    escapedText.includes("\n") ||
    escapedText.includes("\r") ||
    escapedText !== escapedText.trim();

  return shouldQuote ? `"${escapedText}"` : escapedText;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvCell[][],
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
