'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { lhamaAI2Agent, type LhamaAI2AgentOutput } from '@/ai/flows/lhama-ai-2-agent';
import type { AIAgent } from '@/lib/agents';
import { agentLogos } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  User,
  Paperclip,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  Telescope,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  searchResults?: LhamaAI2AgentOutput['searchResults'];
}

type SearchResult = NonNullable<LhamaAI2AgentOutput['searchResults']>[number];

const slashCommands = [
  {
    name: 'Adicionar fotos e arquivos',
    icon: Paperclip,
  },
  {
    name: 'Criar imagem',
    icon: ImageIcon,
  },
  {
    name: 'Pensar',
    icon: Lightbulb,
  },
  {
    name: 'Investigar',
    icon: Telescope,
  },
  {
    name: 'Estudar e aprender',
    icon: BookOpen,
  },
];

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
                <h3 className="font-medium text-primary hover:underline">{result.title}</h3>
                <p className="text-sm text-muted-foreground">{result.snippet}</p>
              </div>
              {thumbnail && (
                 <div className="relative h-20 w-20 flex-shrink-0">
                    <Image src={thumbnail} alt="" fill objectFit="cover" className="rounded-md" />
                 </div>
              )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
};


export default function Chat({ agent }: { agent: AIAgent }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `<p>${agent.greeting}</p>`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [searchMode, setSearchMode] = useState<'chat' | 'search'>('chat');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // Corresponde a max-h-52
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.startsWith('/')) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setShowSlashCommands(false);
    setIsLoading(true);

    try {
      const result = await lhamaAI2Agent({ query: currentInput, mode: searchMode });
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        searchResults: result.searchResults,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao chamar o agente de IA:', error);
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: 'Falha ao obter resposta da IA. Por favor, tente novamente.',
      });
       // Se der erro, coloca a mensagem do usuário de volta no input
       setInput(currentInput);
       // Remove a mensagem do usuário da lista de mensagens
       setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => (prev === 'search' ? 'chat' : 'search'));
    toast({
      title: `Pesquisa da Web ${searchMode === 'search' ? 'Desativada' : 'Ativada'}`,
      description: searchMode === 'search' 
        ? 'A IA voltará a responder com seu conhecimento base.'
        : 'A IA agora usará a web para respostas mais atuais.',
      duration: 3000,
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
     if (e.key === 'Escape') {
      setShowSlashCommands(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSlashCommands(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const LogoComponent = agentLogos[agent.logo];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="mx-auto max-w-3xl space-y-6 p-4 pb-4 md:p-6 md:pb-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex animate-in fade-in-50 slide-in-from-bottom-4 items-start gap-4 duration-500',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <LogoComponent className="h-5 w-5 text-primary" />
                  </div>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-2xl px-4 py-3 text-sm md:text-base lg:max-w-xl',
                  message.role === 'assistant'
                    ? 'rounded-tl-none bg-card'
                    : 'rounded-br-none bg-primary/80 text-primary-foreground',
                )}
              >
                {message.role === 'user' ? (
                   <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0 prose-ul:my-2 prose-li:my-1 prose-hr:my-4">
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    {message.searchResults && message.searchResults.length > 0 && (
                      <div className="mt-4 space-y-4">
                         <hr/>
                         <h3 className="font-bold">Fontes da Web</h3>
                         {message.searchResults.map((result, i) => (
                            <SearchResultCard key={i} result={result} />
                         ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex animate-in fade-in-50 items-start gap-4">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <LogoComponent className="h-5 w-5 text-primary" />
                </div>
              </Avatar>
              <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-background">
        <div className="relative mx-auto max-w-3xl p-4">
           {showSlashCommands && (
            <div className="absolute bottom-full mb-2 w-[calc(100%-2rem)] animate-in fade-in-50 slide-in-from-bottom-4 rounded-xl border bg-card p-2 shadow-lg duration-300">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                Comandos
              </p>
              <ul>
                {slashCommands.map((command) => (
                  <li key={command.name}>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setInput(`/${command.name.toLowerCase()} `);
                        setShowSlashCommands(false);
                        textareaRef.current?.focus();
                      }}
                    >
                      <command.icon className="h-4 w-4" />
                      {command.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="flex w-full flex-col gap-2 rounded-2xl border bg-card p-2"
          >
            <Textarea
              ref={textareaRef}
              id="campo-pesquisa"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${agent.name}... (${searchMode === 'search' ? 'Pesquisa da Web ativada' : 'Chat'})`}
              className="max-h-52 flex-1 resize-none border-none bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
              rows={1}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Anexar</span>
                </Button>
                 <Button
                    type="button"
                    variant={searchMode === 'search' ? "secondary" : "outline"}
                    className="h-9 rounded-full px-4"
                    onClick={toggleSearchMode}
                >
                    <Globe className="mr-2 h-5 w-5" />
                    Pesquisa da Web
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
