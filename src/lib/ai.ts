import { supabase } from "@/integrations/supabase/client";
import type { AnalysisFinding } from "@/components/AnalysisResults";

export interface QualityScore {
  overall: number;
  readability: number;
  performance: number;
  maintainability: number;
  security: number;
}

export interface AnalysisResult {
  findings: AnalysisFinding[];
  qualityScore: QualityScore;
  fixedCode: string;
}

export async function analyzeCodeAI(code: string, language: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-code", {
    body: { code, language },
  });

  if (error) throw new Error(error.message || "Analysis failed");
  if (data.error) throw new Error(data.error);

  // Add IDs to findings
  const findings = (data.findings || []).map((f: any, i: number) => ({
    ...f,
    id: `ai-${i}-${Date.now()}`,
  }));

  return {
    findings,
    qualityScore: data.qualityScore || { overall: 0, readability: 0, performance: 0, maintainability: 0, security: 0 },
    fixedCode: data.fixedCode || code,
  };
}

type Msg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Chat failed (${resp.status})`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  onDone();
}
