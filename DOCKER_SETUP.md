# Docker Setup Guide

This guide explains how to run the Tuff Backend application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later

## Quick Start

1. **Create a `.env` file** in the root directory with your environment variables:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DATABASE=tuff
MONGO_PORT=27017

# Backend Configuration
BACKEND_PORT=3005

# JWT Configuration
# Generate a secure secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION_TIME=3600

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SSLCommerz Payment Gateway
STORE_ID=your_sslcommerz_store_id
STORE_PASSWD=your_sslcommerz_store_password

# Email Configuration (Zoho)
ZOHO_PASSWORD=your_zoho_email_password
```

2. **Build and start the services**:

```bash
docker-compose up -d
```

This will:
- Build the NestJS backend application
- Start MongoDB database
- Start the backend service
- Create necessary volumes and networks

3. **View logs**:

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View MongoDB logs only
docker-compose logs -f mongodb
```

4. **Stop the services**:

```bash
docker-compose down
```

5. **Stop and remove volumes** (⚠️ This will delete all data):

```bash
docker-compose down -v
```

## Services

### Backend Service
- **Container name**: `tuff-backend`
- **Port**: `3005` (configurable via `BACKEND_PORT`)
- **Health check**: Checks if the server responds on the root endpoint
- **Volumes**:
  - `./uploads` → `/app/uploads` (file uploads)
  - `./public` → `/app/public` (static files)

### MongoDB Service
- **Container name**: `tuff-mongodb`
- **Port**: `27017` (configurable via `MONGO_PORT`)
- **Database**: `tuff` (configurable via `MONGO_DATABASE`)
- **Volumes**:
  - `mongodb_data`: Persistent database storage
  - `mongodb_config`: MongoDB configuration

## Environment Variables

All environment variables can be set in the `.env` file. The docker-compose.yml will automatically use these values.

### Required Variables

- `JWT_SECRET`: Secret key for JWT token signing
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `STORE_ID`: SSLCommerz store ID
- `STORE_PASSWD`: SSLCommerz store password
- `ZOHO_PASSWORD`: Zoho email password

### Optional Variables (with defaults)

- `MONGO_ROOT_USERNAME`: MongoDB root username (default: `admin`)
- `MONGO_ROOT_PASSWORD`: MongoDB root password (default: `changeme`)
- `MONGO_DATABASE`: Database name (default: `tuff`)
- `MONGO_PORT`: MongoDB port (default: `27017`)
- `BACKEND_PORT`: Backend port (default: `3005`)
- `JWT_EXPIRATION_TIME`: JWT expiration in seconds (default: `3600`)

## MongoDB Connection

The backend automatically connects to MongoDB using the connection string:
```
mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/${MONGO_DATABASE}?authSource=admin
```

The service name `mongodb` resolves to the MongoDB container within the Docker network.

## Accessing the Application

- **API**: http://localhost:3005
- **Swagger Documentation**: http://localhost:3005/api
- **MongoDB**: localhost:27017 (from host machine)

## Troubleshooting

### Backend won't start

1. Check if MongoDB is healthy:
   ```bash
   docker-compose ps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify environment variables are set correctly:
   ```bash
   docker-compose config
   ```

### MongoDB connection issues

1. Ensure MongoDB container is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Verify the connection string in the backend logs matches your MongoDB credentials.

### Port already in use

If port 3005 or 27017 is already in use, change them in your `.env` file:
```env
BACKEND_PORT=3006
MONGO_PORT=27018
```

Then update the docker-compose.yml port mappings accordingly.

## Development vs Production

### Development
For development, you might want to mount the source code as a volume for hot-reloading:
```yaml
volumes:
  - ./src:/app/src
```

### Production
The current setup is optimized for production with:
- Multi-stage Docker build
- Only production dependencies
- Non-root user execution
- Health checks
- Persistent data volumes

## Data Persistence

MongoDB data is persisted in Docker volumes:
- `mongodb_data`: Database files
- `mongodb_config`: Configuration files

To backup MongoDB data:
```bash
docker-compose exec mongodb mongodump --out /data/backup
```

To restore:
```bash
docker-compose exec mongodb mongorestore /data/backup
```

## Security Notes

1. **Change default passwords**: Always change `MONGO_ROOT_PASSWORD` in production
2. **Use strong JWT secrets**: Generate a secure random string for `JWT_SECRET`
3. **Don't commit `.env`**: The `.env` file is already in `.gitignore`
4. **Use secrets management**: For production, consider using Docker secrets or a secrets management service

## Additional Commands

```bash
# Rebuild containers
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps

# Execute command in backend container
docker-compose exec backend sh

# Execute command in MongoDB container
docker-compose exec mongodb mongosh

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker stats
```



