import React, { useState } from "react";
import { ChevronLeft, FileText, Search, Printer } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function Invoices({
  invoices = [],
  onBack,
}) {
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="invoices-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Invoicing Archive</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search invoicing metadata by invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden hover:shadow-md transition-all">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-xs font-semibold text-muted-foreground uppercase border-b">
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Billing Contact</th>
                  <th className="py-3 px-4 text-center">Receipt Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      <div>{inv.billingDetails?.address || "Silicon Valley Billing Address"}</div>
                      <div className="text-[10px] text-muted-foreground">Contact: {inv.billingDetails?.phone || "555-0100"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">${inv.paymentId?.amount || 120}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" /> Print Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
