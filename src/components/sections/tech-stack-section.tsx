import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TechStackData } from '@/types';

interface TechStackSectionProps {
  data: TechStackData;
}

export function TechStackSection({ data }: TechStackSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data.categories).map(([category, technologies]) => (
          <Card key={category} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {technologies.split(', ').map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tech.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}