import { useMemo } from 'react';
import type { Daily } from '../lib/types';

export function VolumeChart({ data, height = 205 }: { data: Daily[]; height?: number }) {
  const max = Math.max(4, ...data.map((day) => day.count));
  return <div className="volume-chart" style={{ height }}>{data.map((item, i) => <div key={item.date} className="volume-column" title={`${item.date}: ${item.count} Anfragen`}><div className="volume-bars"><div className={`volume-bar ${i === data.length - 1 ? 'volume-bar-latest' : ''}`} style={{ height: `${Math.max(3, item.count / max * 100)}%` }} /></div><small>{new Date(item.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</small></div>)}</div>;
}

export function DonutChart({ values, labels, colors, center, subtitle }: { values: number[]; labels: string[]; colors: string[]; center: string | number; subtitle: string }) {
  const total = Math.max(1, values.reduce((a, b) => a + b, 0));
  const gradient = useMemo(() => {
    let current = 0;
    return `conic-gradient(${values.map((value, i) => { const from = current; current += value / total * 100; return `${colors[i]} ${from}% ${current}%`; }).join(',')})`;
  }, [values, total, colors]);
  return <div className="donut-wrap"><div className="donut" style={{ background: gradient }}><div className="donut-hole"><strong>{center}</strong><span>{subtitle}</span></div></div><div className="donut-legend">{values.map((value, index) => <div key={labels[index]}><span className="legend-swatch" style={{ background: colors[index] }} /><span>{labels[index]}</span><strong>{value}</strong></div>)}</div></div>;
}

export function SegmentedBars({ items, palette = ['#6659e8', '#988afd', '#3fb3aa', '#f1a46b'] }: { items: { label: string; value: number }[]; palette?: string[] }) {
  const max = Math.max(1, ...items.map((x) => x.value));
  return <div className="segmented-bars">{items.map((item, i) => <div className="segmented-row" key={item.label}><div className="segmented-label"><span>{item.label}</span><strong>{item.value}</strong></div><div className="segmented-track"><div style={{ background: palette[i % palette.length], width: `${item.value / max * 100}%` }} /></div></div>)}</div>;
}
