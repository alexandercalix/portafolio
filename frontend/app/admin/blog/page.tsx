import { auth } from "@/auth"
import { getBlogPosts } from "@/src/lib/api"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"

export default async function AdminBlogPage() {
  const session = await auth()
  // @ts-expect-error custom accessToken
  const token = session?.accessToken as string

  // Fetch blog posts with includeDrafts = true to see everything in the CMS
  const response = await getBlogPosts(1, 50, token, true)
  const posts = response.data || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Blog Modules</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            REGISTRY_STATUS: <span className="text-[var(--color-terminal-green)]">ONLINE</span>
          </p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-neutral-100 text-[#1a1d21] font-mono font-bold py-2 px-4 rounded hover:bg-neutral-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>INIT_NEW_POST</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 dark:bg-[#1a1d21] border-b border-neutral-200 dark:border-neutral-800">
                <th className="p-4 font-mono text-xs text-neutral-500 uppercase font-medium">Status</th>
                <th className="p-4 font-mono text-xs text-neutral-500 uppercase font-medium">Title</th>
                <th className="p-4 font-mono text-xs text-neutral-500 uppercase font-medium">Slug / ID</th>
                <th className="p-4 font-mono text-xs text-neutral-500 uppercase font-medium">Date Created</th>
                <th className="p-4 font-mono text-xs text-neutral-500 uppercase font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-mono text-sm">
                    NO_BLOG_DATA_FOUND
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-200/30 dark:bg-neutral-800/30 transition-colors">
                    <td className="p-4">
                      {post.isPublished ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse"></span>
                          <span className="font-mono text-xs text-[var(--color-terminal-green)]">ONLINE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-warning-amber)]"></span>
                          <span className="font-mono text-xs text-[var(--color-warning-amber)]">DRAFT</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{post.title}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">/{post.slug}</div>
                      <div className="font-mono text-[10px] text-neutral-600 truncate max-w-[120px]">{post.id}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {new Date(post.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/blog/${post.id}`} className="text-neutral-600 dark:text-neutral-400 hover:text-[var(--color-terminal-green)] transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
