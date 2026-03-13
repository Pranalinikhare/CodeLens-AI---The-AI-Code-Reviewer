import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CodeLens AI, an expert code analysis engine. You analyze source code to detect bugs, performance issues, security vulnerabilities, and code quality problems.

Return a JSON object with this exact schema:
{
  "findings": [
    {
      "title": "Short issue title",
      "description": "Detailed explanation of why this is a problem",
      "severity": "critical" | "warning" | "info" | "suggestion",
      "category": "bug" | "performance" | "security" | "quality",
      "line": <line number or null>,
      "suggestion": "How to fix it",
      "codeSnippet": "Corrected code example (optional, can be null)"
    }
  ],
  "qualityScore": {
    "overall": <0-100>,
    "readability": <0-100>,
    "performance": <0-100>,
    "maintainability": <0-100>,
    "security": <0-100>
  },
  "fixedCode": "The complete corrected version of the code with all issues fixed"
}

## Analysis Categories

**Bugs (category: "bug")**
- Logical errors, off-by-one, wrong operators (== vs ===)
- Missing await on async calls, unhandled promises
- Null/undefined reference risks, incorrect return types
- Race conditions, incorrect state mutations

**Performance (category: "performance")**
- O(n²) or worse algorithmic complexity
- Unnecessary re-renders, memory leaks
- Redundant computations, missing memoization
- Inefficient data structures

**Security (category: "security")**
- SQL/NoSQL injection, XSS vulnerabilities
- Path traversal, insecure deserialization
- Hardcoded secrets, missing input sanitization
- Improper authentication/authorization checks

**Quality (category: "quality")**
- Missing error handling or input validation
- Floating-point precision in financial calculations
- Dead code, unused variables, code duplication
- Poor naming, missing types, overly complex functions

## Severity Guidelines
- **critical**: Will cause runtime failures, data loss, or security breaches
- **warning**: Likely to cause bugs under certain conditions
- **info**: Best practice violations that may lead to issues
- **suggestion**: Improvements for readability/maintainability

## Rules
1. Only report real issues — no false positives
2. Be specific: reference exact line numbers and variable names
3. Provide actionable fix suggestions with corrected code when possible
4. Prioritize critical/security issues first
5. Limit to 10 most impactful findings
6. If no issues found, return empty findings array
7. The fixedCode should be the complete corrected version with ALL issues addressed
8. Quality scores should reflect the actual code quality objectively`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this ${language} code:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Report code analysis findings, quality scores, and fixed code",
              parameters: {
                type: "object",
                properties: {
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info", "suggestion"] },
                        category: { type: "string", enum: ["bug", "performance", "security", "quality"] },
                        line: { type: "number" },
                        suggestion: { type: "string" },
                        codeSnippet: { type: "string" },
                      },
                      required: ["title", "description", "severity", "category"],
                      additionalProperties: false,
                    },
                  },
                  qualityScore: {
                    type: "object",
                    properties: {
                      overall: { type: "number" },
                      readability: { type: "number" },
                      performance: { type: "number" },
                      maintainability: { type: "number" },
                      security: { type: "number" },
                    },
                    required: ["overall", "readability", "performance", "maintainability", "security"],
                    additionalProperties: false,
                  },
                  fixedCode: { type: "string" },
                },
                required: ["findings", "qualityScore", "fixedCode"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No tool call in response");
  } catch (e) {
    console.error("analyze-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
