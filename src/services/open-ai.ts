import OpenAI from "openai";
import { extractTitle, extractDescription, extractHashtags } from "../utils/side";
import { EnhancedContent, InstagramPost } from "./strapi";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEnhancedContent(post: InstagramPost): Promise<EnhancedContent> {
    try {
        const caption = post.caption || '';

        if (!caption.trim()) {
            return {
                title: `Instagram Post ${post.id}`,
                description: 'Instagram post imported via Account',
                richTextBody: 'No caption available for this Instagram post.',
                tags: []
            };
        }

        const prompt = `
You are a content creator assistant. Transform this Instagram caption into professional blog content:

Original Caption: "${caption}"

Please provide a JSON response with the following structure:
{
  "title": "A compelling, SEO-friendly title (max 60 characters)",
  "description": "A meta description for SEO (max 160 characters)", 
  "richTextBody": "Enhanced blog content in markdown format. Expand the caption into a full blog post with proper structure, headings, and engaging content. Remove excessive hashtags and emojis, but keep the authentic voice.",
  "tags": ["relevant", "tags", "from", "content"]
}

Guidelines:
- Keep the original tone and voice
- Expand abbreviated content into full sentences
- Add structure with headings if appropriate
- Clean up hashtags (max 5 relevant ones)
- Make it blog-ready while maintaining authenticity
- Ensure the content is engaging and readable
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional content creator who specializes in transforming social media content into engaging blog posts. Always respond with valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            throw new Error('No response from OpenAI');
        }

        const enhancedContent = JSON.parse(responseContent);

        if (!enhancedContent.title || !enhancedContent.richTextBody) {
            throw new Error('Invalid response format from OpenAI');
        }

        return enhancedContent;

    } catch (error) {
        console.error('Error generating enhanced content:', error);

        return {
            title: extractTitle(post.caption!) || `Instagram Post ${post.id}`,
            description: extractDescription(post.caption!) || 'Instagram post imported via Account',
            richTextBody: post.caption || 'No caption available for this Instagram post.',
            tags: extractHashtags(post.caption || '')
        };
    }
}