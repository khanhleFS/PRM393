package com.fpt.sba301_su26_groupproject.dto.coin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.UUID;


@Builder
public record CoinPurchaseResponseDTO(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID paymentId,
        @Schema(example = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
        String paymentUrl,
        @Schema(example = "Starter Pack")
        String packageName,
        @Schema(example = "50000")
        Integer priceVnd,
        @Schema(example = "50")
        Integer baseCoins
) {}
