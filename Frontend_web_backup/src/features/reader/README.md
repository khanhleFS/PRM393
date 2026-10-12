# Tài liệu tính năng: Reader (Đọc truyện)

## 🎯 Mục đích (Feature for Page)
Feature này chịu trách nhiệm cho trang **Đọc Truyện (Reader Page)**, ví dụ `[URL]/story/:id/chapter/:id`.
Nó cung cấp một trải nghiệm đọc truyện đắm chìm (Immersive) với các tính năng tùy biến mạnh mẽ: thay đổi chủ đề (Sáng/Đêm/Màu Kem/Màu Ngà/Màu Than), phông chữ, cỡ chữ, giãn dòng, độ sáng và cung cấp công cụ cuộn siêu mượt.

## 🧩 Các Components cấu thành
Feature này bao gồm Component cha (Controller) và các Component con tái sử dụng:

1. **`reader-feature.tsx`**: File entry mỏng. Chỉ khởi tạo `ReaderProvider` và truyền chapter slug từ route vào `ReaderContent`.
2. **`components/reader-content.tsx`**: Container UI chính của reader, gom toàn bộ layout, HUD, modal và tương tác đọc.
3. **`components/chapter-selector.tsx`**: Thanh chuyển đổi chương (Nút Lùi / Nút Tới / Dropdown chọn chương) xuất hiện đối xứng ở đầu và cuối nội dung.
4. **`components/dock.tsx`**: Thanh công cụ thao tác trôi nổi (điều hướng nhanh, bật/tắt fullscreen, mở cài đặt).
5. **`components/reader-config-menu.tsx`**: Menu tùy chỉnh giao diện (Thay đổi Font, Size, Theme). Lõi này được sử dụng chung cho cả giao diện Modal (trên Desktop) và Drawer (trên Mobile) nhằm giữ nguyên tắc DRY.
6. **`components/reader-suggestions.tsx`**: Cụm danh sách gợi ý "Truyện cùng thể loại" xuất hiện ở cuối trang.
7. **`components/reader-skeleton.tsx`**: Khung xương tải trang (Skeleton Loader) hoạt động đồng bộ với trạng thái loading để đem lại trải nghiệm mượt mà nhất.

## ⚙️ Service & Context
- **Context (`context/reader-context.tsx`)**: Quản lý tập trung toàn bộ cấu hình đọc của người dùng (chủ đề, phông chữ, giãn cách dòng, độ sáng, full-frame) và theo dõi trạng thái `isLoading` khi chuyển chương. Đồng bộ hóa mượt mà các thiết lập đọc trực tiếp vào `localStorage` của trình duyệt.
- **Service (`services/reader.service.ts`)**: Cung cấp `readerService` tải và giải mã nội dung chương truyện theo thiết kế bất đồng bộ chuẩn xác.

## 🪝 Custom Hooks
- **`useReaderContext()`**: Hook cục bộ giúp tất cả các thành phần UI (Dock, Selector, ConfigMenu) truy cập và cập nhật nhanh chóng trạng thái cấu hình của trình đọc mà không lo ngại prop-drilling.

## 🔗 Mapping component -> service
- `reader-feature.tsx` -> khởi tạo `ReaderProvider` và truyền `chapterSlug` vào `ReaderContent`.
- `components/reader-content.tsx` -> dựng toàn bộ UI reader, HUD, modal và điều hướng.
- `components/chapter-selector.tsx` -> đọc chapter navigation state từ context.
- `components/dock.tsx` -> điều khiển điều hướng/fullscreen/cài đặt từ context.
- `components/reader-config-menu.tsx` -> consume cấu hình đọc từ context.
- `components/reader-suggestions.tsx` -> dùng `MOCK_STORIES` từ [src/services/mock-data.ts](../../services/mock-data.ts).
- `services/reader.service.ts` -> cấp nội dung chapter từ backend/decryption.

## ✅ Trạng thái hiện tại
- Reader context vẫn là local UI-state, còn chapter content là mock service.
- Feature entry đã được tách ra khỏi phần render lớn, chỉ còn orchestration tối thiểu.
- Ảnh gợi ý truyện nếu không có sẽ dùng placeholder chung.

## 🧪 Mock data & placeholder images
- Reader lấy danh sách truyện gợi ý từ nguồn mock dùng chung ở [src/services/mock-data.ts](../../services/mock-data.ts).
- Nếu cần ảnh thay thế, ưu tiên placeholder thống nhất thay vì URL ảnh thật.

## TODO
- Thay `readerService.getChapter()` bằng API thật.
- Đồng bộ chapter navigation với backend khi có dữ liệu chapter index chính thức.
