import InstagramPostProvider from '../services/post-provider';
import { SQSEvent, SQSRecord } from "aws-lambda";
import { createStrapiEntry, InstagramPost } from '../services/strapi';
import { generateEnhancedContent } from '../services/open-ai';
import { generateSlug } from '../utils/side';

const postProvider = new InstagramPostProvider();


export const handler = async (event: SQSEvent) => {
    try {
        for (const record of event.Records) {
            await processRecord(record);
        }
    } catch (error) {
        console.error("Error in Instagram post worker handler:", error);
    }
};

const processRecord = async (record: SQSRecord) => {
    try {
        const { post }: { post: InstagramPost; accessToken: string } = JSON.parse(record.body);

        console.log(`Processing post: ${post.id}`);

        // Check if post has already been processed
        const isAlreadyProcessed = await postProvider.isPostProcessed(post.id);

        if (isAlreadyProcessed) {
            console.log(`Post ${post.id} already processed, skipping...`);
            return;
        }

        // Generate enhanced content using OpenAI
        const enhancedContent = await generateEnhancedContent(post);

        // Create Strapi entry with AI-enhanced content and direct image upload
        const strapiResponse = await createStrapiEntry(post, enhancedContent);

        // Mark post as processed in DynamoDB
        const metadata = {
            title: enhancedContent.title,
            slug: generateSlug(enhancedContent.title),
            imageUrl: post.media_url || post.thumbnail_url,
            originalCaption: post.caption,
            aiEnhanced: true,
            tags: enhancedContent.tags || []
        };

        await postProvider.markPostAsProcessed(
            post.id,
            strapiResponse.data.id,
            metadata
        );

        console.log(`Successfully processed and recorded post: ${post.id}`);

    } catch (error) {
        console.error('Error processing post:', error);
        throw error;
    }
};