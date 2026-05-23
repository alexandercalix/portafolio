import { getGlobalProfile } from "@/src/lib/api"
import HomeClient from "@/src/components/HomeClient"

// This page is a Server Component and will be rendered on the server/edge.
// Revalidation can be configured in the fetch utility or here.
export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const profile = await getGlobalProfile().catch(() => null)

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-pulse flex flex-col items-center">
          <span className="text-red-500 font-mono text-4xl font-bold tracking-widest">SYSTEM_OFFLINE</span>
          <span className="text-neutral-500 font-mono text-sm mt-2">AWAITING_DATA_INITIALIZATION</span>
        </div>
      </div>
    )
  }

  return <HomeClient profile={profile} />
}
