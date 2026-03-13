import { Bug, Zap, Shield, Lightbulb, AlertTriangle, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export type Severity = "critical" | "warning" | "info" | "suggestion";
export type Category = "bug" | "performance" | "security" | "quality";

export interface AnalysisFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: Category;
  line?: number;
  suggestion?: string;
  codeSnippet?: string;
}

interface AnalysisResultsProps {
  findings: AnalysisFinding[];
  isAnalyzing: boolean;
}

const severityConfig: Record<Severity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive border-destructive/30" },
  warning: { label: "Warning", className: "bg-warning/15 text-warning border-warning/30" },
  info: { label: "Info", className: "bg-info/15 text-info border-info/30" },
  suggestion: { label: "Tip", className: "bg-accent/15 text-accent border-accent/30" },
};

const categoryConfig: Record<Category, { icon: typeof Bug; label: string }> = {
  bug: { icon: Bug, label: "Logical Bug" },
  performance: { icon: Zap, label: "Performance" },
  security: { icon: Shield, label: "Security" },
  quality: { icon: Lightbulb, label: "Code Quality" },
};

function FindingCard({ finding }: { finding: AnalysisFinding }) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityConfig[finding.severity];
  const cat = categoryConfig[finding.category];
  const Icon = cat.icon;

  return (
    <div
      className="border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sev.className}`}>
              {sev.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{cat.label}</span>
            {finding.line && (
              <span className="text-[10px] text-muted-foreground font-mono">Line {finding.line}</span>
            )}
          </div>
          <h4 className="text-sm font-medium text-foreground">{finding.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{finding.description}</p>
        </div>
        <div className="mt-1">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border mx-4 mb-0">
          {finding.suggestion && (
            <div className="mt-3">
              <h5 className="text-xs font-medium text-accent mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" /> Suggested Fix
              </h5>
              <p className="text-xs text-secondary-foreground">{finding.suggestion}</p>
            </div>
          )}
          {finding.codeSnippet && (
            <div className="mt-3">
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded-md overflow-x-auto text-accent">
                {finding.codeSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalysisResults({ findings, isAnalyzing }: AnalysisResultsProps) {
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info" || f.severity === "suggestion").length;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <Zap className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse-glow" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Analyzing your code...</p>
          <p className="text-xs text-muted-foreground mt-1">Scanning for bugs, vulnerabilities & optimizations</p>
        </div>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Shield className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No analysis yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Paste your code and click "Analyze Code" to get AI-powered insights on bugs, performance, and security.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-xs font-medium text-foreground">{findings.length} findings</span>
        <div className="flex items-center gap-3 text-xs">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-3 h-3" /> {criticalCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="w-3 h-3" /> {warningCount}
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-info">
              <CheckCircle2 className="w-3 h-3" /> {infoCount}
            </span>
          )}
        </div>
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {findings.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </div>
  );
}
