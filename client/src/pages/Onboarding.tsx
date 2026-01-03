import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMerchantSchema, type InsertMerchant } from "@shared/schema";
import { useCreateMerchant } from "@/hooks/use-merchants";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hexagon, LogOut } from "lucide-react";

export default function Onboarding() {
  const { mutate: createMerchant, isPending } = useCreateMerchant();
  const { logout } = useAuth();
  
  const form = useForm<InsertMerchant>({
    resolver: zodResolver(insertMerchantSchema),
    defaultValues: { businessName: "", websiteUrl: "" },
  });

  const onSubmit = (data: InsertMerchant) => {
    createMerchant(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <Button variant="ghost" onClick={() => logout()}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Card className="w-full max-w-md relative z-10 border-border shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Hexagon className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-display">Setup your Profile</CardTitle>
            <CardDescription>
              Tell us a bit about your business to get started.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Acme Corp."
                {...form.register("businessName")}
                className="h-11"
              />
              {form.formState.errors.businessName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
              <Input
                id="websiteUrl"
                placeholder="https://example.com"
                {...form.register("websiteUrl")}
                className="h-11"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20" 
              disabled={isPending}
            >
              {isPending ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
