import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Code2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

export default function NoCode() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [amount, setAmount] = useState("25.00");
  const [currency, setCurrency] = useState("USD");
  const [buttonText, setButtonText] = useState("Pay with PayGate");
  const [primaryColor, setPrimaryColor] = useState("#000000");

  const embedCode = `<!-- PayGate No-Code Button -->
<button 
  onclick="window.open('https://paygate.replit.app/api/public/transactions/quick?apiKey=${apiKey || 'YOUR_API_KEY'}&amount=${Math.round(parseFloat(amount) * 100)}&currency=${currency}', '_blank')"
  style="
    background-color: ${primaryColor};
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  "
>
  ${buttonText}
</button>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Snippet copied",
      description: "Paste this HTML into your website.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">No-Code Embeds</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Accept payments on your website without writing a single line of backend code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Customization</CardTitle>
              <CardDescription>Configure how your payment button looks and behaves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Your API Key</Label>
                <Input 
                  id="apiKey" 
                  placeholder="sk_test_..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">Found in the API Keys tab.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="btnText">Button Text</Label>
                <Input 
                  id="btnText" 
                  value={buttonText} 
                  onChange={(e) => setButtonText(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Brand Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    type="color" 
                    className="w-12 p-1 h-10" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                  />
                  <Input 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 flex flex-col items-center justify-center min-h-[200px]">
              <div dangerouslySetInnerHTML={{ __html: embedCode }} />
              <p className="mt-4 text-xs text-muted-foreground text-center">
                This is how the button will appear on your site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 overflow-x-auto text-xs font-mono leading-relaxed">
                  <code>{embedCode}</code>
                </pre>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy and paste this snippet anywhere in your HTML code where you want the button to appear.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}