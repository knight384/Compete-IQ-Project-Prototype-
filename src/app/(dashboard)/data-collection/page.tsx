"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { DATA_SOURCES, MAPPING_DATA } from "@/lib/mockData/data"

export default function DataCollectionPage() {
  return (
    <>
      <PageHeader 
        title="Data Collection Center" 
        description="Manage your data pipelines, web scrapers, and external integrations."
        className="mb-8"
      >
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">add</span> Connect New Source
        </Button>
      </PageHeader>

      <DashboardCard title="Connected Data Sources" className="mb-8 shadow-ambient-1 border-surface-variant" action={
        <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
      }>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DATA_SOURCES.map(source => (
            <div key={source.id} className={`border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-bright cursor-pointer transition-colors ${source.status === "Coming Soon" ? "opacity-60 bg-surface-container-low" : ""}`}>
              <div className={`w-10 h-10 rounded bg-${source.color}-100 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[24px] text-${source.color}-600`}>{source.icon}</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">{source.name}</span>
              {source.status === "Coming Soon" && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Smart Column Mapping" className="mb-8 shadow-ambient-1 border-surface-variant">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 overflow-x-auto border border-surface-variant rounded-lg">
            <Table className="w-full text-left min-w-[500px]">
              <TableHeader className="bg-surface-bright">
                <TableRow className="border-b border-surface-variant">
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Review_Text_Raw</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Stars</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Date_Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body-sm text-on-surface">
                {MAPPING_DATA.map(row => (
                  <TableRow key={row.id} className="border-b border-surface-variant">
                    <TableCell className="px-4 py-3 truncate max-w-[200px]">{row.raw}</TableCell>
                    <TableCell className="px-4 py-3">{row.rating}</TableCell>
                    <TableCell className="px-4 py-3">{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 border border-surface-variant rounded-lg bg-surface-bright">
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Uploaded Column</div>
                <div className="font-label-md">Review_Text_Raw</div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">AI Field</div>
                <div className="font-label-md text-primary flex items-center gap-1">Content <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-surface-variant rounded-lg bg-surface-bright">
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Uploaded Column</div>
                <div className="font-label-md">Stars</div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">AI Field</div>
                <div className="font-label-md text-primary flex items-center gap-1">Rating <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-surface-variant rounded-lg bg-surface-bright">
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Uploaded Column</div>
                <div className="font-label-md">Date_Posted</div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">AI Field</div>
                <div className="font-label-md text-primary flex items-center gap-1">Date <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        <div className="lg:col-span-2">
          <DashboardCard title="AI Processing Pipeline" className="shadow-ambient-1 border-surface-variant h-full">
            <div className="flex items-center justify-between relative px-4 mt-8">
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-surface-variant -z-10"></div>
              <div className="absolute left-8 w-[60%] top-1/2 -translate-y-1/2 h-1 bg-primary -z-10"></div>
              
              <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm">Upload</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm">Cleaning</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-surface-container-lowest text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Sentiment</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-variant bg-surface-container-lowest text-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Extraction</span>
              </div>
            </div>
          </DashboardCard>
        </div>
        <div className="lg:col-span-1">
          <DashboardCard title="Storage Usage" className="shadow-ambient-1 border-surface-variant h-full">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-variant" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-primary" strokeDasharray="351.8" strokeDashoffset="87.95" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-headline-sm font-bold text-on-surface">75%</span>
                  <span className="text-[10px] text-on-surface-variant">Used</span>
                </div>
              </div>
              <div className="w-full flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface-variant">37.5 GB Used</span>
                <span className="text-on-surface-variant">50 GB Total</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
