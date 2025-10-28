import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentById, agentLogos } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChatPageWrapper from './chat';

export default function AgentPage({ params }: { params: { agentId: string } }) {
  const agent = getAgentById(params.agentId);

  if (!agent) {
    notFound();
  }

  const LogoComponent = agentLogos[agent.logo];

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Button asChild variant="ghost" size="icon" className="h-10 w-10">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar para a busca</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <LogoComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">
              Por {agent.company}
            </p>
          </div>
        </div>
      </header>
      <ChatPageWrapper agent={agent} />
    </div>
  );
}
