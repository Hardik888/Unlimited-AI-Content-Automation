import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { fetchInstagramPosts } from "../services/posts";

const sqs = new AWS.SQS();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { accessToken } = JSON.parse(event.body!);

        if (!accessToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Instagram access token is required' })
            };
        }

        const posts = await fetchInstagramPosts(accessToken);

        const sqsPromises = posts.map((post: any) =>
            sqs.sendMessage({
                QueueUrl: process.env.SQS_QUEUE_URL!,
                MessageBody: JSON.stringify({
                    post,
                    accessToken
                })
            }).promise()
        );

        await Promise.all(sqsPromises);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                message: `Successfully queued ${posts.length} posts for processing`,
                postsCount: posts.length
            })
        };

    } catch (error) {
        console.error('Error in initiateSync:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}