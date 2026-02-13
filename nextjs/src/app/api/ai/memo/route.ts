import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

interface MemoRequest {
  title: string;
  description: string;
  answers: string[];
  assumptions: {
    monthly_price: number;
    year1_customers: number;
    revenue_growth_pct: number;
    gross_margin_pct: number;
    investment_amount: number;
    discount_rate: number;
  };
  financials: {
    npv: number;
    irr: number | null;
    payback_months: number | null;
    total_revenue_5yr: number;
    annual_revenues: number[];
  };
}

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(0) + "K";
  return sign + "$" + abs.toFixed(0);
}

function buildSystemPrompt(req: MemoRequest): string {
  const { assumptions: a, financials: f } = req;
  const irrDisplay = f.irr !== null ? (f.irr * 100).toFixed(1) + "%" : "N/A";
  const paybackDisplay =
    f.payback_months !== null ? `${f.payback_months} months` : "N/A";

  return `You are a senior investment analyst at Zelis, a healthcare technology company. Write a professional investment memo for an internal capital allocation review.

## Input Data

**Initiative:** ${req.title}
**Description:** ${req.description || "Not provided"}

**User's Answers to Discovery Questions:**
1. Problem & Target: ${req.answers[0] || "Not provided"}
2. Revenue Model: ${req.answers[1] || "Not provided"}
3. Investment Required: ${req.answers[2] || "Not provided"}
4. Market & Customers: ${req.answers[3] || "Not provided"}
5. Timeline: ${req.answers[4] || "Not provided"}
6. Key Risks: ${req.answers[5] || "Not provided"}

**Financial Assumptions:**
- Monthly price: ${formatCurrency(a.monthly_price)}
- Year 1 customers: ${a.year1_customers}
- Revenue growth: ${a.revenue_growth_pct}%
- Gross margin: ${a.gross_margin_pct}%
- Upfront investment: ${formatCurrency(a.investment_amount)}
- Discount rate: ${a.discount_rate}%

**Computed Financials:**
- NPV: ${formatCurrency(f.npv)}
- IRR: ${irrDisplay}
- Payback period: ${paybackDisplay}
- 5-Year total revenue: ${formatCurrency(f.total_revenue_5yr)}
- Annual revenues: ${f.annual_revenues.map(formatCurrency).join(", ")}

## Instructions

Write a concise investment memo (400-600 words) with these sections:

### Executive Summary
2-3 sentences summarizing the opportunity and recommendation.

### Problem & Opportunity
What market need does this address? Why now? (2-3 sentences from the user's answers)

### Solution & Revenue Model
What will be built and how will it generate revenue? (2-3 sentences)

### Financial Summary
Include a markdown table with: NPV, IRR, Payback Period, 5-Year Revenue, Investment Required.
Add 1-2 sentences of financial commentary.

### Key Risks & Mitigations
List 2-3 risks the user identified, plus any you infer from the financials. Suggest mitigations.

### Recommendation
Give a clear Go / Conditional Go / No-Go recommendation with 1-2 sentences of rationale based on the financial metrics and risk profile.

## Style Guidelines
- Write in a professional, analytical tone appropriate for a C-suite audience
- Use concrete numbers, not vague language
- Be direct and concise — this is an internal decision document, not marketing
- Use markdown formatting (headers, bold, tables)`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: MemoRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, assumptions, financials } = body;
  if (!title || !assumptions || !financials) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: buildSystemPrompt(body),
      messages: [
        {
          role: "user",
          content:
            "Generate the investment memo based on the data provided in your instructions.",
        },
      ],
    });

    const memo =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ memo });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
