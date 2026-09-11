package com.fpt.sba301_su26_groupproject.dto.payment;

import io.swagger.v3.oas.annotations.media.Schema;

public record PaymentMomoCreateResponseDTO(
        @Schema(example = "https://test-payment.momo.vn/v2/gateway/api/pay?...")
        String payUrl,
        @Schema(example = "ORDER001")
        String orderId
) {}
