"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Input } from "@/components/ui/Input"
import { USER_PROFILE } from "@/lib/mockData/admin"

export default function ProfilePage() {
  return (
    <>
      <PageHeader 
        title="User Profile" 
        description="Manage your personal information and account preferences."
        className="mb-8"
      >
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">save</span> Save Changes
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <DashboardCard title="Profile Photo" className="border-surface-container-highest shadow-ambient-1">
            <div className="flex flex-col items-center py-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-variant mb-4">
                <img src={USER_PROFILE.avatar} alt={USER_PROFILE.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{USER_PROFILE.name}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">{USER_PROFILE.role}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="border-outline-variant text-on-surface shadow-sm">Change Photo</Button>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <DashboardCard title="Personal Information" className="border-surface-container-highest shadow-ambient-1">
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Full Name</label>
                  <Input defaultValue={USER_PROFILE.name} />
                </div>
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Email Address</label>
                  <Input defaultValue={USER_PROFILE.email} type="email" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Role</label>
                  <Input defaultValue={USER_PROFILE.role} disabled />
                </div>
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Department</label>
                  <Input defaultValue={USER_PROFILE.department} disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">Timezone</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                    <option>{USER_PROFILE.timezone}</option>
                    <option>UTC (GMT)</option>
                    <option>UTC+1 (CET)</option>
                  </select>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
