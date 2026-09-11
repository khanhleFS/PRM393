package com.fpt.sba301_su26_groupproject.dto.coin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Builder
public record CoinCreateResponseDTO(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID id,
        @Schema(example = "Starter Pack")
        String name,
        @Schema(example = "50000")
        Integer priceVnd,
        @Schema(example = "50")
        Integer baseCoins,
        @Schema(example = "true")
        Boolean isActive,
        @Schema(example = "2026-06-09T08:30:00Z")
        Instant createdAt,
        @Schema(example = "2026-06-09T09:00:00Z")
        Instant updatedAt
) {}
