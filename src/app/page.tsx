import { loadAllData } from '@/lib/data-loader';
import { PortfolioTabs } from '@/components/portfolio-tabs';
import { Sidebar } from '@/components/sidebar';
import { ChatbotModal } from '@/components/ChatbotModal';

export default async function Home() {
  const data = await loadAllData();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-200">
      {/* Left Sidebar - Fixed on desktop, collapsible on mobile */}
      <aside className="lg:w-[400px] lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:overflow-y-auto shadow-xl z-10">
        <Sidebar data={data.intro} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[400px] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700 text-white text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Available for opportunities
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
              Portfolio
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl">
              Explore my projects, experience, and technical expertise
            </p>
          </div>

          {/* Tabs Content */}
          <PortfolioTabs data={data} />
        </div>
      </main>

      {/* Chatbot Modal */}
      <ChatbotModal />
    </div>
  );
}