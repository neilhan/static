import "./style.css";
import { lookup, LOOKUP_TABLE, toLookupIndex } from "./data";

const app = document.querySelector<HTMLDivElement>("#app")!;

function render(): void {
  const inputId = "lucky-input";
  const resultId = "lucky-result";
  const resultDetailId = "lucky-result-detail";

  app.innerHTML = `
    <header class="header">
      <h1>Lucky Number Lookup</h1>
      <p class="subtitle">Enter a number; it will be reduced modulo 81 (1–81) and looked up in the table below.</p>
    </header>

    <section class="lookup-section">
      <label for="${inputId}">Number (digits only)</label>
      <input
        id="${inputId}"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="e.g. 12345"
        autocomplete="off"
      />
      <div id="${resultId}" class="result-box" aria-live="polite"></div>
      <div id="${resultDetailId}" class="result-detail" aria-live="polite"></div>
    </section>

    <section class="table-section">
      <h2>Lookup table (1–81)</h2>
      <div class="table-wrapper">
        <table class="lookup-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Phrases</th>
              <th scope="col">Result</th>
              <th scope="col">#</th>
              <th scope="col">Phrases</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableBody()}
          </tbody>
        </table>
      </div>
    </section>
  `;

  const input = document.getElementById(inputId) as HTMLInputElement;
  const resultEl = document.getElementById(resultId)!;
  const resultDetailEl = document.getElementById(resultDetailId)!;

  function updateResult(): void {
    const raw = input.value.replace(/\D/g, "");
    if (raw === "") {
      resultEl.textContent = "";
      resultEl.className = "result-box";
      resultDetailEl.innerHTML = "";
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      resultEl.textContent = "Enter a valid number.";
      resultEl.className = "result-box result-error";
      resultDetailEl.innerHTML = "";
      return;
    }
    const row = lookup(num);
    const index = toLookupIndex(num);
    resultEl.textContent = `Number ${num} → ${index} → ${row.phrases.join(" ")} 【${row.result}】`;
    resultEl.className = `result-box result-${row.result}`;
    resultDetailEl.innerHTML = `
      <p><strong>Index:</strong> ${index}</p>
      <p><strong>Phrases:</strong> ${row.phrases.join(" · ")}</p>
      <p><strong>Result:</strong> ${row.result}</p>
    `;
  }

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    updateResult();
  });
  input.addEventListener("paste", (e) => {
    const text = (e.clipboardData?.getData("text") ?? "").replace(/\D/g, "");
    if (text !== (e.clipboardData?.getData("text") ?? "")) {
      e.preventDefault();
      input.value = text;
      updateResult();
    }
  });
  input.addEventListener("keyup", updateResult);
  updateResult();
}

function renderTableBody(): string {
  const rows: string[] = [];
  for (let i = 0; i < 40; i++) {
    const left = LOOKUP_TABLE[i];
    const right = LOOKUP_TABLE[i + 40];
    rows.push(`
      <tr>
        <td>${left.num}</td>
        <td>${left.phrases.join(" ")}</td>
        <td class="result-cell result-${left.result}">${left.result}</td>
        <td>${right.num}</td>
        <td>${right.phrases.join(" ")}</td>
        <td class="result-cell result-${right.result}">${right.result}</td>
      </tr>
    `);
  }
  const last = LOOKUP_TABLE[80];
  rows.push(`
    <tr>
      <td>81</td>
      <td>${last.phrases.join(" ")}</td>
      <td class="result-cell result-${last.result}">${last.result}</td>
      <td colspan="3" class="empty-cell"></td>
    </tr>
  `);
  return rows.join("");
}

render();
