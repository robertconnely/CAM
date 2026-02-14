/**
 * Central glossary of business & financial terms.
 * Used by InfoTooltip throughout the app to explain jargon.
 */
export const GLOSSARY: Record<string, string> = {
  ARR: "Annual Recurring Revenue — the yearly value of all active subscription contracts. It measures predictable, ongoing revenue and is the core growth metric for SaaS businesses.",
  "Total ARR":
    "Annual Recurring Revenue — the combined yearly subscription revenue across all products in the portfolio.",
  NPS: "Net Promoter Score — a customer loyalty metric from -100 to 100. Based on the question \"How likely are you to recommend us?\" Scores above 50 are considered excellent.",
  "Avg NPS":
    "Net Promoter Score — measures customer loyalty on a scale of -100 to 100. Scores above 50 are excellent; below 0 signals churn risk.",
  "LTV / CAC":
    "Lifetime Value to Customer Acquisition Cost ratio — how much revenue a customer generates over their lifetime divided by the cost to acquire them. A ratio above 3x is considered healthy; below 1x means you lose money on each customer.",
  "LTV/CAC":
    "Lifetime Value / Customer Acquisition Cost — the return on each dollar spent acquiring a customer. Above 3x is healthy; below 1x means the customer costs more to acquire than they generate.",
  IRR: "Internal Rate of Return — the annualized return an investment is expected to generate. Higher is better. Zelis typically requires >20% IRR to greenlight a product investment.",
  NPV: "Net Present Value — the total value today of all future cash flows from an investment, minus the upfront cost. Positive NPV means the investment creates value; negative means it destroys value.",
  "Net Present Value":
    "The total value today of all future cash flows from an investment, discounted back at a required rate of return. Positive NPV = the investment creates value.",
  "Payback Period":
    "How long it takes for an investment to earn back its initial cost from cumulative cash flows. Shorter is better — typically under 3 years is preferred.",
  "Contribution Margin":
    "Revenue minus variable costs, expressed as a percentage. It shows how much of each revenue dollar is available to cover fixed costs and generate profit. Higher margin = more scalable.",
  "Strategic Score":
    "A weighted composite score (0-100) evaluating an initiative across five dimensions: financial return, strategic alignment, competitive impact, client demand, and execution feasibility.",
  ROIC: "Return on Invested Capital — measures how efficiently the business turns invested dollars into profit. The ROIC tree breaks this down into revenue drivers and cost levers to identify where product initiatives create the most value.",
  "Avg Growth":
    "Average revenue growth rate across all portfolio products. Positive growth indicates expanding market presence; negative signals declining demand.",
  "Avg Retention":
    "Average customer retention rate across the portfolio. Measures the percentage of customers who renew. Above 95% is strong for B2B; below 85% signals churn problems.",
  "Avg Mkt Share":
    "Average market share across portfolio products — the percentage of the addressable market each product captures.",
  "Mkt Share":
    "Market Share — the percentage of the total addressable market captured by this product.",
  Retention:
    "Customer retention rate — the percentage of customers who renew their contracts. Higher retention means more predictable revenue.",
  Growth:
    "Year-over-year revenue growth rate. Positive values indicate expanding revenue; negative values signal contraction.",
  SCAMPER:
    "A structured brainstorming methodology: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse. Used in the Ideation phase to systematically generate product innovation ideas.",
  PDLC: "Product Development Life Cycle — the 8-phase framework governing how products move from idea to launch: Ideation, Business Validation, Requirements, Design & Dev, Marketing Strategy, UAT/QA, Launch, Optimize & Support.",
  PLC: "Product Life Cycle — tracks live products through four stages after PDLC graduation: Introduction (market entry), Growth (scaling), Maturity (market leadership), and Decline (sunset planning).",
  CAM: "Capital Allocation Manager — the decision framework for evaluating and prioritizing product investments using financial modeling (NPV, IRR) and multi-dimensional scoring.",
  "Portfolio Health":
    "A composite score (0-100%) measuring overall portfolio vitality. Weighted across five dimensions: stage distribution (30% — products in Growth/Maturity are healthiest), retention rate (25%), NPS (15%), revenue growth (15%), and LTV/CAC ratio (15%). Above 70% is strong; below 40% signals portfolio-level risk.",
  "Pipeline Health":
    "A weighted score (0-100%) reflecting the status mix of all PDLC initiatives. On Track scores 100, Complete scores 90, At Risk scores 40, and Blocked scores 0. Above 70% means the pipeline is healthy; below 40% signals systemic execution risk.",
};
