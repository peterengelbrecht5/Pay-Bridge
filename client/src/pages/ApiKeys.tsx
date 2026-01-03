import { useState } from "react";
import { useApiKeys, useDeleteApiKey } from "@/hooks/use-api-keys";
import { CreateKeyDialog } from "@/components/CreateKeyDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, Key } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeys() {
  const { data: keys, isLoading } = useApiKeys();
  const { mutate: deleteKey } = useDeleteApiKey();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = (prefix: string) => {
    navigator.clipboard.writeText(prefix + "...");
    toast({
      title: "Prefix Copied",
      description: "Key prefix copied to clipboard.",
    });
  };

  const handleDelete = (id: number) => {
    deleteKey(id, {
      onSuccess: () => {
        toast({
          title: "Key Revoked",
          description: "The API key has been permanently deleted.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your secret keys for API access.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate New Key
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : keys?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No API Keys Found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              Create your first API key to start integrating PayGate with your application.
            </p>
          </div>
        ) : (
          keys?.map((key) => (
            <div
              key={key.id}
              className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{key.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <span>{key.prefix}••••••••••••••••</span>
                  <button
                    onClick={() => handleCopy(key.prefix)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Created on {key.createdAt && format(new Date(key.createdAt), "MMM d, yyyy")}
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Any applications using this key will immediately stop working.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(key.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Revoke Key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>

      <CreateKeyDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
