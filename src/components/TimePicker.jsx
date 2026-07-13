import { useState, useRef, useEffect } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const DEFAULT_INPUT_CLASS =
  "w-full flex items-center gap-1.5 px-2 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg font-body text-[14px] transition-colors text-left focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow/30";

export default function TimePicker({
  value,
  onChange,
  required,
  label,
  labelClassName = "block font-body text-[11px] font-semibold text-navy mb-0.5",
  placeholder = "HH : MM",
  inputClassName,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const hourColRef = useRef(null);
  const minColRef = useRef(null);

  const valid = value && /^\d{2}:\d{2}$/.test(value);
  const [h, m] = valid ? value.split(":") : ["", ""];

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      hourColRef.current
        ?.querySelector("[data-sel='true']")
        ?.scrollIntoView({ block: "center" });
      minColRef.current
        ?.querySelector("[data-sel='true']")
        ?.scrollIntoView({ block: "center" });
    }, 20);
    return () => clearTimeout(t);
  }, [open]);

  const setH = (newH) => {
    const mm = m === "" ? "00" : m;
    onChange(`${newH}:${mm}`);
  };
  const setM = (newM) => {
    const hh = h === "" ? "00" : h;
    onChange(`${hh}:${newM}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="relative" ref={wrapRef}>
      {label && <label className={labelClassName}>{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={inputClassName || DEFAULT_INPUT_CLASS}
      >
        <AccessTimeIcon sx={{ fontSize: 16 }} className="text-gray-400 flex-shrink-0" />
        <span className={value ? "text-navy truncate" : "text-gray-400 truncate"}>
          {value || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="bg-navy px-3 py-2 flex items-center justify-between">
            <span className="font-body text-[11px] font-semibold text-white/70 uppercase tracking-wider">
              Hour
            </span>
            <span className="font-body text-sm font-bold text-white tabular-nums">
              {h || "--"} : {m || "--"}
            </span>
            <span className="font-body text-[11px] font-semibold text-white/70 uppercase tracking-wider">
              Min
            </span>
          </div>

          <div className="flex">
            <div
              ref={hourColRef}
              className="flex-1 max-h-48 overflow-y-auto border-r border-gray-100 scroll-smooth"
            >
              {hours.map((hh) => (
                <button
                  key={hh}
                  type="button"
                  data-sel={h === hh}
                  onClick={() => setH(hh)}
                  className={`w-full py-2 font-body text-sm tabular-nums transition-colors ${
                    h === hh
                      ? "bg-yellow text-navy font-bold"
                      : "text-navy hover:bg-yellow/20"
                  }`}
                >
                  {hh}
                </button>
              ))}
            </div>
            <div
              ref={minColRef}
              className="flex-1 max-h-48 overflow-y-auto scroll-smooth"
            >
              {minutes.map((mm) => (
                <button
                  key={mm}
                  type="button"
                  data-sel={m === mm}
                  onClick={() => setM(mm)}
                  className={`w-full py-2 font-body text-sm tabular-nums transition-colors ${
                    m === mm
                      ? "bg-yellow text-navy font-bold"
                      : "text-navy hover:bg-yellow/20"
                  }`}
                >
                  {mm}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full py-2 bg-navy text-white font-body text-sm font-semibold hover:bg-navy/90 transition-all"
          >
            Done
          </button>
        </div>
      )}

      <input type="hidden" name="time" value={value || ""} required={required} />
    </div>
  );
}
