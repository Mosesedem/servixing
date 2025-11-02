import { Spinner } from "@/components/ui/spinner"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
