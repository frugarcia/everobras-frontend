import type { ReactElement, ReactNode } from "react"
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Tooltip({
  content,
  children,
  className,
  placement,
  color: _color,
  showArrow: _showArrow,
}: {
  content: ReactNode
  children: ReactElement
  className?: string
  placement?: "top" | "bottom" | "left" | "right"
  color?: string
  showArrow?: boolean
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger render={children} />
      <TooltipContent side={placement} className={className}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  )
}
