export function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50) // Limit length
        .replace(/-+$/, ''); // Remove trailing hyphens
}

export function extractTitle(caption: string) {
    if (!caption) return null;

    // Extract first line or first sentence as title
    const firstLine = caption.split('\n')[0];
    const firstSentence = firstLine.split('.')[0];

    // Remove hashtags and mentions from title
    const cleanTitle = firstSentence
        .replace(/#\w+/g, '')
        .replace(/@\w+/g, '')
        .trim();

    return cleanTitle.length > 5 ? cleanTitle.substring(0, 100) : null;
}

export function extractDescription(caption: string) {
    if (!caption) return null;

    // Remove hashtags and mentions, take first 200 chars
    const cleanDescription = caption
        .replace(/#\w+/g, '')
        .replace(/@\w+/g, '')
        .replace(/\n+/g, ' ')
        .trim();

    return cleanDescription.substring(0, 200) + (cleanDescription.length > 200 ? '...' : '');
}

export function extractHashtags(caption: string) {
    const hashtags = caption.match(/#\w+/g);
    return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
}

export function logError(message: string, error: any) {
    console.error(message);

    console.error('Error details (JSON):', JSON.stringify(error, null, 2));

    console.error('Error details (inspect):', require('util').inspect(error, {
        depth: null,
        colors: true,
        showHidden: false
    }));

    if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
    }

    if (error.request) {
        console.error('Request Config:', JSON.stringify({
            method: error.config?.method,
            url: error.config?.url,
            headers: error.config?.headers,
            data: error.config?.data
        }, null, 2));
    }

    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
}