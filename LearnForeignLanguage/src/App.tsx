import homeIcon from "@static/shared/assets/home.svg";
import languageIcon from "@static/shared/assets/icons/language.svg";
import playIcon from "@static/shared/assets/icons/play.svg";
import fastForwardIcon from "@static/shared/assets/icons/fast-forward.svg";
import fastBackIcon from "@static/shared/assets/icons/fast-back.svg";
import "./App.css";

const practiceModes = [
  {
    title: "Daily Dialogues",
    description: "Shadow natural conversations with adjustable speeds.",
    icon: playIcon,
  },
  {
    title: "Rapid Review",
    description: "Jump across spaced-repetition decks to stay fresh.",
    icon: fastForwardIcon,
  },
  {
    title: "Context Rewind",
    description: "Replay the last tricky lines and compare answers.",
    icon: fastBackIcon,
  },
];

export default function App(): React.ReactElement {
  return (
    <div className="lfl-app">
      <header className="hero">
        <div className="hero__breadcrumb">
          <span className="hero__logo">
            <img src={languageIcon} width={32} height={32} alt="Learn Foreign Language" />
          </span>
          <a
            className="breadcrumb__home"
            href="https://neilhan.github.io/static"
            title="Back to Home"
          >
            <img src={homeIcon} width={28} height={28} alt="Home" />
          </a>
          <span className="breadcrumb__divider">/</span>
          <span className="breadcrumb__label">Learn Foreign Language</span>
        </div>
        <h1>Build fluency, one focused session at a time.</h1>
        <p>
          This workspace blends spaced repetition, Morse-style pacing, and micro
          challenges so you can practice listening, speaking, and vocabulary
          with intention.
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn-primary">
            Start practice
          </button>
          <button type="button" className="btn btn-outline">
            Import phrasebook
          </button>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Practice modes</h2>
          <div className="panel__grid">
            {practiceModes.map((mode) => (
              <article key={mode.title} className="card">
                <img src={mode.icon} alt="" aria-hidden width={24} height={24} />
                <div>
                  <h3>{mode.title}</h3>
                  <p>{mode.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Next milestones</h2>
          <ul className="milestone-list">
            <li>
              <strong>Listening streak:</strong> 4 days · target 12
            </li>
            <li>
              <strong>Words retained:</strong> 128 / 500 goal
            </li>
            <li>
              <strong>Conversation seeds:</strong> 6 stories drafted
            </li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <small>Prototype — hook your own data providers here.</small>
      </footer>
    </div>
  );
}

