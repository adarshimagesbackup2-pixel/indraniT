import { useState } from "react";

export function SensitiveAmount({
  value,
  className = "",
}: {
  value: string | number;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed((current) => !current)}
      className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-all duration-150 ${className}`}
      aria-label={revealed ? "Hide amount" : "Show amount"}
    >
      <span className={`transition-all duration-150 ${revealed ? "" : "blur-sm"}`}>{value}</span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{revealed ? "Hide" : "Click to view"}</span>
    </button>
  );
}
