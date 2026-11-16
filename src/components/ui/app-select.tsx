import type {ReactNode} from "react";
import {cn} from "@/lib/utils";
import {Field} from "@/components/ui/app-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TOption = {label: string; value: string};

/**
 * Select con el mismo envoltorio (label, error) que AppInput.
 * `value` vacío ("") muestra el placeholder.
 */
export function AppSelect({
  label,
  placeholder = "Seleccione",
  options,
  value,
  onChange,
  isInvalid,
  errorMessage,
  isRequired,
  isDisabled,
  className,
  triggerClassName,
}: {
  label?: ReactNode;
  placeholder?: string;
  options: TOption[];
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  return (
    <Field
      label={
        isRequired && typeof label === "string" ? `${label} *` : label
      }
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      className={className}
    >
      <Select
        items={options}
        value={value || null}
        onValueChange={(next) => onChange((next as string | null) ?? "")}
        disabled={isDisabled}
      >
        <SelectTrigger
          aria-invalid={isInvalid || undefined}
          className={cn("w-full data-[size=default]:h-9", triggerClassName)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
