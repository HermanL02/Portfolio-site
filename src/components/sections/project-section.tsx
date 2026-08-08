'use client';

import { useState } from 'react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ProjectData } from '@/types';
import { ExternalLink, Github } from 'lucide-react';
import { Printed } from '@/components/ui/printed';

interface ProjectSectionProps {
  data: ProjectData;
}

/** Filters shown before the list collapses behind a toggle. */
const VISIBLE_TAG_COUNT = 12;

export function ProjectSection({ data }: ProjectSectionProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  // Ordered by how many projects carry each tag, so the useful filters come
  // first instead of an alphabetical wall of 35 equally-weighted options.
  const tagCounts = data.items
    .flatMap(item => item.tag.split(', '))
    .map(tag => tag.trim())
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});

  const allTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b)
  );

  // Never hide a filter the visitor has already switched on.
  const visibleTags = showAllTags
    ? allTags
    : Array.from(
        new Set([...allTags.slice(0, VISIBLE_TAG_COUNT), ...selectedTags])
      );
  const hiddenTagCount = allTags.length - visibleTags.length;

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
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">{data.title}</h2>
        <p className="text-xs text-muted-foreground">{filteredProjects.length} entries found</p>
      </div>

      {/* Filter tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={clearFilters}
          className={`text-xs px-2 py-1 border transition-colors ${
            selectedTags.length === 0
              ? 'border-terminal-green text-terminal-green-bright bg-terminal-surface-3'
              : 'border-terminal-border text-muted-foreground hover:text-terminal-green-bright hover:border-terminal-border-strong hover:bg-terminal-surface-2'
          }`}
        >
          --all
        </button>
        {visibleTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            aria-pressed={selectedTags.includes(tag)}
            className={`text-xs px-2 py-1 border transition-colors ${
              selectedTags.includes(tag)
                ? 'border-terminal-green text-terminal-green-bright bg-terminal-surface-3'
                : 'border-terminal-border text-muted-foreground hover:text-terminal-green-bright hover:border-terminal-border-strong hover:bg-terminal-surface-2'
            }`}
          >
            --{tag.toLowerCase().replace(/\s+/g, '-')}
          </button>
        ))}
        {(hiddenTagCount > 0 || showAllTags) && (
          <button
            onClick={() => setShowAllTags(v => !v)}
            className="text-xs px-2 py-1 border border-transparent text-terminal-green-dim hover:text-terminal-green-bright hover:border-terminal-border-strong transition-colors"
          >
            {showAllTags ? '− less' : `+ ${hiddenTagCount} more`}
          </button>
        )}
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <div className="border border-terminal-border bg-terminal-surface-2 p-8 text-center">
          <p className="text-sm text-foreground">No projects match those filters.</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-terminal-green hover:text-terminal-green-bright underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
      <Printed className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project, index) => (
          <div
            key={index}
            className="h-full border border-terminal-border bg-terminal-surface-2 p-5 hover:border-terminal-green-dim transition-colors group hover-lift"
          >
            {/* Project header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-terminal-green transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-terminal-green transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {project.deployment && project.deployment !== project.link && (
                  <a
                    href={project.deployment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-terminal-amber transition-colors"
                    aria-label="Live Demo"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Bullet points */}
            <ul className="space-y-1.5 mb-4">
              {project.bullet_points.map((point, pointIndex) => (
                <li key={pointIndex} className="flex items-start text-xs">
                  <span className="text-terminal-green mr-2 shrink-0">&gt;</span>
                  <MarkdownRenderer content={point} inline />
                </li>
              ))}
            </ul>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tag.split(', ').map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="text-[10px] px-1.5 py-0.5 border border-terminal-border text-muted-foreground"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Printed>
      )}
    </div>
  );
}
