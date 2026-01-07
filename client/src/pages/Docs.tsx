import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Copy, Book, Shield, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Docs() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied.",
    });
  };

  const curlExample = `curl -X POST https://paygate.replit.app/api/public/transactions \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 2500,
    "currency": "USD",
    "customerEmail": "customer@example.com",
    "referenceId": "order_123"
  }'`;

  const nodeExample = `const response = await fetch('https://paygate.replit.app/api/public/transactions', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2500,
    currency: 'USD',
    customerEmail: 'customer@example.com',
    referenceId: 'order_123'
  })
});

const transaction = await response.json();
console.log(\`Checkout URL: https://paygate.replit.app/checkout/\${transaction.id}\`);`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Developer Documentation</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Everything you need to integrate PayGate into your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All requests must include your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header.
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <Zap className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Fast Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create a transaction and redirect your user to the hosted checkout page in minutes.
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <Book className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">API Reference</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Explore our comprehensive REST API endpoints and data models.
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Quick Start Guide</h2>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            To start accepting payments, you first need to create a transaction on your server and then redirect the user to our secure checkout page.
          </p>
          
          <div className="space-y-6 mt-6">
            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-lg font-bold m-0">Generate an API Key</h3>
                <p className="text-muted-foreground">Go to the API Keys tab in your dashboard and generate a new test key.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold m-0">Create a Transaction</h3>
                  <p className="text-muted-foreground">Make a POST request from your backend to our transaction endpoint.</p>
                </div>

                <Tabs defaultValue="curl" className="w-full">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curl" className="relative group">
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 overflow-x-auto text-sm">
                      <code>{curlExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(curlExample)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TabsContent>
                  <TabsContent value="node" className="relative group">
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 overflow-x-auto text-sm">
                      <code>{nodeExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(nodeExample)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-lg font-bold m-0">Redirect User</h3>
                <p className="text-muted-foreground">
                  The API will return a transaction object with an <code className="bg-muted px-1 rounded">id</code>. 
                  Redirect your user to: <code className="bg-muted px-1 rounded text-primary">https://paygate.replit.app/checkout/{"{id}"}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Terminal className="w-6 h-6 text-primary mt-1" />
            <div>
              <h4 className="font-bold text-primary">Webhooks (Coming Soon)</h4>
              <p className="text-sm text-muted-foreground">
                We are currently working on a webhook system to notify your server immediately when a payment is successful.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}