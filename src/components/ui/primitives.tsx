"use client";

import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty card">
      {icon && <div className="empty-icon">{icon}</div>}
      <h2>{title}</h2>
      <p>{body}</p>
      {action && <div className="cluster" style={{ justifyContent: "center" }}>{action}</div>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card skel-card" aria-hidden="true">
      <div className="skeleton skel-art" />
      <div className="skel-body">
        <div className="skeleton skel-line" />
        <div className="skeleton skel-line" />
        <div className="skeleton skel-line short" />
      </div>
    </div>
  );
}

export function Meter({ label, value, showValue = true }: { label: string; value: number; showValue?: boolean }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="meter-top">
        <span>{label}</span>
        {showValue && <span className="num">{safe}</span>}
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="meter-fill" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FilterBar<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="chip-row" role="toolbar" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="chip"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  return (
    <p className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
