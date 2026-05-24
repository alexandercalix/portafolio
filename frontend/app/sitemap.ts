import { MetadataRoute } from 'next'

interface PagedResult<T> {
  data: T[]
  totalRecords: number
  currentPage: number
  totalPages: number
}

interface DynamicItem {
  slug: string
  updatedAt?: string
  createdAt: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://otdev.io'
  const apiUrl = 'https://api.otdev.io/api'

  // Initialize empty arrays in case of fetch failures
  let projects: DynamicItem[] = []
  let posts: DynamicItem[] = []

  try {
    // Fetch both endpoints concurrently
    const [projectsRes, blogRes] = await Promise.all([
      fetch(`${apiUrl}/projects`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/blog`, { next: { revalidate: 3600 } })
    ])

    if (projectsRes.ok) {
      const pagedProjects = (await projectsRes.json()) as PagedResult<DynamicItem>
      projects = pagedProjects.data || []
    }
    
    if (blogRes.ok) {
      const pagedPosts = (await blogRes.json()) as PagedResult<DynamicItem>
      posts = pagedPosts.data || []
    }
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error)
  }

  // Define the core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Map dynamic project routes
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(project.createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Map dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Combine and return all routes
  return [...staticRoutes, ...projectRoutes, ...blogRoutes]
}
