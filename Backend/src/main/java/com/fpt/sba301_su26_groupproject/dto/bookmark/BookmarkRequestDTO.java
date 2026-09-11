package com.fpt.sba301_su26_groupproject.dto.bookmark;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

public record BookmarkRequestDTO(
        @Schema(description = "ID truyện", example = "1")
        Long novelId,

        @Schema(description = "ID chương gần nhất đang đọc", example = "2")
        Long lastChapterId,

        @Schema(description = "Tiến độ đọc (phần trăm 0-100%)", example = "100")
        Integer readingProgressPercent,

        @Schema(description = "Trạng thái yêu thích truyện", example = "true")
        Boolean isFavorite
) {}
