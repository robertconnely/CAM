import { useState, useEffect, useRef } from "react";

const COLORS = {
  navy: "#0F2B4C",
  navyLight: "#1A3D6B",
  navyMid: "#163258",
  teal: "#2A9D8F",
  tealLight: "#3DBDAD",
  tealDark: "#228578",
  slate: "#64748B",
  slateLight: "#94A3B8",
  bg: "#F8FAFB",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  text: "#1E293B",
  textMuted: "#64748B",
  green: "#10B981",
  greenBg: "#ECFDF5",
  amber: "#F59E0B",
  amberBg: "#FFFBEB",
  red: "#EF4444",
  redBg: "#FEF2F2",
  purple: "#8B5CF6",
  purpleBg: "#F5F3FF",
};

const stages = ["Ideation", "Discovery", "Business Case", "Approval", "Execution", "Review"];

const existingCases = [
  { id: 1, title: "AI-Powered Customer Onboarding", stage: 4, npv: "$2.4M", irr: "34%", payback: "14 mo", status: "approved", date: "Jan 28" },
  { id: 2, title: "Supply Chain Visibility Platform", stage: 2, npv: "$5.1M", irr: "41%", payback: "11 mo", status: "in-progress", date: "Feb 3" },
  { id: 3, title: "Mobile Field Service App", stage: 5, npv: "$890K", irr: "22%", payback: "18 mo", status: "tracking", date: "Dec 12" },
  { id: 4, title: "Data Warehouse Migration", stage: 1, npv: "\u2014", irr: "\u2014", payback: "\u2014", status: "draft", date: "Feb 11" },
];

const wizardQuestions = [
  { q: "Tell me about your investment idea. What problem are you trying to solve, and for whom?", field: "description" },
  { q: "How would this generate revenue? What's the pricing model you're considering?", field: "revenue" },
  { q: "What's the estimated upfront investment needed to build and launch this?", field: "investment" },
  { q: "How large is the addressable market? Any estimates on how many customers you could reach in Year 1?", field: "market" },
  { q: "What's the timeline? When would you expect to see first revenue?", field: "timeline" },
  { q: "What are the two biggest risks that could derail this?", field: "risks" },
];

const sampleAnswers = [
  "We want to build an automated compliance monitoring tool for mid-market fintech companies. Right now they spend $200K+ annually on manual compliance reviews and still miss things. Our tool would continuously monitor transactions and flag issues in real-time.",
  "SaaS subscription model. We're thinking $3,500/month for companies with up to 500 employees, scaling to $8,000/month for larger organizations. There would also be a per-transaction monitoring fee of $0.02 for high-volume clients.",
  "We'd need about $1.8M upfront \u2014 roughly $1.2M in engineering over 8 months to build the core platform, $300K for compliance certifications and legal, and $300K for initial GTM.",
  "The US fintech compliance market is roughly $12B. Our serviceable segment is about $1.8B. We think we can land 15 customers in Year 1 with a focused outbound motion.",
  "MVP in 6 months, beta launch at month 8, first paying customer by month 10. We'd expect meaningful recurring revenue starting Q2 of Year 2.",
  "First, regulatory changes could invalidate our approach. Second, the sales cycle for compliance tools is notoriously long (6-9 months) which could delay revenue.",
];

function formatCurrency(n) {
  if (n < 0) return "-" + formatCurrency(-n);
  return n >= 1e6 ? "$" + (n/1e6).toFixed(1) + "M" : n >= 1e3 ? "$" + (n/1e3).toFixed(0) + "K" : "$" + n.toFixed(0);
}

function StageBar({ current, total = 6 }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: 14, height: 4, borderRadius: 2, background: i < current ? COLORS.teal : COLORS.border }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: { bg: COLORS.greenBg, color: COLORS.green, label: "Approved" },
    "in-progress": { bg: COLORS.amberBg, color: COLORS.amber, label: "In Progress" },
    tracking: { bg: COLORS.purpleBg, color: COLORS.purple, label: "Tracking" },
    draft: { bg: COLORS.borderLight, color: COLORS.slate, label: "Draft" },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color, letterSpacing: 0.3
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 10, padding: "16px 20px",
      border: "1px solid " + COLORS.border, flex: 1, minWidth: 120,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || COLORS.navy, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function CAMApp() {
  const [view, setView] = useState("dashboard");
  const [wizardStep, setWizardStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const chatEndRef = useRef(null);
  const [revenue, setRevenue] = useState(3500);
  const [customers, setCustomers] = useState(15);
  const [growth, setGrowth] = useState(85);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function startWizard() {
    setView("wizard");
    setWizardStep(0);
    setMessages([]);
    setAnswers([]);
    setShowModel(false);
    setResultsReady(false);
    setInputValue("");
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ role: "cam", text: wizardQuestions[0].q }]);
      }, 1200);
    }, 500);
  }

  function handleSend() {
    if (!inputValue.trim() || isTyping) return;
    const userMsg = inputValue.trim();
    setInputValue("");
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    const newAnswers = [...answers, userMsg];
    setAnswers(newAnswers);
    const nextStep = wizardStep + 1;
    setWizardStep(nextStep);

    if (nextStep >= wizardQuestions.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "cam", text: "Excellent \u2014 I have everything I need. Building your financial model now..." }]);
        setTimeout(() => setResultsReady(true), 2000);
      }, 1500);
    } else {
      if (nextStep >= 2) setShowModel(true);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "cam", text: wizardQuestions[nextStep].q }]);
      }, 1000 + Math.random() * 800);
    }
  }

  function useSampleAnswer() {
    if (wizardStep < sampleAnswers.length) {
      setInputValue(sampleAnswers[wizardStep]);
    }
  }

  var monthlyRev = revenue * customers;
  var annualRev = monthlyRev * 12;
  var yr1 = annualRev;
  var yr2 = yr1 * (1 + growth / 100);
  var yr3 = yr2 * (1 + growth / 100 * 0.7);
  var yr4 = yr3 * (1 + growth / 100 * 0.5);
  var yr5 = yr4 * (1 + growth / 100 * 0.35);
  var totalInvestment = 1800000;
  var cashFlows = [-totalInvestment, yr1 * 0.15, yr2 * 0.35, yr3 * 0.52, yr4 * 0.6, yr5 * 0.65];
  var npvCalc = cashFlows.reduce(function(sum, cf, i) { return sum + cf / Math.pow(1.1, i); }, 0);
  var paybackMonths = Math.round(totalInvestment / (yr2 * 0.35 / 12));

  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: "hidden", background: COLORS.bg
    }}>
      <style>{
        "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');" +
        "@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }" +
        "* { box-sizing: border-box; margin: 0; }" +
        "input[type=range] { -webkit-appearance: none; appearance: none; background: " + COLORS.border + "; border-radius: 4px; outline: none; cursor: pointer; }" +
        "input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: " + COLORS.teal + "; cursor: pointer; }" +
        "textarea::placeholder { color: " + COLORS.slateLight + "; }" +
        "::-webkit-scrollbar { width: 6px; }" +
        "::-webkit-scrollbar-track { background: transparent; }" +
        "::-webkit-scrollbar-thumb { background: " + COLORS.border + "; border-radius: 3px; }"
      }</style>

      {/* SIDEBAR */}
      <div style={{
        width: 220, background: COLORS.navy, color: "white", display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif", flexShrink: 0, height: "100vh"
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, " + COLORS.teal + ", " + COLORS.tealLight + ")",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, letterSpacing: 1
            }}>C</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>CAM</div>
              <div style={{ fontSize: 10, color: COLORS.slateLight, letterSpacing: 0.3 }}>Capital Allocation</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {[
            { icon: "\u25EB", label: "Dashboard", active: view === "dashboard", action: function() { setView("dashboard"); } },
            { icon: "\u2726", label: "New Case", active: view === "wizard", action: startWizard },
            { icon: "\u25C8", label: "Portfolio", disabled: true },
            { icon: "\u25CE", label: "Performance", disabled: true },
            { icon: "\u229E", label: "Calculators", disabled: true },
            { icon: "\u22A1", label: "Reports", disabled: true },
          ].map(function(item, i) {
            return (
              <button key={i} onClick={item.disabled ? undefined : item.action} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 8, border: "none", cursor: item.disabled ? "default" : "pointer",
                background: item.active ? "rgba(42,157,143,0.15)" : "transparent",
                color: item.disabled ? "rgba(255,255,255,0.25)" : item.active ? COLORS.tealLight : "rgba(255,255,255,0.7)",
                fontSize: 13, fontWeight: item.active ? 600 : 400, fontFamily: "inherit",
                textAlign: "left", marginBottom: 2,
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
                {item.disabled && <span style={{ marginLeft: "auto", fontSize: 9, opacity: 0.5, fontStyle: "italic" }}>soon</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: COLORS.navyLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: COLORS.tealLight
            }}>R</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Rob</div>
              <div style={{ fontSize: 10, color: COLORS.slateLight }}>SVP Operations</div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      {view === "dashboard" && (
        <div style={{ flex: 1, overflow: "auto", padding: "32px 40px", background: COLORS.bg }}>
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.navy, margin: 0, letterSpacing: -0.3 }}>Capital Allocation Dashboard</h1>
                <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>4 active investment cases across your portfolio</p>
              </div>
              <button onClick={startWizard} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, " + COLORS.teal + ", " + COLORS.tealDark + ")",
                color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(42,157,143,0.3)", letterSpacing: 0.2
              }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Investment Case
              </button>
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
              <MetricCard label="Total Portfolio NPV" value="$8.4M" sub="Across 3 modeled cases" accent={COLORS.teal} />
              <MetricCard label="Avg. IRR" value="32%" sub="Weighted by investment size" />
              <MetricCard label="Capital Deployed" value="$4.2M" sub="Of $6.5M approved" />
              <MetricCard label="Cases in Pipeline" value="4" sub="1 awaiting approval" />
            </div>
            <div style={{
              background: COLORS.card, borderRadius: 12, border: "1px solid " + COLORS.border,
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              <div style={{
                padding: "14px 24px", borderBottom: "1px solid " + COLORS.border,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>Investment Cases</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>Sorted by last updated</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid " + COLORS.border }}>
                    {["Case", "Stage", "Status", "NPV", "IRR", "Payback", ""].map(function(h, i) {
                      return <th key={i} style={{ padding: "10px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {existingCases.map(function(c, i) {
                    return (
                      <tr key={c.id} style={{ borderBottom: i < existingCases.length - 1 ? "1px solid " + COLORS.borderLight : "none", cursor: "pointer" }}>
                        <td style={{ padding: "14px 24px" }}>
                          <div style={{ fontWeight: 600, color: COLORS.text }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{c.date}</div>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StageBar current={c.stage} />
                            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{stages[c.stage - 1]}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 24px" }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: "14px 24px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{c.npv}</td>
                        <td style={{ padding: "14px 24px", fontVariantNumeric: "tabular-nums" }}>{c.irr}</td>
                        <td style={{ padding: "14px 24px", fontVariantNumeric: "tabular-nums" }}>{c.payback}</td>
                        <td style={{ padding: "14px 24px" }}><span style={{ color: COLORS.textMuted, fontSize: 16 }}>\u2192</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WIZARD */}
      {view === "wizard" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", background: COLORS.bg }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid " + COLORS.border }}>
            <div style={{
              padding: "16px 28px", borderBottom: "1px solid " + COLORS.border, background: COLORS.card,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Investment Case Wizard</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                  Question {Math.min(wizardStep + 1, wizardQuestions.length)} of {wizardQuestions.length}
                </div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {wizardQuestions.map(function(_, i) {
                  return <div key={i} style={{
                    width: 28, height: 4, borderRadius: 2,
                    background: i < wizardStep ? COLORS.teal : i === wizardStep ? COLORS.tealLight : COLORS.border,
                  }} />;
                })}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
              {messages.map(function(m, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
                    {m.role === "cam" && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginRight: 10, marginTop: 2,
                        background: "linear-gradient(135deg, " + COLORS.teal + ", " + COLORS.tealDark + ")",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, color: "white", letterSpacing: 0.5
                      }}>C</div>
                    )}
                    <div style={{
                      maxWidth: "75%", padding: "12px 16px", borderRadius: 12, fontSize: 13, lineHeight: 1.6,
                      background: m.role === "user" ? COLORS.navy : COLORS.card,
                      color: m.role === "user" ? "white" : COLORS.text,
                      border: m.role === "user" ? "none" : "1px solid " + COLORS.border,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg, " + COLORS.teal + ", " + COLORS.tealDark + ")",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "white"
                  }}>C</div>
                  <div style={{
                    padding: "12px 18px", borderRadius: 12, background: COLORS.card,
                    border: "1px solid " + COLORS.border, display: "flex", gap: 5
                  }}>
                    {[0, 1, 2].map(function(j) {
                      return <div key={j} style={{
                        width: 6, height: 6, borderRadius: "50%", background: COLORS.slateLight,
                        animation: "pulse 1.2s ease-in-out " + (j * 0.2) + "s infinite"
                      }} />;
                    })}
                  </div>
                </div>
              )}
              {resultsReady && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <button onClick={function() { setView("results"); }} style={{
                    padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, " + COLORS.teal + ", " + COLORS.tealDark + ")",
                    color: "white", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(42,157,143,0.35)",
                  }}>
                    View Financial Model & Results \u2192
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {!resultsReady && wizardStep < wizardQuestions.length && (
              <div style={{ padding: "16px 28px", borderTop: "1px solid " + COLORS.border, background: COLORS.card }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={useSampleAnswer} style={{
                    padding: "4px 12px", borderRadius: 6, border: "1px solid " + COLORS.border,
                    background: COLORS.borderLight, fontSize: 11, color: COLORS.textMuted,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    \u2728 Use sample answer (for demo)
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <textarea
                    value={inputValue}
                    onChange={function(e) { setInputValue(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type your response..."
                    rows={2}
                    style={{
                      flex: 1, padding: "10px 14px", borderRadius: 10, resize: "none",
                      border: "1px solid " + COLORS.border, fontSize: 13, fontFamily: "inherit",
                      lineHeight: 1.5, outline: "none", color: COLORS.text,
                    }}
                  />
                  <button onClick={handleSend} disabled={!inputValue.trim() || isTyping} style={{
                    padding: "0 20px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: inputValue.trim() ? COLORS.navy : COLORS.border,
                    color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    alignSelf: "flex-end", height: 40
                  }}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={{ width: 340, background: COLORS.card, overflow: "auto", padding: "20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>
              Live Financial Model
            </div>
            {!showModel ? (
              <div style={{
                padding: "40px 20px", textAlign: "center", borderRadius: 10,
                border: "1px dashed " + COLORS.border, color: COLORS.textMuted, fontSize: 12
              }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>\u25CE</div>
                Model updates as you answer questions
              </div>
            ) : (
              <div>
                {[
                  { label: "Monthly Revenue (est.)", value: "$52,500", note: "$3,500 \u00D7 15 customers" },
                  { label: "Annual Revenue", value: "$630,000", note: "Year 1 projection" },
                  { label: "Upfront Investment", value: "$1,800,000", note: "Engineering + GTM + Legal" },
                  { label: "Gross Margin (est.)", value: "78%", note: "SaaS benchmark applied" },
                ].map(function(item, i) {
                  return (
                    <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid " + COLORS.borderLight }}>
                      <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, marginTop: 2 }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: COLORS.slateLight, marginTop: 1 }}>{item.note}</div>
                    </div>
                  );
                })}
                {wizardStep >= 4 && (
                  <div>
                    <div style={{ marginTop: 16, padding: "12px", borderRadius: 8, background: COLORS.greenBg, border: "1px solid " + COLORS.green + "22" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.green, letterSpacing: 0.4, textTransform: "uppercase" }}>Preliminary NPV</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.green, marginTop: 4 }}>$2.1M</div>
                      <div style={{ fontSize: 10, color: COLORS.textMuted }}>10% discount rate, 5-year horizon</div>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, padding: "10px", borderRadius: 8, background: COLORS.borderLight, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600 }}>IRR</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy }}>28%</div>
                      </div>
                      <div style={{ flex: 1, padding: "10px", borderRadius: 8, background: COLORS.borderLight, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600 }}>Payback</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy }}>19 mo</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {view === "results" && (
        <div style={{ flex: 1, overflow: "auto", padding: "32px 40px", background: COLORS.bg }}>
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <button onClick={function() { setView("dashboard"); }} style={{
                  background: "none", border: "none", color: COLORS.teal, cursor: "pointer",
                  fontSize: 12, fontFamily: "inherit", padding: 0, marginBottom: 8, fontWeight: 500
                }}>\u2190 Back to Dashboard</button>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Automated Compliance Monitoring Tool</h1>
                <p style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>Investment case generated Feb 13, 2026 \u00B7 Business Case stage</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid " + COLORS.border, background: COLORS.card, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: COLORS.text }}>Export PDF</button>
                <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: COLORS.navy, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Submit for Approval</button>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", margin: "20px 0 28px",
              padding: "14px 20px", borderRadius: 10, background: COLORS.card, border: "1px solid " + COLORS.border
            }}>
              {stages.map(function(s, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: i < 3 ? COLORS.teal : i === 3 ? "transparent" : COLORS.borderLight,
                        color: i < 3 ? "white" : i === 3 ? COLORS.teal : COLORS.textMuted,
                        border: i === 3 ? "2px solid " + COLORS.teal : "none",
                      }}>{i < 3 ? "\u2713" : i + 1}</div>
                      <span style={{
                        fontSize: 11, fontWeight: i === 3 ? 700 : 500,
                        color: i <= 3 ? COLORS.navy : COLORS.textMuted, whiteSpace: "nowrap"
                      }}>{s}</span>
                    </div>
                    {i < stages.length - 1 && (
                      <div style={{ flex: 1, height: 2, margin: "0 12px", background: i < 3 ? COLORS.teal : COLORS.border }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <MetricCard label="Net Present Value" value={formatCurrency(npvCalc)} accent={npvCalc > 0 ? COLORS.teal : COLORS.red} sub="10% discount rate" />
              <MetricCard label="Internal Rate of Return" value="28.4%" sub="Above 15% hurdle rate" accent={COLORS.green} />
              <MetricCard label="Payback Period" value={paybackMonths + " mo"} sub="From initial investment" />
              <MetricCard label="Total Investment" value="$1.8M" sub="Year 0 capital required" />
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{
                flex: 1, background: COLORS.card, borderRadius: 12,
                border: "1px solid " + COLORS.border, padding: "20px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>5-Year Cash Flow Projection</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 16 }}>Net cash flow by year (investment in Year 0)</div>
                <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 10px" }}>
                  {cashFlows.map(function(cf, i) {
                    var maxAbs = Math.max.apply(null, cashFlows.map(Math.abs));
                    var h = Math.abs(cf) / maxAbs * 140;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: cf >= 0 ? COLORS.teal : COLORS.red }}>
                          {formatCurrency(cf)}
                        </div>
                        <div style={{
                          width: "100%", height: h, borderRadius: 4,
                          background: cf >= 0
                            ? "linear-gradient(180deg, " + COLORS.teal + ", " + COLORS.tealDark + ")"
                            : "linear-gradient(180deg, " + COLORS.red + ", #DC2626)",
                          opacity: 0.85
                        }} />
                        <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500 }}>
                          {i === 0 ? "Inv." : "Yr " + i}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{
                width: 340, background: COLORS.card, borderRadius: 12,
                border: "1px solid " + COLORS.border, padding: "20px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>Key Assumptions</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 16 }}>Adjust to see model update in real-time</div>
                {[
                  { label: "Monthly Price", value: revenue, set: setRevenue, min: 1000, max: 10000, step: 500, fmt: function(v) { return "$" + v.toLocaleString(); } },
                  { label: "Year 1 Customers", value: customers, set: setCustomers, min: 5, max: 50, step: 1, fmt: function(v) { return v; } },
                  { label: "Revenue Growth %", value: growth, set: setGrowth, min: 20, max: 150, step: 5, fmt: function(v) { return v + "%"; } },
                ].map(function(s, i) {
                  return (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.text }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.teal, fontVariantNumeric: "tabular-nums" }}>{s.fmt(s.value)}</span>
                      </div>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                        onChange={function(e) { s.set(Number(e.target.value)); }}
                        style={{ width: "100%", accentColor: COLORS.teal, height: 4 }}
                      />
                    </div>
                  );
                })}
                <div style={{
                  marginTop: 8, padding: "12px", borderRadius: 8,
                  background: npvCalc > 0 ? COLORS.greenBg : COLORS.redBg,
                  border: "1px solid " + (npvCalc > 0 ? COLORS.green : COLORS.red) + "22"
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
                    color: npvCalc > 0 ? COLORS.green : COLORS.red
                  }}>
                    {npvCalc > 0 ? "\u2713 Positive NPV \u2014 Investment Recommended" : "\u2717 Negative NPV \u2014 Reassess Assumptions"}
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 24, background: COLORS.card, borderRadius: 12,
              border: "1px solid " + COLORS.border, padding: "24px 32px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>Generated Investment Memo</div>
                <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>AI-generated \u00B7 Review before sharing</span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.8, color: COLORS.text }}>
                <p style={{ fontWeight: 600, color: COLORS.navy, fontSize: 14, marginBottom: 8 }}>Executive Summary</p>
                <p>This memo proposes a $1.8M investment to build an automated compliance monitoring platform targeting mid-market fintech companies. The tool addresses a critical pain point: companies in this segment currently spend $200K+ annually on manual compliance reviews that remain error-prone and reactive. Our solution provides continuous, real-time transaction monitoring and automated flagging.</p>
                <p style={{ marginTop: 12 }}>Based on a SaaS model with average monthly pricing of ${revenue.toLocaleString()} and a target of {customers} customers in Year 1 growing at {growth}% annually, the investment yields a net present value of {formatCurrency(npvCalc)} with an internal rate of return of 28.4%. The payback period of {paybackMonths} months positions this as a strong risk-adjusted investment relative to our standard 15% hurdle rate and 24-month payback threshold.</p>
                <p style={{ marginTop: 12, color: COLORS.textMuted, fontStyle: "italic", fontSize: 11 }}>Full memo includes: Market Opportunity, Competitive Analysis, Financial Projections, Sensitivity Analysis, Risk Assessment, and Recommendation. Export to PDF for the complete document.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
