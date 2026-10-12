# Tài liệu tính năng: Story Detail (Chi tiết bộ truyện)

## 🎯 Mục đích (Feature for Page)
Feature này phục vụ cho trang **Thông tin Chi tiết Truyện (Story Detail Page)**, ví dụ `[URL]/story/:id`.
Nó đóng vai trò là "Cổng vào" của một bộ truyện, hiển thị Cover Art, Tên, Tác giả, Lượt xem, Thể loại, Đánh giá (Rating), Nút "Đọc Ngay", Danh sách Chương (Chapter List) và khu vực gợi ý/bình luận truyện tương ứng.

## 🧩 Các Components cấu thành
Feature này đã được tái cấu trúc từ dạng nguyên khối sang kiến trúc module linh hoạt, tăng tính bảo trì:

1. **`story-detail-feature.tsx`**: Component cha (Controller), bọc toàn bộ trang trong `StoryDetailProvider` và quản lý trạng thái hiển thị loading chính.
2. **`components/story-banner.tsx`**: Banner thông tin đầu trang chứa bìa truyện (Cover), tựa đề, tác giả, các nút action ("Đọc ngay", "Thêm vào thư viện") và thống kê cơ bản.
3. **`components/story-synopsis.tsx`**: Khu vực giới thiệu ngắn/tóm tắt cốt truyện kèm theo hệ thống tag thể loại.
4. **`components/story-chapters.tsx`**: Bảng điều khiển danh sách chương, hỗ trợ phân trang (Pagination) và sắp xếp thứ tự tăng/giảm dần linh hoạt.
5. **`components/story-recommendations.tsx`**: Đề xuất các bộ truyện liên quan/cùng chủ đề ở thanh Sidebar bên phải.
6. **`components/story-detail-skeleton.tsx`**: Khung xương tải trang gồm `StoryDetailBannerSkeleton`, `StoryChaptersSkeleton` và khối bố cục toàn trang `StoryDetailPageSkeleton` giúp giao diện cực kỳ mượt mà, không bị xê dịch (Layout Shift) khi tải dữ liệu.


## ⚙️ Service & Context
- **Context (`context/story-detail-context.tsx`)**: Đóng vai trò State Manager cục bộ, phân phối dữ liệu bộ truyện (`storyInfo`), danh sách chương (`chapters`), trạng thái thư viện (`inLibrary`), cũng như tính toán phân trang động cho các tab chương truyện.
- **Service (`services/story-detail.service.ts`)**: Quản lý luồng tải thông tin chi tiết và danh sách chương từ máy chủ thông qua `storyDetailService`.

## 🪝 Custom Hooks
- **`useStoryDetailContext()`**: Trích xuất nhanh dữ liệu và điều khiển các hoạt động tương tác (lọc, phân trang, đổi thứ tự chương, toggle thư viện) tại bất kỳ vị trí component nào thuộc cấu trúc trang detail.

## 🔗 Mapping component -> service
- `story-detail-feature.tsx` -> bọc `StoryDetailProvider` và render các section con.
- `components/story-banner.tsx` -> consume `storyInfo` từ context.
- `components/story-synopsis.tsx` -> consume `storyInfo.synopsis` và genres.
- `components/story-chapters.tsx` -> consume `chapters`, `paginatedChapters`, `isSortedAsc`, `currentPage` từ context.
- `components/story-recommendations.tsx` -> lấy `MOCK_STORIES` từ [src/services/mock-data.ts](../../services/mock-data.ts).
- `components/story-banner.tsx` + `context/story-detail-context.tsx` -> gọi `storyDetailService`.

## ✅ Trạng thái hiện tại
- Story detail đã tách rõ server-state và UI-state.
- Cover mock và danh sách gợi ý dùng placeholder chung.

## 🧪 Mock data & placeholder images
- Story detail dùng chung mock story/chapter data từ [src/services/mock-data.ts](../../services/mock-data.ts).
- Ảnh bìa truyện trong mock được thay bằng placeholder thống nhất để dễ nhận diện dữ liệu giả.

## TODO
- Thay `storyDetailService.getStoryInfo()` và `getStoryChapters()` bằng API thật.
- Nối `inLibrary` và trạng thái đọc dở với auth/backend khi có schema chính thức.
