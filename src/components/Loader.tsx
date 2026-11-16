import { Spinner } from "@/components/ui/spinner"

export default function Loader() {
  return (
    <div className="my-24 flex h-full items-center justify-center">
      <Spinner className="size-12 text-primary" />
    </div>
  )
}
