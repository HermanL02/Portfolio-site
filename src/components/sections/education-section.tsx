import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { EducationData } from '@/types';

interface EducationSectionProps {
  data: EducationData;
}

export function EducationSection({ data }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Academic Background</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.items.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-blue-500 mr-3 text-lg">•</span>
                  <MarkdownRenderer content={item} inline className="text-lg" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}