export interface BlueprintColProps {
  variant: "rrsp" | "pi" | "corp" | "tfsa" | "net";
  icon: string;
  title: string;
  titleColor: string;
  amountText: string;
  amountColor?: string;
  noteText: string;
  customStyle?: string;
}

/**
 * Reusable metric column card used in Starting Retirement Summary and Annual Withdrawal Blueprint.
 */
export function renderBlueprintCol(props: BlueprintColProps): string {
  const {
    variant,
    icon,
    title,
    titleColor,
    amountText,
    amountColor,
    noteText,
    customStyle,
  } = props;
  return `
    <div class="blueprint-col ${variant}"${customStyle ? ` style="${customStyle}"` : ""}>
      <div class="blueprint-col-title" style="color:${titleColor};">
        <span>${icon}</span> ${title}
      </div>
      <div class="blueprint-amount"${amountColor ? ` style="color:${amountColor};"` : ""}>${amountText}</div>
      <div class="blueprint-note">${noteText}</div>
    </div>
  `;
}

export interface AccountCompareCardProps {
  cardVariant: "card-rrsp" | "card-nonreg" | "card-corp" | "card-tfsa";
  badgeText: string;
  accountName: string;
  longevityText: string;
  longevitySubText: string;
  metrics: Array<{ label: string; value: string }>;
}

/**
 * Reusable Account Comparison Card used in Direct Account Comparator View.
 */
export function renderAccountCompareCard(props: AccountCompareCardProps): string {
  const { cardVariant, badgeText, accountName, longevityText, longevitySubText, metrics } = props;
  const rowsHtml = metrics
    .map(
      (m) => `
      <div class="metric-row">
        <span class="metric-label">${m.label}</span>
        <span class="metric-val">${m.value}</span>
      </div>
    `
    )
    .join("");

  return `
    <article class="card ${cardVariant}">
      <div class="card-header">
        <span class="card-badge">${badgeText}</span>
        <span class="card-title">${accountName}</span>
      </div>
      <div class="hero-metric">
        <div class="hero-metric-label">Retirement Longevity</div>
        <div class="hero-metric-val">${longevityText}</div>
        <div class="hero-metric-sub">${longevitySubText}</div>
      </div>
      <div class="metric-rows">
        ${rowsHtml}
      </div>
    </article>
  `;
}

