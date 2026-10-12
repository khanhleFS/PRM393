# Tài liệu tính năng: Profile

## 🎯 Mục đích
Trang hồ sơ người dùng hiển thị thông tin cá nhân, ví, lịch sử giao dịch và các bộ sưu tập.

## 🧩 Thành phần chính
- `profile-feature.tsx`: entry feature dùng `ProfileProvider`.
- `pages/protected/profile.tsx`: page wrapper re-export feature.
- `context/profile.context.tsx`: bọc `useQuery` cho profile server-state.
- `components/*`: header, wallet, transactions, transaction detail modal, personal info, collections, skeleton.
- `services/profile.service.ts`: service mock cho dữ liệu profile.

## 🔗 Mapping component -> service
- `profile-feature.tsx` -> dùng `ProfileProvider` + `useProfile()`.
- `pages/protected/profile.tsx` -> re-export `profile-feature.tsx` để route vẫn giữ nguyên.
- `components/profile-header.tsx`, `wallet-card.tsx`, `transaction-section.tsx`, `personal-info-section.tsx`, `collection-section.tsx` -> consume `data` từ `useProfile()`.
- `context/profile.context.tsx` -> gọi `fetchProfileData()`.
- `services/profile.service.ts` -> đọc mock từ [src/services/mock-data.ts](../../services/mock-data.ts).

## ✅ Trạng thái hiện tại
- Profile server-state đã chạy qua TanStack Query.
- Entry feature mỏng, page chỉ re-export.
- Avatar mock dùng placeholder chung.

## 🧪 Mock data & placeholder images
- Mock profile data được gom ở [src/services/mock-data.ts](../../services/mock-data.ts).
- Nếu có avatar/cover mock, ưu tiên placeholder chung thay vì ảnh ngoài.

## TODO
- Thay `fetchProfileData()` bằng API thật.
- Nối thật các dữ liệu giao dịch/collection khi backend có schema ổn định.