import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { AnalysisResults, type AnalysisFinding } from "@/components/AnalysisResults";
import { QualityScoreCard } from "@/components/QualityScoreCard";
import { FixedCodeViewer } from "@/components/FixedCodeViewer";
import { AIChat } from "@/components/AIChat";
import { analyzeCodeAI, type QualityScore } from "@/lib/ai";
import { Bug, Zap, Shield, Lightbulb, Terminal } from "lucide-react";
import { toast } from "sonner";

const FEATURES = [
  { icon: Bug, label: "Logical Bugs", desc: "Detect hidden logic errors" },
  { icon: Zap, label: "Performance", desc: "Find inefficient patterns" },
  { icon: Shield, label: "Security", desc: "Spot vulnerabilities" },
  { icon: Lightbulb, label: "Quality", desc: "Improve code quality" },
];

export default function Index() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [fixedCode, setFixedCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setHasAnalyzed(true);
    try {
      const result = await analyzeCodeAI(code, language);
      setFindings(result.findings);
      setQualityScore(result.qualityScore);
      setFixedCode(result.fixedCode);
      toast.success(`Analysis complete: ${result.findings.length} findings`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Analysis failed");
      setFindings([]);
      setQualityScore(null);
      setFixedCode("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = (fixed: string) => {
    setCode(fixed);
    toast.success("Fixed code applied to editor");
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Terminal className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">CodeLens AI</span>
          </div>
          <div className="flex items-center gap-6">
            {FEATURES.map((f) => (
              <div key={f.label} className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      {!hasAnalyzed && (
        <section className="container py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI-Powered <span className="text-gradient">Code Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Detect logical bugs, performance bottlenecks, security vulnerabilities, and code quality issues with intelligent AI analysis.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <f.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] text-muted-foreground">{f.desc}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main content */}
      <main className="container pb-12">
        <div
          className={`grid gap-4 ${hasAnalyzed ? "grid-cols-1 lg:grid-cols-2 mt-4" : "grid-cols-1 max-w-4xl mx-auto"}`}
          style={{ minHeight: hasAnalyzed ? "calc(100vh - 200px)" : "500px" }}
        >
          <div className="flex flex-col gap-4">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
            {hasAnalyzed && fixedCode && (
              <FixedCodeViewer originalCode={code} fixedCode={fixedCode} onApplyFix={handleApplyFix} />
            )}
          </div>

          {hasAnalyzed && (
            <div className="flex flex-col gap-4">
              {qualityScore && <QualityScoreCard score={qualityScore} />}
              <div className="border border-border rounded-lg bg-card overflow-hidden flex-1">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Analysis Results</span>
                </div>
                <AnalysisResults findings={findings} isAnalyzing={isAnalyzing} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Chat FAB */}
      <AIChat code={code} language={language} />
    </div>
  );
}
