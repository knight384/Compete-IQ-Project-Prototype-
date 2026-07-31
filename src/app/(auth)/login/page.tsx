"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <main className="w-full max-w-[440px] mx-auto">
      <div className="bg-surface-container-lowest rounded-[20px] shadow-ambient-1 border border-surface-variant p-8 sm:p-10 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-headline-lg text-primary mb-2">CompetIQ AI</h1>
          <h2 className="text-headline-md font-headline-md text-on-surface">Welcome Back</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">Sign in to access your enterprise analytics.</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
          <Button variant="primary" type="submit" className="w-full h-10 shadow-sm">
            Sign In
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
          <Button variant="outline" type="button" className="w-full h-10 gap-2 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#0078D4]" fill="currentColor" viewBox="0 0 21 21">
              <path d="M10 0H0v10h10V0zM21 0H11v10h10V0zM10 11H0v10h10V11zM21 11H11v10h10V11z"></path>
            </svg>
            Continue with Microsoft
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-body-sm font-body-sm text-on-surface-variant">
          Don't have an account? <a href="#" className="text-primary-container hover:text-primary font-medium transition-colors">Create Account</a>
        </p>
      </div>
    </main>
  );
}
