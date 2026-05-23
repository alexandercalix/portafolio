export function generateCleanExcerpt(markdown: string, maxLength: number = 120): string {
    if (!markdown) return '';

    let cleanText = markdown
        // Remove Markdown images: ![alt](url) or malformed !(url)
        .replace(/!\[?.*?\]?\(.*?\)/g, '')
        // Clean Markdown links: [text](url) -> text
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
        // Remove heading hashes
        .replace(/#+\s/g, '')
        // Remove bold/italic formatting (**text**, *text*, __text__, _text_)
        .replace(/(\*\*|\*|__|_)(.*?)\1/g, '$2')
        // Remove blockquotes, lists, etc. if desired (optional, but good for plain text)
        .replace(/>\s/g, '')
        // Replace multiple newlines/spaces with a single space
        .replace(/\s+/g, ' ')
        .trim();

    if (cleanText.length > maxLength) {
        return cleanText.substring(0, maxLength) + '...';
    }

    return cleanText;
}
