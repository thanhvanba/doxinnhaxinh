# Đồ Xịn Nhà Xinh

Website affiliate giới thiệu sản phẩm chất lượng từ Shopee — "Đồ xịn cho nhà xinh". Đang phát triển thành hệ thống tự động: **website + fanpage + pipeline lấy hàng & đăng bài (bán tự động có duyệt)**.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **shadcn/ui** (Radix UI) + **lucide-react**
- Font: **Be Vietnam Pro** (body) + **Bricolage Grotesque** (display)
- **Supabase** (Postgres + Storage + Auth) — nguồn dữ liệu sản phẩm
- Deploy: **Vercel**

> Dự án đang chuyển từ landing page React/Vite (sản phẩm hardcode) sang kiến trúc trên. Xem `plans/` để biết lộ trình.

## Kiến trúc & lộ trình

| GĐ | Nội dung |
|----|----------|
| 1 | Nền tảng Next.js + Supabase + website đọc sản phẩm từ DB (bỏ hardcode) |
| 2 | Admin duyệt + nhập link tay + các tool callable (lấy hàng / tạo bài / đăng) |
| 3 | Pipeline có lịch lấy sản phẩm Shopee Affiliate + đăng fanpage |
| 4 | Agent nghe lệnh qua Telegram ("hôm nay đăng gì") bọc lên các tool |

Chi tiết: [plans/brainstorm-architecture.md](plans/brainstorm-architecture.md) · kế hoạch GĐ1: [plans/260606-phase1-foundation/plan.md](plans/260606-phase1-foundation/plan.md) · định hướng giao diện: [plans/260606-phase1-foundation/design-direction.md](plans/260606-phase1-foundation/design-direction.md).

## Chạy local

```bash
npm install
npm run dev          # mở http://localhost:3000
```

### Biến môi trường

Tạo `.env.local` (xem `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # CHỈ server, không bao giờ prefix NEXT_PUBLIC_
```

## Scripts

| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |
