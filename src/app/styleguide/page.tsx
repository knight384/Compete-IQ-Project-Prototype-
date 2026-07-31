"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Search } from "@/components/ui/Search"
import { Badge } from "@/components/ui/Badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { EmptyState, LoadingState, LoadingSpinner } from "@/components/shared/Feedback"
import { Modal } from "@/components/ui/Modal"
import { Drawer } from "@/components/ui/Drawer"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { PageHeader, PageContainer } from "@/components/shared/PageLayout"
import { ChartWrapper } from "@/components/shared/ChartWrapper"

export default function StyleguidePage() {
  return (
    <PageContainer className="py-12">
      <PageHeader 
        title="Component Styleguide" 
        description="Visual verification of the shared component library."
      >
        <Button>Primary Action</Button>
      </PageHeader>

      <div className="space-y-16">
        {/* Buttons */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Buttons</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><span className="material-symbols-outlined">add</span></Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Badges</h3>
          <div className="flex gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
        </section>

        {/* Inputs & Search */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Inputs & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input placeholder="Standard Input..." />
            <Search placeholder="Search components..." />
            <Input disabled placeholder="Disabled Input..." />
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Alerts</h3>
          <div className="grid gap-4 max-w-2xl">
            <Alert variant="default">
              <span className="material-symbols-outlined">info</span>
              <div>
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>This is a default information alert.</AlertDescription>
              </div>
            </Alert>
            <Alert variant="success">
              <span className="material-symbols-outlined">check_circle</span>
              <div>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>The operation was completed successfully.</AlertDescription>
              </div>
            </Alert>
            <Alert variant="warning">
              <span className="material-symbols-outlined">warning</span>
              <div>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please be careful with this action.</AlertDescription>
              </div>
            </Alert>
            <Alert variant="error">
              <span className="material-symbols-outlined">error</span>
              <div>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went critically wrong.</AlertDescription>
              </div>
            </Alert>
          </div>
        </section>

        {/* Cards & KPIs */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Cards & KPIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>A simple card component.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-on-surface">Card content goes here.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <KPICard 
              title="Opportunity Score"
              value={<>8.4<span className="text-headline-sm font-headline-sm text-outline-variant">/10</span></>}
              icon="insights"
              iconClassName="bg-secondary/10 text-secondary"
              trend={{ value: "High Potential", label: "Identified today", isPositive: true }}
            />

            <DashboardCard title="Quick Actions" action={<Button size="icon" variant="ghost"><span className="material-symbols-outlined">more_vert</span></Button>}>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="justify-start">Action 1</Button>
                <Button variant="secondary" className="justify-start">Action 2</Button>
              </div>
            </DashboardCard>
          </div>
        </section>

        {/* Tables */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Tables</h3>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Synthetix</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                  <TableCell className="text-right">9.2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ApexCorp</TableCell>
                  <TableCell><Badge variant="warning">Review</Badge></TableCell>
                  <TableCell className="text-right">7.4</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Feedback & Loading */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Feedback & Empty States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState 
              title="No Competitors Found"
              description="You haven't added any competitors to track yet."
              action={<Button variant="primary">Add Competitor</Button>}
            />
            <div className="border border-surface-variant rounded-card bg-surface-container-lowest">
              <LoadingState title="Analyzing Data..." description="This might take a few seconds." />
            </div>
          </div>
        </section>

        {/* Navigation & Overlays */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Navigation & Overlays</h3>
          <div className="space-y-6">
            <Breadcrumb items={[
              { label: 'Dashboard', href: '#' },
              { label: 'Competitors', href: '#' },
              { label: 'Synthetix' }
            ]} />
            
            <div className="flex gap-4">
              <Button onClick={() => alert('Modal overlay opens')}>Test Modal</Button>
              <Button variant="outline" onClick={() => alert('Drawer opens')}>Test Drawer</Button>
            </div>
          </div>
        </section>
        
        {/* Charts */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">Charts</h3>
          <Card className="p-6">
             <ChartWrapper 
               type="bar" 
               data={{
                 labels: ['A', 'B', 'C'],
                 datasets: [{
                   label: 'Score',
                   data: [65, 80, 45],
                   backgroundColor: '#2563EB'
                 }]
               }} 
             />
          </Card>
        </section>

        {/* System States & Feedback (Stage 3.5 addition) */}
        <section className="space-y-4">
          <h3 className="text-headline-md font-headline-md border-b border-surface-variant pb-2">System States & Feedback</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title="Empty State (Data)" className="shadow-ambient-1 border-surface-container-highest">
              <EmptyState 
                title="No competitors found" 
                description="You haven't added any competitors to track yet. Start by adding your first competitor to the intelligence engine."
                icon="person_off"
                action={<Button variant="primary">Add Competitor</Button>}
              />
            </DashboardCard>

            <DashboardCard title="Loading State" className="shadow-ambient-1 border-surface-container-highest">
              <LoadingState description="Analyzing 10,000+ data points..." />
            </DashboardCard>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashboardCard title="Error State" className="shadow-ambient-1 border-surface-container-highest">
              <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
                <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">error</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Connection Failed</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mb-6 max-w-sm">We couldn't reach the intelligence API. Please check your network connection and try again.</p>
                <Button variant="outline" className="border-outline-variant text-on-surface shadow-sm">
                  Retry Connection
                </Button>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Success State" className="shadow-ambient-1 border-surface-container-highest">
              <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
                <div className="w-16 h-16 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Import Successful</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mb-6 max-w-sm">Your CSV file has been processed and 524 new data points have been added to the repository.</p>
                <Button variant="primary" className="shadow-sm">
                  View Data
                </Button>
              </div>
            </DashboardCard>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
