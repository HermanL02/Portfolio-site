'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ProjectData } from '@/types';

interface ProjectSectionProps {
  data: ProjectData;
}

export function ProjectSection({ data }: ProjectSectionProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(
    new Set(
      data.items
        .flatMap(item => item.tag.split(', '))
        .map(tag => tag.trim())
    )
  );

  const filteredProjects = selectedTags.length === 0 
    ? data.items 
    : data.items.filter(project => 
        selectedTags.some(tag => 
          project.tag.toLowerCase().includes(tag.toLowerCase())
        )
      );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
        
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Button 
            variant={selectedTags.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={clearFilters}
          >
            All Projects
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>{project.name}</span>
                <div className="flex flex-wrap gap-2">
                  {project.tag.split(', ').map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {project.bullet_points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <MarkdownRenderer content={point} inline />
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-2">
                {project.link && (
                  <Button asChild size="sm">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </Button>
                )}
                {project.deployment && project.deployment !== project.link && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.deployment} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}