import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

export type ProcessedPost = {
    instagramPostId: string;  
    strapiArticleId: number;
    createdAt: number;
    processedAt: string;
    metadata: string;
    status: 'processed' | 'failed';
}
class InstagramPostProvider {
    private dynamoDB: DynamoDB;
    private TABLE_NAME: string;

    constructor() {
        this.dynamoDB = new DynamoDB({ region: "eu-central-1" });
        this.TABLE_NAME = "processed-instagram-posts";
    }

    async isPostProcessed(instagramPostId: string): Promise<boolean> {
        const params = {
            TableName: this.TABLE_NAME,
            Key: marshall({
                instagramPostId: instagramPostId
            })
        };

        try {
            const result = await this.dynamoDB.getItem(params);
            return !!result.Item;
        } catch (error) {
            console.error('Error checking if post is processed:', error);
            return false;
        }
    }

    async markPostAsProcessed(
        instagramPostId: string,
        strapiArticleId: number,
        metadata: {
            title: string;
            slug: string;
            imageUrl?: string;
            originalCaption?: string;
            aiEnhanced?: boolean;
            tags?: string[];
        }
    ): Promise<string | undefined> {
        const timeStampNow = Date.now();

        try {
            const { $metadata } = await this.dynamoDB.putItem({
                TableName: this.TABLE_NAME,
                Item: marshall({
                    instagramPostId: instagramPostId,
                    strapiArticleId: strapiArticleId,
                    createdAt: timeStampNow,
                    processedAt: new Date().toISOString(),
                    metadata: JSON.stringify(metadata),
                    status: 'processed'
                } satisfies ProcessedPost)
            });

            if ($metadata.httpStatusCode !== 200) {
                return undefined;
            }
            return instagramPostId;
        } catch (error) {
            console.error('Error marking post as processed:', error);
            return undefined;
        }
    }

}

export default InstagramPostProvider;
