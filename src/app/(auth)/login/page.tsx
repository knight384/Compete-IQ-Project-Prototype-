"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[440px] mx-auto">
      <div className="bg-surface-container-lowest rounded-[20px] shadow-ambient-1 border border-surface-variant p-8 sm:p-10 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-headline-lg text-primary mb-2">CompetIQ AI</h1>
          <h2 className="text-headline-md font-headline-md text-on-surface">Welcome Back</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">Sign in to access your enterprise analytics.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/20 border border-error/30 rounded-lg text-error text-body-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Field */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">mail</span>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 py-[10px] h-auto rounded-lg text-body-md"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">lock</span>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-[10px] h-auto rounded-lg text-body-md"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container/20 cursor-pointer" />
              <label htmlFor="remember" className="ml-2 text-body-sm font-body-sm text-on-surface-variant cursor-pointer">Remember Me</label>
            </div>
            <a href="#" className="text-label-sm font-label-sm text-primary-container hover:text-primary transition-colors">Forgot Password?</a>
          </div>

          {/* Primary Action */}
          <Button variant="primary" type="submit" disabled={loading} className="w-full h-10 shadow-sm">
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/50"></div>
          </div>
          <div className="relative flex justify-center text-label-sm font-label-sm">
            <span className="px-2 bg-surface-container-lowest text-outline">OR</span>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-4">
          <Button variant="outline" type="button" className="w-full h-10 gap-2 flex items-center justify-center">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu2WafTW7NuyxA9ryJ--VZ0o6PnsmQVTDoWzTogcu2S4ovIbFizZx9VRLRA2QrVsUADSJ90o3QvaBgFPveqRnrSe2_Z_UZAIVMRnRfsmTM7wWQe_gjFCoaJ9Ty94ZLUmWycEnxDEXnELQ1l5dmEpEfcHixD8-Fwq10Rg5j4g8jkpd0eTrfDhvpJc3bTKq2-K9zgnf09vECnUvRVp7GA_bHROKMpeswafGAXbCPyCxkSWrS6FXySTTqpA" alt="Google" className="w-4 h-4" />
            Continue with Google
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-body-sm font-body-sm text-on-surface-variant">
          Don't have an account? <a href="/register" className="text-primary-container hover:text-primary font-medium transition-colors">Create Account</a>
        </p>
      </div>
    </main>
  );
}
