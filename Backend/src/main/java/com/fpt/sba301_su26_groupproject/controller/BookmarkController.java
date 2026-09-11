package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkResponseDTO;
import com.fpt.sba301_su26_groupproject.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookmarks")
@Tag(name = "Bookmark APIs", description = "Bookmark & Reading Progress APIs")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final com.fpt.sba301_su26_groupproject.service.NovelService novelService;

    @Operation(
            summary = "Upsert bookmark (tạo mới hoặc cập nhật)",
            description = "Tạo mới bookmark nếu chưa có, cập nhật nếu đã tồn tại. " +
                    "Dùng để bookmark truyện (isFavorite=true) và lưu tiến độ đọc (lastChapterId, lastPage).",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping
    public ResponseEntity<ApiResponse<BookmarkResponseDTO>> upsertBookmark(
            @RequestBody BookmarkRequestDTO request,
            Authentication authentication) {
        BookmarkResponseDTO result = bookmarkService.upsertBookmark(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<BookmarkResponseDTO>builder()
                        .code(200)
                        .message("Bookmark đã được lưu thành công")
                        .result(result)
                        .build()
        );
    }

    @Operation(
            summary = "Xóa bookmark",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @DeleteMapping("/{novelId}")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable String novelId,
            Authentication authentication) {
        Long resolvedNovelId = novelService.findEntityByIdentifier(novelId).getId();
        bookmarkService.removeBookmark(resolvedNovelId, authentication.getName());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Xóa bookmark thành công")
                        .build()
        );
    }

    @Operation(
            summary = "Lấy thông tin bookmark của user cho 1 novel",
            description = "Trả về null nếu user chưa bookmark novel này.",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/{novelId}")
    public ResponseEntity<ApiResponse<BookmarkResponseDTO>> getBookmark(
            @PathVariable String novelId,
            Authentication authentication) {
        Long resolvedNovelId = novelService.findEntityByIdentifier(novelId).getId();
        BookmarkResponseDTO result = bookmarkService.getBookmark(resolvedNovelId, authentication.getName());
        return ResponseEntity.ok(
                ApiResponse.<BookmarkResponseDTO>builder()
                        .code(200)
                        .message("Lấy thông tin bookmark thành công")
                        .result(result)
                        .build()
        );
    }

    @Operation(
            summary = "Lấy toàn bộ bookmark của user hiện tại",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookmarkResponseDTO>>> getMyBookmarks(
            Authentication authentication) {
        List<BookmarkResponseDTO> result = bookmarkService.getMyBookmarks(authentication.getName());
        return ResponseEntity.ok(
                ApiResponse.<List<BookmarkResponseDTO>>builder()
                        .code(200)
                        .message("Lấy danh sách bookmark thành công")
                        .result(result)
                        .build()
        );
    }
}
