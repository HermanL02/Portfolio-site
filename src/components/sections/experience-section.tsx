import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ExperienceData } from '@/types';

interface ExperienceSectionProps {
  data: ExperienceData;
}

export function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((experience, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                <MarkdownRenderer content={experience.company} inline />
              </CardTitle>
              <CardDescription>{experience.description}</CardDescription>
              <div className="text-sm text-muted-foreground mt-2">
                📅 {experience.duration}
              </div>
            </CardHeader>
            <CardContent>
              {experience.bullet_points && (
                <ul className="space-y-2 mb-4">
                  {experience.bullet_points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <MarkdownRenderer content={point} inline className="text-sm" />
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="flex flex-wrap gap-2">
                {experience.tag.split(', ').map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    {tag.trim()}
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