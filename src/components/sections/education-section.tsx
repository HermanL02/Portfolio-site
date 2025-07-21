import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { EducationData, EducationItem } from '@/types';

interface EducationSectionProps {
  data: EducationData;
}

export function EducationSection({ data }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((item: EducationItem, index: number) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                <MarkdownRenderer content={`${item.degree}, **${item.school}**`} inline />
              </CardTitle>
              <CardDescription>
                <MarkdownRenderer content={item.description} inline />
              </CardDescription>
              <div className="text-sm text-muted-foreground mt-2">
                📅 {item.duration}
              </div>
            </CardHeader>
            <CardContent>
              {item.bullet_points && item.bullet_points.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {item.bullet_points.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <MarkdownRenderer content={point} inline className="text-sm" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                {item.skills.split(',').map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill.trim()}
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