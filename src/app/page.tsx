import { loadAllData } from '@/lib/data-loader';
import { PortfolioTabs } from '@/components/portfolio-tabs';

export default async function Home() {
  const data = await loadAllData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {data.intro.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            {data.intro.subtitle}
          </p>
          <blockquote className="text-lg italic text-gray-700 max-w-2xl mx-auto">
            &ldquo;{data.intro.quote}&rdquo;
            <footer className="text-sm mt-2">— {data.intro.quote_author}</footer>
          </blockquote>
        </header>
        
        <PortfolioTabs data={data} />
      </div>
    </div>
  );
}