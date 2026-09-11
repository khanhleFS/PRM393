package com.fpt.sba301_su26_groupproject.dto.profile;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record CoinTransactionResponseDTO(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID transactionId,
        @Schema(example = "Nguyen Van A")
        String userName,
        @Schema(example = "Gói 1000 coin")
        String packageName,
        @Schema(example = "50000")
        Integer amount,
        @Schema(example = "TOP_UP")
        String transactionType,
        @Schema(example = "VNPAY")
        String paymentMethod,
        @Schema(example = "SUCCESS")
        String status,
        @Schema(example = "2026-06-09T08:30:00Z")
        Instant createdAt
) {}
