/**
 * Minimal Prometheus text-exposition (v0.0.4) renderer — no deps.
 * Spec: https://prometheus.io/docs/instrumenting/exposition_formats/
 */

export type MetricType = "counter" | "gauge" | "histogram" | "summary";
export type Labels = Record<string, string | number | null | undefined>;

/** Escapes label values per the exposition format rules. */
export function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

/** Prometheus names allow [a-zA-Z0-9_:] only. */
export function sanitizeName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_:]/g, "_");
  return /^[a-zA-Z_:]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function renderLabels(labels?: Labels): string {
  if (!labels) return "";
  const parts = Object.entries(labels)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${sanitizeName(k)}="${escapeLabelValue(String(v))}"`);
  return parts.length ? `{${parts.join(",")}}` : "";
}

export class PrometheusRegistry {
  private readonly lines: string[] = [];
  private readonly declared = new Set<string>();

  /** Declares HELP/TYPE once per metric family, then appends a sample. */
  add(
    name: string,
    value: number,
    opts: { help: string; type: MetricType; labels?: Labels } ,
  ): this {
    const metric = sanitizeName(name);
    if (!this.declared.has(metric)) {
      this.declared.add(metric);
      this.lines.push(`# HELP ${metric} ${opts.help.replace(/\n/g, " ")}`);
      this.lines.push(`# TYPE ${metric} ${opts.type}`);
    }
    const safe = Number.isFinite(value) ? value : 0;
    this.lines.push(`${metric}${renderLabels(opts.labels)} ${safe}`);
    return this;
  }

  render(): string {
    return `${this.lines.join("\n")}\n`;
  }
}

export const PROM_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";
