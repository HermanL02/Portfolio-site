import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunFactsData } from '@/types';

interface FunFactsSectionProps {
  data: FunFactsData;
}

export function FunFactsSection({ data }: FunFactsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-3 text-lg">•</span>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}