import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const QUESTIONS = [
  "Tell me about your investment idea. What problem are you trying to solve, and for whom?",
  "How would this generate revenue? What's the pricing model you're considering?",
  "What's the estimated upfront investment needed to build and launch this?",
  "How large is the addressable market? Any estimates on how many customers you could reach in Year 1?",
  "What's the timeline? When would you expect to see first revenue?",
  "What are the two biggest risks that could derail this?",
];

function buildSystemPrompt(questionIndex: number): string {
  const questionList = QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");

  return `You are CAM, the Capital Allocation Manager at Zelis. You guide product leaders through building an investment case.

You are currently on question ${questionIndex + 1} of 6. The user has answered ${questionIndex} questions so far. The questions are:
${questionList}

Rules:
- Acknowledge the user's answer briefly (1 sentence), then ask the next question naturally.
- NEVER ask follow-up or clarifying questions. Always accept the answer and move to the next question. If data is vague, the financial model will use defaults for missing values.
- If the user's message is correcting or clarifying a PREVIOUS answer (not answering the current question), acknowledge the correction briefly and then re-ask the current question (question ${questionIndex + 1}).
- Keep responses under 3 sentences total.
- Be professional but warm — you're a helpful financial advisor, not an interrogator.
- After the user answers question 6, give a brief encouraging wrap-up (1-2 sentences) and say you'll now generate their investment case review.
- Do NOT use markdown formatting, bullet points, or numbered lists. Write in plain conversational sentences.

After your conversational response, you MUST output an extraction block on its own lines. This is used by the system to extract financial assumptions — the user will NOT see it.

Format:
###EXTRACT###
{"questions_answered": <number>, "short_title": <string|null>, "monthly_price": <number|null>, "year1_customers": <number|null>, "investment_amount": <number|null>, "revenue_growth_pct": <number|null>}

Field descriptions:
- questions_answered: Total number of the 6 structured questions the user has fully answered so far (0-6). Currently ${questionIndex} have been answered. If the user just answered question ${questionIndex + 1}, set this to ${questionIndex + 1}. If the user's message was a correction or clarification (not answering a new question), keep this at ${questionIndex}.
- short_title: A concise 3-7 word product/initiative title based on what the user is describing (e.g. "Automated Compliance Monitoring Platform", "Real-Time Claims Processing Engine", "Provider Network Analytics Dashboard"). Generate this once the user has described their idea (after question 1). Use null if no idea has been described yet.
- monthly_price: a per-month subscription/price (e.g. "$3,500/month" → 3500)
- year1_customers: number of customers expected in Year 1 (e.g. "15 customers" → 15)
- investment_amount: total upfront investment (e.g. "$1.8M" → 1800000)
- revenue_growth_pct: year-over-year growth rate (e.g. "85% growth" → 85)

Use null for any financial value not mentioned in the latest answer.`;
}

interface WizardMessage {
  role: "cam" | "user";
  text: string;
}

interface WizardRequest {
  messages: WizardMessage[];
  questionIndex: number;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: WizardRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, questionIndex } = body;
  if (!Array.isArray(messages) || typeof questionIndex !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  // Convert our chat messages to Anthropic format
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role === "cam" ? "assistant" : "user",
    content: m.text,
  }));

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: buildSystemPrompt(questionIndex),
      messages: anthropicMessages,
    });

    // Stream SSE response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({
                type: "text",
                content: event.delta.text,
              });
              controller.enqueue(
                encoder.encode(`data: ${data}\n\n`)
              );
            }
          }

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", content: errorMsg })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
