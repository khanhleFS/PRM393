package com.fpt.sba301_su26_groupproject.dto.coin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CoinPurchaseRequestDTO(
        @NotNull(message = "Vui lòng chọn gói coin cần mua.")
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID packageId,
        @NotBlank(message = "Vui lòng chọn phương thức thanh toán.")
        @Pattern(
                regexp = "^(VNPAY|MOMO)$",
                message = "Hệ thống chỉ hỗ trợ phương thức thanh toán VNPAY hoặc MOMO."
        )
        @Schema(example = "VNPAY")
        String paymentMethod
) {}
