import type { MetadataRoute } from 'next'

interface PagedResult<T> {
  data?: T[]
  totalRecords?: number
  currentPage?: number
  totalPages?: number
}

interface DynamicItem {
  slug?: string
  updatedAt?: string | null
  createdAt?: string | null
}

export const dynamic = 'force-static'
export const revalidate = false

const baseUrl = 'https://otdev.io'
const apiUrl = 'https://api.otdev.io/api'

function safeDate(value?: string | null): Date {
  if (!value) return new Date()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function cleanSlug(slug?: string): string {
  return slug ? slug.replace(/^\/+|\/+$/g, '') : ''
}

async function getItems(endpoint: string): Promise<DynamicItem[]> {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      cache: 'force-cache',
    })

    if (!response.ok) {
      console.warn(`Sitemap fetch failed for ${endpoint}: ${response.status}`)
      return []
    }

    const result = (await response.json()) as PagedResult<DynamicItem>
    return Array.isArray(result.data) ? result.data : []
  } catch (error) {
    console.error(`Sitemap fetch error for ${endpoint}:`, error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getItems('projects'),
    getItems('blog'),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = []

  for (const project of projects) {
    const slug = cleanSlug(project.slug)

    if (!slug) {
      continue
    }

    projectRoutes.push({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: safeDate(project.updatedAt || project.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  const blogRoutes: MetadataRoute.Sitemap = []

  for (const post of posts) {
    const slug = cleanSlug(post.slug)

    if (!slug) {
      continue
    }

    blogRoutes.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: safeDate(post.updatedAt || post.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes]
}