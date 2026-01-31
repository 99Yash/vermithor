import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3Client = new S3Client({ region: 'us-east-1' });

async function testUpload() {
  try {
    console.log('Testing presigned post creation...');
    const result = await createPresignedPost(s3Client, {
      Bucket: 'vermithor-dev',
      Key: 'test-upload.pdf',
      Fields: {
        'Content-Type': 'application/pdf',
      },
      Conditions: [
        ['content-length-range', 1, 10485760],
        ['eq', '$Content-Type', 'application/pdf'],
        ['eq', '$key', 'test-upload.pdf'],
      ],
      Expires: 300,
    });
    
    console.log('✅ Presigned post created successfully');
    console.log('Bucket:', result.url);
    console.log('Has fields:', Object.keys(result.fields).length > 0);
    
    // Test minimal put
    console.log('\nTesting direct put...');
    const putCommand = new PutObjectCommand({
      Bucket: 'vermithor-dev',
      Key: 'test-direct.pdf',
      Body: 'test content',
    });
    
    await s3Client.send(putCommand);
    console.log('✅ Direct put successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.Code);
    console.error('Error name:', error.name);
  }
}

testUpload();