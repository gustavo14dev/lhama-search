
'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { lhamaAI2Agent, type LhamaAI2AgentOutput } from '@/ai/flows/lhama-ai-2-agent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type SearchResult = NonNullable<LhamaAI2AgentOutput['searchResults']>[number];

const SearchResultCard = ({ result }: { result: SearchResult }) => {
  const siteName = result.pagemap?.metatags?.[0]?.['og:site_name'] || new URL(result.link).hostname.replace('www.', '');
  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(result.link).hostname}&sz=32`;
  const thumbnail = result.pagemap?.cse_thumbnail?.[0]?.src;

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <a href={result.link} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/40">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <Image src={favicon} alt={`${siteName} favicon`} width={16} height={16} className="rounded-full" />
                <span className="text-xs text-muted-foreground">{siteName}</span>
              </div>
              <h3 className="text-lg font-medium text-primary hover:underline">{result.title}</h3>
              <p className="text-sm text-muted-foreground">{result.snippet}</p>
            </div>
            {thumbnail && (
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image src={thumbnail} alt="" fill style={{objectFit:"cover"}} className="rounded-md" />
              </div>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-24 w-full" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-24 w-24 flex-shrink-0 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchResult, setSearchResult] = useState<LhamaAI2AgentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!initialQuery) {
        setIsLoading(false);
        return;
      };

      setIsLoading(true);
      setSearchResult(null);

      try {
        const result = await lhamaAI2Agent({ query: initialQuery, mode: 'search' });
        setSearchResult(result);
      } catch (error) {
        console.error("Search failed:", error);
        // Handle error state in UI
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [initialQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
             <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pergunte qualquer coisa ou busque na web..."
              className="h-11 w-full rounded-full bg-muted/50 pl-10 pr-4"
            />
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          {isLoading && <LoadingSkeleton />}
          
          {!isLoading && searchResult && (
            <div className="space-y-8">
              {searchResult.response && (
                 <Card className="bg-muted/30">
                    <CardContent className="p-6">
                       <div 
                         className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0" 
                         dangerouslySetInnerHTML={{ __html: searchResult.response }} 
                        />
                    </CardContent>
                 </Card>
              )}

              <div className="space-y-4">
                {searchResult.searchResults?.map((result, i) => (
                  <SearchResultCard key={i} result={result} />
                ))}
              </div>

               {searchResult.searchResults?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p>Nenhum resultado encontrado para "{initialQuery}"</p>
                </div>
            )}
            </div>
          )}
           {!isLoading && !initialQuery && (
              <div className="py-12 text-center text-muted-foreground">
                  <p>Comece uma nova pesquisa para ver os resultados.</p>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPageWrapper() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
            <SearchPage />
        </Suspense>
    )
}
