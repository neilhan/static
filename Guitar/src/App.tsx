import "./App.css";
import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";

function App() {
  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <header className="header-row">
          <div className="header-title-group">
            <a
              href="https://neilhan.github.io/static"
              className="home-link"
              title="Back to Home"
            >
              <IconGraphic
                svgMarkup={homeIcon}
                size="md"
                style={{ width: 22, height: 22 }}
              />
            </a>
            <h1>Guitar Fretboard Lookup</h1>
          </div>
        </header>

        <main className="panel guitar-placeholder">
          <p>Project scaffold ready. See <code>PLAN.md</code> for the implementation plan.</p>
        </main>
      </div>
    </div>
  );
}

export default App;

