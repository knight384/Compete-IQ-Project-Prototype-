import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function RegisterPage() {
  return (
    <div className="max-w-[1200px] w-full bg-surface-container-lowest rounded-[20px] shadow-[0px_12px_32px_-4px_rgba(15,23,42,0.1)] border border-surface-container flex flex-col lg:flex-row overflow-hidden">
      {/* Registration Form Section */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">CompetIQ AI</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create your CompetIQ Account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Join 500+ enterprises using AI to dominate their market.</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Full Name</label>
              <Input id="fullName" type="text" placeholder="Jane Doe" className="border-surface-container-highest bg-surface" />
            </div>
            <div>
              <label htmlFor="companyName" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Company Name</label>
              <Input id="companyName" type="text" placeholder="Acme Corp" className="border-surface-container-highest bg-surface" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Business Email</label>
            <Input id="email" type="email" placeholder="jane@acmecorp.com" className="border-surface-container-highest bg-surface" />
          </div>

          <div>
            <label htmlFor="industry" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Industry</label>
            <select id="industry" defaultValue="" className="w-full h-10 px-3 rounded-lg border border-surface-container-highest bg-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-sm text-body-sm text-on-surface outline-none">
              <option disabled value="">Select Industry</option>
              <option value="tech">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Password</label>
              <Input id="password" type="password" placeholder="••••••••" className="border-surface-container-highest bg-surface" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Confirm Password</label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" className="border-surface-container-highest bg-surface" />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" className="w-4 h-4 rounded border-surface-container-highest text-primary focus:ring-primary" />
            </div>
            <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant">
              I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <div className="mt-8 space-y-4">
            <Button variant="primary" type="button" className="w-full">Create Account</Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-surface-container-highest"></div>
              <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm text-label-sm">OR</span>
              <div className="flex-grow border-t border-surface-container-highest"></div>
            </div>

            <Button variant="outline" type="button" className="w-full gap-2 border-surface-container-highest flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6">
            Already have an account? <a href="#" className="text-primary font-medium hover:underline">Sign in</a>
          </p>
        </form>
      </div>

      {/* Illustration/Information Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container-low p-12 flex-col justify-center relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}>
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-8 rounded-[20px] shadow-sm border border-surface-container-highest">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">3 Steps to Insights</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface mb-1">Connect Data Sources</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Securely integrate your existing tools and proprietary datasets in minutes.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface mb-1">AI Processing</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Our models analyze competitors, market trends, and identify actionable gaps.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface mb-1">Actionable Intelligence</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Receive automated reports and real-time alerts directly to your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
