"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { REPOSITORY_ITEMS } from "@/lib/mockData/data"

export default function RepositoryPage() {
  return (
    <>
      <PageHeader 
        title="Intelligence Repository" 
        description="Centralized storage for all your competitive analysis documents."
        className="mb-8"
      >
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">upload_file</span> Upload Document
        </Button>
      </PageHeader>

      <DashboardCard title="Repository Documents" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden" action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input type="text" placeholder="Search repository..." className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary focus:border-primary w-64" />
          </div>
          <Button variant="outline" className="h-9 px-3 gap-1">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
          </Button>
        </div>
      }>
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Document Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Size</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Author</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {REPOSITORY_ITEMS.map(item => (
                <TableRow key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">description</span>
                    {item.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{item.type}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{item.size}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{item.author}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{item.date}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors" title="Download">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                    <button className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors ml-2" title="Delete">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </>
  );
}
