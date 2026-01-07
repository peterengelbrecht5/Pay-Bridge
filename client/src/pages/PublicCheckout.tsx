import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useProcessPayment } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicCheckout() {
  const [match, params] = useRoute("/checkout/:transactionId");
  const transactionId = parseInt(params?.transactionId || "0");
  
  const { mutate: processPayment, isPending } = useProcessPayment();
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const { toast } = useToast();

  const { data: transaction, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ["/api/public/transactions", transactionId],
    queryFn: async () => {
      const res = await fetch(`/api/public/transactions/${transactionId}`);
      if (!res.ok) throw new Error("Transaction not found");
      return res.json();
    },
    enabled: transactionId > 0
  });

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processPayment(
      { transactionId, ...formData },
      {
        onSuccess: (data) => {
          if (data.status === "success") {
            setStatus("success");
          } else {
            setStatus("failed");
          }
        },
        onError: () => {
          setStatus("failed");
          toast({
            title: "Payment Error",
            description: "Could not process payment. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts: string[] = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    if (parts.length) {
      setFormData(prev => ({ ...prev, cardNumber: parts.join(" ") }));
    } else {
      setFormData(prev => ({ ...prev, cardNumber: "" }));
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
           <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
             <CheckCircle2 className="w-10 h-10 text-emerald-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
           <p className="text-gray-500 mb-8">
             Your transaction has been processed securely. You may close this window.
           </p>
           <Button variant="outline" className="w-full" onClick={() => window.close()}>
             Close Window
           </Button>
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
           <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
             <XCircle className="w-10 h-10 text-red-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
           <p className="text-gray-500 mb-8">
             There was an issue processing your card. Please try again or use a different method.
           </p>
           <Button className="w-full" onClick={() => setStatus("idle")}>
             Try Again
           </Button>
        </Card>
      </div>
    );
  }

  if (isLoadingTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!transaction && transactionId > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
           <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
             <XCircle className="w-10 h-10 text-red-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
           <p className="text-gray-500 mb-8">
             The transaction you are looking for does not exist or has expired.
           </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-0">
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold opacity-80">PayGate Secure Checkout</span>
            <ShieldCheck className="w-5 h-5 opacity-80" />
          </div>
          <div className="mb-1">
             <span className="text-3xl font-bold tracking-tight">
               {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction?.currency || 'USD' }).format((transaction?.amount || 0) / 100)}
             </span>
             <span className="text-slate-400 ml-2">{transaction?.currency || 'USD'}</span>
          </div>
          <p className="text-sm text-slate-400">Order #{transactionId}</p>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Card Information</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="0000 0000 0000 0000" 
                  className="pl-10 font-mono"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input 
                  placeholder="MM/YY" 
                  className="font-mono"
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input 
                  placeholder="123" 
                  className="font-mono"
                  value={formData.cvv}
                  onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
               <Label>Cardholder Name</Label>
               <Input 
                 placeholder="John Doe" 
                 value={formData.cardholderName}
                 onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                 required
               />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-base shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-gray-50 border-t p-4 text-center">
           <p className="text-xs text-gray-400 w-full flex items-center justify-center gap-1">
             <ShieldCheck className="w-3 h-3" />
             Payments are secure and encrypted.
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
