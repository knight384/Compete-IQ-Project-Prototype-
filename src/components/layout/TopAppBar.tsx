export function TopAppBar() {
  return (
    <header className="sticky top-0 right-0 z-30 flex justify-between items-center px-gutter h-16 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl shadow-sm border-b border-surface-variant/50">
      <div className="flex items-center">
        <div className="relative input-focus flex items-center bg-surface-container-lowest border border-slate-200 rounded-lg px-3 py-1.5 w-64 transition-all">
          <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
          <input className="bg-transparent border-none outline-none text-body-sm font-body-sm w-full placeholder:text-outline-variant focus:ring-0 p-0" placeholder="Search insights..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-variant/50 rounded-full p-2 transition-colors focus:ring-2 ring-primary/10">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-variant/50 rounded-full p-2 transition-colors focus:ring-2 ring-primary/10">
          <span className="material-symbols-outlined">apps</span>
        </button>
        <img alt="User Profile Avatar" className="w-8 h-8 rounded-full border border-surface-variant ml-2 object-cover" data-alt="A high-quality, professional headshot of a corporate executive, smiling warmly." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUuLBWL2srOe1JpX0o-6mCh6ppvzlL3yREopXMCBUqRcE65C4G1NWLd9duiiNlGNdlgGScRmGNyz3nI39WnHJ9iRvaye1B-349Q5f7qONMnGXChb1sqqYgcVo06vR8Labv4qN6HgDn7MlTjr3kcsBKAuNV69s-qUJHuX7v3vJaoBwzqGe2TKuBEMObCjm4rjYORTRgn2Oj4qS7qiUnpV9sNShXjw4zXV4l-zRPEZSCLjhXrjcmTAiGZA"/>
      </div>
    </header>
  );
}
