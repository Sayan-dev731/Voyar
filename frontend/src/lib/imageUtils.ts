// Helper function to convert Google Drive link to direct image URL.
// Uses lh3.googleusercontent.com/d/{id} (the GDrive CDN) instead of the
// drive.google.com/thumbnail redirect, which is blocked by CORS in browsers.
export const convertGoogleDriveLink = (url: string, size = 'w1000'): string => {
    if (!url) return url;

    // Patterns that can contain a Google Drive file ID
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/?]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?(?:export=view&)?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?(?:[^&]*&)?id=([^&]+)/,
        /https:\/\/lh3\.googleusercontent\.com\/d\/([^=?&]+)/,
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            // Direct CDN URL — no redirect, no CORS issues
            return `https://lh3.googleusercontent.com/d/${match[1]}=${size}`;
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
