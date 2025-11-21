import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) setMessages(data as Message[]);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Save user message
      const { error: userError } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: userMessage,
      });

      if (userError) throw userError;

      // Call edge function with proper auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('health-chat', {
        body: { message: userMessage },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Save assistant response
      const { error: assistantError } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: data.response,
      });

      if (assistantError) throw assistantError;

      if (data.action) {
        toast.success(data.action);
      }
    } catch (error: any) {
      toast.error('Gagal mengirim pesan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Card className="shadow-medium max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] sm:h-auto">
          <CardHeader className="border-b px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Chat Kesehatan AI
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tanya tentang kesehatan Anda atau gunakan perintah seperti "tambah 250ml air"
            </p>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground px-4 text-center">
                  <p className="text-sm sm:text-base">Mulai percakapan dengan AI health assistant</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2 sm:gap-3 animate-fade-in',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full h-fit animate-scale-in flex-shrink-0">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all hover:scale-[1.02]',
                        message.role === 'user'
                          ? 'bg-gradient-primary text-white shadow-glow'
                          : 'bg-muted'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-pre:bg-muted-foreground/10 prose-pre:p-3 prose-pre:rounded-lg prose-code:text-primary prose-headings:mt-3 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="bg-accent/10 p-1.5 sm:p-2 rounded-full h-fit animate-scale-in flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="border-t p-3 sm:p-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                disabled={loading}
                className="flex-1 transition-all focus:scale-[1.01] text-sm sm:text-base"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="sm"
                className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 px-3 sm:px-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
