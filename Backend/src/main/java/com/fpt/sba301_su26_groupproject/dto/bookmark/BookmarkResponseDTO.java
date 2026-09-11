package com.fpt.sba301_su26_groupproject.dto.bookmark;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record BookmarkResponseDTO(
        @Schema(description = "ID bookmark")
        UUID id,

        @Schema(description = "ID truyện")
        Long novelId,

        @Schema(description = "Tên truyện")
        String novelTitle,

        @Schema(description = "Slug truyện")
        String novelSlug,

        @Schema(description = "URL ảnh bìa")
        String coverImageUrl,

        @Schema(description = "Tên tác giả")
        String authorName,

        @Schema(description = "ID chương gần nhất đang đọc")
        Long lastChapterId,

        @Schema(description = "Số thứ tự chương gần nhất")
        Integer lastChapterNumber,

        @Schema(description = "Tiêu đề chương gần nhất")
        String lastChapterTitle,

        @Schema(description = "Slug chương gần nhất")
        String lastChapterSlug,

        @Schema(description = "Tổng số chương")
        Integer totalChapters,

        @Schema(description = "Trạng thái yêu thích")
        Boolean isFavorite,

        @Schema(description = "Tiến độ đọc (phần trăm 0-100%)")
        Integer readingProgressPercent,

        @Schema(description = "Thời gian tạo")
        Instant createdAt,

        @Schema(description = "Thời gian cập nhật")
        Instant updatedAt
) {}
