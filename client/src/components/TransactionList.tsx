import { Transaction } from "@shared/schema";
import { BadgeCheck, Clock, XCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <BadgeCheck className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return status;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/20">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No transactions yet</h3>
        <p className="text-muted-foreground mt-1">
          When payments are processed, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-6 py-4 font-semibold text-muted-foreground">Amount</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Customer</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Reference</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {displayTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-bold font-mono text-foreground">
                  {(tx.amount / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: tx.currency,
                  })}
                </td>
                <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                <td className="px-6 py-4 text-foreground">{tx.customerEmail || "—"}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  {tx.referenceId || "—"}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {tx.createdAt && format(new Date(tx.createdAt), "MMM d, h:mm a")}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-secondary rounded-full transition-colors outline-none">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Refund Payment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
