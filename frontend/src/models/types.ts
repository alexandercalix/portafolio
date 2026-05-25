export interface PagedResult<T> {
    data: T[];
    totalRecords: number;
    currentPage: number;
    totalPages: number;
}

export interface SiteProfile {
    id: string;
    name: string;
    headline: string;
    bio: string;
    authorTitle?: string;
    authorBio?: string;
    currentFocus: string;
    systemCapabilities: string[];
    avatarUrl?: string;
    resumeUrl?: string;
    githubUrl?: string;
    linkedInUrl?: string;
    updatedAt: string;
    experiences: Experience[];
    educations: Education[];
}

export interface Experience {
    id: string;
    sortOrder: number;
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    technologies: string[];
}

export interface Education {
    id: string;
    sortOrder: number;
    degreeOrCertificate: string;
    institution: string;
    dateObtained: string;
    description: string;
    focusLine: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    submittedAt: string;
}

export interface Project {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    description: string;
    liveUrl?: string;
    repositoryUrl?: string;
    images: string[];
    thumbnailUrl?: string;
    technologies: string[];
    tags: string[];
    author?: {
        name: string;
        avatarUrl?: string;
    };
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    category?: string;
    tags: string[];
    technologies: string[];
    thumbnailUrl?: string;
    author?: {
        name: string;
        avatarUrl?: string;
    };
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}
