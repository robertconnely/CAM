"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  computeFinancials,
  DEFAULT_ASSUMPTIONS,
} from "@/lib/financial";
import type { FinancialAssumptions } from "@/lib/financial";
import type { InitiativeType, RevenueModel } from "@/lib/types/database";
import { ClassificationCard } from "./ClassificationCard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WizardResult {
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
  initiative_type: InitiativeType;
  revenue_model: RevenueModel;
}

interface InvestmentWizardProps {
  onComplete: (result: WizardResult) => void;
}

interface ChatMessage {
  role: "cam" | "user";
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const QUESTIONS: string[] = [
  "Tell me about your investment idea. What problem are you trying to solve, and for whom?",
  "How would this generate revenue? What\u2019s the pricing model you\u2019re considering?",
  "What\u2019s the estimated upfront investment needed to build and launch this?",
  "How large is the addressable market? Any estimates on how many customers you could reach in Year 1?",
  "What\u2019s the timeline? When would you expect to see first revenue?",
  "What are the two biggest risks that could derail this?",
];


/* ------------------------------------------------------------------ */
/*  Financial helpers                                                   */
/* ------------------------------------------------------------------ */

function formatCurrency(n: number): string {
  if (n < 0) return "-" + formatCurrency(-n);
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(1) + "M"
    : n >= 1e3
      ? "$" + (n / 1e3).toFixed(0) + "K"
      : "$" + n.toFixed(0);
}

/** Extract a dollar amount from natural language (e.g. "$3,500", "$1.8M", "$300K") */
function parseAmount(text: string): number | null {
  // Match patterns like $1.8M, $300K, $1,800,000, $3,500
  const mMatch = text.match(/\$\s*([\d.]+)\s*[Mm]/);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;

  const kMatch = text.match(/\$\s*([\d.]+)\s*[Kk]/);
  if (kMatch) return parseFloat(kMatch[1]) * 1_000;

  const rawMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (rawMatch) return parseFloat(rawMatch[1].replace(/,/g, ""));

  return null;
}

/** Extract a plain number from text (e.g. "15 customers") */
function parseCount(text: string): number | null {
  const match = text.match(/(\d+)\s*(?:customers?|clients?|companies|organizations?)/i);
  return match ? parseInt(match[1], 10) : null;
}

/** Update assumptions based on the user's answer to a given question */
function parseAssumptionsFromAnswer(
  questionIndex: number,
  answer: string,
  current: FinancialAssumptions
): FinancialAssumptions {
  const updated = { ...current };

  switch (questionIndex) {
    case 1: {
      // Pricing model — look for monthly price
      const amounts: number[] = [];
      const regex = /\$\s*[\d,.]+(?:\s*[KkMm])?/g;
      let m;
      while ((m = regex.exec(answer)) !== null) {
        const val = parseAmount(m[0]);
        if (val !== null) amounts.push(val);
      }
      // Use the first amount under $100K as monthly price
      const monthlyCandidate = amounts.find((a) => a < 100_000);
      if (monthlyCandidate) updated.monthly_price = monthlyCandidate;
      break;
    }
    case 2: {
      // Investment amount — look for total amounts
      const amounts: number[] = [];
      const regex = /\$\s*[\d,.]+(?:\s*[KkMm])?/g;
      let m;
      while ((m = regex.exec(answer)) !== null) {
        const val = parseAmount(m[0]);
        if (val !== null) amounts.push(val);
      }
      // Use the largest amount as investment
      if (amounts.length > 0) {
        updated.investment_amount = Math.max(...amounts);
      }
      break;
    }
    case 3: {
      // Market / customers — look for customer count
      const count = parseCount(answer);
      if (count !== null && count > 0 && count < 10000) {
        updated.year1_customers = count;
      }
      break;
    }
    default:
      break;
  }

  return updated;
}

/* ------------------------------------------------------------------ */
/*  Session helpers                                                    */
/* ------------------------------------------------------------------ */

/** Clear saved wizard session so next mount starts fresh */
export function clearWizardSession() {
  try {
    sessionStorage.removeItem("cam_wizard_state");
    sessionStorage.removeItem("cam_wizard_result");
    sessionStorage.removeItem("cam_memo");
    sessionStorage.removeItem("cam_nav_source");
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InvestmentWizard({ onComplete }: InvestmentWizardProps) {
  /* Check for saved session synchronously (before effects) */
  const sessionRead = useRef(false);
  const savedSession = useRef<{
    messages: ChatMessage[];
    answeredCount: number;
    currentQuestion: number;
    liveAssumptions: FinancialAssumptions;
    touchedFields: string[];
    answers: string[];
    aiTitle: string | null;
    wizardDone: boolean;
    showModelPanel: boolean;
    modelStage: number;
    showResultButton: boolean;
    useAI: boolean;
    initiativeType: InitiativeType | null;
    revenueModel: RevenueModel | null;
  } | null>(null);

  if (!sessionRead.current) {
    sessionRead.current = true;
    try {
      const raw = typeof window !== "undefined"
        ? sessionStorage.getItem("cam_wizard_state")
        : null;
      savedSession.current = raw ? JSON.parse(raw) : null;
    } catch { savedSession.current = null; }
  }

  const s = savedSession.current;

  const [messages, setMessages] = useState<ChatMessage[]>(s?.messages ?? []);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(s?.currentQuestion ?? 0);
  const [answeredCount, setAnsweredCount] = useState(s?.answeredCount ?? 0);
  const [isTyping, setIsTyping] = useState(false);
  const [showModelPanel, setShowModelPanel] = useState(s?.showModelPanel ?? false);
  const [modelStage, setModelStage] = useState(s?.modelStage ?? 0);
  const [wizardDone, setWizardDone] = useState(s?.wizardDone ?? false);
  const [showResultButton, setShowResultButton] = useState(s?.showResultButton ?? false);
  const [useAI, setUseAI] = useState(s?.useAI ?? true);
  const [initiativeType, setInitiativeType] = useState<InitiativeType | null>(s?.initiativeType ?? null);
  const [revenueModel, setRevenueModel] = useState<RevenueModel | null>(s?.revenueModel ?? null);
  const classificationDone = initiativeType !== null && revenueModel !== null;

  const [liveAssumptions, setLiveAssumptions] =
    useState<FinancialAssumptions>(s?.liveAssumptions ?? DEFAULT_ASSUMPTIONS);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    new Set(s?.touchedFields ?? [])
  );

  const liveFinancials = useMemo(
    () => computeFinancials(liveAssumptions),
    [liveAssumptions]
  );

  const hasPricing = touchedFields.has("monthly_price");
  const hasCustomers = touchedFields.has("year1_customers");
  const hasInvestment = touchedFields.has("investment_amount");
  const hasRevenue = hasPricing || hasCustomers;
  const hasEnoughForNpv = hasRevenue && hasInvestment;

  const answersRef = useRef<string[]>(s?.answers ?? []);
  const aiTitleRef = useRef<string | null>(s?.aiTitle ?? null);
  const processingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Save wizard state to sessionStorage after meaningful changes */
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      sessionStorage.setItem("cam_wizard_state", JSON.stringify({
        messages,
        answeredCount,
        currentQuestion,
        liveAssumptions,
        touchedFields: [...touchedFields],
        answers: answersRef.current,
        aiTitle: aiTitleRef.current,
        wizardDone,
        showModelPanel,
        modelStage,
        showResultButton,
        useAI,
        initiativeType,
        revenueModel,
      }));
    } catch { /* sessionStorage full or unavailable */ }
  }, [messages, answeredCount, currentQuestion, liveAssumptions, touchedFields, wizardDone, showModelPanel, modelStage, showResultButton, useAI, initiativeType, revenueModel]);

  /* Auto-scroll messages */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /* Re-focus textarea after CAM finishes typing */
  useEffect(() => {
    if (!isTyping && !wizardDone) {
      textareaRef.current?.focus();
    }
  }, [isTyping, wizardDone]);

  /* Initial greeting + first question after mount (skip if restoring session) */
  useEffect(() => {
    if (savedSession.current) return; // session restored — skip greeting

    let cancelled = false;

    const t1 = setTimeout(() => {
      if (!cancelled) setIsTyping(true);
    }, 400);

    const t2 = setTimeout(() => {
      if (cancelled) return;
      setIsTyping(false);
      setMessages([
        {
          role: "cam",
          text: "Hi! I\u2019m CAM, your Capital Allocation Manager. I\u2019ll walk you through building an investment case in just a few minutes. I\u2019ll ask six quick questions about your idea, and as you answer I\u2019ll build a live financial model in real-time on the right. Ready? Let\u2019s dive in.",
        },
      ]);
    }, 1500);

    const t3 = setTimeout(() => {
      if (!cancelled) setIsTyping(true);
    }, 3000);

    const t4 = setTimeout(() => {
      if (cancelled) return;
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "cam", text: QUESTIONS[0] }]);
    }, 4200);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  /* Show model panel after question 2 answered */
  useEffect(() => {
    if (answeredCount >= 2 && !showModelPanel) {
      setShowModelPanel(true);
      setModelStage(1);
    }
    if (answeredCount >= 4) {
      setModelStage(2);
    }
  }, [answeredCount, showModelPanel]);

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  /* Fallback: hardcoded question flow (used when AI is unavailable) */
  const sendFallback = useCallback((newAnswered: number) => {
    if (newAnswered >= QUESTIONS.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "cam", text: "Building your financial model now..." },
        ]);
        setWizardDone(true);
        setTimeout(() => setShowResultButton(true), 2000);
      }, 1500);
    } else {
      setCurrentQuestion(newAnswered);
      setIsTyping(true);
      const delay = 1000 + Math.random() * 800;
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "cam", text: QUESTIONS[newAnswered] },
        ]);
      }, delay);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping || wizardDone || processingRef.current) return;
      processingRef.current = true;

      const trimmed = text.trim();
      answersRef.current.push(trimmed);
      console.log(`[CAM] User message (Q${answeredCount + 1}): "${trimmed.slice(0, 50)}..."`);

      // Always run regex extraction based on current question
      setLiveAssumptions((prev) =>
        parseAssumptionsFromAnswer(answeredCount, trimmed, prev)
      );

      // Mark fields as touched based on what we found in the text
      const fieldsFromAnswer = new Set<string>();
      if (answeredCount === 1) {
        if (parseAmount(trimmed) !== null) fieldsFromAnswer.add("monthly_price");
      }
      if (answeredCount === 2) {
        if (parseAmount(trimmed) !== null) fieldsFromAnswer.add("investment_amount");
      }
      if (answeredCount === 3) {
        if (parseCount(trimmed) !== null) fieldsFromAnswer.add("year1_customers");
      }
      if (fieldsFromAnswer.size > 0) {
        setTouchedFields((prev) => new Set([...prev, ...fieldsFromAnswer]));
      }

      // Build message history before state update
      const msgHistory = [...messages, { role: "user" as const, text: trimmed }];

      setMessages((prev) => [...prev, { role: "user" as const, text: trimmed }]);
      setInput("");

      if (!useAI) {
        const newAnswered = answeredCount + 1;
        setAnsweredCount(newAnswered);
        processingRef.current = false;
        sendFallback(newAnswered);
        return;
      }

      /* ── AI streaming path ── */
      setIsTyping(true);
      try {
        const res = await fetch("/api/ai/wizard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: msgHistory,
            questionIndex: answeredCount,
          }),
        });

        if (!res.ok || !res.body) throw new Error("AI unavailable");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "text") {
                if (firstChunk) {
                  setIsTyping(false);
                  setMessages((prev) => [...prev, { role: "cam", text: "" }]);
                  firstChunk = false;
                }
                fullText += event.content;
                const displayText = fullText.split("###EXTRACT###")[0].trim();
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "cam", text: displayText };
                  return updated;
                });
              }
            } catch { /* skip malformed SSE events */ }
          }
        }

        if (firstChunk) {
          setIsTyping(false);
          throw new Error("No response text received");
        }

        // Clean display text (remove extraction block)
        const cleanText = fullText.split("###EXTRACT###")[0].trim();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "cam", text: cleanText };
          return updated;
        });

        // Parse AI extraction and merge (AI overrides regex where non-null)
        const extractMatch = fullText.match(/###EXTRACT###\s*\n?\s*(\{[\s\S]*?\})/);
        let aiAnsweredCount = answeredCount + 1; // default: assume question was answered
        if (extractMatch) {
          try {
            const extracted = JSON.parse(extractMatch[1]);

            // Use AI-reported question progress
            if (typeof extracted.questions_answered === "number") {
              aiAnsweredCount = extracted.questions_answered;
              console.log(`[CAM] AI reports ${aiAnsweredCount}/${QUESTIONS.length} questions answered`);
            }

            // Capture AI-generated title
            if (typeof extracted.short_title === "string") {
              aiTitleRef.current = extracted.short_title;
            }

            const aiTouched = new Set<string>();
            if (extracted.monthly_price != null) aiTouched.add("monthly_price");
            if (extracted.year1_customers != null) aiTouched.add("year1_customers");
            if (extracted.investment_amount != null) aiTouched.add("investment_amount");
            if (extracted.revenue_growth_pct != null) aiTouched.add("revenue_growth_pct");
            setLiveAssumptions((prev) => {
              const updated = { ...prev };
              if (extracted.monthly_price != null) updated.monthly_price = extracted.monthly_price;
              if (extracted.year1_customers != null) updated.year1_customers = extracted.year1_customers;
              if (extracted.investment_amount != null) updated.investment_amount = extracted.investment_amount;
              if (extracted.revenue_growth_pct != null) updated.revenue_growth_pct = extracted.revenue_growth_pct;
              return updated;
            });
            if (aiTouched.size > 0) {
              setTouchedFields((prev) => new Set([...prev, ...aiTouched]));
            }
          } catch { /* ignore extraction parse errors */ }
        }

        setAnsweredCount(aiAnsweredCount);
        if (aiAnsweredCount >= QUESTIONS.length) {
          setWizardDone(true);
          setTimeout(() => setShowResultButton(true), 1500);
        } else {
          setCurrentQuestion(aiAnsweredCount);
        }
        processingRef.current = false;
      } catch {
        // AI failed — fall back to hardcoded questions
        const newAnswered = answeredCount + 1;
        setAnsweredCount(newAnswered);
        processingRef.current = false;
        setUseAI(false);
        setIsTyping(false);
        sendFallback(newAnswered);
      }
    },
    [isTyping, wizardDone, answeredCount, useAI, messages, sendFallback],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };


  const handleComplete = () => {
    const firstAnswer = answersRef.current[0] || "";

    // Use AI-generated title, or fall back to first ~50 chars of first answer
    let title = aiTitleRef.current || "";
    if (!title) {
      const words = firstAnswer.split(/\s+/);
      for (const word of words) {
        if ((title + " " + word).trim().length > 50) break;
        title = (title + " " + word).trim();
      }
    }
    if (!title) title = "Investment Case";

    const result: WizardResult = {
      title,
      description: firstAnswer,
      answers: answersRef.current,
      assumptions: {
        monthly_price: liveAssumptions.monthly_price,
        year1_customers: liveAssumptions.year1_customers,
        revenue_growth_pct: liveAssumptions.revenue_growth_pct,
        gross_margin_pct: liveAssumptions.gross_margin_pct,
        investment_amount: liveAssumptions.investment_amount,
        discount_rate: liveAssumptions.discount_rate,
      },
      initiative_type: initiativeType!,
      revenue_model: revenueModel!,
    };
    onComplete(result);
  };

  /* ---------------------------------------------------------------- */
  /*  Progress bar                                                     */
  /* ---------------------------------------------------------------- */

  const progressSegments = Array.from({ length: QUESTIONS.length }, (_, i) => (
    <div
      key={i}
      style={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        background:
          i < answeredCount
            ? "var(--zelis-blue-purple, #5F5FC3)"
            : "var(--zelis-ice, #ECE9FF)",
        transition: "background 0.3s",
      }}
    />
  ));

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .wizard-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--zelis-blue-purple, #5F5FC3);
          display: inline-block;
          animation: pulse 1.4s infinite ease-in-out;
        }
        .wizard-typing-dot:nth-child(1) { animation-delay: 0s; }
        .wizard-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .wizard-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .wizard-textarea:focus { outline: none; border-color: var(--zelis-blue-purple, #5F5FC3) !important; }
        .wizard-send-btn:hover { opacity: 0.9; }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
          background: "#fff",
        }}
      >
        {/* ========================================================= */}
        {/*  LEFT PANEL - Chat                                         */}
        {/* ========================================================= */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 32px 20px",
              borderBottom: "1px solid #eee",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--zelis-dark, #23004B)",
                  margin: 0,
                }}
              >
                Investment Case Wizard
              </h1>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                }}
              >
                Question {Math.min(answeredCount + 1, QUESTIONS.length)} of{" "}
                {QUESTIONS.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>{progressSegments}</div>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, idx) =>
              msg.role === "cam" ? (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background:
                        "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    C
                  </div>
                  {/* Bubble */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "4px 16px 16px 16px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "var(--zelis-dark, #23004B)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      background: "var(--zelis-purple, #321478)",
                      color: "#fff",
                      borderRadius: "16px 4px 16px 16px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      maxWidth: "80%",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ),
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background:
                      "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  C
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "12px 20px",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span className="wizard-typing-dot" />
                  <span className="wizard-typing-dot" />
                  <span className="wizard-typing-dot" />
                </div>
              </div>
            )}

            {/* Classification card — shown after wizard is done */}
            {wizardDone && (
              <ClassificationCard
                initiativeType={initiativeType}
                revenueModel={revenueModel}
                onSetType={setInitiativeType}
                onSetModel={setRevenueModel}
              />
            )}

            {/* View Results button — requires classification done */}
            {showResultButton && classificationDone && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background:
                      "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  C
                </div>
                <button
                  onClick={handleComplete}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    boxShadow: "0 4px 16px rgba(50, 20, 120, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(50, 20, 120, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(50, 20, 120, 0.25)";
                  }}
                >
                  View Financial Model & Results &rarr;
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              borderTop: "1px solid #eee",
              padding: "16px 32px 20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              <textarea
                ref={textareaRef}
                className="wizard-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  wizardDone
                    ? "Wizard complete"
                    : "Type your answer..."
                }
                disabled={isTyping || wizardDone}
                rows={2}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
                  color: "var(--zelis-dark, #23004B)",
                  background: wizardDone ? "#f9f9f9" : "#fff",
                  transition: "border-color 0.15s",
                }}
              />
              <button
                className="wizard-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping || wizardDone}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background:
                    input.trim()
                      ? "var(--zelis-dark, #23004B)"
                      : "var(--zelis-ice, #ECE9FF)",
                  color: input.trim() ? "#fff" : "var(--zelis-blue-purple, #5F5FC3)",
                  cursor: input.trim() && !isTyping && !wizardDone ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/*  RIGHT PANEL - Live Financial Model                        */}
        {/* ========================================================= */}
        <div
          style={{
            width: 360,
            flexShrink: 0,
            borderLeft: "1px solid #eee",
            background: "#FAFAFA",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            transition: "opacity 0.4s",
            opacity: showModelPanel ? 1 : 1,
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "24px 24px 16px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--zelis-dark, #23004B)",
              }}
            >
              Live Financial Model
            </div>
          </div>

          <div style={{ padding: "20px 24px", flex: 1 }}>
            {!showModelPanel ? (
              /* Placeholder */
              <div
                style={{
                  border: "2px dashed #ddd",
                  borderRadius: 12,
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Model updates as you answer questions
              </div>
            ) : (
              /* Live metrics */
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Summary metrics — shown after question 4 */}
                {modelStage >= 2 && (
                  <>
                    {/* NPV Card */}
                    <div
                      style={{
                        background: !hasEnoughForNpv
                          ? "#f5f5f5"
                          : liveFinancials.npv >= 0
                            ? "#E8F5E9"
                            : "rgba(230,30,45,0.08)",
                        borderRadius: 12,
                        padding: "16px 20px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: !hasEnoughForNpv
                            ? "#999"
                            : liveFinancials.npv >= 0
                              ? "#2E7D32"
                              : "var(--zelis-red, #E61E2D)",
                          marginBottom: 6,
                        }}
                      >
                        Preliminary NPV
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: !hasEnoughForNpv
                            ? "#ccc"
                            : liveFinancials.npv >= 0
                              ? "#2E7D32"
                              : "var(--zelis-red, #E61E2D)",
                        }}
                      >
                        {hasEnoughForNpv ? formatCurrency(liveFinancials.npv) : "---"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: !hasEnoughForNpv
                            ? "#bbb"
                            : liveFinancials.npv >= 0
                              ? "#558B2F"
                              : "#999",
                          marginTop: 4,
                        }}
                      >
                        {hasEnoughForNpv ? `${liveAssumptions.discount_rate}% discount rate` : "Needs pricing + investment data"}
                      </div>
                    </div>

                    {/* IRR and Payback */}
                    <div
                      style={{ display: "flex", gap: 12 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: 10,
                          padding: "14px 16px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#999",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                            marginBottom: 4,
                          }}
                        >
                          IRR
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "var(--zelis-dark, #23004B)",
                          }}
                        >
                          {!hasEnoughForNpv
                            ? "---"
                            : liveFinancials.irr !== null
                              ? (liveFinancials.irr * 100).toFixed(0) + "%"
                              : "N/A"}
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          background: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: 10,
                          padding: "14px 16px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#999",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                            marginBottom: 4,
                          }}
                        >
                          Payback
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "var(--zelis-dark, #23004B)",
                          }}
                        >
                          {!hasEnoughForNpv
                            ? "---"
                            : liveFinancials.payback_months !== null
                              ? liveFinancials.payback_months + " mo"
                              : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        height: 1,
                        background: "#e5e5e5",
                        margin: "6px 0",
                      }}
                    />
                  </>
                )}

                {/* Monthly Revenue */}
                <MetricRow
                  label="Monthly Revenue (est.)"
                  value={hasRevenue ? formatCurrency(liveFinancials.monthly_revenue) : "---"}
                  detail={hasRevenue ? `$${liveAssumptions.monthly_price.toLocaleString()} x ${liveAssumptions.year1_customers} customers` : "Waiting for pricing & customer data"}
                />

                {/* Annual Revenue */}
                <MetricRow
                  label="Annual Revenue"
                  value={hasRevenue ? formatCurrency(liveFinancials.annual_revenue) : "---"}
                  detail={hasRevenue ? "Year 1 projection" : "Waiting for pricing data"}
                />

                {/* Upfront Investment */}
                <MetricRow
                  label="Upfront Investment"
                  value={hasInvestment ? formatCurrency(liveAssumptions.investment_amount) : "---"}
                  detail={hasInvestment ? "Engineering + GTM + Legal" : "Waiting for investment data"}
                />

                {/* Gross Margin */}
                <MetricRow
                  label="Gross Margin (est.)"
                  value={`${liveAssumptions.gross_margin_pct}%`}
                  detail="SaaS benchmark applied"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricRow helper                                                   */
/* ------------------------------------------------------------------ */

function MetricRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "var(--zelis-dark, #23004B)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#aaa",
          marginTop: 2,
        }}
      >
        {detail}
      </div>
    </div>
  );
}
