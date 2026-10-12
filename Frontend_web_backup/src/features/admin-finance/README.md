# Tài liệu tính năng: Admin Finance

## 🎯 Mục đích
Trang tài chính quản trị hiển thị KPI doanh thu/chi phí, cash flow, recent deposits và package tiers.

## 🧩 Thành phần chính

## 🔗 Mapping component -> service
- `finance-feature.tsx` -> chỉ điều phối `FinanceProvider`, loading gate và ghép các section.
- `components/finance-sections.tsx` -> chứa toàn bộ UI section của dashboard tài chính.
- `context/finance.context.tsx` -> gọi `fetchFinanceData()`.
- `services/finance.service.ts` -> đọc mock từ [src/services/mock-data.ts](../../services/mock-data.ts).

## ✅ Trạng thái hiện tại
- File entry đã mỏng hơn, logic UI lớn được dời sang section component.
- `CashFlowChart` và `PackageCard` vẫn là mock UI, chưa nối backend.

## 🔗 Mapping component -> service
- `finance-feature.tsx` -> `useFinance()` từ `context/finance.context.tsx`.
- `components/KpiCard.tsx` -> nhận `kpiData` từ `useFinance()`.
- `CashFlowChart` và danh sách deposit -> nhận `cashFlow` / `recentDeposits` từ `useFinance()`.
- `context/finance.context.tsx` -> gọi `fetchFinanceData()`.
- `services/finance.service.ts` -> đọc mock từ [src/services/mock-data.ts](../../services/mock-data.ts).

## ✅ Trạng thái hiện tại
- `refresh()` đã map sang `refetch()` của TanStack Query.
- Ảnh mock đồng nhất bằng placeholder chung.

## 🧪 Mock data & placeholder images
- Mock finance data được đồng bộ ở [src/services/mock-data.ts](../../services/mock-data.ts).
- Nếu phát sinh asset ảnh mới, dùng placeholder dùng chung để giữ UI nhất quán.

## TODO
- Thay `fetchFinanceData()` bằng API thật.
- Tách các fake KPI/transactions ra backend khi endpoint sẵn sàng.