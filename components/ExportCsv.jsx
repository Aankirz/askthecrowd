"use client";
import { toCSV } from "../lib/export.js";

export default function ExportCsv({ data }) {
  const download = () => {
    const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `askthecrowd-${data.seed.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <button type="button" aria-label="Download results as CSV" className="ghost small" onClick={download}>
      ↓ CSV
    </button>
  );
}
