import type { ReactNode } from "react"
import { IconCircleX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type FieldProps = {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  isInvalid?: boolean
  className?: string
  labelPlacement?: string
  variant?: string
  disableAnimation?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  children: ReactNode
}

export function Field({
  label,
  description,
  errorMessage,
  isInvalid,
  className,
  startContent,
  endContent,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label ? <Label>{label}</Label> : null}
      <div className="relative flex items-center gap-2">
        {startContent}
        <div className="min-w-0 flex-1">{children}</div>
        {endContent}
      </div>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {isInvalid && errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}

type Shared = {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  isInvalid?: boolean
  isRequired?: boolean
  isDisabled?: boolean
  isClearable?: boolean
  onClear?: () => void
  labelPlacement?: string
  variant?: string
  size?: string
  color?: string
  disableAnimation?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  className?: string
  classNames?: Record<string, string>
}

export function AppInput({
  label,
  description,
  errorMessage,
  isInvalid,
  isRequired,
  isDisabled,
  isClearable,
  onClear,
  labelPlacement: _labelPlacement,
  variant: _variant,
  size: _size,
  color: _color,
  disableAnimation: _disableAnimation,
  startContent,
  endContent,
  className,
  classNames,
  ...props
}: Shared & Omit<React.ComponentProps<"input">, "size">) {
  const labelNode =
    isRequired && typeof label === "string" ? `${label} *` : label
  return (
    <Field
      label={labelNode}
      description={description}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      startContent={startContent}
      endContent={endContent}
      className={classNames?.base}
    >
      <div className="relative w-full min-w-0">
        <Input
          aria-invalid={isInvalid || undefined}
          disabled={isDisabled || props.disabled}
          className={cn(
            "h-9",
            isClearable && props.value && "pr-9",
            classNames?.input,
            className,
          )}
          {...props}
        />
        {isClearable && props.value ? (
          <button
            type="button"
            aria-label="Limpiar"
            onClick={onClear}
            className="absolute top-1/2 right-2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
          >
            <IconCircleX size={18} />
          </button>
        ) : null}
      </div>
    </Field>
  )
}

export function AppTextarea({
  label,
  description,
  errorMessage,
  isInvalid,
  isRequired,
  isDisabled,
  isClearable: _isClearable,
  onClear: _onClear,
  labelPlacement: _labelPlacement,
  variant: _variant,
  size: _size,
  color: _color,
  disableAnimation: _disableAnimation,
  startContent,
  endContent,
  className,
  classNames,
  ...props
}: Shared & React.ComponentProps<"textarea">) {
  return (
    <Field
      label={isRequired && typeof label === "string" ? `${label} *` : label}
      description={description}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      startContent={startContent}
      endContent={endContent}
      className={classNames?.base}
    >
      <Textarea
        aria-invalid={isInvalid || undefined}
        disabled={isDisabled || props.disabled}
        className={cn("min-h-24", classNames?.input, className)}
        {...props}
      />
    </Field>
  )
}
