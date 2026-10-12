# Tài liệu tính năng: Admin Dashboard

## 🎯 Mục đích
Trang tổng quan quản trị hiển thị KPI, biểu đồ, giao dịch gần đây và nhóm gói nạp.

## 🧩 Thành phần chính
- `dashboard-feature.tsx`: entry component của feature.
- `components/*`: các card, chart và skeleton hiển thị dashboard.
- `context/dashboard.context.tsx`: bọc `useQuery` cho server-state.
- `services/dashboard.service.ts`: service mock/placeholder cho dữ liệu tổng quan.

## 🔗 Mapping component -> service
- `dashboard-feature.tsx` -> `useDashboard()` từ `context/dashboard.context.tsx`.
- `components/KpiCard.tsx`, chart, recent transactions, package tiers -> consume `data` từ `useDashboard()`.
- `context/dashboard.context.tsx` -> gọi `fetchDashboardData()`.
- `services/dashboard.service.ts` -> đọc mock từ [src/services/mock-data.ts](../../services/mock-data.ts).

## ✅ Trạng thái hiện tại
- Server-state đã chuyển sang TanStack Query.
- Ảnh mock dùng placeholder chung từ module mock-data.

## 🧪 Mock data & placeholder images
- Dữ liệu mock trung tâm nằm ở [src/services/mock-data.ts](../../services/mock-data.ts).
- Feature này không còn giữ ảnh thật rải rác; mọi ảnh mock đều đi qua placeholder dùng chung.

## TODO
- Thay `fetchDashboardData()` bằng API thật.
- Nếu có KPI/transaction mới, cập nhật schema trong [src/services/mock-data.ts](../../services/mock-data.ts).