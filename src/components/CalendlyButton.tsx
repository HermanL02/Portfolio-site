'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

export function CalendlyButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/hermanyiqunliang/30min'
      });
    }
    return false;
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="bg-slate-700 text-white hover:bg-slate-800 rounded-full shadow-md hover:shadow-lg animate-pulse"
    >
      <Calendar className="h-4 w-4" />
      Schedule Coffee Chat with me by Calendly
    </Button>
  );
}
