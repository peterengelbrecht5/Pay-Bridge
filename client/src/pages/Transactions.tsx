import { useTransactions } from "@/hooks/use-transactions";
import { TransactionList } from "@/components/TransactionList";
import { Loader2 } from "lucide-react";

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your payments.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <TransactionList transactions={transactions || []} />
      )}
    </div>
  );
}
