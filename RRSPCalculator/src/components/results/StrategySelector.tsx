import { DecumulationStrategy, StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";

interface StrategyCardOption {
  id: DecumulationStrategy;
  title: string;
  desc: string;
}

export interface StrategySelectorProps {
  selectedStrategy: DecumulationStrategy;
  bestStratId: DecumulationStrategy;
  isCouple: boolean;
  hasCorp: boolean;
  onSelectStrategy: (strategy: DecumulationStrategy) => void;
}

export function StrategySelector({
  selectedStrategy,
  bestStratId,
  isCouple,
  hasCorp,
  onSelectStrategy,
}: StrategySelectorProps) {
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

  return (
    <section>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          marginBottom: "0.6rem",
          color: "var(--text-primary)",
        }}
      >
        Choose Your Decumulation Sequencing Strategy:
      </h3>
      <div className="strat-cards-grid">
        {cards.map((c) => (
          <div
            key={c.id}
            className={`strat-card ${selectedStrategy === c.id ? "active" : ""}`}
            data-strat={c.id}
            onClick={() => {
              if (c.id !== selectedStrategy) onSelectStrategy(c.id);
            }}
          >
            <div className="strat-card-title">
              {c.title}{" "}
              {bestStratId === c.id && (
                <span className="badge-recommended">Optimal</span>
              )}
            </div>
            <p className="strat-card-desc">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export interface StrategyScorecardProps {
  allStrats: StrategyResult[];
  selectedStrategy: DecumulationStrategy;
  bestStratId: DecumulationStrategy;
  isCouple: boolean;
}

export function StrategyScorecard({
  allStrats,
  selectedStrategy,
  bestStratId,
  isCouple,
}: StrategyScorecardProps) {
  const minTax = Math.min(...allStrats.map((x) => x.totalLifetimeRetirementTax));

  return (
    <article className="scorecard-card">
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          marginBottom: "0.85rem",
          color: "var(--text-primary)",
        }}
      >
        📊 Strategy Comparison Scorecard {isCouple ? "(Household Combined)" : ""}
      </h3>
      <div className="table-responsive" style={{ marginTop: 0 }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="td-left">Strategy</th>
              <th>Retirement Longevity</th>
              <th>Depletion Age</th>
              <th>Lifetime Taxes Paid</th>
              <th>OAS Clawback</th>
              <th>Estate @ 85</th>
            </tr>
          </thead>
          <tbody>
            {allStrats.map((s) => {
              const isSelected = s.id === selectedStrategy;
              const isRec = s.id === bestStratId;
              return (
                <tr
                  key={s.id}
                  style={
                    isSelected ? { background: "rgba(99,102,241,0.1)" } : undefined
                  }
                >
                  <td className="td-left" style={{ fontWeight: 700 }}>
                    {s.name}{" "}
                    {isRec && <span className="badge-recommended">Top Pick</span>}
                  </td>
                  <td style={{ color: "#10b981", fontWeight: 700 }}>
                    {s.isPerpetual ? "50+ Yrs" : `${s.longevityYears} Yrs`}
                  </td>
                  <td>{s.isPerpetual ? "Age 100+" : `Age ${s.depletionAge}`}</td>
                  <td
                    style={{
                      color:
                        s.totalLifetimeRetirementTax === minTax
                          ? "#10b981"
                          : "var(--text-primary)",
                    }}
                  >
                    {formatCurrency(s.totalLifetimeRetirementTax)}
                  </td>
                  <td
                    style={{
                      color:
                        s.totalOASClawbackPaid === 0 ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {formatCurrency(s.totalOASClawbackPaid)}
                  </td>
                  <td>{formatCurrency(s.estateValueAtAge85)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
