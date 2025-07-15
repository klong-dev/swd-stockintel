# Admin Post Management API

## Overview

Hệ thống quản lý bài post cho admin với các tính năng CRUD đầy đủ, tìm kiếm, lọc và thao tác hàng loạt.

## Available Endpoints

### 1. Get All Posts (Phân trang)

```
GET /admin/posts?page=1&pageSize=10
```

- Lấy tất cả bài post với phân trang
- Tự động cache kết quả

### 2. Get Post by ID

```
GET /admin/posts/{id}
```

- Lấy chi tiết một bài post theo ID
- Bao gồm thông tin expert, stock, tag, comments và reports

### 3. Create New Post

```
POST /admin/posts
```

Body:

```json
{
  "title": "Post title",
  "content": "Post content",
  "expertId": 1,
  "stockId": 1,
  "sourceUrl": "https://example.com",
  "viewCount": 0,
  "likeCount": 0,
  "session": 1
}
```

### 4. Update Post

```
PATCH /admin/posts/{id}
```

Body: Tương tự như create, nhưng tất cả fields đều optional

### 5. Delete Post

```
DELETE /admin/posts/{id}
```

### 6. Get Posts by Status

```
GET /admin/posts/status/filter?status=reported&page=1&pageSize=10
```

- Lọc posts theo trạng thái (reported, active, hidden)

### 7. Get Reported Posts

```
GET /admin/posts/reported?page=1&pageSize=10
```

- Lấy tất cả posts đã được báo cáo

### 8. Get Posts Statistics

```
GET /admin/posts/statistics
```

Response:

```json
{
  "totalPosts": 1000,
  "totalReportedPosts": 50,
  "totalViewCount": 50000,
  "totalLikeCount": 10000,
  "postsToday": 10,
  "postsThisWeek": 50,
  "postsThisMonth": 200
}
```

### 9. Toggle Post Status

```
PATCH /admin/posts/{id}/toggle-status
```

- Chuyển đổi trạng thái hiển thị của post

### 10. Advanced Search and Filter

```
POST /admin/posts/search
```

Body:

```json
{
  "page": 1,
  "pageSize": 10,
  "status": "reported",
  "title": "search term",
  "expertId": 1,
  "stockId": 1,
  "sortBy": "createdAt",
  "sortOrder": "DESC"
}
```

### 11. Bulk Update Posts

```
PATCH /admin/posts/bulk-update
```

Body:

```json
{
  "postIds": [1, 2, 3],
  "updateData": {
    "viewCount": 0,
    "likeCount": 0
  }
}
```

### 12. Bulk Delete Posts

```
DELETE /admin/posts/bulk-delete
```

Body:

```json
{
  "postIds": [1, 2, 3]
}
```

## Features

### Caching

- Tất cả các endpoint đều sử dụng Redis cache
- Cache tự động được xóa khi có thay đổi dữ liệu
- TTL mặc định: 5-10 phút

### Authentication

- Tất cả endpoints đều yêu cầu JWT token
- Sử dụng JwtAuthGuard để bảo vệ

### Error Handling

- Tất cả response đều có format chuẩn:

```json
{
  "error": false,
  "data": {},
  "message": "Success message"
}
```

### Validation

- Sử dụng class-validator cho tất cả DTOs
- Swagger documentation tự động

## Usage Examples

### 1. Search posts by title

```bash
curl -X POST "http://localhost:3000/admin/posts/search" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "stock market",
    "page": 1,
    "pageSize": 10
  }'
```

### 2. Get reported posts

```bash
curl -X GET "http://localhost:3000/admin/posts/reported?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Bulk hide posts

```bash
curl -X PATCH "http://localhost:3000/admin/posts/bulk-update" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postIds": [1, 2, 3],
    "updateData": {
      "viewCount": 0
    }
  }'
```

## Database Relations

- Post có mối quan hệ với User (expert), Stock, Tag, Comment, Report
- Tất cả relations đều được load khi cần thiết

## Performance Optimization

- Sử dụng pagination để giảm tải
- Query optimization với proper indexing
- Redis cache cho frequently accessed data
- Bulk operations để giảm số lượng database queries
