import { forwardRef, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className="w-full flex items-center gap-1.5 px-2 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg font-body text-[14px] transition-colors text-left focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow/30"
  >
    <CalendarTodayIcon sx={{ fontSize: 14 }} className="text-gray-400" />
    <span className={value ? "text-navy truncate" : "text-gray-400 truncate"}>
      {value || placeholder}
    </span>
  </button>
));
CustomInput.displayName = "CustomInput";

export default function DatePicker({ value, onChange, required }) {
  const selected = value ? new Date(value + "T00:00:00") : null;

  // Create portal container on body
  useEffect(() => {
    if (!document.getElementById("datepicker-portal")) {
      const div = document.createElement("div");
      div.id = "datepicker-portal";
      div.className = "datepicker-navy";
      document.body.appendChild(div);
    }
  }, []);

  const handleChange = (date) => {
    if (!date) {
      onChange("");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
  };

  return (
    <div className="datepicker-navy">
      <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Date *</label>
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        minDate={new Date()}
        customInput={<CustomInput placeholder="Select date" />}
        dateFormat="d MMM yyyy"
        portalId="datepicker-portal"
        showPopperArrow={false}
        calendarClassName="navy-calendar"
      />
      <input type="hidden" name="date" value={value} required={required} />
    </div>
  );
}
