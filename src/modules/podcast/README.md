# Podcast Module

The Podcast Module provides a secure and scalable solution for managing audio content with client-based authentication and access control.

## Features

### 🔐 Client Authentication
- **Secret Key Authentication**: Each client gets a unique secret key for API access
- **API Key Authentication**: Alternative authentication method
- **Rate Limiting**: Configurable per-hour request limits
- **Redis Caching**: Fast authentication with cached client data

### 📁 File Management
- **Audio Upload**: Support for multiple audio formats (MP3, WAV, OGG, M4A)
- **Storage Limits**: Configurable storage quotas per client
- **File Size Limits**: Configurable maximum file sizes
- **Cloudinary Integration**: Secure cloud storage for audio files

### 📊 Content Management
- **Podcast CRUD**: Full lifecycle management of podcast content
- **Status Management**: Draft, Published, and Archived states
- **Play Count Tracking**: Analytics for content engagement
- **Metadata Support**: Title, description, tags, and duration

### 🛡️ Security Features
- **Client Isolation**: Each client can only access their own content
- **Storage Monitoring**: Track and enforce storage usage limits
- **Access Logging**: Monitor client activity and last access times
- **Key Regeneration**: Ability to regenerate compromised keys

## API Endpoints

### Client Management (Admin Only)
```
POST   /admin/podcast-clients              # Create new client
GET    /admin/podcast-clients              # List all clients
PATCH  /admin/podcast-clients/:id          # Update client settings
POST   /admin/podcast-clients/:id/regenerate-keys  # Regenerate client keys
GET    /admin/podcast-clients/all-podcasts # View all podcasts across clients
```

### Podcast Management (Client API)
```
POST   /podcasts/upload                    # Upload new podcast
GET    /podcasts                          # List client's podcasts
GET    /podcasts/:id                      # Get specific podcast
PATCH  /podcasts/:id                      # Update podcast
DELETE /podcasts/:id                      # Delete podcast
POST   /podcasts/:id/play                 # Increment play count
```

## Authentication

### For Admin Endpoints
Use JWT authentication with admin role:
```
Authorization: Bearer <jwt_token>
```

### For Client Endpoints
Use either secret key or API key:
```
# Option 1: Secret Key
X-Podcast-Secret-Key: sk_abc123...

# Option 2: API Key  
X-Podcast-API-Key: pk_xyz789...
```

## Usage Examples

### 1. Create a New Client (Admin)
```bash
curl -X POST "http://localhost:3000/admin/podcast-clients" \
  -H "Authorization: Bearer <admin_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "My Podcast App",
    "contactEmail": "admin@podcastapp.com",
    "maxStorageMb": 5000,
    "maxFileSizeMb": 200,
    "rateLimitPerHour": 500
  }'
```

Response:
```json
{
  "error": false,
  "data": {
    "clientId": 1,
    "clientName": "My Podcast App",
    "secretKey": "sk_abc123def456...",
    "apiKey": "pk_xyz789uvw012...",
    "maxStorageMb": 5000,
    "maxFileSizeMb": 200,
    "allowedFormats": ["mp3", "wav", "ogg", "m4a"],
    "rateLimitPerHour": 500
  },
  "message": "Podcast client created successfully"
}
```

### 2. Upload a Podcast
```bash
curl -X POST "http://localhost:3000/podcasts/upload" \
  -H "X-Podcast-Secret-Key: sk_abc123def456..." \
  -H "Authorization: Bearer <user_jwt>" \
  -F "audio=@podcast-episode-1.mp3" \
  -F "title=Episode 1: Getting Started" \
  -F "description=Our first episode covers the basics" \
  -F "status=published" \
  -F "tags=[\"beginner\", \"tutorial\"]"
```

### 3. List Podcasts
```bash
curl -X GET "http://localhost:3000/podcasts?page=1&pageSize=10&status=published" \
  -H "X-Podcast-Secret-Key: sk_abc123def456..."
```

### 4. Play a Podcast (Increment Count)
```bash
curl -X POST "http://localhost:3000/podcasts/123/play" \
  -H "X-Podcast-Secret-Key: sk_abc123def456..."
```

## Database Schema

### PodcastClient Entity
- `clientId` - Primary key
- `clientName` - Display name for the client
- `secretKey` - Authentication secret key
- `apiKey` - Alternative API key
- `isActive` - Enable/disable client access
- `maxStorageMb` - Storage quota in megabytes
- `usedStorageMb` - Current storage usage
- `maxFileSizeMb` - Maximum file size allowed
- `allowedFormats` - Array of permitted file formats
- `rateLimitPerHour` - Request rate limit
- `contactEmail` - Client contact information
- `lastAccess` - Last API access timestamp

### Podcast Entity
- `podcastId` - Primary key
- `title` - Podcast title
- `description` - Podcast description
- `audioUrl` - Cloudinary URL for audio file
- `duration` - Duration in seconds
- `fileSize` - File size in bytes
- `fileFormat` - Audio file format
- `status` - Draft/Published/Archived
- `playCount` - Number of plays
- `isFeatured` - Featured content flag
- `tags` - Array of tags
- `clientId` - Foreign key to client
- `uploadedBy` - User who uploaded

## Configuration

The module supports the following configuration options:

### Default Client Settings
- **Max Storage**: 1000 MB
- **Max File Size**: 100 MB
- **Rate Limit**: 100 requests/hour
- **Allowed Formats**: mp3, wav, ogg, m4a

### Cache Settings
- **Client Auth Cache**: 5 minutes
- **Podcast Data Cache**: 5 minutes
- **Rate Limit Window**: 1 hour

## Error Handling

The API returns consistent error responses:

```json
{
  "error": true,
  "data": null,
  "message": "Error description"
}
```

Common error scenarios:
- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Access denied (e.g., wrong client)
- **413 Payload Too Large**: File exceeds size limits
- **429 Too Many Requests**: Rate limit exceeded
- **507 Insufficient Storage**: Storage quota exceeded

## Security Considerations

1. **Key Management**: Store secret keys securely, never expose in client-side code
2. **Rate Limiting**: Prevents abuse and ensures fair usage
3. **File Validation**: Only allowed formats and sizes are accepted
4. **Client Isolation**: Each client can only access their own content
5. **Audit Trail**: All access is logged with timestamps

## Performance Features

1. **Redis Caching**: Fast authentication and data retrieval
2. **Cloudinary CDN**: Global content delivery for audio files
3. **Database Indexing**: Optimized queries for large datasets
4. **Pagination**: Efficient data loading for large collections
