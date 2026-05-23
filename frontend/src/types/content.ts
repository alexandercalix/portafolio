import { BlogPost, Project } from '../models/types';

export interface NormalizedContent {
    id: string;
    title: string;
    slug: string;
    markdownBody: string;
    thumbnailUrl?: string;
    publishedAt: string;
    tags: string[];
    type: 'blog' | 'project';
}

export function normalizeBlogPosts(posts: BlogPost[]): NormalizedContent[] {
    return posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        markdownBody: post.content,
        thumbnailUrl: post.thumbnailUrl,
        publishedAt: post.publishedAt || post.createdAt,
        tags: (post.tags || []).map(t => t.toLowerCase()),
        type: 'blog'
    }));
}

export function normalizeProjects(projects: Project[]): NormalizedContent[] {
    return projects.map(project => {
        const rawTags = (project.tags && project.tags.length > 0) ? project.tags : (project.technologies || []);
        return {
            id: project.id,
            title: project.title,
            slug: project.slug,
            markdownBody: project.description,
            thumbnailUrl: project.thumbnailUrl,
            publishedAt: project.publishedAt || project.createdAt,
            tags: rawTags.map(t => t.toLowerCase()),
            type: 'project'
        };
    });
}
