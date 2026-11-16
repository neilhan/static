import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";

export interface LedgerTableProps {
  currentStrat: StrategyResult;
  retireAge: number;
  includeOtherIncome: boolean;
  ledgerOpen: boolean;
  isCouple: boolean;
  onToggleLedger: () => void;
}

export function LedgerTable({
  currentStrat,
  retireAge,
  includeOtherIncome,
  ledgerOpen,
  isCouple,
  onToggleLedger,
}: LedgerTableProps) {
  const hasCorp =
    currentStrat.terminalBalanceAtRetirement.corp > 0 ||
    currentStrat.history.some(
      (d) => d.corpEnd > 0 || d.corpContrib > 0 || d.corpGrossDraw > 0
    );

  return (
    <div className="ledger-card">
      <div
        className="ledger-toggle-row"
        id="ledger-toggle"
        role="button"
        tabIndex={0}
        onClick={onToggleLedger}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleLedger();
          }
        }}
      >
        <h2 className="panel-title" style={{ marginBottom: 0 }}>
          📊 Year-by-Year Multi-Account Cash Flow{" "}
          {isCouple ? "(2-Person Breakdown)" : ""}
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginLeft: "0.4rem",
            }}
          >
            {ledgerOpen ? "▲ Click to collapse" : "▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>

      {ledgerOpen && (
        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="td-left">
                  {isCouple ? "Couple Ages & Strategy" : "Age & Status"}
                </th>
                <th>RRSP Balance</th>
                <th>Personal (PI)</th>
                {hasCorp && (
                  <th style={{ color: "var(--corp-color)" }}>
                    {isCouple ? "Co-Owned Corp" : "Corp Balance"}
                  </th>
                )}
                <th>TFSA Balance</th>
                <th>Total Wealth</th>
                {includeOtherIncome && (
                  <th style={{ color: "#60a5fa" }}>Guaranteed Inc</th>
                )}
                <th style={{ color: "var(--rrsp-color)" }}>RRSP Draw</th>
                <th style={{ color: "var(--nonreg-color)" }}>PI Draw</th>
                {hasCorp && (
                  <th style={{ color: "var(--corp-color)" }}>Corp Draw</th>
                )}
                <th style={{ color: "var(--tfsa-color)" }}>TFSA Draw</th>
                <th>Tax Paid</th>
                <th style={{ color: "#10b981" }}>Net Spend</th>
              </tr>
            </thead>
            <tbody>
              {currentStrat.history.map((d) => {
                const isRetire = d.age >= retireAge;
                const ageLabel =
                  isCouple && d.person2Age
                    ? `P1: Age ${d.age} · P2: Age ${d.person2Age}`
                    : `Age ${d.age}`;
                return (
                  <tr key={d.age}>
                    <td className="td-left" style={{ fontWeight: 600 }}>
                      <span className="badge-age">{ageLabel}</span>
                      {d.isIncomeSplit && (
                        <span
                          className="badge-rrif-min"
                          style={{
                            background: "rgba(16,185,129,0.2)",
                            color: "#34d399",
                            borderColor: "rgba(16,185,129,0.4)",
                          }}
                        >
                          Split
                        </span>
                      )}
                      {d.notes && <span className="badge-rrif-min">{d.notes}</span>}
                    </td>
                    <td className="td-highlight-rrsp">{formatCurrency(d.rrspEnd)}</td>
                    <td className="td-highlight-nonreg">{formatCurrency(d.piEnd)}</td>
                    {hasCorp && (
                      <td className="td-highlight-corp">{formatCurrency(d.corpEnd)}</td>
                    )}
                    <td style={{ color: "var(--tfsa-color)" }}>
                      {formatCurrency(d.tfsaEnd)}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--total-color)" }}>
                      {formatCurrency(d.totalEnd)}
                    </td>
                    {includeOtherIncome && (
                      <td style={{ color: "#60a5fa", fontWeight: 600 }}>
                        {isRetire && d.guaranteedGross > 0
                          ? formatCurrency(d.guaranteedGross)
                          : "—"}
                      </td>
                    )}
                    <td style={{ color: "var(--rrsp-color)", fontWeight: 600 }}>
                      {isRetire
                        ? d.rrspGrossDraw > 0
                          ? formatCurrency(d.rrspGrossDraw)
                          : "—"
                        : d.rrspContrib > 0
                          ? `+${formatCurrency(d.rrspContrib)}`
                          : "—"}
                    </td>
                    <td style={{ color: "var(--nonreg-color)", fontWeight: 600 }}>
                      {isRetire
                        ? d.piGrossDraw > 0
                          ? formatCurrency(d.piGrossDraw)
                          : "—"
                        : d.piContrib > 0
                          ? `+${formatCurrency(d.piContrib)}`
                          : "—"}
                    </td>
                    {hasCorp && (
                      <td style={{ color: "var(--corp-color)", fontWeight: 600 }}>
                        {isRetire
                          ? d.corpGrossDraw > 0
                            ? formatCurrency(d.corpGrossDraw)
                            : "—"
                          : d.corpContrib > 0
                            ? `+${formatCurrency(d.corpContrib)}`
                            : "—"}
                      </td>
                    )}
                    <td style={{ color: "var(--tfsa-color)", fontWeight: 600 }}>
                      {isRetire
                        ? d.tfsaGrossDraw > 0
                          ? formatCurrency(d.tfsaGrossDraw)
                          : "—"
                        : d.tfsaContrib > 0
                          ? `+${formatCurrency(d.tfsaContrib)}`
                          : "—"}
                    </td>
                    <td
                      style={{
                        color: d.totalTax > 0 ? "#f87171" : "var(--text-muted)",
                      }}
                    >
                      {formatCurrency(d.totalTax)}
                    </td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>
                      {isRetire ? formatCurrency(d.netSpendReceived) : "Accumulating"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
