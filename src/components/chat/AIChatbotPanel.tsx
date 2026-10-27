'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sliders,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIChatMessage, SimulationParameters } from '@/lib/types';
import { QUICK_PROMPTS, parseNaturalLanguageQuery, INITIAL_CHAT_HISTORY } from '@/lib/aiScenarios';

interface AIChatbotPanelProps {
  currentParams: SimulationParameters;
  onApplyParams: (params: SimulationParameters) => void;
  isEmbedded?: boolean;
}

export function AIChatbotPanel({
  currentParams,
  onApplyParams,
  isEmbedded = false,
}: AIChatbotPanelProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>(INITIAL_CHAT_HISTORY);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simulate AI reasoning and scenario execution
    setTimeout(() => {
      const { parsedParams, responseText, analysis } = parseNaturalLanguageQuery(text, currentParams);

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
        scenarioParams: parsedParams,
        analysis,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      
      // Auto apply to live engine for instant feedback!
      onApplyParams(parsedParams);
    }, 700);
  };

  return (
    <div className={`flex flex-col h-full ${isEmbedded ? 'max-h-[600px]' : 'min-h-[650px]'}`}>
      {/* Chat header */}
      <div className="p-4 rounded-t-xl border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              OmniSim AI Scenario Analyst
              <Badge variant="default" className="text-[10px] py-0 px-1.5 font-mono">
                GPT-4o Sim Engine
              </Badge>
            </h3>
            <p className="text-[11px] text-slate-400">
              Natural language scenario simulation & operational bottleneck diagnosis
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMessages(INITIAL_CHAT_HISTORY)}
          className="text-xs text-slate-400 hover:text-white"
          title="Clear Conversation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-400" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.query)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-all font-medium"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                  <span className="font-semibold">{isUser ? 'You (Executive)' : 'OmniSim Intelligence'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Text Content */}
                <div className="whitespace-pre-line text-xs font-sans">
                  {msg.text}
                </div>

                {/* Structured AI Analysis Card if present */}
                {msg.analysis && (
                  <div className="mt-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3 font-mono text-[11px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-sans font-bold text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                        Executive Intelligence Summary
                      </span>
                      <Badge
                        variant={
                          msg.analysis.healthTag === 'Optimal'
                            ? 'success'
                            : msg.analysis.healthTag === 'Strained'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-[10px] py-0 px-2"
                      >
                        {msg.analysis.feasibilityScore}% Feasible
                      </Badge>
                    </div>

                    <div className="text-slate-300 font-sans">
                      {msg.analysis.financialSummary}
                    </div>

                    {/* Identified Bottlenecks */}
                    <div className="space-y-1">
                      <span className="font-semibold text-rose-300 font-sans flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-rose-400" />
                        Identified Operational Bottlenecks:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {msg.analysis.bottlenecks.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Actionable Recommendations */}
                    <div className="space-y-1 pt-1 border-t border-slate-800/80">
                      <span className="font-semibold text-emerald-300 font-sans flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Strategic Action Plan:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {msg.analysis.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Apply Parameters CTA */}
                    {msg.scenarioParams && (
                      <Button
                        size="sm"
                        onClick={() => onApplyParams(msg.scenarioParams!)}
                        className="w-full mt-2 gap-2 h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-sans"
                      >
                        <Sliders className="h-3 w-3" />
                        <span>Scenario Synced with Live Dashboard</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 items-center text-xs text-slate-400 font-mono">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="h-4 w-4 animate-spin-slow" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Parsing scenario parameters & running Monte Carlo operational stress test...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 rounded-b-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Ask a scenario, e.g. "What happens if sales increase 25% without hiring?"'
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Simulate</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
