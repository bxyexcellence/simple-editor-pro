import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TableIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM4 5V9H8V5H4ZM10 5V9H14V5H10ZM16 5V9H20V5H16ZM20 11H16V15H20V11ZM14 11H10V15H14V11ZM8 11H4V15H8V11ZM4 17H8V19H4V17ZM10 17H14V19H10V17ZM16 17H20V19H16V17Z"
        fill="currentColor"
      />
    </svg>
  )
})

TableIcon.displayName = "TableIcon"

