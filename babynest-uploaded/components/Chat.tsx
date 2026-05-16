'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Bot, Loader2, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  userContext?: {
    state?: string;
    dueDate?: string;
    incomeBracket?: string;
  };
}

export function Chat({ userContext }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm BabyNest, your friendly AI assistant for new parent financial planning.\n\nI can help you with:\n• Understanding insurance deadlines\n• 529 college savings plans\n• Tax benefits for your state\n• Important legal documents\n• General financial questions\n\nWhat would you like to know? 💚",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          userContext,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || 'Sorry, I had trouble responding. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'When do I need to add my baby to insurance?',
    'Should I choose 529 or UTMA?',
    'What tax benefits are available in my state?',
    'How do I set up a Roth IRA for my child?',
  ];

  return (
    <Card className="h-[calc(100vh-200px)] min-h-[500px] flex flex-col shadow-soft-lg border-warm-100 sticky top-28">
      <CardHeader className="border-b border-warm-100 bg-gradient-to-r from-primary-50 to-cream-50 rounded-t-2xl">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-warm-900">BabyNest Assistant</div>
            <div className="text-xs text-warm-500 font-normal flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-500" />
              AI-powered guidance
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3 animate-fade-in',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-accent-400 to-accent-500'
                    : 'bg-gradient-to-br from-primary-400 to-primary-500'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-soft',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white'
                    : 'bg-white border border-warm-100 text-warm-800'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={cn(
                    'text-[10px] mt-2',
                    message.role === 'user' ? 'text-accent-200' : 'text-warm-400'
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-soft">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-warm-100 rounded-2xl p-3.5 shadow-soft">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-warm-100 space-y-3 bg-cream-50 rounded-b-2xl">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-xs bg-white hover:bg-primary-50 text-warm-600 hover:text-primary-700 px-3 py-1.5 rounded-full border border-warm-200 hover:border-primary-200 transition-all duration-200 shadow-soft"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about insurance, 529 plans, taxes..."
              className="flex-1 h-11 bg-white border-warm-200 focus:border-primary-400 focus:ring-primary-200"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="h-11 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-warm-400 text-center flex items-center justify-center gap-1">
            <Heart className="w-3 h-3" />
            AI responses are informational only, not professional advice
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
