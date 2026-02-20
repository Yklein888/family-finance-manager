import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'שלום! אני פינקי, העוזר הפיננסי החכם שלך 🤖\n\nאני כאן כדי לעזור לך לנהל את הכספים בצורה חכמה יותר. אפשר לשאול אותי כל דבר!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'כמה הוצאתי החודש?',
    'איך אני מתקדם ביעדים?',
    'תן לי טיפ לחיסכון',
    'מה ההוצאות הגדולות שלי?'
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll למטה
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    // הוספת הודעת משתמש
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // קריאה ל-API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // הוספת תשובת bot
      const botMessage: Message = {
        role: 'bot',
        content: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // עדכון suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'bot',
        content: 'סליחה, נתקלתי בבעיה טכנית. נסה שוב בעוד רגע 😅',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">פינקי - העוזר הפיננסי שלך</CardTitle>
            <p className="text-xs text-muted-foreground">מבוסס AI • מדבר עברית • זמין 24/7</p>
          </div>
          <Badge variant="secondary" className="mr-auto">
            <Sparkles className="w-3 h-3 ml-1" />
            GPT-4
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 pl-2">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                  <div
                    className={cn(
                      "text-xs mt-1 opacity-60",
                      message.role === 'user' ? "text-left" : "text-right"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">פינקי כותב...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="שאל אותי כל דבר..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          💡 טיפ: תוכל לשאול על הוצאות, תקציבים, יעדים והמלצות לחיסכון
        </p>
      </CardContent>
    </Card>
  );
}
