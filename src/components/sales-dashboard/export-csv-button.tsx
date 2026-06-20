import { Download } from "lucide-react";

type ExportCsvButtonProps = {
  ariaLabel: string;
  disabled: boolean;
  onExport: () => void;
};

export function ExportCsvButton({
  ariaLabel,
  disabled,
  onExport,
}: ExportCsvButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-zinc-300 disabled:hover:text-zinc-700"
      disabled={disabled}
      onClick={onExport}
      type="button"
    >
      <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
      CSV
    </button>
  );
}
