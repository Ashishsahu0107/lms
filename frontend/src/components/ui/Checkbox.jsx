import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

export function Checkbox({ checked, onChange, label, className, ...props }) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <div
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          checked
            ? "bg-primary border-primary"
            : "border-input bg-background hover:border-primary",
        )}
        onClick={() => onChange?.(!checked)}
      >
        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
        {...props}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}

export function RadioGroup({ value, onChange, options, className }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors",
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              value === option.value
                ? "border-primary bg-primary"
                : "border-input",
            )}
            onClick={() => onChange(option.value)}
          >
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            )}
          </div>
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export default Checkbox;
