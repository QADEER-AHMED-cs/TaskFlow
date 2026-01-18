import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  LayoutDashboard, 
  CheckSquare, 
  Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logoutMutation, user } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Sidebar / Mobile Header */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 glass-card md:min-h-screen flex flex-col border-r border-white/5 z-20"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold font-display text-gradient tracking-tight">
            SmartTask
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Productivity Manager</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location === '/' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          {children}
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 w-full py-4 text-center text-xs text-muted-foreground/50 border-t border-white/5 bg-background/50 backdrop-blur-sm">
          <p>Developed by Qadeer Ahmed • Portfolio Project</p>
        </footer>
      </main>
    </div>
  );
}
