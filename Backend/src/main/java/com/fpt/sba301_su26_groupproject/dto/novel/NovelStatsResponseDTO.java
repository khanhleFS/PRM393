package com.fpt.sba301_su26_groupproject.dto.novel;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.util.List;

@Builder
public record NovelStatsResponseDTO(
        @Schema(example = "1250400")
        long totalViews,
        
        @Schema(example = "450000")
        long totalRevenue,
        
        @Schema(example = "12.5")
        double avgConversionRate,
        
        List<ChapterStatsDTO> chapters
) {}
