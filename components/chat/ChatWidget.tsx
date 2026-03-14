'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useClientsStore } from '@/stores/clientsStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Minimal markdown renderer: bold, headers, bullet lists, line breaks
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className="font-semibold text-[13px] mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>
          {line.slice(3)}
        </p>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <p key={i} className="font-medium text-[12px] mt-2 mb-0.5" style={{ color: 'var(--text-primary)' }}>
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex gap-1.5 text-[12.5px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--text-tertiary)' }} />
          <span>{inlineMarkdown(line.slice(2))}</span>
        </div>
      );
    } else if (line === '---') {
      elements.push(<hr key={i} className="my-2" style={{ borderColor: 'var(--border)' }} />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {inlineMarkdown(line)}
        </p>
      );
    }
    i++;
  }
  return elements;
}

function inlineMarkdown(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const SUGGESTED_QUESTIONS = [
  'Geef me een overzicht van alle facturen',
  'Hoeveel staat er nog open?',
  'Welke facturen zijn deze maand verstuurd?',
  'Geef me een samenvatting van de afgelopen periode',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const documenten = useDocumentsStore((s) => s.documenten);
  const bedrijf = useCompanyStore((s) => s.bedrijf);
  const klanten = useClientsStore((s) => s.klanten);

  useEffect(() => { setMounted(true); }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const appData = useMemo(() => ({
    bedrijf,
    documenten: mounted ? documenten : [],
    klanten: mounted ? klanten : [],
  }), [bedrijf, documenten, klanten, mounted]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // Append empty assistant message to stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          appData,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'Er is een fout opgetreden. Controleer je ANTHROPIC_API_KEY in .env.local.';
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Onbekende fout';
      setError(msg);
      // Remove the empty assistant message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [messages, loading, appData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setOpen(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={handleClose}
            />

            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[70vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5746EA20' }}>
                    <Bot className="w-4 h-4" style={{ color: '#5746EA' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Bedrijfsassistent</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Heeft toegang tot al je data</p>
                  </div>
                </div>
                <button type="button" onClick={handleClose} className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {isEmpty ? (
                  <div className="py-4">
                    <p className="text-center text-[12.5px] mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Stel me een vraag over je facturen, offertes of rapporten.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="text-left text-[12px] px-3 py-2 rounded-lg border transition-colors hover:bg-[var(--muted)]"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#5746EA20' }}>
                          <Bot className="w-3.5 h-3.5" style={{ color: '#5746EA' }} />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                          msg.role === 'user'
                            ? 'rounded-br-sm'
                            : 'rounded-bl-sm'
                        }`}
                        style={
                          msg.role === 'user'
                            ? { backgroundColor: '#5746EA', color: '#fff' }
                            : { backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }
                        }
                      >
                        {msg.role === 'user' ? (
                          <p className="text-[12.5px] leading-relaxed">{msg.content}</p>
                        ) : msg.content === '' ? (
                          <div className="flex items-center gap-1 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#5746EA', animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#5746EA', animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#5746EA', animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--muted)' }}>
                          <User className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg text-[12px]" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Stel een vraag… (Enter om te sturen)"
                    rows={1}
                    className="flex-1 resize-none rounded-lg px-3 py-2 text-[12.5px] outline-none border transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      minHeight: '36px',
                      maxHeight: '96px',
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 96) + 'px';
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
                    style={{ backgroundColor: '#5746EA', color: '#fff' }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10.5px] text-center mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Geen financieel advies · Data blijft lokaal
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#5746EA', color: '#fff' }}
        whileTap={{ scale: 0.9 }}
        title="Bedrijfsassistent"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
