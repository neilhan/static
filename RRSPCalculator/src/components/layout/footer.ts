export function renderFooter(): string {
  return `
    <footer class="footer-note">
      <p>Built with CRA RRIF prescribed factors (Age 71+), Pension Income Splitting (Form T1032), CCPC Small Business Deduction (12.2%), Capital Dividend Account (CDA) & Dividend Gross-Up/Tax Credit rules, Federal & Ontario graduated brackets, and Capital Gains 50% inclusion.</p>
      <p>© ${new Date().getFullYear()} static-apps · Educational financial model. Not formal financial advice.</p>
    </footer>
  `;
}

