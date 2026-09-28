/**
 * Client-side CSV export of already-fetched real data (no server endpoint
 * exists for this). Values come straight from the API — nothing synthetic.
 */
const UTF8_BOM = String.fromCharCode(0xfeff);

export function downloadCsv(filename, columns, rows) {
  const escape = (val) => {
    const s = val == null ? "" : String(val);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = columns.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(","))
    .join("\n");

  const blob = new Blob([`${UTF8_BOM}${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Trigger the browser print dialog (used for "Unduh PDF" via print-to-pdf). */
export function printPage() {
  window.print();
}
