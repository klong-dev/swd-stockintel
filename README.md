<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# STOCK INTEL

Stock Intel là một nền tảng thu thập dữ liệu và phân tích thông tin chứng khoán chuyên nghiệp, được xây dựng trên nền tảng [NestJS](https://nestjs.com), tích hợp trí tuệ nhân tạo AI mạnh mẽ để cung cấp một hệ thống hiệu quả.

## Môi trường cấu hình (.env.example)

Dự án sử dụng tệp `.env` để cấu hình các biến môi trường. Dưới đây là ví dụ về tệp `.env.example`:

```plaintext
APP_PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
JWT_SECRET=your_jwt_secret
```

Hãy sao chép tệp `.env.example` thành `.env` và cập nhật các giá trị phù hợp với môi trường của bạn.

## Cài đặt

```bash
# Clone repository
$ git clone https://github.com/klong-dev/swd-stockintel.git

# Chuyển vào thư mục dự án
$ cd chotroimmo

# Cài đặt các dependencies
$ npm install

# Tạo tệp .env từ .env.example và cấu hình
$ cp .env.example .env
```

## Chạy dự án

```bash
# Chế độ phát triển
$ npm run start

# Chế độ watch
$ npm run start:dev

# Chế độ sản xuất
$ npm run start:prod
```

## Kiểm tra

```bash
# Chạy unit tests
$ npm run test

# Chạy e2e tests
$ npm run test:e2e

# Báo cáo độ bao phủ
$ npm run test:cov
```

## Coding Conventions

Để đảm bảo chất lượng mã nguồn và tính nhất quán, dự án tuân theo các quy tắc sau:

1. **Style Guide**: Sử dụng [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) với một số tùy chỉnh.
2. **Linting**: Sử dụng ESLint để kiểm tra mã nguồn. Chạy lệnh sau để kiểm tra:
   ```bash
   $ npm run lint
   ```
3. **Formatting**: Sử dụng Prettier để định dạng mã nguồn. Định dạng tự động có thể được thực hiện bằng lệnh:
   ```bash
   $ npm run format
   ```
4. **Folder Structure**:
   - `src/`: Chứa mã nguồn chính.
   - `src/modules/`: Chứa các module của ứng dụng.
   - `src/common/`: Chứa các thành phần dùng chung như filters, interceptors, guards, v.v.
5. **Commit Messages**: Sử dụng [Conventional Commits](https://www.conventionalcommits.org/) để viết commit messages.

## Tài nguyên

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com)
