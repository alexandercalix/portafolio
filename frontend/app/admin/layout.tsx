import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import AuthProvider from "@/src/components/AuthProvider"
import { getGlobalProfile } from "@/src/lib/api"
import AdminSidebarWrapper from "./components/AdminSidebarWrapper"

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getGlobalProfile().catch(() => null);
  
  return {
    title: profile?.name ? `${profile.name} | CMS Dashboard` : "CMS Dashboard",
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/?error=unauthorized_admin")
  }

  return (
    <AdminSidebarWrapper>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AdminSidebarWrapper>
  )
}
