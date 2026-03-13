import { useState } from "react";
import { Bug, Zap, Shield, Lightbulb, ChevronDown } from "lucide-react";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "PHP", "Ruby", "C#"];

const SAMPLE_CODE = `function findDuplicate(nums) {
  let result = [];
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] == nums[j]) {
        result.push(nums[i]);
      }
    }
  }
  return result;
}

function fetchUserData(userId) {
  const response = fetch('/api/users/' + userId);
  const data = response.json();
  return data;
}

function calculateDiscount(price, discount) {
  if (discount > 0) {
    return price - (price * discount / 100);
  }
  return price;
}`;

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function CodeEditor({ code, onChange, language, onLanguageChange, onAnalyze, isAnalyzing }: CodeEditorProps) {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const lineCount = code.split("\n").length;

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
          </div>
          <span className="text-sm text-muted-foreground font-mono">editor</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
            >
              {language}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-10 min-w-[140px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { onLanguageChange(lang); setShowLangDropdown(false); }}
                    className="block w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Analyze Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-auto">
        {/* Line numbers */}
        <div className="flex-shrink-0 py-4 px-3 text-right select-none border-r border-border bg-muted/30">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-xs text-muted-foreground/50 font-mono leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 py-4 px-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none focus:outline-none placeholder:text-muted-foreground/40"
          placeholder="Paste your code here or use the sample code..."
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">{lineCount} lines · {code.length} chars</span>
        <button
          onClick={() => onChange(SAMPLE_CODE)}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Load sample code
        </button>
      </div>
    </div>
  );
}
