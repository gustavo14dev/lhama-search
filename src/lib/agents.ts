import type React from 'react';
import { LlamaIcon } from '@/components/icons';

export interface AIAgent {
  id: string;
  name: string;
  company: string;
  family: string;
  description: string;
  logo: React.ComponentType<{ className?: string }>;
  greeting: string;
}

export const aiAgents: AIAgent[] = [
  {
    id: 'lhama-ai-2',
    name: 'Lhama AI 2',
    company: 'Lhama',
    family: 'Lhama AI',
    description:
      'A helpful and friendly AI assistant capable of answering a wide range of user requests.',
    logo: LlamaIcon,
    greeting: "Hello! I'm Lhama AI 2. How can I assist you today?",
  },
];

export function getAgentById(id: string): AIAgent | undefined {
  return aiAgents.find((agent) => agent.id === id);
}

export function groupAgentsByCompany(agents: AIAgent[]) {
  return agents.reduce((acc, agent) => {
    (acc[agent.company] = acc[agent.company] || []).push(agent);
    return acc;
  }, {} as Record<string, AIAgent[]>);
}
