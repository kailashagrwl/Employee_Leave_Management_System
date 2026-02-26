# Backend Render Deployment Guide

## Environment Variables to Set on Render

When setting up your Node.js service on Render, add these environment variables in the dashboard:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_12345
MONGODB_URI=mongodb://kailashagarwal:Kshqwerty12@ac-j9pbidg-shard-00-00.kveabfd.mongodb.net:27017,ac-j9pbidg-shard-00-01.kveabfd.mongodb.net:27017,ac-j9pbidg-shard-00-02.kveabfd.mongodb.net:27017/mernDB?ssl=true&authSource=admin&retryWrites=true&w=majority
ALLOWED_ORIGINS=localhost,yourdomain.com,yourfrontend-domain.com
```

## Important Settings

1. **NODE_ENV**: Must be `production` on Render for secure cookies
2. **ALLOWED_ORIGINS**: Add all frontend domains that will access this API (comma-separated with NO spaces)
   - Example: `localhost,example.com,app.example.com`
3. **JWT_SECRET**: Keep this secret and unique
4. **Remove sensitive data**: Never commit .env file with real credentials

## CORS Configuration

The server now allows:
- ✅ Credentials (cookies) in cross-origin requests
- ✅ Multiple origin domains via ALLOWED_ORIGINS
- ✅ Localhost for development
- ✅ Production domains when deployed

## Cookie Settings

- **sameSite=None** when NODE_ENV=production (required for cross-origin cookies)
- **secure=true** when NODE_ENV=production (requires HTTPS)
- **httpOnly=true** (protects from XSS attacks)
- **maxAge=30d** (30-day expiration)

## Frontend Integration

The frontend is configured to:
1. Use Vite proxy for development (/api routes)
2. Use full RENDER_API_URL for production
3. Include credentials in all requests
