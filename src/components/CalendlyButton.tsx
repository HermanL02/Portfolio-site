'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function CalendlyButton() {
  return (
    <Button
      asChild
      size="lg"
      className="bg-slate-700 text-white hover:bg-slate-800 rounded-full shadow-md hover:shadow-lg animate-pulse"
    >
      <a
        href="https://calendly.com/hermanyiqunliang/30min"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Calendar className="h-4 w-4" />
        Schedule Coffee Chat with me by Calendly
      </a>
    </Button>
  );
}
