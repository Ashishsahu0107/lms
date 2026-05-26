import React from "react";
import { FileDown, Printer, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ExportFeatures({ data, title = "Analytics Report", csvHeaders = [] }) {
  const [copied, setCopied] = React.useState(false);

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No record data available to export");
      return;
    }

    try {
      // Build CSV
      const headers = csvHeaders.length > 0 ? csvHeaders : Object.keys(data[0]);
      const csvRows = [];
      
      // Add Header Row
      csvRows.push(headers.join(","));

      // Add Data Rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const stringVal = val === null || val === undefined ? "" : String(val);
          // Escape quotes
          const cleanVal = stringVal.replace(/"/g, '""');
          return `"${cleanVal}"`;
        });
        csvRows.push(values.join(","));
      }

      // Create Blob
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile CSV data");
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyClipboard = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      toast.success("JSON data copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy data");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* CSV Export */}
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        title="Export CSV"
      >
        <FileDown className="h-4 w-4" /> Export CSV
      </button>

      {/* Copy Clipboard */}
      <button
        onClick={handleCopyClipboard}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        title="Copy JSON to clipboard"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy Data"}
      </button>

      {/* Print PDF */}
      <button
        onClick={handlePrintPDF}
        className="flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 transition-all"
        title="Print PDF report"
      >
        <Printer className="h-4 w-4" /> Print PDF
      </button>
    </div>
  );
}
