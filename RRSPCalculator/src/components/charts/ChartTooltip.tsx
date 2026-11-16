import { StrategyYearRecord } from "../../calculator";
import { formatCurrency } from "../../formatters";

export interface ChartTooltipProps {
  chartViewMode: "balances" | "incomeStreams";
  record: StrategyYearRecord | null;
  retireAge: number;
  hasCorp: boolean;
  tipLeft: number;
}

export function ChartTooltip({
  chartViewMode,
  record,
  retireAge,
  hasCorp,
  tipLeft,
}: ChartTooltipProps) {
  if (!record) {
    return <div id="chart-tooltip" className="chart-tooltip" style={{ display: "none" }} />;
  }

  const ageHeader = record.person2Age
    ? `P1: Age ${record.age} · P2: Age ${record.person2Age}`
    : `Age ${record.age}`;

  if (chartViewMode === "incomeStreams") {
    const cpp = record.cppIncome || 0;
    const oas = record.oasIncome || 0;
    const dbAndOther = (record.dbPensionIncome || 0) + (record.otherIncome || 0);
    const corp = record.corpGrossDraw || 0;
    const totalGross =
      cpp +
      oas +
      dbAndOther +
      record.rrspGrossDraw +
      record.piGrossDraw +
      corp +
      record.tfsaGrossDraw;

    return (
      <div
        id="chart-tooltip"
        className="chart-tooltip"
        style={{ display: "block", left: `${tipLeft}px`, top: "30px" }}
      >
        <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: "#fff" }}>
          {ageHeader} (Year {record.age - retireAge + 1} of Retirement)
        </div>
        <div
          style={{
            color: "#10b981",
            fontWeight: 700,
            marginBottom: "0.35rem",
            fontSize: "0.9rem",
          }}
        >
          Net Spending: {formatCurrency(record.netSpendReceived)}
        </div>
        <div
          style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}
        >
          Total Gross Cash Inflows: {formatCurrency(totalGross)}
        </div>
        {cpp > 0 && (
          <div style={{ color: "#3b82f6" }}>
            🏛️ CPP: <strong>+{formatCurrency(cpp)}</strong>
          </div>
        )}
        {oas > 0 && (
          <div style={{ color: "#60a5fa" }}>
            🏛️ OAS: <strong>+{formatCurrency(oas)}</strong>
          </div>
        )}
        {dbAndOther > 0 && (
          <div style={{ color: "#818cf8" }}>
            💼 DB/Other: <strong>+{formatCurrency(dbAndOther)}</strong>
          </div>
        )}
        {record.rrspGrossDraw > 0 && (
          <div style={{ color: "var(--rrsp-color)" }}>
            🟣 RRSP Draw: <strong>+{formatCurrency(record.rrspGrossDraw)}</strong>
          </div>
        )}
        {record.piGrossDraw > 0 && (
          <div style={{ color: "var(--nonreg-color)" }}>
            🟠 PI Draw: <strong>+{formatCurrency(record.piGrossDraw)}</strong>
          </div>
        )}
        {corp > 0 && (
          <div style={{ color: "var(--corp-color)" }}>
            🏢 Corp Div/CDA: <strong>+{formatCurrency(corp)}</strong>
          </div>
        )}
        {record.tfsaGrossDraw > 0 && (
          <div style={{ color: "var(--tfsa-color)" }}>
            🟢 TFSA Draw: <strong>+{formatCurrency(record.tfsaGrossDraw)}</strong>
          </div>
        )}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "0.35rem",
            paddingTop: "0.35rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Total Tax Paid:{" "}
          <strong style={{ color: "#ef4444" }}>{formatCurrency(record.totalTax)}</strong>
          {record.isOASCapped && (
            <>
              <br />
              <span style={{ color: "#10b981" }}>🛡️ Clawback Shield Active</span>
            </>
          )}
          {record.isRRIFForced && (
            <>
              <br />
              <span style={{ color: "#f59e0b" }}>⚠️ Mandatory RRIF Min Active</span>
            </>
          )}
          <div style={{ marginTop: "0.25rem", color: "#93c5fd", fontStyle: "italic" }}>
            💡 Click to inspect this age in Blueprint below
          </div>
        </div>
      </div>
    );
  }

  const isRetire = record.age >= retireAge;

  return (
    <div
      id="chart-tooltip"
      className="chart-tooltip"
      style={{ display: "block", left: `${tipLeft}px`, top: "30px" }}
    >
      <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: "#fff" }}>
        {ageHeader} ({isRetire ? "Retirement" : "Accumulating"})
      </div>
      <div
        style={{
          color: "var(--total-color)",
          fontWeight: 700,
          marginBottom: "0.35rem",
          fontSize: "0.9rem",
        }}
      >
        Total Wealth: {formatCurrency(record.totalEnd)}
      </div>
      <div style={{ color: "var(--rrsp-color)" }}>
        RRSP: <strong>{formatCurrency(record.rrspEnd)}</strong>
      </div>
      <div style={{ color: "var(--nonreg-color)" }}>
        PI: <strong>{formatCurrency(record.piEnd)}</strong>
      </div>
      {(hasCorp || record.corpEnd > 0) && (
        <div style={{ color: "var(--corp-color)" }}>
          Corp: <strong>{formatCurrency(record.corpEnd)}</strong>
        </div>
      )}
      <div style={{ color: "var(--tfsa-color)" }}>
        TFSA: <strong>{formatCurrency(record.tfsaEnd)}</strong>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: "0.35rem",
          paddingTop: "0.35rem",
        }}
      >
        {isRetire ? (
          <>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: "0.2rem",
              }}
            >
              Retirement Cashflow:
            </div>
            {record.guaranteedGross > 0 && (
              <>
                <div style={{ color: "#60a5fa" }}>
                  🏛️ Pensions:{" "}
                  <strong>
                    +{formatCurrency(record.guaranteedGross)} (
                    {formatCurrency(record.guaranteedNet)} net)
                  </strong>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                  Portfolio Bridge: <strong>{formatCurrency(record.portfolioNetDraw)}</strong>
                </div>
              </>
            )}
            <div style={{ color: "var(--rrsp-color)" }}>
              RRSP Draw:{" "}
              <strong>
                {record.rrspGrossDraw > 0 ? formatCurrency(record.rrspGrossDraw) : "$0"}
              </strong>
            </div>
            <div style={{ color: "var(--nonreg-color)" }}>
              PI Draw:{" "}
              <strong>
                {record.piGrossDraw > 0 ? formatCurrency(record.piGrossDraw) : "$0"}
              </strong>
            </div>
            {(hasCorp || record.corpGrossDraw > 0) && (
              <div style={{ color: "var(--corp-color)" }}>
                Corp Draw:{" "}
                <strong>
                  {record.corpGrossDraw > 0 ? formatCurrency(record.corpGrossDraw) : "$0"}
                </strong>
              </div>
            )}
            <div style={{ color: "var(--tfsa-color)" }}>
              TFSA Draw:{" "}
              <strong>
                {record.tfsaGrossDraw > 0 ? formatCurrency(record.tfsaGrossDraw) : "$0"}
              </strong>
            </div>
            <div style={{ color: "#10b981", fontWeight: 700, marginTop: "0.2rem" }}>
              Net Spending: {formatCurrency(record.netSpendReceived)}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: "0.2rem",
              }}
            >
              Annual Savings Added:
            </div>
            <div style={{ color: "var(--rrsp-color)" }}>
              RRSP: <strong>+{formatCurrency(record.rrspContrib)}</strong>
            </div>
            <div style={{ color: "var(--nonreg-color)" }}>
              PI: <strong>+{formatCurrency(record.piContrib)}</strong>
            </div>
            {record.corpContrib > 0 && (
              <div style={{ color: "var(--corp-color)" }}>
                Corp: <strong>+{formatCurrency(record.corpContrib)}</strong>
              </div>
            )}
            {record.tfsaContrib > 0 && (
              <div style={{ color: "var(--tfsa-color)" }}>
                TFSA: <strong>+{formatCurrency(record.tfsaContrib)}</strong>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
