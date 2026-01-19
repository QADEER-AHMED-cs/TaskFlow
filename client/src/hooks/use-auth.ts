import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Use strict Zod schema types
type LoginData = z.infer<typeof api.auth.login.input>;
type SendOtpData = z.infer<typeof api.auth.sendOtp.input>;
type VerifyOtpData = z.infer<typeof api.auth.verifyOtp.input>;
import { z } from "zod";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Welcome back!", description: `Logged in as ${data.name}` });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: SendOtpData) => {
      const res = await fetch(api.auth.sendOtp.path, {
        method: api.auth.sendOtp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to send OTP");
      }
      return api.auth.sendOtp.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "OTP Sent", description: "Check your email for the OTP" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to send OTP", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      const res = await fetch(api.auth.verifyOtp.path, {
        method: api.auth.verifyOtp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Invalid OTP");
      }
      return api.auth.verifyOtp.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Account created!", description: "Welcome to Smart Task Manager" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Verification Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.clear();
      toast({ title: "Logged out", description: "See you next time!" });
    },
  });

  return {
    user,
    isLoading,
    loginMutation,
    sendOtpMutation,
    verifyOtpMutation,
    logoutMutation,
  };
}
