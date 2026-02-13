export interface TreeNode {
  id: string;
  label: string;
  shortLabel?: string;
  children?: TreeNode[];
  /** Maps to initiative type categories for leaf nodes */
  initiativeCategories?: string[];
  color: string;
  description?: string;
  /** Highlighted as a key value driver (gold) — actionable lever for initiatives */
  isKeyDriver?: boolean;
}

/** Colors for the McKinsey-style rendering — Zelis brand palette */
export const TREE_COLORS = {
  nodeBg: "#ECE9FF", // zelis-ice — light purple for financial nodes
  nodeBorder: "#41329B", // zelis-mid-purple
  nodeText: "#23004B", // zelis-dark
  keyDriverBg: "#23004B", // zelis-dark — actionable value levers
  keyDriverBorder: "#1a0038", // deeper dark border
  keyDriverText: "#FFFFFF", // white on dark
  connectorLine: "#5F5FC3", // zelis-blue-purple
} as const;

/**
 * ROIC Value Driver Tree based on McKinsey framework
 * adapted for Zelis Price Optimization / Payment Integrity.
 *
 * Structure: Value → Growth + ROIC + WACC
 * Key value drivers (gold) are the actionable levers where
 * product initiatives connect to business value.
 */
export const ROIC_TREE: TreeNode = {
  id: "value",
  label: "Value",
  color: "#23004B", // zelis-dark
  description: "Total enterprise value driven by growth, ROIC, and cost of capital",
  children: [
    {
      id: "growth",
      label: "Growth",
      color: "#321478", // zelis-purple
      description: "Revenue growth through client expansion and volume increases",
      children: [
        {
          id: "rev_per_client",
          label: "Revenue per Client",
          shortLabel: "Rev / Client",
          color: "#41329B", // zelis-mid-purple
          description: "Average revenue per client — driven by attach rate, savings yield, and contract value",
          children: [
            {
              id: "client_retention",
              label: "Client Retention & Expansion",
              shortLabel: "Client Retention",
              color: "#23004B", // zelis-dark (key driver)
              description: "Client renewal rate, NPS, expanded module adoption, savings yield per claim",
              isKeyDriver: true,
              initiativeCategories: ["client_retention_defensive"],
            },
            {
              id: "cross_sell",
              label: "Cross-Sell Attach Rate",
              shortLabel: "Cross-Sell",
              color: "#23004B", // zelis-dark (key driver)
              description: "Multi-module adoption rate, new feature attach, upsell conversion",
              isKeyDriver: true,
              initiativeCategories: ["major_feature_enhancement"],
            },
          ],
        },
        {
          id: "claims_volume",
          label: "Volume",
          color: "#41329B", // zelis-mid-purple
          description: "Total claims processed across the platform",
          children: [
            {
              id: "market_share",
              label: "Market Share",
              shortLabel: "Market Share",
              color: "#5F5FC3", // zelis-blue-purple
              description: "Share of addressable market — payer count, lives covered, claims captured",
              children: [
                {
                  id: "product_quality",
                  label: "Product Quality",
                  shortLabel: "Quality",
                  color: "#5F5FC3", // zelis-blue-purple
                  description: "Edit accuracy, false positive rate, provider satisfaction, claim turnaround time",
                },
                {
                  id: "new_product_pipeline",
                  label: "New-Product Pipeline",
                  shortLabel: "New Products",
                  color: "#23004B", // zelis-dark (key driver)
                  description: "New pricing modules, analytics products, and market segments",
                  isKeyDriver: true,
                  initiativeCategories: ["new_product_platform"],
                },
              ],
            },
            {
              id: "market_growth",
              label: "Market Growth",
              shortLabel: "Mkt Growth",
              color: "#5F5FC3", // zelis-blue-purple
              description: "Overall market expansion — healthcare claims volume, regulatory tailwinds",
            },
          ],
        },
      ],
    },
    {
      id: "roic",
      label: "ROIC",
      color: "#321478", // zelis-purple
      description: "Return on invested capital — the core financial engine",
      children: [
        {
          id: "processing_cost",
          label: "Processing Cost per Claim",
          shortLabel: "Cost / Claim",
          color: "#41329B", // zelis-mid-purple
          description: "Direct cost of processing each claim through the platform",
          children: [
            {
              id: "clinical_review",
              label: "Clinical Review Hours",
              shortLabel: "Review Hours",
              color: "#5F5FC3", // zelis-blue-purple
              description: "Hours of clinical reviewer time per claim, overturn rate, rework",
            },
            {
              id: "auto_adj_rate",
              label: "Auto-Adjudication Rate",
              shortLabel: "Auto-Adj Rate",
              color: "#23004B", // zelis-dark (key driver)
              description: "Percentage of claims auto-adjudicated without human review (target: 99%+)",
              isKeyDriver: true,
              initiativeCategories: ["efficiency_automation"],
            },
          ],
        },
        {
          id: "sga_cost",
          label: "SG&A Cost per Claim",
          shortLabel: "SG&A / Claim",
          color: "#E61E2D", // zelis-red
          description: "Selling, general & administrative costs allocated per claim",
          children: [
            {
              id: "eng_headcount",
              label: "Engineering Productivity",
              shortLabel: "Eng Prod",
              color: "#E61E2D", // zelis-red
              description: "R&D and engineering output per headcount dollar",
            },
            {
              id: "compliance",
              label: "Regulatory Compliance",
              shortLabel: "Compliance",
              color: "#23004B", // zelis-dark (key driver)
              description: "Compliance & audit costs, CMS regulatory requirements, state mandates",
              isKeyDriver: true,
              initiativeCategories: ["compliance_regulatory"],
            },
          ],
        },
        {
          id: "invested_capital",
          label: "Invested Capital per Claim",
          shortLabel: "Capital / Claim",
          color: "#320FFF", // zelis-blue
          description: "Technology and infrastructure investment per claim processed",
          children: [
            {
              id: "platform_rules",
              label: "Platform & Rules Engine",
              shortLabel: "Platform",
              color: "#23004B", // zelis-dark (key driver)
              description: "ZIPP platform investment, rules engine, edit library, API infrastructure",
              isKeyDriver: true,
              initiativeCategories: ["new_product_platform"],
            },
            {
              id: "analytics_ml",
              label: "Analytics & ML",
              shortLabel: "Analytics & ML",
              color: "#23004B", // zelis-dark (key driver)
              description: "Analytics infrastructure, ML pricing models, data acquisition, AI capabilities",
              isKeyDriver: true,
              initiativeCategories: ["new_product_platform", "efficiency_automation"],
            },
          ],
        },
      ],
    },
    {
      id: "wacc",
      label: "WACC",
      color: "#797279", // neutral gray — external factor
      description: "Weighted average cost of capital — cost of equity and debt financing",
    },
  ],
};

/**
 * Operating initiative categories that map to key value driver nodes.
 */
export const OPERATING_INITIATIVE_CATEGORIES = [
  {
    id: "client_growth",
    label: "Client Growth & Retention",
    color: "#321478", // zelis-purple
    initiativeTypes: ["client_retention_defensive"],
  },
  {
    id: "product_expansion",
    label: "Product Expansion",
    color: "#5F5FC3", // zelis-blue-purple
    initiativeTypes: ["major_feature_enhancement", "new_product_platform"],
  },
  {
    id: "operational_excellence",
    label: "Operational Excellence",
    color: "#FFC000", // zelis-gold
    initiativeTypes: ["efficiency_automation"],
  },
  {
    id: "compliance",
    label: "Compliance & Regulatory",
    color: "#E61E2D", // zelis-red
    initiativeTypes: ["compliance_regulatory"],
  },
  {
    id: "platform_tech",
    label: "Platform & Technology",
    color: "#320FFF", // zelis-blue
    initiativeTypes: ["new_product_platform"],
  },
] as const;
