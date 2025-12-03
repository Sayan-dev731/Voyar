// Helper function to convert Google Drive link to direct image URL
export const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;

    // Check if it's already in thumbnail format
    if (url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    // Patterns to extract Google Drive file ID
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?id=([^&]+)/
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            // Use thumbnail format which works better for rendering
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    // Return original URL if not a Google Drive link
    return url;
};

// Convert an array of image URLs
export const convertGoogleDriveLinks = (urls: string[]): string[] => {
    return urls.map(url => convertGoogleDriveLink(url));
};

// Get all product images including main image
export const getProductImages = (mainImage: string, additionalImages?: string[]): string[] => {
    const images: string[] = [];

    // Add main image first
    if (mainImage) {
        images.push(convertGoogleDriveLink(mainImage));
    }

    // Add additional images (avoiding duplicates)
    if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(img => {
            const convertedImg = convertGoogleDriveLink(img);
            if (convertedImg && !images.includes(convertedImg)) {
                images.push(convertedImg);
            }
        });
    }

    return images;
};
