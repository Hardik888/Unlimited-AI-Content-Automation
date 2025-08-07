import axios from "axios";
import FormData from 'form-data';
import { generateSlug, logError } from "../utils/side";

export type InstagramPost = {
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    timestamp: string;
}

export type EnhancedContent = {
    title: string;
    description: string;
    richTextBody: string;
    tags: string[];
}

export async function createStrapiEntry(post: InstagramPost, enhancedContent: EnhancedContent): Promise<any> {
    try {
        console.log('Starting Strapi entry creation for post:', post.id);

        const strapiImageId = await uploadImageDirectlyToStrapi(post);
        console.log('Image uploaded successfully, ID:', strapiImageId);

        const slug = generateSlug(enhancedContent.title);
        console.log('Generated slug:', slug);

        const truncatedDescription = enhancedContent.description.length > 80
            ? enhancedContent.description.substring(0, 77) + '...'
            : enhancedContent.description;

        console.log('Original description length:', enhancedContent.description.length);
        console.log('Truncated description:', truncatedDescription);

        const strapiData = {
            data: {
                title: enhancedContent.title,
                description: truncatedDescription,
                slug: slug,
                cover: strapiImageId,
                blocks: [
                    {
                        __component: 'shared.rich-text',
                        body: enhancedContent.richTextBody
                    }
                ],
                publishedAt: new Date().toISOString()
            }
        };

        console.log('Sending data to Strapi:', JSON.stringify(strapiData, null, 2));

        const response = await axios.post(
            `${process.env.STRAPI_URL}/api/articles`,
            strapiData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.STRAPI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Strapi entry created successfully with ID: ${response.data.data.id}`);
        return response.data;
    } catch (error: any) {
        logError('Error creating Strapi entry:', error);
        throw error;
    }
}

async function uploadImageDirectlyToStrapi(post: InstagramPost): Promise<number> {
    try {
        const imageUrl = post.media_url || post.thumbnail_url;
        if (!imageUrl) {
            throw new Error('No image URL found for post');
        }

        console.log('Downloading image from URL:', imageUrl);

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        console.log('Image downloaded, size:', response.data.byteLength, 'bytes');

        const form = new FormData();
        const fileName = `instagram-${post.id}.jpg`;
        const imageBuffer = Buffer.from(response.data);

        form.append('files', imageBuffer, {
            filename: fileName,
            contentType: response.headers['content-type'] || 'image/jpeg'
        });

        console.log('Uploading file to Strapi:', fileName);

        const strapiResponse = await axios.post(
            `${process.env.STRAPI_URL}/api/upload`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.STRAPI_API_KEY}`,
                    ...form.getHeaders()
                }
            }
        );

        console.log(`Image uploaded directly to Strapi with ID: ${strapiResponse.data[0].id}`);
        return strapiResponse.data[0].id;
    } catch (error: any) {
        logError('Error uploading image directly to Strapi:', error);
        throw error;
    }
}

