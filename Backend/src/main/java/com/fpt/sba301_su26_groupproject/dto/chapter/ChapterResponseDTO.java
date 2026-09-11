package com.fpt.sba301_su26_groupproject.dto.chapter;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.ChapterStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

@Builder
public record ChapterResponseDTO(
         @Schema(example = "1")
         Long id,
         @Schema(example = "1")
         Long novelId,
         @Schema(example = "1")
         Integer chapterNumber,
         @Schema(example = "Chapter 1: The Beginning")
         String title,
         @Schema(example = "chapter-1-the-beginning")
         String slug,
         @Schema(example = "The night was silent when the journey began...")
         String content,
         @Schema(example = "a1b2c3d4e5f6...")
         String encryptedData,
         @Schema(example = "f6e5d4c3b2a1...")
         String iv,
         @Schema(example = "https://cdn.example.com/audio/chapter-1.mp3")
         String audioUrl,
         @Schema(example = "UNLOCKED")
         ChapterStatus status,
         @Schema(example = "0")
         Integer coinPrice,
         @Schema(example = "325")
         Integer viewCount,
        @Schema(example = "2026-06-09T08:30:00Z")
        Instant createdAt,
         @Schema(example = "2026-06-09T09:00:00Z")
         Instant updateAt
) {
}
