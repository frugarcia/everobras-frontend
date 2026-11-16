import React from "react"
import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function GoBackTitle({
  title,
  icon,
  subtitle,
}: {
  title: string
  icon?: React.ReactNode
  subtitle?: string
}) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Volver"
        onClick={() => navigate(-1)}
      >
        <IconArrowLeft />
      </Button>
      <div className="flex items-center gap-2">
        {icon
          ? React.cloneElement(
              icon as React.ReactElement<{ className?: string; size?: number }>,
              {
                className: "size-5 text-muted-foreground",
                size: 20,
              },
            )
          : null}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
