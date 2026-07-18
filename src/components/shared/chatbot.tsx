'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  source?: string;
}

/**
 * Floating chatbot widget for StadiumAI.
 *
 * Accessibility features:
 * - `role="dialog"` with `aria-modal` and `aria-label` on the panel
 * - `role="log"` with `aria-live="polite"` on the message list so new
 *   messages are announced by screen readers without interrupting
 * - Focus is trapped inside the dialog when open (Escape closes it)
 * - Focus moves to the input when the dialog opens
 * - Toggle button uses `aria-expanded` and `aria-haspopup`
 * - Close and send buttons have explicit `aria-label` attributes
 * - Ctrl+K / Cmd+K keyboard shortcut documented with `title`
 */
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am StadiumAI. How can I assist you today?', sender: 'ai', source: 'gemini' },
  ]);
  const [input, setInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── Global Ctrl+K / Cmd+K toggle ─────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Auto-focus input when dialog opens ───────────────────────── */
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the animation mount the panel
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* ── Scroll to newest message ─────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Focus trap (Escape closes, Tab wraps) ────────────────────── */
  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  const [isTyping, setIsTyping] = useState(false);

  /* ── Send message handler ─────────────────────────────────────── */
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), text: trimmedInput, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-user-token',
        },
        body: JSON.stringify({
          message: trimmedInput,
          targetLanguage: 'en',
          isAudio: false,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat API returned error status');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message || 'Sorry, I encountered an error.',
          sender: 'ai',
          source: data.source || 'gemini',
        },
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Sorry, I could not connect to the assistant service. Please check your connection.',
          sender: 'ai',
          source: 'heuristic',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ── FAB toggle ──────────────────────────────────────────── */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant (Ctrl+K)"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Open AI Assistant (Ctrl+K)"
      >
        <MessageSquare className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* ── Chat dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-background border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="StadiumAI Assistant"
            onKeyDown={handlePanelKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" aria-hidden="true" />
                <h3 className="font-semibold" id="chatbot-title">
                  StadiumAI Assistant
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Message log — aria-live announces new messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              aria-relevant="additions"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col max-w-[85%]',
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start',
                  )}
                >
                  <div
                    className={cn(
                      'px-4 py-2 rounded-2xl',
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm',
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.sender === 'ai' && msg.source && (
                    <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center space-x-1">
                      <Bot className="h-3 w-3" aria-hidden="true" />{' '}
                      <span>Source: {msg.source}</span>
                    </span>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="mr-auto items-start flex flex-col max-w-[85%]">
                  <div className="px-4 py-2 rounded-2xl bg-muted rounded-tl-sm text-sm text-muted-foreground flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              className="p-3 border-t bg-muted/30 flex items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              role="search"
              aria-label="Send a message"
            >
              <label htmlFor="chatbot-input" className="sr-only">
                Message
              </label>
              <input
                ref={inputRef}
                id="chatbot-input"
                type="text"
                className="flex-1 bg-background border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ask about the stadium..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Type a message"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
