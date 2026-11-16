import { createContext, useContext, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const sizes: Record<string, string> = {
  xs: "sm:max-w-xs",
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  full: "sm:max-w-[calc(100%-2rem)] h-[calc(100%-2rem)]",
}

const ModalContext = createContext({
  sizeClass: "sm:max-w-lg",
  hideCloseButton: false,
})

type ModalProps = {
  isOpen?: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  size?: string
  children?: ReactNode
  hideCloseButton?: boolean
  scrollBehavior?: string
  className?: string
  isDismissable?: boolean
  placement?: string
}

export default function Modal({
  isOpen,
  onClose,
  onOpenChange,
  size = "lg",
  children,
  className,
  hideCloseButton = false,
  isDismissable = true,
}: ModalProps) {
  return (
    <ModalContext.Provider
      value={{
        sizeClass: cn(sizes[size] ?? sizes.lg, className),
        hideCloseButton,
      }}
    >
      <Dialog
        open={!!isOpen}
        disablePointerDismissal={!isDismissable}
        onOpenChange={(open, eventDetails) => {
          if (!open && !isDismissable) {
            eventDetails.cancel()
            return
          }
          onOpenChange?.(open)
          if (!open) onClose?.()
        }}
      >
        {children}
      </Dialog>
    </ModalContext.Provider>
  )
}

export function ModalContent({
  children,
  className,
}: {
  children?: ReactNode | ((onClose: () => void) => ReactNode)
  className?: string
}) {
  const {sizeClass, hideCloseButton} = useContext(ModalContext)
  return (
    <DialogContent
      showCloseButton={!hideCloseButton}
      className={cn(
        "max-h-[90vh] min-w-0 overflow-x-hidden overflow-y-auto *:min-w-0 sm:max-w-lg",
        sizeClass,
        className,
      )}
    >
      {typeof children === "function" ? children(() => {}) : children}
    </DialogContent>
  )
}

export function ModalHeader({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <DialogHeader className={cn("gap-1 border-b pb-3 text-left", className)}>
      <DialogTitle className="sr-only">Diálogo</DialogTitle>
      {children}
    </DialogHeader>
  )
}

export function ModalBody({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3 *:min-w-0", className)}>
      {children}
    </div>
  )
}

export function ModalFooter({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "-mx-6 -mb-4 flex items-center justify-end gap-2 rounded-b-xl border-t bg-transparent px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ModalDescription({ children }: { children?: ReactNode }) {
  return <DialogDescription>{children}</DialogDescription>
}
