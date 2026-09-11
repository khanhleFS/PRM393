package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelPageResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelStatsResponseDTO;
import com.fpt.sba301_su26_groupproject.service.NovelService;
import com.fpt.sba301_su26_groupproject.service.ChapterService;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterUnlockResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.service.UploadService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api")
@Tag(name = "Novel APIs", description = "Novel management APIs")
@RequiredArgsConstructor
public class NovelController {

    private final NovelService novelService;
    private final ChapterService chapterService;
    private final UploadService uploadService;

    @Operation(
            summary = "Create novel",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/author/novels")
    public ResponseEntity<ApiResponse<NovelResponseDTO>> createNovel(
            @Valid @RequestBody NovelRequestDTO request,
            Authentication authentication) {
        NovelResponseDTO result = novelService.createNovel(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<NovelResponseDTO>builder()
                .code(201)
                .message("Bộ truyện được tạo thành công")
                .result(result)
                .build());
    }

    @Operation(
            summary = "Get my novels",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/author/novels")
    public ResponseEntity<ApiResponse<List<NovelResponseDTO>>> getMyNovels(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<NovelResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách bộ truyện của tác giả thành công")
                .result(novelService.getAllNovelsByAuthor(authentication.getName()))
                .build());
    }

    @Operation(
            summary = "Get novel by ID (Author)",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/author/novels/{id}")
    public ResponseEntity<ApiResponse<NovelResponseDTO>> getNovelById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<NovelResponseDTO>builder()
                .code(200)
                .message("Lấy thông tin bộ truyện thành công")
                .result(novelService.getNovelById(id))
                .build());
    }

    @Operation(summary = "Search novels (Guest/Reader)")
    @GetMapping("/novels")
    public ResponseEntity<ApiResponse<NovelPageResponseDTO>> searchNovels(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minChapters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.<NovelPageResponseDTO>builder()
                .code(200)
                .message("Lấy danh sách truyện thành công")
                .result(novelService.searchNovels(q, status, category, minChapters, page, size))
                .build());
    }


    @Operation(summary = "Get novel by ID or slug (Guest/Reader)")
    @GetMapping("/novels/{id}")
    public ResponseEntity<ApiResponse<NovelResponseDTO>> getPublicNovelById(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<NovelResponseDTO>builder()
                .code(200)
                .message("Lấy thông tin bộ truyện thành công")
                .result(novelService.getNovelByIdentifier(id))
                .build());
    }

    @Operation(summary = "Get novel enums (Public)")
    @GetMapping("/novels/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getPublicEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(novelService.getEnums())
                .build());
    }

    @Operation(
            summary = "Update novel",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PutMapping("/author/novels/{id}")
    public ResponseEntity<ApiResponse<NovelResponseDTO>> updateNovel(
            @PathVariable Long id,
            @Valid @RequestBody NovelRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<NovelResponseDTO>builder()
                .code(200)
                .message("Cập nhật thông tin bộ truyện thành công")
                .result(novelService.updateNovel(id, request, authentication.getName()))
                .build());
    }

    @Operation(
            summary = "Delete novel",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @DeleteMapping("/author/novels/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNovel(
            @PathVariable Long id,
            Authentication authentication) {
        novelService.deleteNovel(id, authentication.getName());

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Xóa bộ truyện thành công")
                .build());
    }

    @Operation(summary = "Get enums")
    @GetMapping("/author/novels/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(novelService.getEnums())
                .build());
    }

    @Operation(
            summary = "Get novel statistics (Dashboard & Charts)",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/author/novels/{id}/stats")
    public ResponseEntity<ApiResponse<NovelStatsResponseDTO>> getNovelStats(
            @PathVariable Long id,
            Authentication authentication) {
        NovelStatsResponseDTO result = novelService.getNovelStats(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.<NovelStatsResponseDTO>builder()
                .code(200)
                .message("Lấy thống kê chi tiết bộ truyện thành công")
                .result(result)
                .build());
    }

    @Operation(
            summary = "Upload image",
            description = "Upload image file and return image URL",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping(value = "/author/novels/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(200)
                .message("Tải ảnh lên thành công")
                .result(uploadService.uploadImage(file))
                .build());
    }

    // --- Chapters API ---

    @Operation(
            summary = "Create chapter",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/author/novels/{novelId}/chapters")
    public ResponseEntity<ApiResponse<ChapterResponseDTO>> createChapter(
            @PathVariable Long novelId,
            @Valid @RequestBody ChapterRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ChapterResponseDTO>builder()
                .code(201)
                .message("Chương truyện được tạo thành công")
                .result(chapterService.createChapter(novelId, request, authentication.getName()))
                .build());
    }

    @Operation(summary = "Get chapters by novel")
    @GetMapping("/novels/{novelId}/chapters")
    public ResponseEntity<ApiResponse<List<ChapterResponseDTO>>> getChaptersByNovel(
            @PathVariable String novelId,
            Authentication authentication) {
        String userEmail = authentication == null ? null : authentication.getName();
        Long resolvedNovelId = novelService.findEntityByIdentifier(novelId).getId();
        return ResponseEntity.ok(ApiResponse.<List<ChapterResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách chương truyện thành công")
                .result(chapterService.getChaptersByNovel(resolvedNovelId, userEmail))
                .build());
    }

    @Operation(summary = "Get chapter details")
    @GetMapping("/novels/{novelId}/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponseDTO>> getChapterDetails(
            @PathVariable String novelId,
            @PathVariable Long chapterId,
            Authentication authentication) {
        String userEmail = authentication == null ? null : authentication.getName();
        Long resolvedNovelId = novelService.findEntityByIdentifier(novelId).getId();

        return ResponseEntity.ok(ApiResponse.<ChapterResponseDTO>builder()
                .code(200)
                .message("Lấy thông tin chương truyện thành công")
                .result(chapterService.getChapterDetails(resolvedNovelId, chapterId, userEmail))
                .build());
    }

    @Operation(summary = "User reads a chapter (Increments view, saves history etc.)")
    @PostMapping("/novels/{novelId}/chapters/{chapterId}/read")
    public ResponseEntity<ApiResponse<ChapterResponseDTO>> readChapter(
            @PathVariable String novelId,
            @PathVariable Long chapterId,
            Authentication authentication) {
        String userEmail = authentication == null ? null : authentication.getName();
        Long resolvedNovelId = novelService.findEntityByIdentifier(novelId).getId();

        return ResponseEntity.ok(ApiResponse.<ChapterResponseDTO>builder()
                .code(200)
                .message("Đọc chương truyện thành công")
                .result(chapterService.readChapter(resolvedNovelId, chapterId, userEmail))
                .build());
    }

    @Operation(
            summary = "Update chapter",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PutMapping("/author/novels/{novelId}/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponseDTO>> updateChapter(
            @PathVariable Long novelId,
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<ChapterResponseDTO>builder()
                .code(200)
                .message("Cập nhật chương truyện thành công")
                .result(chapterService.updateChapter(novelId, chapterId, request, authentication.getName()))
                .build());
    }

    @Operation(
            summary = "Delete chapter",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @DeleteMapping("/author/novels/{novelId}/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(
            @PathVariable Long novelId,
            @PathVariable Long chapterId,
            Authentication authentication) {
        chapterService.deleteChapter(novelId, chapterId, authentication.getName());

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Xóa chương truyện thành công")
                .build());
    }

    @Operation(summary = "Generate chapter audio")
    @PostMapping("/novels/{novelId}/chapters/{chapterId}/audio")
    public ResponseEntity<ApiResponse<ChapterResponseDTO>> generateChapterAudio(
            @PathVariable Long novelId,
            @PathVariable Long chapterId) {
        return ResponseEntity.ok(ApiResponse.<ChapterResponseDTO>builder()
                .code(200)
                .message("Tạo audio cho chương truyện thành công")
                .result(chapterService.generateChapterAudio(novelId, chapterId))
                .build());
    }

    @Operation(
            summary = "Unlock chapter with coins",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/novels/{novelId}/chapters/{chapterId}/unlock")
    public ResponseEntity<ApiResponse<ChapterUnlockResponseDTO>> unlockChapter(
            @PathVariable Long novelId,
            @PathVariable Long chapterId,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<ChapterUnlockResponseDTO>builder()
                .code(200)
                .message("Mở khóa chương truyện thành công")
                .result(chapterService.unlockChapter(novelId, chapterId, authentication.getName()))
                .build());
    }

    @Operation(summary = "Get enums")
    @GetMapping("/novels/chapters/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getChapterEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(chapterService.getEnums())
                .build());
    }
}
