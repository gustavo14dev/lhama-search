import type React from 'react';
import { LlamaIcon, SparkleIcon } from '@/components/icons';

export const agentLogos = {
  lhama: SparkleIcon,
};

export interface AIAgent {
  id: string;
  name: string;
  company: string;
  family: string;
  description: string;
  logo: keyof typeof agentLogos;
  greeting: string;
}

export const aiAgents: AIAgent[] = [
  {
    id: 'lhama-ai-2',
    name: 'Lhama AI 2',
    company: 'Lhama',
    family: 'Lhama AI',
    description:
      'Uma assistente de IA prestativa e amigável, capaz de responder a uma vasta gama de solicitações.',
    logo: 'lhama',
    greeting: 'Olá! 👋 Eu sou a Lhama AI 2. Como posso te ajudar hoje?',
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
