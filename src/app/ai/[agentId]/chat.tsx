'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { lhamaAI2Agent } from '@/ai/flows/lhama-ai-2-agent';
import type { AIAgent } from '@/lib/agents';
import { agentLogos } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Paperclip, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat({ agent }: { agent: AIAgent }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `<p>${agent.greeting}</p>`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await lhamaAI2Agent({ query: input });
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao chamar o agente de IA:', error);
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: 'Falha ao obter resposta da IA. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const LogoComponent = agentLogos[agent.logo];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
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
                  'max-w-md rounded-2xl px-4 py-3 text-sm md:text-base prose prose-sm dark:prose-invert',
                  message.role === 'assistant'
                    ? 'rounded-tl-none bg-card'
                    : 'rounded-br-none bg-primary/80 text-primary-foreground',
                  'prose-p:m-0 prose-ul:m-0 prose-li:m-0 prose-hr:my-4'
                )}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
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
        <div className="mx-auto max-w-3xl p-4">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border bg-card p-2"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${agent.name}...`}
              className="max-h-48 resize-none border-none bg-transparent pr-14 text-base shadow-none focus-visible:ring-0"
              rows={1}
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Anexar</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <Globe className="h-5 w-5" />
                        <span>Search</span>
                    </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Enviar</span>
                </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
