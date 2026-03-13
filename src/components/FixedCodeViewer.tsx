import { useState } from "react";
import { Wrench, Copy, Check } from "lucide-react";

interface FixedCodeViewerProps {
  originalCode: string;
  fixedCode: string;
  onApplyFix: (code: string) => void;
}

export function FixedCodeViewer({ originalCode, fixedCode, onApplyFix }: FixedCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!fixedCode || fixedCode === originalCode) return null;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Fixed Code</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onApplyFix(fixedCode)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
          >
            <Wrench className="w-3 h-3" />
            Apply Fix
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-auto text-sm font-mono text-foreground leading-6 max-h-[400px]">
        {fixedCode}
      </pre>
    </div>
  );
}
