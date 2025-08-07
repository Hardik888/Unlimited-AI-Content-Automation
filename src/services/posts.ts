import axios from "axios";

export async function fetchInstagramPosts(accessToken: string) {
    try {
        const mediaResponse = await axios.get(
            `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
        );

        return mediaResponse.data.data.filter((post: any) =>
            post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM'
        );
    } catch (error) {
        console.error('Error fetching Instagram posts:', error);
        throw new Error('Failed to fetch Instagram posts');
    }
}