import type { ReactNode } from "react"
import { IconLoader2 } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button as ShadButton, buttonVariants } from "@/components/ui/button"

type AppButtonProps = {
  children?: ReactNode
  className?: string
  variant?: string
  color?: string
  size?: "sm" | "md" | "lg" | "default"
  isDisabled?: boolean
  disabled?: boolean
  isLoading?: boolean
  isIconOnly?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  onPress?: (...args: unknown[]) => void
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: "button" | "submit" | "reset"
  radius?: string
  disableAnimation?: boolean
  fullWidth?: boolean
} & Omit<
  React.ComponentProps<"button">,
  "color" | "size" | "onClick" | "disabled"
>

function mapVariant(variant?: string, color?: string) {
  if (color === "danger" || variant === "destructive") return "destructive" as const
  if (variant === "bordered" || variant === "outline" || variant === "faded") {
    return "outline" as const
  }
  if (variant === "light" || variant === "flat" || variant === "ghost") {
    return "ghost" as const
  }
  if (variant === "link") return "link" as const
  return "default" as const
}

export function Button({
  children,
  className,
  variant,
  color,
  size,
  isDisabled,
  disabled,
  isLoading,
  isIconOnly,
  startContent,
  endContent,
  onPress,
  onClick,
  type = "button",
  fullWidth,
  radius: _radius,
  disableAnimation: _disableAnimation,
  ...rest
}: AppButtonProps) {
  const shadSize = isIconOnly ? "icon" : size === "sm" ? "sm" : size === "lg" ? "lg" : "default"
  return (
    <ShadButton
      type={type}
      variant={mapVariant(variant, color)}
      size={shadSize}
      disabled={Boolean(isDisabled || disabled || isLoading)}
      className={cn(fullWidth && "w-full", "cursor-pointer", className)}
      onClick={(event) => {
        onClick?.(event)
        onPress?.()
      }}
      {...rest}
    >
      {isLoading ? <IconLoader2 className="animate-spin" size={16} /> : startContent}
      {isIconOnly ? children : children}
      {endContent}
    </ShadButton>
  )
}

export { buttonVariants }
export type ButtonProps = AppButtonProps
