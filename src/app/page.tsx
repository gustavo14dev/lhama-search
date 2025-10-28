'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Redireciona para a página de chat do agente com a query de pesquisa
    router.push(`/ai/lhama-ai-2?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/20">
      <main className="w-full flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center pt-24 text-center">
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
        </div>
      </main>
    </div>
  );
}
