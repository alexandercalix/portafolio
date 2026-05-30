import { getGlobalProfile } from "@/src/lib/api"
import HomeClient from "@/src/components/HomeClient"
import Script from "next/script"

// This page is a Server Component and will be rendered on the server/edge.
// Revalidation can be configured in the fetch utility or here.
export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: 'Oscar Calix | System Architecture and Portfolio',
  description: 'Oscar Calix - System Architecture and Portfolio. A registry of completed systems, architectural blueprints, and full-stack deployments.',
};

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline || profile.authorTitle,
    url: 'https://otdev.io',
    sameAs: [
      profile.linkedInUrl,
      profile.githubUrl,
    ].filter(Boolean),
    description: profile.bio,
    image: profile.avatarUrl,
  }

  return (
    <>
      <Script id="json-ld-person" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient profile={profile} />
    </>
  )
}
