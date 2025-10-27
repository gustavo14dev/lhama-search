'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { aiAgents, groupAgentsByCompany, agentLogos } from '@/lib/agents';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search } from 'lucide-react';
import { LlamaIcon } from '@/components/icons';

export default function Home() {
  const [search, setSearch] = useState('');

  const filteredAgents = useMemo(() => {
    if (!search) {
      return aiAgents;
    }
    return aiAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.company.toLowerCase().includes(search.toLowerCase()) ||
        agent.family.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedAgents = useMemo(
    () => groupAgentsByCompany(filteredAgents),
    [filteredAgents]
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-4 sm:p-8">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <LlamaIcon className="h-16 w-16 text-primary" />
          <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Busca Lhama
          </h1>
          <p className="max-w-md text-muted-foreground">
            Seu navegador pessoal para uma nova geração de agentes de IA.
          </p>
        </header>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por um agente de IA..."
            className="h-14 w-full rounded-full bg-card pl-12 pr-6 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="w-full space-y-8">
          {Object.keys(groupedAgents).length > 0 ? (
            Object.entries(groupedAgents).map(([company, agents]) => (
              <div key={company} className="space-y-4">
                <h2 className="font-headline text-2xl font-semibold tracking-tight">
                  {company}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => {
                    const LogoComponent = agentLogos[agent.logo];
                    return (
                      <Link
                        href={`/ai/${agent.id}`}
                        key={agent.id}
                        className="group"
                      >
                        <Card className="h-full transform-gpu transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/10">
                          <CardHeader>
                            <div className="mb-4 flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <LogoComponent className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  {agent.name}
                                </CardTitle>
                                <CardDescription>
                                  {agent.family}
                                </CardDescription>
                              </div>
                            </div>

                            <CardDescription>
                              {agent.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-card text-center">
              <h3 className="font-headline text-xl font-semibold">
                Nenhum Agente Encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente um termo de busca diferente.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
