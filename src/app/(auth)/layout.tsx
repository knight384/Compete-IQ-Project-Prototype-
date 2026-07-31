export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center p-4 md:p-8 bg-background relative overflow-hidden font-body-md text-on-background">
      {/* Abstract Background Gradient - Used in Login */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
