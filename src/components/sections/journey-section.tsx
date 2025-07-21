import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { JourneyData } from '@/types';

interface JourneySectionProps {
  data: JourneyData;
}

export function JourneySection({ data }: JourneySectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-8">
            {data.timeline.map((event, index) => (
              <div key={index} className="relative flex items-start">
                <div className="absolute left-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow"></div>
                
                <div className="ml-16 flex-1">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="font-mono">
                          {event.year}
                        </Badge>
                        <CardTitle className="text-lg">
                          <MarkdownRenderer content={event.event} inline />
                        </CardTitle>
                      </div>
                    </CardHeader>
                    {event.details && (
                      <CardContent>
                        <ul className="space-y-2">
                          {event.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <MarkdownRenderer 
                                content={typeof detail === 'string' ? detail : JSON.stringify(detail)} 
                                inline 
                              />
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <div className="text-xl font-bold text-gray-700">
            <MarkdownRenderer content={data.footer} inline />
          </div>
        </div>
      </div>
    </div>
  );
}