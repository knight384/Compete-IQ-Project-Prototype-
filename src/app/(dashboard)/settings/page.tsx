"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Input } from "@/components/ui/Input"

export default function SettingsPage() {
  return (
    <>
      <PageHeader 
        title="Workspace Settings" 
        description="Manage your organization's core details and preferences."
        className="mb-8"
      >
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">save</span> Save Settings
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-1 border-r border-outline-variant/30 pr-4">
             <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-bold border-l-2 border-primary text-label-md font-label-md">
               <span className="material-symbols-outlined text-xl">domain</span>
               Organization
             </button>
             <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-label-md font-label-md border-l-2 border-transparent">
               <span className="material-symbols-outlined text-xl">group</span>
               Team
             </button>
             <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-label-md font-label-md border-l-2 border-transparent">
               <span className="material-symbols-outlined text-xl">memory</span>
               AI Models
             </button>
          </div>
        </div>
        <div className="lg:col-span-9 flex flex-col gap-gutter">
          <DashboardCard title="Organization Details" titleIcon={<span className="material-symbols-outlined text-primary text-sm">info</span>} className="border-surface-container-highest shadow-ambient-1">
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Workspace Name <span className="text-error">*</span></label>
                  <Input defaultValue="Acme Corp Global" />
                </div>
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Industry Sector</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                    <option>Technology & SaaS</option>
                    <option>Financial Services</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-3">Workspace Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-center overflow-hidden">
                    <img alt="Workspace Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFYjkiwKUifbXuAk9I6KM54lYs72c-4Od_wtWwaF0aQibZXIGFYy6tlbPDBX-NqYJbrLS9zTo3kcl3F7b73lV1hEBB18AEYndQpEQScQt3Uv1QB_ZSbsdIquQZ38djrIrQhfE2knLz5tXAsQfWuLnVfus6fPQMTFe_2WN7LBkf-KmT_o0wuH4HHT5A-LTqn5s9wtCJ4qo2r0bjt2z5tSzdu2R8C4TRMePaRSwkmhX5e_EOQdtwe3GrtA" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-outline-variant text-on-surface">Change</Button>
                    <Button variant="ghost" className="text-error hover:bg-error/10">Remove</Button>
                  </div>
                </div>
                <p className="text-label-sm font-label-sm text-outline mt-2">Recommended size: 256x256px. Max 2MB (JPG, PNG).</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="AI Preferences" titleIcon={<span className="material-symbols-outlined text-primary text-sm">psychology</span>} className="border-surface-container-highest shadow-ambient-1">
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between py-2 border-b border-surface-variant/50 pb-6">
                <div>
                  <div className="text-label-md font-label-md text-on-surface">Automated Competitor Scanning</div>
                  <div className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Allow AI to autonomously discover and analyze new market entrants.</div>
                </div>
                <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in" id="toggle1" />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer transition-colors duration-200 ease-in"></label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Primary Inference Model</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                    <option>CompetIQ Pro (Recommended)</option>
                    <option>CompetIQ Fast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Confidence Threshold</label>
                  <div className="flex items-center gap-4 h-10">
                    <input type="range" min="50" max="99" defaultValue="85" className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" />
                    <span className="text-label-md font-label-md text-on-surface w-12 text-right">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
