// Dependencies
import {Tooltip} from "@/components/ui/app-tooltip";
import {cn} from "@/lib/utils";
import {cloneElement, isValidElement, ReactElement} from "react";
import {Link} from "react-router-dom";

export default function LinkTable({
  tooltip,
  isDisabled,
  icon,
  to,
  state,
}: {
  tooltip: string;
  isDisabled?: boolean;
  icon: ReactElement;
  to: string;
  state?: unknown;
}) {
  const iconWithClasses = isValidElement<{className?: string}>(icon)
    ? cloneElement(icon, {
        className: cn(icon.props.className, {
          "stroke-gray-400": isDisabled,
        }),
      })
    : icon;

  const link = (
    <Link
      to={to}
      state={state}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
        }
      }}
      className={cn("cursor-pointer", {
        "cursor-not-allowed": isDisabled,
      })}
    >
      {iconWithClasses}
    </Link>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{link}</Tooltip>;
  }

  return link;
}
