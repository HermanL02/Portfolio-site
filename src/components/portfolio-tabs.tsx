'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllData } from '@/types';
import { CommandLine } from '@/components/ui/command-line';
import { DELETE_CPS, DURATION, EASE_OUT, TYPE_CPS } from '@/lib/motion';
import { ProjectSection } from './sections/project-section';
import { ExperienceSection } from './sections/experience-section';
import { TechStackSection } from './sections/tech-stack-section';
import { EducationSection } from './sections/education-section';
import { CurrentWorkSection } from './sections/current-work-section';
import { LearningSection } from './sections/learning-section';
import { FunFactsSection } from './sections/fun-facts-section';
import { JourneySection } from './sections/journey-section';
import { BlogSection } from './sections/blog-section';

interface PortfolioTabsProps {
  data: AllData;
}

export function PortfolioTabs({ data }: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState('projects');
  const [previousTab, setPreviousTab] = useState('projects');
  const reduced = useReducedMotion();

  const handleTabChange = (value: string) => {
    setPreviousTab(activeTab);
    setActiveTab(value);
  };

  const tabs = [
    { id: 'projects', label: 'projects', component: <ProjectSection data={data.projects} /> },
    { id: 'blog', label: 'blog', component: <BlogSection posts={data.posts} /> },
    { id: 'experience', label: 'experience', component: <ExperienceSection data={data.experience} /> },
    { id: 'tech-stack', label: 'stack', component: <TechStackSection data={data.techStack} /> },
    { id: 'current-work', label: 'current', component: <CurrentWorkSection data={data.currentWork} /> },
    { id: 'learning', label: 'learning', component: <LearningSection data={data.learning} /> },
    { id: 'education', label: 'edu', component: <EducationSection data={data.education} /> },
    { id: 'journey', label: 'journey', component: <JourneySection data={data.journey} /> },
    { id: 'fun-facts', label: 'facts', component: <FunFactsSection data={data.funFacts} /> },
  ];

  // Output waits for the command to finish being typed, the way a shell does.
  // Derived from the actual string lengths so it always matches what the
  // prompt is doing rather than being a guessed constant.
  const commandDuration = reduced
    ? 0
    : previousTab.length / DELETE_CPS + activeTab.length / TYPE_CPS;

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Tab bar styled as terminal command options */}
      <div className="w-full mb-8">
        <div className="border border-terminal-border bg-terminal-surface">
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-terminal-border text-xs text-muted-foreground">
            <span className="text-terminal-green">$</span>
            <span>herman</span>
            <span className="text-terminal-amber">--section</span>
            <CommandLine value={activeTab} />
          </div>
          <TabsList className="flex w-full flex-wrap bg-transparent p-1 gap-0.5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative text-xs px-3 py-1.5 border border-transparent rounded-none transition-colors text-muted-foreground hover:text-foreground hover:bg-terminal-surface-2 data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:border-terminal-border-strong"
              >
                {tab.id === activeTab && (
                  <motion.span
                    layoutId="tab-selection"
                    className="absolute inset-0 -z-10 bg-terminal-surface-3"
                    transition={{ duration: DURATION.state, ease: EASE_OUT }}
                  />
                )}
                ./{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          <div className="border border-terminal-border bg-terminal-surface p-6 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: 'brightness(0.35)' }}
                transition={{
                  duration: reduced ? 0 : DURATION.state,
                  ease: EASE_OUT,
                  delay: commandDuration,
                }}
              >
                {tab.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
