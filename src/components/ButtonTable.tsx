// Dependencies
import {Tooltip} from "@/components/ui/app-tooltip";
import {cn} from "@/lib/utils";
import {cloneElement, isValidElement, ReactElement} from "react";

export default function ButtonTable({
  tooltip,
  isDisabled,
  icon,
  onClick,
}: {
  tooltip: string;
  isDisabled?: boolean;
  icon: ReactElement;
  onClick?: () => void;
}) {
  const iconWithClasses = isValidElement<{className?: string}>(icon)
    ? cloneElement(icon, {
        className: cn(icon.props.className, {
          "stroke-gray-400": isDisabled,
        }),
      })
    : icon;

  const button = (
    <button
      className={cn("cursor-pointer", {
        "cursor-not-allowed": isDisabled,
      })}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
    >
      {iconWithClasses}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}
