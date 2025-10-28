'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { aiAgents, groupAgentsByCompany, agentLogos } from '@/lib/agents';

export default function Home() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Redireciona para a página de chat do agente com a query de pesquisa
    router.push(`/ai/lhama-ai-2?q=${encodeURIComponent(search)}`);
  };

  const filteredAgents = search.trim()
    ? aiAgents.filter((agent) =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.company.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase())
      )
    : aiAgents;

  const groupedAgents = groupAgentsByCompany(filteredAgents);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/20">
      <main className="w-full flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center pt-16 text-center md:pt-24">
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Lhama
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Seu navegador pessoal para uma nova geração de agentes de IA.
            </p>
          </div>
          <form onSubmit={handleSearch} className="relative mt-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pergunte qualquer coisa ou busque na web..."
              className="h-14 w-full rounded-full border-2 border-transparent bg-card pl-12 pr-6 text-base transition-all focus:border-primary/50 focus:bg-background focus:shadow-lg focus:shadow-primary/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="ai-browser-bar"
            />
          </form>

          <div className="mt-12 space-y-8">
            {Object.entries(groupedAgents).map(([company, agents]) => (
              <div key={company}>
                <h2 className="text-lg font-semibold text-foreground">{company}</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {agents.map((agent) => {
                    const LogoComponent = agentLogos[agent.logo];
                    return (
                      <Link href={`/ai/${agent.id}`} key={agent.id} className="group">
                        <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                          <CardHeader className="flex-row items-start gap-4 space-y-0">
                             <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                                <LogoComponent className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                              </div>
                            <div>
                              <CardTitle className="text-base">{agent.name}</CardTitle>
                              <CardDescription className="mt-1 text-xs">{agent.family}</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
             {filteredAgents.length === 0 && search.trim() && (
                <div className="py-12 text-center text-muted-foreground">
                    <p>Nenhum agente de IA encontrado para "{search}"</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
