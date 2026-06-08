# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong dự án này.

## Dự án: Đồ Xịn Nhà Xinh — hệ thống affiliate Shopee

Mục tiêu: chuyển từ landing page tĩnh thành **hệ thống tự động hóa** gồm website + fanpage + agent, lấy sản phẩm từ Shopee Affiliate để (bán) tự động đăng lên web và fanpage Facebook.

### Kiến trúc mục tiêu
- **Website**: React 19 + Vite 7 + Tailwind 4 (đang có). Sẽ bỏ dữ liệu hardcode, đọc sản phẩm từ Supabase.
- **Nền tảng/Backend**: **Supabase** — Postgres + API tự sinh + Edge Functions + Cron + Auth + Storage.
- **Agent/Worker**: Edge Function chạy theo lịch, lấy sản phẩm Shopee Affiliate → Claude API viết caption → lưu DB → đăng Facebook Graph API.
- **Fanpage**: đăng bài **bán tự động** — agent gom + soạn, user DUYỆT rồi mới đăng.

### Lộ trình
1. Supabase schema (`products`, `posts`) + website bỏ hardcode, đọc từ DB.
2. Admin dashboard + nhập link affiliate tay.
3. Agent lấy hàng Shopee (khi có AppID/Secret).
4. Đăng fanpage + Claude viết caption.

### Trạng thái phụ thuộc bên ngoài
- Shopee Affiliate Open API: CHƯA xác minh user có quyền API (mới có acc affiliate). Module lấy hàng thiết kế kiểu "cắm nguồn" — nhập tay trước, cắm API sau.
- Facebook tự đăng: cần Facebook App + Page Access Token dài hạn + App Review của Meta.

## Quy ước
- Hiện chưa dùng TypeScript; giữ JS + JSX cho frontend cho tới khi quyết định đổi.
- Tách dữ liệu khỏi UI: không hardcode sản phẩm trong component.
- Bí mật (API key, token) để trong biến môi trường / Supabase secrets, KHÔNG commit.
- Trả lời và viết tài liệu bằng tiếng Việt.

## Công cụ có sẵn
- `.claude/skills/` — 76 skill claudekit (namespace `ck:`). Kích hoạt skill phù hợp khi cần (vd `ck:plan`, `ck:databases`, `ck:backend-development`, `ck:frontend-development`, `ck:copywriting`, `ck:google-adk-python`).
- `.claude/agents/` — 14 sub-agent (planner, code-reviewer, fullstack-developer...).
- `.claude/output-styles/` — phong cách trả lời theo trình độ.
- Chưa cài hooks (cố ý, để tránh tự động đổi hành vi).
