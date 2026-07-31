export function SideNavBar() {
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-[260px] z-40 flex flex-col bg-surface-container-lowest dark:bg-inverse-surface border-r border-outline-variant dark:border-outline">
      <div className="px-6 py-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <img alt="Organization Logo" className="w-8 h-8 rounded-md" data-alt="A small, stylized geometric logo in shades of blue representing artificial intelligence and corporate analytics, set against a pristine white background. Clean, modern aesthetic suitable for an enterprise dashboard. High resolution, sharp edges." src="https://lh3.googleusercontent.com/aida-public/AB6AXuACjuCRZAIoL51x_naP9NmEqPTi60tDS_U160ymEXQsWn7w7EGqVM24tCPzXgE29R0UoWCu1t2xk-CwTBCCdXVZ71c7EIRK8TFVwYqDLRnfbvfQN4HQzP0-HccBp18ORQLX11HLvoiq5d8G9ox3yuUrOqAUVB5A_WVFlF0wvmwxjuprAXYkCOXpT8MQRTcm4GOQKZMWxmTP_G4yN46vr5348Zfe4fsX-mXK0LWVw7Nlb9uWrqxRi1xgLg"/>
          <div>
            <h1 className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">CompetIQ AI</h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant">Enterprise Analytics</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <a className="text-primary dark:text-primary-fixed bg-secondary-fixed/10 flex items-center gap-3 px-4 py-3 border-l-4 border-primary rounded-r-lg" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-label-md font-label-md">Dashboard</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-label-md font-label-md">Competitors</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">database</span>
          <span className="text-label-md font-label-md">Data Collection</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-label-md font-label-md">AI Intelligence</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">assessment</span>
          <span className="text-label-md font-label-md">Reports</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-label-md font-label-md">Alerts</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md font-label-md">Settings</span>
        </a>
      </div>
      <div className="p-6">
        <button className="w-full bg-primary-container text-on-primary py-2 px-4 rounded-lg text-label-md font-label-md hover:opacity-90 transition-opacity">
          Upgrade Plan
        </button>
      </div>
      <div className="px-4 pb-6 space-y-1 border-t border-outline-variant pt-4 mt-auto">
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">help</span>
          <span className="text-label-md font-label-md">Help Center</span>
        </a>
        <a className="text-on-surface-variant dark:text-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-label-md font-label-md">Account</span>
        </a>
      </div>
    </nav>
  );
}
