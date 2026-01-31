import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3Client = new S3Client({ region: 'us-east-1' });

async function testPresignedPost() {
  try {
    const result = await createPresignedPost(s3Client, {
      Bucket: 'vermithor-dev',
      Key: 'test.pdf',
      Fields: {
        'Content-Type': 'application/pdf',
      },
      Conditions: [
        ['content-length-range', 1, 10485760],
        ['eq', '$Content-Type', 'application/pdf'],
        ['eq', '$key', 'test.pdf'],
      ],
      Expires: 300,
    });
    
    console.log('✅ Presigned post created successfully');
    console.log('URL:', result.url);
    console.log('Fields:', result.fields);
  } catch (error) {
    console.error('❌ Error creating presigned post:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.Code);
    console.error('Error region:', error.Region);
  }
}

testPresignedPost();