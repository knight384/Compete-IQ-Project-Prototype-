import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopAppBar } from "@/components/layout/TopAppBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNavBar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopAppBar />
        <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full space-y-stack-lg">
          {children}
        </main>
      </div>
    </>
  );
}
