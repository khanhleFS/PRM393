package com.fpt.sba301_su26_groupproject.dto.novel;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.util.UUID;

@Builder
public record ChapterStatsDTO(
        @Schema(example = "1")
        Long chapterId,
        
        @Schema(example = "1")
        int chapterNumber,
        
        @Schema(example = "Chương 1: Xuyên không")
        String title,
        
        @Schema(example = "Free")
        String status,
        
        @Schema(example = "50000")
        long viewCount,
        
        @Schema(example = "0")
        long revenue,
        
        @Schema(example = "100.0")
        double conversionRate
) {}
