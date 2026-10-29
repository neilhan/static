import { DecumulationStrategy, StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { AppRenderCallbacks } from "../ui/types";

interface StrategyCardOption {
  id: DecumulationStrategy;
  title: string;
  desc: string;
}

/**
 * Renders the 4 Decumulation Strategy Selector Cards
 */
export function renderStrategySelectorSection(
  bestStratId: DecumulationStrategy,
  isCouple: boolean,
  hasCorp: boolean
): string {
  const cards: StrategyCardOption[] = [
    {
      id: "oasShield",
      title: `🛡️ ${isCouple ? "Dual OAS Shield" : "OAS Shield & Smoothing"}`,
      desc: isCouple
        ? "Splits RRIF & Corp income 50/50 and shields up to $182k combined from OAS clawback."
        : "Caps taxable draw below the ~$91k clawback line; bridges shortfall from PI/Corp/TFSA.",
    },
    {
      id: "rrspMeltdown",
      title: "🔥 Early RRSP Meltdown",
      desc: "Burns down RRSP aggressively between retirement and 71 to crush the future RRIF tax bomb.",
    },
    {
      id: "taxableFirst",
      title: `⏳ Taxable (PI${hasCorp ? " + Corp" : ""}) First`,
      desc: `Spends Personal (PI)${hasCorp ? " & Co-Owned Corp" : ""} first, allowing RRSP & TFSA shelters to compound.`,
    },
    {
      id: "proRata",
      title: "⚖️ Proportional Balanced Draw",
      desc: `Draws simultaneously across RRSP, PI${hasCorp ? ", Corp," : ""} and TFSA in proportion to account weights.`,
    },
  ];

  const cardsHtml = cards
    .map(
      (c) => `
      <div class="strat-card ${state.decumStrategy === c.id ? "active" : ""}" data-strat="${c.id}">
        <div class="strat-card-title">${c.title} ${bestStratId === c.id ? '<span class="badge-recommended">Optimal</span>' : ""}</div>
        <p class="strat-card-desc">${c.desc}</p>
      </div>
    `
    )
    .join("");

  return `
    <section>
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.6rem;color:var(--text-primary);">
        Choose Your Decumulation Sequencing Strategy:
      </h3>
      <div class="strat-cards-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders the Strategy Comparison Scorecard Table
 */
export function renderStrategyScorecard(
  allStrats: StrategyResult[],
  bestStratId: DecumulationStrategy,
  isCouple: boolean
): string {
  const minTax = Math.min(...allStrats.map((x) => x.totalLifetimeRetirementTax));

  const rowsHtml = allStrats
    .map((s) => {
      const isSelected = s.id === state.decumStrategy;
      const isRec = s.id === bestStratId;
      return `
        <tr style="${isSelected ? "background:rgba(99,102,241,0.1);" : ""}">
          <td class="td-left" style="font-weight:700;">
            ${s.name} ${isRec ? '<span class="badge-recommended">Top Pick</span>' : ""}
          </td>
          <td style="color:#10b981;font-weight:700;">${s.isPerpetual ? "50+ Yrs" : `${s.longevityYears} Yrs`}</td>
          <td>${s.isPerpetual ? "Age 100+" : `Age ${s.depletionAge}`}</td>
          <td style="color:${s.totalLifetimeRetirementTax === minTax ? "#10b981" : "var(--text-primary)"};">
            ${formatCurrency(s.totalLifetimeRetirementTax)}
          </td>
          <td style="color:${s.totalOASClawbackPaid === 0 ? "#10b981" : "#f59e0b"};">
            ${formatCurrency(s.totalOASClawbackPaid)}
          </td>
          <td>${formatCurrency(s.estateValueAtAge85)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <article class="scorecard-card">
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.85rem;color:var(--text-primary);">
        📊 Strategy Comparison Scorecard ${isCouple ? "(Household Combined)" : ""}
      </h3>
      <div class="table-responsive" style="margin-top:0;">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="td-left">Strategy</th>
              <th>Retirement Longevity</th>
              <th>Depletion Age</th>
              <th>Lifetime Taxes Paid</th>
              <th>OAS Clawback</th>
              <th>Estate @ 85</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

export function attachStrategySelectorListeners(cb: AppRenderCallbacks): void {
  document.querySelectorAll<HTMLDivElement>(".strat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const s = card.dataset.strat as DecumulationStrategy;
      if (s && s !== state.decumStrategy) {
        state.decumStrategy = s;
        cb.updateResultsOnly();
      }
    });
  });
}

