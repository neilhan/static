<script lang="ts">
  export let activeWeeks: number;
  export let remainingWeeks: number;

  $: activeYearsApprox = activeWeeks / 52;
  $: activeYearsDisplay = Number.isFinite(activeYearsApprox)
    ? (activeYearsApprox >= 10 ? Math.round(activeYearsApprox).toString() : activeYearsApprox.toFixed(1))
    : '0';

  $: activeMonthsDisplay = Number.isFinite(activeWeeks)
    ? Math.round((activeWeeks * 12) / 52)
    : 0;
</script>

<div class="hero-stat">
  <div class="hero-group hero-active">
    <div class="hero-primary">
      <span class="hero-number active">{activeWeeks}</span>
      <span class="hero-label">Active Weeks</span>
    </div>
    <div class="hero-meta">
      <div class="hero-meta-item">
        <span class="meta-value">{activeYearsDisplay}</span>
        <span class="meta-label">Active years</span>
      </div>
      <div class="hero-meta-item">
        <span class="meta-value">{activeMonthsDisplay}</span>
        <span class="meta-label">Active months</span>
      </div>
    </div>
  </div>
  <div class="hero-divider"></div>
  <div class="hero-group">
    <span class="hero-number total">{remainingWeeks}</span>
    <span class="hero-label">Total Weeks</span>
  </div>
</div>

