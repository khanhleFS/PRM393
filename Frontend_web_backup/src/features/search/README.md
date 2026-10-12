# Tài liệu tính năng: Search (Tìm kiếm & Phân loại)

## 🎯 Mục đích (Feature for Page)
Feature này phục vụ cho trang **Tìm Kiếm / Khám phá Truyện (Advanced Search / Catalog Page)**.
Cung cấp cho người dùng khả năng duyệt kho truyện đồ sộ với các bộ lọc cực kỳ chi tiết (Thể loại, Trạng thái, Sắp xếp), kết hợp với tìm kiếm văn bản trực tiếp. Giao diện được thiết kế hiện đại, cao cấp với hiệu ứng Particles nền.

## 🧩 Các Components cấu thành
Tính năng Search có kiến trúc Modular rất sạch sẽ và hiện đại:

1. **`search-feature.tsx`**: Component Controller, bọc `SearchProvider` và dựng Layout bao quát toàn trang một cách cực kỳ khai báo (declarative) và gọn gàng.
2. **`components/search-header-section.tsx`**: Khối giao diện trên cùng hiển thị tiêu đề, số lượng truyện tìm thấy, thanh input di động và dải quick-filter categories capsule trượt ngang.
3. **`components/search-results-section.tsx`**: Quản lý logic phân tách truyện thành "Đang đọc & Đã mua" vs "Khám phá thêm", render danh sách card hoặc giao diện trống khi không có kết quả.
4. **`components/search-mobile-filters.tsx`**: Bảng điều khiển bộ lọc dạng ngăn kéo trượt lên (Bottom Sheet Drawer) dành riêng cho thiết bị di động.
5. **`components/particle-backdrop.tsx`**: Khối giao diện tạo hiệu ứng nền hạt lấp lánh (Particles) đem lại vẻ đẹp Premium cho trang tìm kiếm.
6. **`components/search-sidebar.tsx`**: Thanh công cụ (Sidebar) chứa các Input Lọc nâng cao hiển thị trên Desktop.
7. **`components/search-card.tsx`**: Component hiển thị thông tin chi tiết một bộ truyện trong khung Grid/List (Thumbnail, Tên, Lượt view, Nút Bookmark).
8. **`components/search-pagination.tsx`**: Thanh phân trang (Pagination) ở dưới cùng.
9. **`components/search-skeleton.tsx`**: Khung Skeleton loading mượt mà hiển thị trong lúc chờ dữ liệu API để tránh Layout Shift.


## ⚙️ Service, Context, Skeleton, Loader
Feature này được xây dựng chuẩn mực theo mô hình Layer:

- **Context (`context/search-context.tsx`)**: Đảm nhiệm State Management cục bộ cho trang Search (giữ trạng thái bộ lọc hiện hành, query chữ, page hiện tại) để tránh Prop-drilling giữa Sidebar và Danh sách truyện.
- **Service (`services/search.service.ts`)**: Tách biệt logic lấy data ra khỏi Component. Có thể đây là nơi chứa API calls `getStories(filters)` hoặc Mock Data logic trả về kết quả truy vấn.
- **Skeleton / Loader**: Có sử dụng `search-skeleton.tsx` đóng vai trò làm Loader riêng biệt siêu nhẹ cho List Truyện.

## 🪝 Custom Hooks
- Nhờ việc sử dụng Context, trang này cung cấp hook **`useSearchContext()`** (nằm bên trong file context) giúp các component con như Pagination, Sidebar, hay Input lấy và cập nhật dữ liệu bộ lọc một cách đồng bộ.

## 🔗 Mapping component -> service
- `search-feature.tsx` -> dựng layout, đọc `useSearchContext()`.
- `components/search-sidebar.tsx` -> dùng `filterGroups`, `categories`, `clearFilters`, `isFiltersLoading` từ context.
- `components/search-card.tsx` -> nhận `Story` + `userReadState` từ context/feature.
- `components/search-pagination.tsx` -> dùng `currentPage` / `setCurrentPage` từ context.
- `context/search-context.tsx` -> gọi `searchService.getStories()` và `searchService.getSearchFilters()`.
- `services/search.service.ts` -> gọi API backend hoặc mapper.

## ✅ Trạng thái hiện tại
- State bộ lọc là local UI state, còn stories/filter metadata là server-state.
- Ảnh cover truyện thống nhất từ backend.

## 🧪 Mock data & placeholder images
- Dữ liệu cho stories và filter scope được xử lý qua [services/search.service.ts](services/search.service.ts).

## TODO
- Đã kết nối `searchService.getStories()` và `searchService.getSearchFilters()` với API thật.
- Khi backend hỗ trợ phân trang thật, chuyển `currentPage` sang query params hoặc server pagination.
