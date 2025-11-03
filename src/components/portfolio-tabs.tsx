'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllData } from '@/types';
import { ProjectSection } from './sections/project-section';
import { ExperienceSection } from './sections/experience-section';
import { TechStackSection } from './sections/tech-stack-section';
import { EducationSection } from './sections/education-section';
import { CurrentWorkSection } from './sections/current-work-section';
import { LearningSection } from './sections/learning-section';
import { FunFactsSection } from './sections/fun-facts-section';
import { JourneySection } from './sections/journey-section';

interface PortfolioTabsProps {
  data: AllData;
}

export function PortfolioTabs({ data }: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState('projects');

  const tabs = [
    { id: 'projects', label: '💼 Projects', component: <ProjectSection data={data.projects} /> },
    { id: 'experience', label: '💼 Experience', component: <ExperienceSection data={data.experience} /> },
    { id: 'tech-stack', label: '🧰 Tech Stack', component: <TechStackSection data={data.techStack} /> },
    { id: 'current-work', label: '🔭 Current Work', component: <CurrentWorkSection data={data.currentWork} /> },
    { id: 'learning', label: '🌱 Learning', component: <LearningSection data={data.learning} /> },
    { id: 'education', label: '📚 Education', component: <EducationSection data={data.education} /> },
    { id: 'journey', label: '🕰️ Journey', component: <JourneySection data={data.journey} /> },
    { id: 'fun-facts', label: '✨ Fun Facts', component: <FunFactsSection data={data.funFacts} /> },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="w-full mb-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-300 p-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-xs lg:text-sm px-3 py-2.5 whitespace-nowrap rounded-xl data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:bg-slate-200 transition-all duration-200 font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 animate-in fade-in-50 duration-300">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-300 p-8">
            {tab.component}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}