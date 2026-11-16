import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/app-button"

const colorClasses: Record<string, string> = {
  "green-600": "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50",
  "red-600": "border-destructive/40 text-destructive hover:bg-destructive/10",
  "blue-600": "border-primary/30 text-primary hover:bg-primary/5",
  "violet-600": "border-violet-600/30 text-violet-700 hover:bg-violet-50",
  "orange-600": "border-orange-600/30 text-orange-700 hover:bg-orange-50",
  "main-blue": "border-primary/30 text-primary hover:bg-primary/5",
  "secondary-blue": "border-sky-500/40 text-sky-700 hover:bg-sky-50",
}

type ButtonBorderedProps = {
  label: string
  color: keyof typeof colorClasses
  className?: string
  startContent?: ReactNode
  endContent?: ReactNode
} & Omit<ButtonProps, "color" | "variant" | "className">

export default function ButtonBordered({
  label,
  color,
  className,
  isDisabled,
  startContent,
  endContent,
  ...restProps
}: ButtonBorderedProps) {
  return (
    <Button
      variant="outline"
      isDisabled={isDisabled}
      startContent={startContent}
      endContent={endContent}
      className={cn(
        "bg-background",
        !isDisabled && colorClasses[color],
        className,
      )}
      {...restProps}
    >
      {label}
    </Button>
  )
}
