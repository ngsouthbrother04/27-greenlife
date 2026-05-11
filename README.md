# 27Greenlife

## Tổng quan

`27Greenlife` là một dự án web thương mại điện tử (full-stack) bao gồm backend Node.js/Express với Prisma và frontend hiện đại (Vite + React).

## Nội dung chính

- [Tính năng chính](#features)
- [Kiến trúc & Công nghệ](#architecture-and-tech-stack)
- [Yêu cầu & Chuẩn bị](#prerequisites)
- [Cài đặt và chạy local (Quickstart)](#quickstart)
- [Biến môi trường](#environment-variables)
- [Cơ sở dữ liệu & Prisma](#database-and-prisma)
- [Test, Lint, Coverage](#tests-and-quality)
- [Docker & Deployment](#docker-and-deployment)
- [Contributing & Code Review](#contributing)
- [Báo cáo lỗi / Hỗ trợ](#support)

## Features

- RESTful API cho sản phẩm, giỏ hàng, đơn hàng, người dùng
- Xác thực & phân quyền cơ bản (JWT / session)
- Tích hợp thanh toán (mô phỏng Momo)
- Upload ảnh và xử lý file tĩnh
- Migrations & seed data qua Prisma

## Architecture and Tech Stack

- Backend: Node.js, Express, Prisma ORM, Vitest (tests)
- Frontend: Vite, React, Tailwind (cấu trúc trong `app/frontend`)
- DB: PostgreSQL / SQLite (tùy môi trường) — Prisma schema tại `app/backend/prisma/schema.prisma`
- Dev tooling: Docker, docker-compose, ESLint, Prettier, Vitest

## Prerequisites

- Node.js 18+ (hoặc LTS hiện hành)
- pnpm / npm / yarn (chọn 1)
- Docker & Docker Compose (khi dùng container)
- PostgreSQL (nếu không dùng Dockerized DB)

## Quickstart (local development)

1. Clone repository

	git clone https://github.com/ngsouthbrother04/27-greenlife.git
	cd 27-greenlife

2. Backend — cài dependencies và khởi chạy

	cd app/backend
	npm install
	cp .env.example .env   # chỉnh các biến cần thiết
	npx prisma migrate dev --name init
	npm run dev

3. Frontend — cài dependencies và khởi chạy

	cd ../../app/frontend
	npm install
	npm run dev

4. Mở trình duyệt: frontend thường lắng nghe tại `http://localhost:5173` (theo cấu hình Vite)

Ghi chú: repository có sẵn `docker-compose.yml` trong `app/backend` để chạy DB và backend kèm theo; dùng Docker nếu muốn môi trường đồng nhất.

## Environment Variables

Tạo file `.env` cho backend với các biến tối thiểu (ví dụ):

- `DATABASE_URL` — connection string cho PostgreSQL/SQLite
- `PORT` — port cho server (mặc định 3000)
- `JWT_SECRET` — secret cho token
- `NODE_ENV` — development|production

Đặt biến tương ứng cho frontend nếu cần (ví dụ `VITE_API_BASE_URL`).

## Database and Prisma

- Schema: `app/backend/prisma/schema.prisma`
- Migrations: `npx prisma migrate dev` để tạo/migrate local
- Seed: `node prisma/seed.js` hoặc script tương ứng nếu có trong `package.json`

Best practice: sử dụng Dockerized DB cho CI và local dev để tránh khác biệt môi trường.

## Tests and Quality

- Backend tests: `cd app/backend && npm test` (Vitest)
- Frontend tests: `cd app/frontend && npm test` (Vitest)
- Lint: `npm run lint` (có thể có ở cả frontend/backend)
- Format: `npx prettier --write .`

Thực hiện CI để chạy lint → tests → build trên mỗi PR.

## Docker & Deployment

- Dockerfile và `docker-compose.yml` nằm trong `app/backend`.
- Local Docker dev: `docker compose up --build` từ `app/backend` (hoặc repo root nếu cấu hình path)
- Production: Build image và deploy lên registry (Docker Hub / ACR / ECR), sau đó deploy trên k8s / container service.

Ví dụ ngắn (local docker-compose):

```
cd app/backend
docker compose up --build -d
```

## CI/CD Recommendations

- Run `npm ci`, `npx prisma migrate deploy`, `npm run build` và `npm run test` in pipeline
- Use review apps / ephemeral environments for PR preview
- Store secrets in environment vault (GH Secrets, Azure KeyVault, etc.)
