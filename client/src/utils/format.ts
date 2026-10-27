/**
 * Cleanly strips raw Markdown formatting (headers, backticks, bold, links)
 * to produce an elegant, readable text excerpt for note cards and search results.
 */
export const formatContentExcerpt = (content?: string, maxLength: number = 140): string => {
  if (!content || !content.trim()) {
    return 'No additional content provided.';
  }

  const cleaned = content
    // Remove markdown code fences and backticks
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers (# Title)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove images ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Replace links [text](url) with just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold and italic markers
    .replace(/[*_~]{1,3}/g, '')
    // Remove blockquotes (> quote)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Collapse multiple whitespace/newlines
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned || 'No additional content provided.';
  }

  return cleaned.slice(0, maxLength).trim() + '…';
};

/**
 * Formats relative or calendar date
 */
export const formatDateLabel = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
