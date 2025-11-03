import { loadAllData } from '@/lib/data-loader';
import { PortfolioTabs } from '@/components/portfolio-tabs';

export default async function Home() {
  const data = await loadAllData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-black">
            {data.intro.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 sm:mb-6">
            {data.intro.subtitle}
          </p>
          <blockquote className="text-base sm:text-lg italic text-gray-700 max-w-2xl mx-auto px-4 sm:px-0">
            &ldquo;{data.intro.quote}&rdquo;
            <footer className="text-sm mt-2">— {data.intro.quote_author}</footer>
          </blockquote>
        </header>

        <PortfolioTabs data={data} />
      </div>
    </div>
  );
}