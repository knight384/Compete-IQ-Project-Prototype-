import * as React from "react"
import { Button } from "@/components/ui/Button"

export default function LandingPage() {
  return (
    <header className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Abstract Background Gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-surface to-surface -z-10 blur-3xl opacity-60 pointer-events-none"></div>
      
      <div className="max-w-container-max mx-auto px-margin-page grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">new_releases</span>
            Introducing CompetIQ AI 2.0
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight">
            Monitor Competitors. <br/><span className="text-primary">Discover Opportunities.</span> <br/>Stay Ahead.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            AI-powered competitor intelligence platform that continuously monitors competitors, customer reviews, pricing changes, product launches, market trends, and business opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="primary" size="lg" className="shadow-[0px_4px_20px_-2px_rgba(37,99,235,0.3)] gap-2">
              Start Free Trial
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
            <Button variant="outline" size="lg" className="border-outline-variant/30 gap-2">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">JD</div>
              <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px] font-bold">AM</div>
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">+2k</div>
            </div>
            <span>Trusted by 2,000+ analysts</span>
          </div>
        </div>
        
        <div className="relative">
          {/* Dashboard Mockup */}
          <div className="relative z-10 rounded-[20px] border border-surface-variant/60 bg-surface-container-lowest shadow-[0px_12px_32px_-4px_rgba(15,23,42,0.1)] p-4 overflow-hidden transform md:rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
            {/* Faux Browser Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-surface-variant/30 pb-3">
              <div className="w-3 h-3 rounded-full bg-error/80"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary-container/80"></div>
              <div className="w-3 h-3 rounded-full bg-primary-container/80"></div>
            </div>
            {/* Mock Content */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="h-32 rounded-[12px] bg-gradient-to-br from-surface-container to-surface-container-low border border-surface-variant/50 p-4">
                  <div className="w-1/3 h-4 bg-surface-container-high rounded mb-4"></div>
                  <div className="flex items-end gap-2 h-16">
                    <div className="w-1/6 bg-primary/40 rounded-t h-[40%]"></div>
                    <div className="w-1/6 bg-primary/60 rounded-t h-[60%]"></div>
                    <div className="w-1/6 bg-primary/80 rounded-t h-[80%]"></div>
                    <div className="w-1/6 bg-primary rounded-t h-[100%]"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-[12px] bg-surface-container-low border border-surface-variant/50 p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-surface-container-high rounded"></div>
                    <div className="w-3/4 h-6 bg-surface-container-highest rounded"></div>
                  </div>
                  <div className="h-24 rounded-[12px] bg-surface-container-low border border-surface-variant/50 p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-surface-container-high rounded"></div>
                    <div className="w-3/4 h-6 bg-surface-container-highest rounded"></div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 space-y-4">
                <div className="h-60 rounded-[12px] bg-surface-container-low border border-surface-variant/50 p-4 flex flex-col gap-3">
                  <div className="w-2/3 h-4 bg-surface-container-high rounded mb-2"></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-container-high"></div><div className="w-full h-3 bg-surface-container-high rounded"></div></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-container-high"></div><div className="w-full h-3 bg-surface-container-high rounded"></div></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-container-high"></div><div className="w-full h-3 bg-surface-container-high rounded"></div></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-container-high"></div><div className="w-full h-3 bg-surface-container-high rounded"></div></div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl -z-10"></div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10"></div>
        </div>
      </div>
    </header>
  );
}
