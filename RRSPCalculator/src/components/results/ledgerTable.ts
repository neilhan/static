import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { AppRenderCallbacks } from "../ui/types";

/**
 * Render Simulator Year-by-Year Ledger Table
 */
export function renderSimulatorLedger(strat: StrategyResult, isCouple: boolean): string {
  const hasCorp =
    strat.terminalBalanceAtRetirement.corp > 0 ||
    strat.history.some((d) => d.corpEnd > 0 || d.corpContrib > 0 || d.corpGrossDraw > 0);

  const rows = strat.history
    .map((d) => {
      const isRetire = d.age >= state.retireAge;
      const ageLabel =
        isCouple && d.person2Age
          ? `P1: Age ${d.age} · P2: Age ${d.person2Age}`
          : `Age ${d.age}`;
      return `
        <tr>
          <td class="td-left" style="font-weight:600;">
            <span class="badge-age">${ageLabel}</span>
            ${d.isIncomeSplit ? `<span class="badge-rrif-min" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4);">Split</span>` : ""}
            ${d.notes ? `<span class="badge-rrif-min">${d.notes}</span>` : ""}
          </td>
          <td class="td-highlight-rrsp">${formatCurrency(d.rrspEnd)}</td>
          <td class="td-highlight-nonreg">${formatCurrency(d.piEnd)}</td>
          ${hasCorp ? `<td class="td-highlight-corp">${formatCurrency(d.corpEnd)}</td>` : ""}
          <td style="color:var(--tfsa-color);">${formatCurrency(d.tfsaEnd)}</td>
          <td style="font-weight:700;color:var(--total-color);">${formatCurrency(d.totalEnd)}</td>
          ${
            state.includeOtherIncome
              ? `<td style="color:#60a5fa;font-weight:600;">${isRetire && d.guaranteedGross > 0 ? formatCurrency(d.guaranteedGross) : "—"}</td>`
              : ""
          }
          <td style="color:var(--rrsp-color);font-weight:600;">
            ${isRetire ? (d.rrspGrossDraw > 0 ? formatCurrency(d.rrspGrossDraw) : "—") : d.rrspContrib > 0 ? `+${formatCurrency(d.rrspContrib)}` : "—"}
          </td>
          <td style="color:var(--nonreg-color);font-weight:600;">
            ${isRetire ? (d.piGrossDraw > 0 ? formatCurrency(d.piGrossDraw) : "—") : d.piContrib > 0 ? `+${formatCurrency(d.piContrib)}` : "—"}
          </td>
          ${
            hasCorp
              ? `<td style="color:var(--corp-color);font-weight:600;">
                  ${isRetire ? (d.corpGrossDraw > 0 ? formatCurrency(d.corpGrossDraw) : "—") : d.corpContrib > 0 ? `+${formatCurrency(d.corpContrib)}` : "—"}
                </td>`
              : ""
          }
          <td style="color:var(--tfsa-color);font-weight:600;">
            ${isRetire ? (d.tfsaGrossDraw > 0 ? formatCurrency(d.tfsaGrossDraw) : "—") : d.tfsaContrib > 0 ? `+${formatCurrency(d.tfsaContrib)}` : "—"}
          </td>
          <td style="color:${d.totalTax > 0 ? "#f87171" : "var(--text-muted)"};">${formatCurrency(d.totalTax)}</td>
          <td style="color:#10b981;font-weight:700;">
            ${isRetire ? formatCurrency(d.netSpendReceived) : "Accumulating"}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-responsive">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="td-left">${isCouple ? "Couple Ages & Strategy" : "Age & Status"}</th>
            <th>RRSP Balance</th>
            <th>Personal (PI)</th>
            ${hasCorp ? `<th style="color:var(--corp-color);">${isCouple ? "Co-Owned Corp" : "Corp Balance"}</th>` : ""}
            <th>TFSA Balance</th>
            <th>Total Wealth</th>
            ${state.includeOtherIncome ? `<th style="color:#60a5fa;">Guaranteed Inc</th>` : ""}
            <th style="color:var(--rrsp-color);">RRSP Draw</th>
            <th style="color:var(--nonreg-color);">PI Draw</th>
            ${hasCorp ? `<th style="color:var(--corp-color);">Corp Draw</th>` : ""}
            <th style="color:var(--tfsa-color);">TFSA Draw</th>
            <th>Tax Paid</th>
            <th style="color:#10b981;">Net Spend</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

export function renderLedgerCard(currentStrat: StrategyResult, isCouple: boolean): string {
  return `
    <div class="ledger-card">
      <div class="ledger-toggle-row" id="ledger-toggle" role="button" tabindex="0">
        <h2 class="panel-title" style="margin-bottom: 0;">
          📊 Year-by-Year Multi-Account Cash Flow ${isCouple ? "(2-Person Breakdown)" : ""}
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
            ${state.ledgerOpen ? "▲ Click to collapse" : "▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>
      ${state.ledgerOpen ? renderSimulatorLedger(currentStrat, isCouple) : ""}
    </div>
  `;
}

export function attachLedgerListeners(cb: AppRenderCallbacks): void {
  document.getElementById("ledger-toggle")?.addEventListener("click", () => {
    state.ledgerOpen = !state.ledgerOpen;
    cb.updateResultsOnly();
  });
}

