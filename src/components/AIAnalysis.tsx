"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import type { SystemScan, AnalysisResult } from "@/lib/types";

interface AIAnalysisProps {
  scan: SystemScan;
  analysis: AnalysisResult;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function hashScan(scan: SystemScan): string {
  const key = `${scan.cpu.model_name}|${scan.gpu.model_name}|${scan.ram.total_gb}|${scan.ram.speed_mhz}|${scan.storage.length}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return `ai-analysis-${Math.abs(hash)}`;
}

function getCachedAnalysis(scan: SystemScan): string | null {
  try {
    return localStorage.getItem(hashScan(scan));
  } catch {
    return null;
  }
}

function setCachedAnalysis(scan: SystemScan, text: string) {
  try {
    localStorage.setItem(hashScan(scan), text);
  } catch {
    // localStorage full or unavailable
  }
}

export function AIAnalysis({ scan, analysis }: AIAnalysisProps) {
  const [aiText, setAiText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Check cache on mount
  useEffect(() => {
    const cached = getCachedAnalysis(scan);
    if (cached) {
      setAiText(cached);
      setHasAnalyzed(true);
    }
  }, [scan]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isLoading && textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [aiText, isLoading]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAiText("");
    setChatMessages([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan, analysis }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiText(fullText);
      }

      setCachedAnalysis(scan, fullText);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, [scan, analysis]);

  const sendChatMessage = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || isChatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: question };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Build message history: initial analysis + follow-up messages
      const allMessages = [
        { role: "assistant", content: aiText },
        ...newMessages,
      ];

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan, analysis, messages: allMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let replyText = "";

      // Add a placeholder assistant message we'll stream into
      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        replyText += chunk;
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: replyText,
          };
          return updated;
        });
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, chatMessages, aiText, scan, analysis]);

  // ── CTA State (no analysis yet, no cache) ──
  if (!hasAnalyzed && !isLoading && !error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-dim border border-cyan/30 flex items-center justify-center mb-6">
          <Sparkles size={28} className="text-cyan" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          AI Deep Analysis
        </h2>
        <p className="text-text-secondary text-sm text-center max-w-md mb-8">
          Get personalized insights from AI — specific bottleneck impact,
          free fixes ranked by effectiveness, and upgrade recommendations
          tailored to your exact hardware.
        </p>
        <button
          onClick={runAnalysis}
          className="flex items-center gap-2.5 px-6 py-3 bg-cyan/10 border border-cyan/30 text-cyan
                     rounded-xl font-medium text-sm hover:bg-cyan/20 transition-colors duration-200"
        >
          <Sparkles size={16} />
          Get AI Deep Analysis
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Personalized analysis powered by Claude
          </p>
        </div>
        {hasAnalyzed && !isLoading && (
          <button
            onClick={runAnalysis}
            className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
          >
            <RefreshCw size={14} />
            Re-analyze
          </button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="px-4 py-3 bg-red-dim border border-red/30 rounded-xl text-red text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {error}
            <button
              onClick={runAnalysis}
              className="ml-3 underline hover:no-underline"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response */}
      <motion.div
        ref={textRef}
        className="bg-surface border border-border rounded-2xl p-6 max-h-[60vh] overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading && !aiText && (
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 size={16} className="animate-spin text-cyan" />
            <span className="text-sm">Analyzing your system...</span>
          </div>
        )}

        {aiText && (
          <div className="ai-markdown prose prose-invert prose-sm max-w-none">
            <MarkdownRenderer text={aiText} />
            {isLoading && (
              <span className="inline-block w-1.5 h-4 bg-cyan animate-pulse ml-0.5 -mb-0.5 rounded-sm" />
            )}
          </div>
        )}
      </motion.div>

      {/* Follow-up Chat */}
      {hasAnalyzed && !isLoading && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan/10 border border-cyan/30 text-cyan"
                        : "bg-surface-raised border border-border text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <MarkdownRenderer text={msg.content} />
                        {isChatLoading && i === chatMessages.length - 1 && (
                          <span className="inline-block w-1.5 h-4 bg-cyan animate-pulse ml-0.5 -mb-0.5 rounded-sm" />
                        )}
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-surface-raised border border-border rounded-xl px-4 py-2.5 focus-within:border-cyan/40 transition-colors">
              <MessageSquare size={14} className="text-text-secondary shrink-0" />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Ask a follow-up... (e.g., 'what if I upgrade to RTX 4070?')"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-secondary outline-none"
                disabled={isChatLoading}
              />
            </div>
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 bg-cyan/10 border border-cyan/30 rounded-xl text-cyan
                         hover:bg-cyan/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isChatLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Simple Markdown Renderer ──
// Renders headings, bold, lists, and paragraphs without pulling in a full library
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-base font-semibold text-foreground mt-5 mb-2 first:mt-0"
        >
          {renderInline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-sm font-semibold text-foreground mt-4 mb-1.5"
        >
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }

    // Bullet lists
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2">
          {items.map((item, j) => (
            <li
              key={j}
              className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed"
            >
              <span className="text-cyan mt-1.5 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2">
          {items.map((item, j) => (
            <li
              key={j}
              className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed"
            >
              <span className="text-cyan font-mono text-xs mt-0.5 shrink-0 w-4 text-right">
                {j + 1}.
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={i}
        className="text-sm text-text-secondary leading-relaxed my-1.5"
      >
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return <>{elements}</>;
}

// Render inline markdown: **bold**, *italic*, `code`
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="text-foreground font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="text-foreground/80">
          {match[3]}
        </em>,
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-surface-raised border border-border rounded text-cyan text-xs font-mono"
        >
          {match[4]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
