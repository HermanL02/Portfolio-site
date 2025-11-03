import { loadAllData } from '@/lib/data-loader';
import { PortfolioTabs } from '@/components/portfolio-tabs';
import { Sidebar } from '@/components/sidebar';

export default async function Home() {
  const data = await loadAllData();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Sidebar - Fixed on desktop, collapsible on mobile */}
      <aside className="lg:w-[400px] lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Sidebar data={data.intro} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[400px] bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <PortfolioTabs data={data} />
        </div>
      </main>
    </div>
  );
}