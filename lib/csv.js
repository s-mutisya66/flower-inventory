export function downloadCSV(filename, rows, columns) {
  const lines = [columns.map((c) => c[0]).join(",")];
  rows.forEach((item) => {
    lines.push(
      columns
        .map((c) => {
          let v = String(c[1](item) ?? "");
          v = v.replace(/"/g, '""');
          return /[",\n]/.test(v) ? `"${v}"` : v;
        })
        .join(",")
    );
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
