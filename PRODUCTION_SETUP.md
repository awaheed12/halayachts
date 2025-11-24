# Production Setup Guide

This guide will help you deploy the Hala Yachts website to production on Vercel or any other hosting platform.

## Prerequisites

- MongoDB Atlas account and cluster
- Cloud storage account (Cloudinary recommended, or AWS S3)
- Git repository for deployment

## Environment Variables

Set the following environment variables in your hosting platform:

### Required Variables

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Admin Credentials (REQUIRED in production)
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password_here
```

### Optional Variables

```bash
# API URL (auto-detected on Vercel/Netlify)
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Cloud Storage Configuration

Choose one storage provider:

#### Option 1: Cloudinary (Recommended)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_FOLDER=hala-yachts
```

#### Option 2: AWS S3

```bash
AWS_S3_BUCKET=your_bucket_name
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Deployment Steps

### Vercel Deployment

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to add them for Production, Preview, and Development

3. **Deploy**
   - Push to your main branch or click "Deploy"
   - Vercel will automatically build and deploy

### Other Platforms

The code is platform-agnostic and will work on:
- Netlify
- AWS Amplify
- Railway
- Render
- Any Node.js hosting platform

Just ensure:
- Node.js 18+ is available
- Environment variables are set
- Build command: `npm run build`
- Start command: `npm start`

## Features

### Production-Ready Features

✅ **Cloud Storage Integration**
- Automatic detection of storage provider
- Supports Cloudinary and AWS S3
- Fallback to local storage in development

✅ **Security**
- Rate limiting on uploads and login
- Secure headers (HSTS, XSS protection, etc.)
- Input validation and sanitization
- Error message sanitization in production

✅ **Performance**
- Optimized database connections with connection pooling
- Dynamic rendering for real-time data
- Image optimization
- Compression enabled

✅ **Error Handling**
- Proper error logging (development only)
- User-friendly error messages
- Graceful degradation

✅ **URL Management**
- Automatic URL detection for all platforms
- Works on Vercel, Netlify, and custom domains
- No hardcoded localhost references

## Post-Deployment Checklist

- [ ] Verify MongoDB connection is working
- [ ] Test admin login functionality
- [ ] Test file uploads (should use cloud storage)
- [ ] Verify all pages load correctly
- [ ] Check that data from MongoDB displays properly
- [ ] Test booking form submission
- [ ] Test contact form submission
- [ ] Verify newsletter subscription
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

## Troubleshooting

### Data Not Showing

1. Check MongoDB connection string is correct
2. Verify network access in MongoDB Atlas (allow all IPs or add Vercel IPs)
3. Check environment variables are set correctly
4. Review build logs for errors

### File Uploads Not Working

1. Ensure cloud storage credentials are configured
2. Check file size limits (5MB for locations, 10MB for yachts)
3. Verify allowed file types (JPEG, PNG, WebP)
4. Check rate limiting hasn't been exceeded

### Build Errors

1. Check all required environment variables are set
2. Verify Node.js version (18+)
3. Review build logs for specific errors
4. Ensure all dependencies are installed

## Support

For issues or questions, check:
- Build logs in your hosting platform
- Browser console for client-side errors
- Server logs for API errors

## Security Notes

- **Never commit** `.env` files to Git
- Use strong passwords for admin credentials
- Regularly rotate API keys and secrets
- Enable MongoDB IP whitelisting
- Use HTTPS in production (automatic on Vercel)

