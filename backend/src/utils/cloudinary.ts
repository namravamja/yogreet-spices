import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;
let configChecked = false;

// Lazy initialization function - only runs when actually needed
const initializeCloudinary = (): boolean => {
  if (configChecked) {
    return isConfigured;
  }

  configChecked = true;

  // Validate and configure Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    console.warn(`⚠️  Warning: Cloudinary is not configured. Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  File uploads will use memory storage. Please set these variables in your .env file.');
    isConfigured = false;
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('✅ Cloudinary configured successfully');
    isConfigured = true;
    return true;
  } catch (error: any) {
    console.error('❌ Failed to configure Cloudinary:', error?.message || error);
    isConfigured = false;
    return false;
  }
};

// Check if Cloudinary is configured (will initialize on first call)
export const isCloudinaryConfigured = (): boolean => {
  return initializeCloudinary();
};

// Don't initialize on module load - wait until it's actually needed
// This ensures dotenv.config() has already run

export default cloudinary;

