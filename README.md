# Unlimited AI Instagram Content Automation for Strapi CMS

A serverless AWS Lambda application that automatically pulls unlimited content from Instagram and publishes it to Strapi CMS with image optimization.

## 🚀 Features

- **Unlimited Instagram Integration**: Fetches unlimited posts from Instagram using the Instagram Basic Display API
- **Content Publishing**: Automatically creates and publishes posts in Strapi CMS
- **Serverless Architecture**: Built on AWS Lambda with SQS for reliable message processing
- **Duplicate Prevention**: Uses DynamoDB to track processed posts and prevent duplicates
- **Batch Processing**: Processes multiple Instagram posts efficiently
- **Error Handling**: Robust error handling and retry mechanisms
- **Unlimited Content Processing**: No limits on content volume or processing frequency

## 🏗️ Architecture

```
Instagram API → Lambda → SQS → Lambda → Strapi CMS
     ↓              ↓       ↓       ↓
  Fetch Posts → Queue → Process → Publish
```

### Components

- **Instagram Service**: Handles Instagram API interactions
- **Image Optimization Service**: Optimizes images for better performance
- **Strapi Service**: Handles content publishing to Strapi CMS
- **DynamoDB**: Tracks processed posts to prevent duplicates
- **SQS**: Reliable message queuing for post processing

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Instagram Basic Display API access token
- Strapi CMS instance with API access
- Node.js 18.x or higher

## 🛠️ Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Instagram Configuration
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token

# Strapi Configuration
STRAPI_URL=http://your-strapi-instance.com
STRAPI_API_KEY=your_strapi_api_key

# AWS Configuration
AWS_REGION=eu-central-1
SQS_QUEUE_URL=https://sqs.eu-central-1.amazonaws.com/your-account/instagram-post-processing

# OpenAI (Optional - for content enhancement)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Deploy to AWS

```bash
npm run deploy
```

## 🔧 Configuration

### Instagram API Setup

1. Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
2. Add Instagram Basic Display product
3. Configure Instagram Basic Display settings
4. Generate a long-lived access token
5. Add the token to your environment variables

### Strapi CMS Setup

1. Ensure your Strapi instance has the following content types:
   - `Post` with fields:
     - `title` (Text)
     - `content` (Rich Text)
     - `excerpt` (Text)
     - `slug` (UID)
     - `featuredImage` (Media)
     - `images` (Media - multiple)
     - `instagramPostId` (Text)
     - `instagramPermalink` (Text)
     - `instagramCaption` (Text)
     - `instagramTimestamp` (DateTime)
     - `status` (Enumeration: draft, published)

2. Create an API token in Strapi admin panel
3. Add the token to your environment variables

### AWS Resources

The application automatically creates:
- SQS Queue for message processing
- DynamoDB table for tracking processed posts
- IAM roles with necessary permissions
- No S3 bucket required - images are optimized and stored directly in Strapi

## 📖 Usage

### Manual Sync

Trigger a manual Instagram sync:

```bash
curl -X POST https://your-api-gateway-url/sync-instagram \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "publishImmediately": true
  }'
```

### Automatic Sync

Set up a CloudWatch Event to trigger syncs automatically:

```yaml
# Add to serverless.yml
functions:
  scheduledSync:
    handler: dist/handler.scheduledSync
    events:
      - schedule: rate(1 hour)
```

### API Endpoints

- `POST /sync-instagram`: Trigger Instagram sync

## 🔄 Processing Flow

1. **Fetch Posts**: Retrieves unlimited Instagram posts
2. **Queue Processing**: Adds posts to SQS for processing
3. **Image Download**: Downloads images from Instagram
4. **Strapi Publishing**: Creates posts in Strapi CMS with optimized images
5. **Duplicate Check**: Prevents duplicate processing

## 📊 Monitoring

### CloudWatch Metrics

Monitor the following metrics:
- Lambda execution duration
- SQS queue depth
- DynamoDB read/write capacity
- Error rates
- Content processing volume

### Logs

Check CloudWatch Logs for:
- Instagram API errors
- Image optimization issues
- Strapi publishing issues
- Processing statistics
- Unlimited content processing metrics

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Instagram API Errors**: Retries with exponential backoff
- **Image Optimization Failures**: Logs errors and continues processing
- **Strapi Publishing Errors**: Retries failed posts
- **Network Timeouts**: Configurable timeouts for all operations
- **Unlimited Processing**: Handles high-volume content processing gracefully

## 🔒 Security

- IAM roles with minimal required permissions
- Environment variables for sensitive data
- API Gateway authentication (can be configured)
- Secure image processing without external storage

## 🧪 Testing

### Local Development

```bash
# Start local development
npm run offline:local

# Run tests
npm test
`
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the logs in CloudWatch
3. Verify your environment variables
4. Test individual components

## 🔄 Changelog

### v1.0.0
- Initial release
- Unlimited Instagram content fetching
- Strapi CMS integration
- Image optimization without S3
- Serverless architecture
- High-volume content processing 