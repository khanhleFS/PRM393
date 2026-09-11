package com.fpt.sba301_su26_groupproject.dto.novel;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.NovelStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record NovelResponseDTO(
        @Schema(example = "1")
        Long id,
        @Schema(example = "The Last Kingdom")
        String title,
        @Schema(example = "the-last-kingdom")
        String slug,
        @Schema(example = "A fantasy novel about war, loyalty, and destiny.")
        String description,
        @Schema(example = "https://cdn.example.com/covers/the-last-kingdom.jpg")
        String coverImageUrl,
        @Schema(example = "ONGOING")
        NovelStatus status,
        @Schema(example = "1520")
        Integer viewCount,
        @Schema(example = "42")
        Integer chapterCount,
        @Schema(example = "2026-06-09T08:30:00Z")
        Instant createdAt,
        @Schema(example = "2026-06-09T09:00:00Z")
        Instant updatedAt,
        @Schema(example = "78f6a7c2-3d9a-4c12-9b43-9ef5b9b71a11")
        UUID authorId,
        @Schema(example = "Nguyen Van A")
        String authorName,
        @Schema(example = "[\"Fantasy\", \"Adventure\"]")
        List<String> categories
) {}
