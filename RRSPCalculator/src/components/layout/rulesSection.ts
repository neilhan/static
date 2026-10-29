export interface RuleCardItem {
  icon: string;
  title: string;
  tagText: string;
  tagClass: string;
  tagStyle?: string;
  descriptionHtml: string;
  takeawayHtml: string;
}

const RULES_DATA: RuleCardItem[] = [
  {
    icon: "🤝",
    title: "Pension Income Splitting (CRA Form T1032)",
    tagText: "Couples Rule",
    tagClass: "tag-strategy",
    descriptionHtml:
      "At age 65+, Canadian couples can transfer up to <strong>50% of eligible RRIF withdrawals</strong> to their spouse on line 21000 of their tax return. Both spouses get the <strong>$2,000 Pension Credit</strong> and dual Basic Personal Amounts ($31,410 tax-free combined).",
    takeawayHtml:
      "<strong>Impact:</strong> Cuts annual retirement income tax by $6,000 to $12,000+ per year, adding 3 to 6 years of longevity to a couple's portfolio!",
  },
  {
    icon: "🏢",
    title: "2-Person Co-Owned Corp (CCPC / HoldCo)",
    tagText: "Co-Owned Corp",
    tagClass: "tag-strategy",
    tagStyle:
      "background:rgba(244,114,182,0.18);color:var(--corp-color);border-color:rgba(244,114,182,0.35);",
    descriptionHtml:
      "Active business earnings retained inside a Canadian-Controlled Private Corporation are taxed at just <strong>12.2% (Ontario SBD)</strong>, leaving 87.8¢ on the dollar to invest. In retirement, <strong>50% of realized corporate capital gains</strong> flow out <strong>100% tax-free via the Capital Dividend Account (CDA)</strong>, while co-owning spouses split dividends 50/50 (TOSI-exempt at age 65+ or with co-founder shares).",
    takeawayHtml:
      "<strong>Impact:</strong> Note that taxable CCPC dividends have a <strong>1.15× CRA gross-up</strong> on line 23400, so blending CDA tax-free payouts with RRSP/TFSA draws helps protect OAS!",
  },
  {
    icon: "🛡️",
    title: "Dual OAS Clawback Shield ($182k Combined)",
    tagText: "Clawback Shield",
    tagClass: "tag-tax",
    descriptionHtml:
      "While a single person's OAS clawback starts at ~$91,000, a couple splitting RRIF pensions and CCPC corporate dividends can draw up to <strong>$182,000 combined</strong> before triggering the 15% OAS recovery tax.",
    takeawayHtml:
      "<strong>Impact:</strong> Fully shields both spouses' Old Age Security pensions from government clawbacks.",
  },
  {
    icon: "🏛️",
    title: "CRA Mandatory RRIF Conversion (Age 71+)",
    tagText: "CRA Rule",
    tagClass: "tag-cra",
    descriptionHtml:
      "By December 31 of the year you turn <strong>71</strong>, you must convert your RRSP to a RRIF. For couples, the CRA allows basing mandatory minimums on the <strong>younger spouse's age</strong>, lowering required withdrawals!",
    takeawayHtml:
      "<strong>Impact:</strong> Using the younger spouse's age legally reduces forced taxable withdrawals and keeps more money compounding.",
  },
  {
    icon: "📉",
    title: "Annual Tax Drag in Personal & Passive Accounts",
    tagText: "Growth Drag",
    tagClass: "tag-tax",
    descriptionHtml:
      "In non-registered and passive corporate investment accounts, dividends, interest, and realized capital gains face annual tax drag, slowing compounding by <strong>~1.0% to 2.0% annually</strong> compared to RRSP/TFSA.",
    takeawayHtml:
      "<strong>Impact:</strong> Prioritize ETFs with deferred capital gains inside Personal & HoldCo accounts, and maximize dual TFSAs ($14,000/yr) first.",
  },
];

export function renderRuleCard(rule: RuleCardItem): string {
  return `
    <article class="rule-card">
      <div class="rule-card-header">
        <div class="rule-title-group">
          <span class="rule-icon">${rule.icon}</span>
          <span class="rule-title">${rule.title}</span>
        </div>
        <span class="rule-tag ${rule.tagClass}"${rule.tagStyle ? ` style="${rule.tagStyle}"` : ""}>${rule.tagText}</span>
      </div>
      <p class="rule-desc">${rule.descriptionHtml}</p>
      <div class="rule-takeaway">${rule.takeawayHtml}</div>
    </article>
  `;
}

export function renderRulesSection(): string {
  return `
    <section class="rules-section" aria-label="Canadian Retirement Planning Rules & Factors">
      <div class="rules-header">
        <h2>📋 Rules & Factors to Consider in Canadian Retirement Planning</h2>
        <p>Key tax laws, CRA regulations, and structural differences that impact RRSP, Personal Non-Registered, 2-Person Co-Owned Corporations (CCPC), and TFSA accounts.</p>
      </div>
      <div class="rules-grid">
        ${RULES_DATA.map(renderRuleCard).join("")}
      </div>
    </section>
  `;
}

