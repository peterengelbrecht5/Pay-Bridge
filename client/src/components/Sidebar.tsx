import { Link, useLocation } from "wouter";
import { LayoutDashboard, CreditCard, Key, Settings, LogOut, Hexagon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: CreditCard },
    { href: "/keys", label: "API Keys", icon: Key },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 z-20 shadow-xl shadow-black/5">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Hexagon className="w-6 h-6 fill-current" />
        </div>
        <span className="text-2xl font-display font-bold text-foreground tracking-tight">
          PayGate
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-6">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
