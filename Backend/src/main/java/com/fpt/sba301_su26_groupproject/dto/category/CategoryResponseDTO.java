package com.fpt.sba301_su26_groupproject.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.util.UUID;

@Builder
public record CategoryResponseDTO(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID id,
        @Schema(example = "Fantasy")
        String name,
        @Schema(example = "fantasy")
        String slug
) {}
