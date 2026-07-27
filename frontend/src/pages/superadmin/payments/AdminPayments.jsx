import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPayments,
  getInvoices,
  getSubscriptions,
  processRefund,
} from "../../../services/adminModulesService";
import PaymentDashboard from "./PaymentDashboard";
import Transactions from "./Transactions";
import Invoices from "./Invoices";
import SubscriptionPlans from "./SubscriptionPlans";
import RefundRequests from "./RefundRequests";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function AdminPayments() {
  const [view, setView] = useState("dashboard"); // "dashboard" | "transactions" | "invoices" | "plans" | "refunds"
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      const [payRes, invRes, planRes] = await Promise.all([
        getPayments(),
        getInvoices(),
        getSubscriptions(),
      ]);

      if (payRes.data?.success) setPayments(payRes.data.data);
      if (invRes.data?.success) setInvoices(invRes.data.data);
      if (planRes.data?.success) setPlans(planRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const handleApproveRefund = async (paymentId) => {
    try {
      setLoading(true);
      await processRefund(paymentId, "refunded");
      await loadPaymentsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRefund = async (paymentId) => {
    try {
      setLoading(true);
      await processRefund(paymentId, "completed");
      await loadPaymentsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && view === "dashboard") {
    return (
      <div
        className="flex flex-col justify-center items-center py-32 space-y-4"
        id="payments-loading"
      >
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Syncing platform ledgers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-payments-root">
      {/* View navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" /> Revenue & Financial
            Ledger
          </h1>
          <p className="text-muted-foreground">
            Monitor course sales, subscriptions, invoices and fee refunds
          </p>
        </div>
        <div className="flex gap-2">
          {["dashboard", "transactions", "invoices", "plans", "refunds"].map(
            (v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "outline"}
                size="sm"
                className="capitalize text-xs font-semibold"
                onClick={() => setView(v)}
              >
                {v}
              </Button>
            ),
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {view === "dashboard" && (
            <PaymentDashboard
              payments={payments}
              onNavigateToTransactions={() => setView("transactions")}
              onNavigateToRefunds={() => setView("refunds")}
            />
          )}

          {view === "transactions" && (
            <Transactions
              payments={payments}
              onBack={() => setView("dashboard")}
            />
          )}

          {view === "invoices" && (
            <Invoices invoices={invoices} onBack={() => setView("dashboard")} />
          )}

          {view === "plans" && (
            <SubscriptionPlans
              plans={plans}
              onBack={() => setView("dashboard")}
            />
          )}

          {view === "refunds" && (
            <RefundRequests
              payments={payments}
              onBack={() => setView("dashboard")}
              onApproveRefund={handleApproveRefund}
              onRejectRefund={handleRejectRefund}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
