import {
  DecumulationStrategy,
  StrategyResult,
  StrategyYearRecord,
} from "../../calculator";
import { formatCurrency } from "../../formatters";
import { AppState } from "../../state";
import { BlueprintCol } from "../ui/BlueprintCol";

interface IncomeStreamSegment {
  variant: string;
  label: string;
  fullTitle: string;
  amount: number;
  pct: number;
}

interface BlueprintDynamicDetailsProps {
  record: StrategyYearRecord;
  selectedAge: number;
  retireNetSpending: number;
  isCouple: boolean;
  hasCorp: boolean;
  onEnablePensions: () => void;
}

function BlueprintDynamicDetails({
  record,
  selectedAge,
  retireNetSpending,
  isCouple,
  hasCorp,
  onEnablePensions,
}: BlueprintDynamicDetailsProps) {
  const cpp = record.cppIncome || 0;
  const oas = record.oasIncome || 0;
  const dbAndOther = (record.dbPensionIncome || 0) + (record.otherIncome || 0);
  const rrsp = record.rrspGrossDraw || 0;
  const pi = record.piGrossDraw || 0;
  const corp = record.corpGrossDraw || 0;
  const tfsa = record.tfsaGrossDraw || 0;
  const totalGross = cpp + oas + dbAndOther + rrsp + pi + corp + tfsa;
  const safeGross = Math.max(1, totalGross);

  const cppPct = Math.round((cpp / safeGross) * 100);
  const oasPct = Math.round((oas / safeGross) * 100);
  const dbPct = Math.round((dbAndOther / safeGross) * 100);
  const rrspPct = Math.round((rrsp / safeGross) * 100);
  const piPct = Math.round((pi / safeGross) * 100);
  const corpPct = Math.round((corp / safeGross) * 100);
  const tfsaPct = Math.max(
    0,
    100 - cppPct - oasPct - dbPct - rrspPct - piPct - corpPct
  );

  const showCorpCol = hasCorp || corp > 0 || record.corpStart > 0;

  const activeStreams: IncomeStreamSegment[] = [
    { variant: "cpp", label: "CPP", fullTitle: "CPP", amount: cpp, pct: cppPct },
    { variant: "oas", label: "OAS", fullTitle: "OAS", amount: oas, pct: oasPct },
    {
      variant: "db",
      label: "DB/Other",
      fullTitle: "DB Pension/Other",
      amount: dbAndOther,
      pct: dbPct,
    },
    { variant: "rrsp", label: "RRSP", fullTitle: "RRSP/RRIF", amount: rrsp, pct: rrspPct },
    { variant: "pi", label: "PI", fullTitle: "Personal (PI)", amount: pi, pct: piPct },
    {
      variant: "corp",
      label: "Corp",
      fullTitle: "Co-Owned Corp (CDA + Div)",
      amount: corp,
      pct: corpPct,
    },
    { variant: "tfsa", label: "TFSA", fullTitle: "TFSA", amount: tfsa, pct: tfsaPct },
  ].filter((s) => s.amount > 0);

  return (
    <>
      <div className="income-breakdown-bar-wrapper">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "0.25rem",
          }}
        >
          <span>Gross Income Composition (Total: {formatCurrency(totalGross)})</span>
          <span style={{ color: "#10b981" }}>
            Net Received: {formatCurrency(record.netSpendReceived)} (Tax:{" "}
            {formatCurrency(record.totalTax)})
          </span>
        </div>
        <div className="income-breakdown-bar">
          {activeStreams.map((s) => (
            <div
              key={s.variant}
              className={`income-bar-seg ${s.variant}`}
              style={{ width: `${s.pct}%` }}
              title={`${s.fullTitle}: ${formatCurrency(s.amount)} (${s.pct}%)`}
            />
          ))}
        </div>
        <div className="income-legend-row">
          {activeStreams.map((s) => (
            <div key={s.variant} className="income-legend-item">
              <span className={`income-legend-dot ${s.variant}`} /> {s.label}:{" "}
              {formatCurrency(s.amount)} ({s.pct}%)
            </div>
          ))}
        </div>
      </div>

      {record.guaranteedGross > 0 ? (
        <div className="income-stack-container">
          <div className="income-stack-title">
            <span>🏛️</span> Full Retirement Income Stack at Age {selectedAge}
          </div>
          <div className="income-stack-rows">
            <div className="income-stack-row">
              <span>1. Guaranteed Pensions &amp; Other Sources (Gross):</span>
              <span style={{ fontWeight: 700, color: "#60a5fa" }}>
                +{formatCurrency(record.guaranteedGross)}/yr
              </span>
            </div>
            <div className="income-stack-row">
              <span style={{ color: "var(--text-muted)", paddingLeft: "1rem" }}>
                ↳ CPP: {formatCurrency(cpp)} · OAS: {formatCurrency(oas)}
                {dbAndOther > 0 ? ` · Pension/Other: ${formatCurrency(dbAndOther)}` : ""}
              </span>
              <span style={{ color: "#93c5fd", fontWeight: 600 }}>
                Net: +{formatCurrency(record.guaranteedNet)}/yr
              </span>
            </div>
            <div className="income-stack-row">
              <span>2. Investment Portfolio Net Draw Needed:</span>
              <span style={{ fontWeight: 700, color: "#34d399" }}>
                +{formatCurrency(record.portfolioNetDraw)}/yr
              </span>
            </div>
            <div className="income-stack-row total">
              <span>Total Net Spending Cash Delivered:</span>
              <span>
                {formatCurrency(record.netSpendReceived)}/yr net (Goal:{" "}
                {formatCurrency(retireNetSpending)})
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pension-cta-callout">
          <div className="pension-cta-info">
            <span style={{ fontSize: "1.15rem" }}>🛡️</span>
            <span>
              <strong>Have a Pension, CPP, or OAS?</strong> Add them to factor in guaranteed
              lifetime income and reduce required investment portfolio draw.
            </span>
          </div>
          <button
            type="button"
            className="btn-enable-pensions-inline"
            id="btn-enable-pensions-inline"
            onClick={onEnablePensions}
          >
            + Add Pensions &amp; Income
          </button>
        </div>
      )}

      <div className="blueprint-grid">
        <BlueprintCol
          variant="rrsp"
          icon="🟣"
          title={isCouple ? "Joint RRSP / RRIF" : "RRSP / RRIF"}
          titleColor="var(--rrsp-color)"
          amountText={formatCurrency(record.rrspGrossDraw)}
          noteText={
            record.isRRIFForced
              ? "Mandatory RRIF Min Active"
              : record.rrspGrossDraw > 0
                ? "Taxable graduated bracket draw"
                : "$0 needed (deferred)"
          }
        />
        <BlueprintCol
          variant="pi"
          icon="🟠"
          title="Personal Account (PI)"
          titleColor="var(--nonreg-color)"
          amountText={formatCurrency(record.piGrossDraw)}
          noteText={
            record.piGrossDraw > 0 ? "50% capital gains inclusion" : "$0 needed this year"
          }
        />
        {showCorpCol && (
          <BlueprintCol
            variant="corp"
            icon="🏢"
            title={isCouple ? "Co-Owned Corp" : "Private Corp"}
            titleColor="var(--corp-color)"
            amountText={formatCurrency(corp)}
            noteText={
              corp > 0
                ? isCouple
                  ? "Tax-free CDA + 50/50 split divs"
                  : "Tax-free CDA + CCPC dividends"
                : "$0 distributed this year"
            }
          />
        )}
        <BlueprintCol
          variant="tfsa"
          icon="🟢"
          title={isCouple ? "Dual TFSAs" : "TFSA"}
          titleColor="var(--tfsa-color)"
          amountText={formatCurrency(record.tfsaGrossDraw)}
          noteText={
            record.tfsaGrossDraw > 0 ? "100% tax-free buffer" : "Kept compounding tax-free"
          }
        />
        <BlueprintCol
          variant="net"
          icon="💰"
          title="Net Cash Received"
          titleColor="#10b981"
          amountText={formatCurrency(record.netSpendReceived)}
          amountColor="#10b981"
          noteText={
            record.guaranteedGross > 0
              ? `${formatCurrency(record.guaranteedNet)} pensions + ${formatCurrency(record.portfolioNetDraw)} portfolio`
              : `After paying ${formatCurrency(record.totalTax)} in tax`
          }
        />
      </div>
    </>
  );
}

function StrategyWithdrawalExplanation({
  strat,
  isCouple,
  hasCorp,
  retireNetSpending,
}: {
  strat: DecumulationStrategy;
  isCouple: boolean;
  hasCorp: boolean;
  retireNetSpending: number;
}) {
  const corpPhrase = hasCorp ? (
    isCouple ? (
      <>
        , <strong>2-Person Co-Owned Corp</strong> (50% tax-free CDA + 50/50 split dividends with
        1.15× gross-up check),
      </>
    ) : (
      <>
        , <strong>Private Corp</strong> (50% tax-free CDA + CCPC dividends),
      </>
    )
  ) : null;

  if (strat === "oasShield") {
    return isCouple ? (
      <>
        <strong>The OAS Shield Formula:</strong> Withdraw from your Joint RRSP/RRIF up to{" "}
        <strong>$176,000/yr combined</strong> ($88,000 per spouse via CRA Form T1032 pension
        income splitting). This keeps both spouses below the ~$91,000 OAS clawback line. Shortfall
        is bridged from your <strong>Personal Account (PI)</strong>
        {corpPhrase} and your <strong>TFSA</strong> (100% tax-free).
      </>
    ) : (
      <>
        <strong>The OAS Shield Formula:</strong> Withdraw from RRSP up to{" "}
        <strong>$88,000/yr</strong> to stay just below the ~$91,000 OAS clawback line. Shortfalls
        are bridged from your <strong>Personal Account (PI)</strong>
        {corpPhrase} and your <strong>TFSA</strong> (tax-free).
      </>
    );
  }

  if (strat === "rrspMeltdown") {
    return isCouple ? (
      <>
        <strong>Early RRSP Meltdown Formula:</strong> Draw aggressively from RRSPs (up to{" "}
        <strong>$180,000/yr combined</strong>) between retirement and age 71. This shrinks your
        future RRIF balance to dismantle the &quot;tax bomb&quot; when CRA mandatory minimums take
        effect at age 71. If after-tax proceeds are below your {formatCurrency(retireNetSpending)}{" "}
        target, take the remaining from PI{hasCorp ? ", Co-Owned Corp," : ""} then TFSA.
      </>
    ) : (
      <>
        <strong>Early RRSP Meltdown Formula:</strong> Draw up to <strong>$105,000/yr</strong>{" "}
        from your RRSP before age 71 to burn down the tax-deferred balance before forced CRA
        minimums begin. Supplement with PI{hasCorp ? ", Corp," : ""} and TFSA if needed.
      </>
    );
  }

  if (strat === "taxableFirst") {
    return (
      <>
        <strong>Taxable (PI{hasCorp ? " & Corp" : ""}) First Formula:</strong> Withdraw spending
        from your <strong>Personal Investment (PI)</strong>
        {hasCorp && (
          <>
            {" "}
            and <strong>Co-Owned Private Corp (CDA + dividends)</strong>
          </>
        )}{" "}
        first until exhausted. During this time, take <strong>$0 from RRSP</strong> (until
        mandatory RRIF minimums start at age 71) and <strong>$0 from TFSA</strong>, allowing
        tax-sheltered accounts to compound untouched.
      </>
    );
  }

  return (
    <>
      <strong>Proportional Balanced Draw Formula:</strong> Withdraw simultaneously across RRSP,
      Personal Account{hasCorp ? ", Co-Owned Corp," : ""} and TFSA based on their current balance
      weights. Each account pays its proportional share toward your{" "}
      {formatCurrency(retireNetSpending)} after-tax spending goal.
    </>
  );
}

export interface WithdrawalBlueprintProps {
  currentStrat: StrategyResult;
  state: AppState;
  isCouple: boolean;
  hasCorp: boolean;
  onSelectAge: (age: number) => void;
  onEnablePensions: () => void;
}

export function WithdrawalBlueprint({
  currentStrat,
  state,
  isCouple,
  hasCorp,
  onSelectAge,
  onEnablePensions,
}: WithdrawalBlueprintProps) {
  const retireHistory = currentStrat.history.filter((d) => d.age >= state.retireAge);
  const minAge = state.retireAge;
  const maxAge =
    retireHistory.length > 0 ? retireHistory[retireHistory.length - 1].age : state.retireAge;

  const rawAge = state.blueprintSelectedAge ?? state.retireAge;
  const selectedAge = Math.min(maxAge, Math.max(minAge, rawAge));

  const record =
    retireHistory.find((d) => d.age === selectedAge) ||
    retireHistory[0] ||
    currentStrat.history[0];
  if (!record) return null;
  const yearInRetire = selectedAge - state.retireAge + 1;

  return (
    <article className="withdrawal-blueprint-card">
      <div className="blueprint-header">
        <div className="blueprint-title">
          <span>🎯</span> Retirement Income &amp; Withdrawal Blueprint ({currentStrat.name})
        </div>
        <span className="badge-recommended">
          Target Spend: {formatCurrency(state.retireNetSpending)}/yr Net
        </span>
      </div>

      <div className="blueprint-age-explorer">
        <div className="blueprint-age-label-row">
          <span className="blueprint-age-title">📅 Inspect Cashflow Mix at Age:</span>
          <span className="blueprint-age-display" id="disp-blueprint-age">
            Age {selectedAge} (Year {yearInRetire} of Retirement)
            {isCouple && record.person2Age ? ` · Spouse Age ${record.person2Age}` : ""}
          </span>
        </div>
        <div className="blueprint-age-controls">
          <input
            type="range"
            id="slider-blueprint-age"
            min={minAge}
            max={maxAge}
            step={1}
            value={selectedAge}
            onChange={(e) => {
              const age = parseInt(e.target.value, 10);
              if (!Number.isNaN(age)) onSelectAge(age);
            }}
          />
          <div className="blueprint-age-chips">
            <button
              type="button"
              className={`age-chip ${selectedAge === minAge ? "active" : ""}`}
              data-age={minAge}
              onClick={() => onSelectAge(minAge)}
            >
              Age {minAge} (Retire Start)
            </button>
            {maxAge >= 71 && (
              <button
                type="button"
                className={`age-chip ${selectedAge === 71 ? "active" : ""}`}
                data-age={71}
                onClick={() => onSelectAge(71)}
              >
                Age 71 (RRIF Min Rule)
              </button>
            )}
            {maxAge >= 75 && (
              <button
                type="button"
                className={`age-chip ${selectedAge === 75 ? "active" : ""}`}
                data-age={75}
                onClick={() => onSelectAge(75)}
              >
                Age 75 (OAS +10% Boost)
              </button>
            )}
            {maxAge >= 85 && (
              <button
                type="button"
                className={`age-chip ${selectedAge === 85 ? "active" : ""}`}
                data-age={85}
                onClick={() => onSelectAge(85)}
              >
                Age 85 (Late Life)
              </button>
            )}
          </div>
        </div>
      </div>

      <div id="blueprint-dynamic-details">
        <BlueprintDynamicDetails
          record={record}
          selectedAge={selectedAge}
          retireNetSpending={state.retireNetSpending}
          isCouple={isCouple}
          hasCorp={hasCorp}
          onEnablePensions={onEnablePensions}
        />
      </div>

      <div className="blueprint-explanation">
        <StrategyWithdrawalExplanation
          strat={state.decumStrategy}
          isCouple={isCouple}
          hasCorp={hasCorp}
          retireNetSpending={state.retireNetSpending}
        />
      </div>
    </article>
  );
}
