import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApiKeySchema, type InsertApiKey } from "@shared/schema";
import { useCreateApiKey } from "@/hooks/use-api-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKeyDialog({ open, onOpenChange }: CreateKeyDialogProps) {
  const { mutateAsync: createKey, isPending } = useCreateApiKey();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InsertApiKey>({
    resolver: zodResolver(insertApiKeySchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: InsertApiKey) => {
    try {
      const result = await createKey(data);
      setCreatedKey(result.rawKey);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedKey(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new secret key for authenticating API requests.
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="e.g. Production Server, Staging"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Generating..." : "Generate Key"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6 py-4">
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertCircle className="h-4 w-4 stroke-amber-600" />
              <AlertTitle className="text-amber-900 font-semibold">
                Save this key immediately
              </AlertTitle>
              <AlertDescription>
                This is the only time we will show you the full API key. If you lose it,
                you will need to generate a new one.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your API Secret Key</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted p-3 rounded-lg font-mono text-sm break-all border border-border">
                  {createdKey}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                I have saved this key
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
