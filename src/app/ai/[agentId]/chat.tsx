'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { lhamaAI2Agent } from '@/ai/flows/lhama-ai-2-agent';
import type { AIAgent } from '@/lib/agents';
import { agentLogos } from '@/lib/agents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat({ agent }: { agent: AIAgent }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: agent.greeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

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
      console.error('Error calling AI agent:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response from the AI. Please try again.',
      });
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
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
                  'max-w-md rounded-2xl px-4 py-3 text-sm md:text-base',
                  message.role === 'assistant'
                    ? 'rounded-tl-none bg-card'
                    : 'rounded-br-none bg-primary/80 text-primary-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
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
            className="relative flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${agent.name}...`}
              className="h-12 flex-1 rounded-full bg-card pr-14 text-base"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
