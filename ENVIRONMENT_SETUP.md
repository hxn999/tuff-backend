# Environment Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRATION_TIME=1h

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/miskbd
```

## Important Notes

1. **JWT_SECRET**: Use a long, random string for production. You can generate one using:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **JWT_EXPIRATION_TIME**: Set the token expiration time (e.g., '1h', '24h', '7d')

3. **Security**: Never commit the `.env` file to version control. It's already in `.gitignore`.

## Fallback Values

If no `.env` file is provided, the application will use these default values:

- JWT_SECRET: `your-default-jwt-secret-key-change-this-in-production`
- JWT_EXPIRATION_TIME: `1h`

**⚠️ Warning**: The default JWT secret is not secure for production use!

