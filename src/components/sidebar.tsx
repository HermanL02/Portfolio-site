import { IntroData } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Linkedin, Globe, MapPin } from 'lucide-react';

interface SidebarProps {
  data: IntroData;
}

export function Sidebar({ data }: SidebarProps) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 flex flex-col">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Profile Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {data.title}
          </h1>
          <p className="text-lg text-slate-300">
            {data.subtitle}
          </p>
          {data.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {data.address}
            </a>
          )}
        </div>

        {/* Quote Section */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <blockquote className="text-sm italic text-slate-300">
            &ldquo;{data.quote}&rdquo;
          </blockquote>
          <footer className="text-xs text-slate-400 mt-2">
            &mdash; {data.quote_author}
          </footer>
        </Card>

        {/* Contact Links */}
        <div className="space-y-3">
          <a
            href={`mailto:${data.contact.email}`}
            className="block"
          >
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              <span className="truncate">{data.contact.email}</span>
            </Button>
          </a>

          <a
            href={data.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </a>

          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
            >
              <Globe className="h-4 w-4" />
              Website
            </Button>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          &copy; {new Date().getFullYear()} {data.title}
        </p>
      </div>
    </div>
  );
}
