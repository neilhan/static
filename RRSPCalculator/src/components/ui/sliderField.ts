export interface InlineSliderRowProps {
  sliderId: string;
  numId: string;
  value: number;
  sliderMin: number;
  sliderMax: number;
  numMin?: number;
  numMax?: number;
  step: number;
}

export function renderInlineSliderRow(props: InlineSliderRowProps): string {
  const {
    sliderId,
    numId,
    value,
    sliderMin,
    sliderMax,
    numMin = sliderMin,
    numMax = sliderMax,
    step,
  } = props;
  const clampedSliderVal = Math.min(sliderMax, Math.max(sliderMin, value));
  return `
    <div class="slider-container">
      <input type="range" id="${sliderId}" min="${sliderMin}" max="${sliderMax}" step="${step}" value="${clampedSliderVal}">
      <input type="number" id="${numId}" class="form-input-number" min="${numMin}" max="${numMax}" step="${step}" value="${value}">
    </div>
  `;
}

export interface SliderFieldProps extends InlineSliderRowProps {
  id?: string;
  label: string;
  dispId: string;
  displayHtml: string;
  displayStyle?: string;
  extraHtml?: string;
}

export function renderSliderField(props: SliderFieldProps): string {
  const { id, label, sliderId, dispId, displayHtml, displayStyle, extraHtml = "" } = props;
  return `
    <div class="form-group"${id ? ` id="${id}"` : ""}>
      <div class="form-label-row">
        <label class="form-label" for="${sliderId}">${label}</label>
        <span class="form-val-display" id="${dispId}"${displayStyle ? ` style="${displayStyle}"` : ""}>${displayHtml}</span>
      </div>
      ${renderInlineSliderRow(props)}
      ${extraHtml}
    </div>
  `;
}

export interface BindSliderPairOptions {
  sliderId: string;
  numId: string;
  dispId?: string;
  maxSliderVal?: number;
  minVal?: number;
  formatter?: (val: number) => string;
  onChange: (val: number) => void;
}

/**
 * Reusable two-way DOM binding between a range slider, number input, and display label.
 * Never re-renders parent DOM so pointer capture during slider dragging stays uninterrupted.
 */
export function bindSliderPair(opts: BindSliderPairOptions): void {
  const { sliderId, numId, dispId, maxSliderVal, minVal, formatter, onChange } = opts;
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  const num = document.getElementById(numId) as HTMLInputElement | null;
  const disp = dispId ? document.getElementById(dispId) : null;

  const apply = (rawVal: number) => {
    const val = minVal !== undefined ? Math.max(minVal, rawVal) : rawVal;
    if (disp && formatter) {
      disp.textContent = formatter(val);
    }
    onChange(val);
  };

  slider?.addEventListener("input", () => {
    const v = parseFloat(slider.value);
    if (!isNaN(v)) {
      if (num) num.value = v.toString();
      apply(v);
    }
  });

  num?.addEventListener("input", () => {
    const v = parseFloat(num.value);
    if (!isNaN(v)) {
      const clamped = maxSliderVal !== undefined ? Math.min(maxSliderVal, v) : v;
      if (slider) slider.value = clamped.toString();
      apply(v);
    }
  });
}

/**
 * Syncs an existing slider + number + display DOM trio without re-rendering HTML.
 */
export function syncInputPair(
  sliderId: string,
  numId: string,
  dispId: string,
  value: number,
  formattedText: string,
  maxSliderVal?: number
): void {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  const num = document.getElementById(numId) as HTMLInputElement | null;
  const disp = document.getElementById(dispId);

  if (slider) {
    slider.value = (maxSliderVal !== undefined ? Math.min(maxSliderVal, value) : value).toString();
  }
  if (num) num.value = value.toString();
  if (disp) disp.textContent = formattedText;
}

