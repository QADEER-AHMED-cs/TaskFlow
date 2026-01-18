import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation, user } = useAuth();

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const onSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-gradient mb-2">SmartTask</h1>
            <p className="text-muted-foreground">Productivity powered by AI</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    {...form.register("name")}
                    className="bg-background/50 border-white/10" 
                    placeholder="Qadeer Ahmed"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{(form.formState.errors as any).name.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                {...form.register("username")}
                className="bg-background/50 border-white/10" 
                placeholder="username"
              />
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">{(form.formState.errors as any).username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                {...form.register("password")}
                className="bg-background/50 border-white/10" 
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{(form.formState.errors as any).password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full btn-gradient h-11 text-base font-medium mt-6"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary hover:underline font-medium focus:outline-none"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground/40 mt-8">
          Developed by Qadeer Ahmed
        </p>
      </motion.div>
    </div>
  );
}
