import * as React from "react"
import { Button } from "@/components/ui/Button"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col antialiased">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 max-w-container-max mx-auto bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-surface-variant/50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-8">
          <a className="text-headline-md font-headline-md font-bold text-on-surface dark:text-surface-bright flex items-center gap-2" href="#">
            <span className="material-symbols-outlined text-primary" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            CompetIQ AI
          </a>
          <ul className="hidden md:flex items-center gap-6">
            <li><a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#">Features</a></li>
            <li><a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#">Solutions</a></li>
            <li><a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#">Pricing</a></li>
            <li><a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#">Resources</a></li>
            <li><a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#">About</a></li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex">Login</Button>
          <Button variant="primary">Start Free Trial</Button>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {children}
      </main>

      <footer className="w-full py-12 px-gutter flex flex-col md:flex-row justify-between items-center gap-stack-md bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline mt-24">
        <div className="flex items-center gap-2 text-headline-sm font-headline-sm font-bold text-on-surface dark:text-surface-bright">
          <span className="material-symbols-outlined text-primary">analytics</span>
          CompetIQ AI
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Security</a>
          <a className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Status</a>
          <a className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
        </div>
        <div className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant text-center md:text-right">
          © 2024 CompetIQ AI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
