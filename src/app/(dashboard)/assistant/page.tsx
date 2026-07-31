"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { ASSISTANT_SUGGESTIONS } from "@/lib/mockData/specialized"

export default function AssistantPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] -mt-6">
      <div className="flex-1 overflow-y-auto p-gutter pb-32 flex items-center justify-center">
        <div className="max-w-4xl mx-auto space-y-8 w-full">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">smart_toy</span>
            </div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Welcome back, Sarah.</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant">How can I assist with your competitive intelligence today?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {ASSISTANT_SUGGESTIONS.map(suggestion => (
              <button key={suggestion.id} className="bg-surface-container-lowest border border-surface-container-highest p-4 rounded-[20px] text-left hover:border-primary/30 hover:shadow-ambient-1 transition-all group">
                <span className={`material-symbols-outlined text-${suggestion.color} mb-2`}>{suggestion.icon}</span>
                <h4 className={`text-label-md font-label-md text-on-surface mb-1 group-hover:text-${suggestion.color} transition-colors`}>{suggestion.title}</h4>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 right-0 left-0 md:left-[260px] p-4 bg-surface/80 backdrop-blur-xl border-t border-outline-variant z-10">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input 
            type="text" 
            placeholder="Ask anything about your competitors, market trends, or internal data..." 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-4 pl-6 pr-16 text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
          />
          <button className="absolute right-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
