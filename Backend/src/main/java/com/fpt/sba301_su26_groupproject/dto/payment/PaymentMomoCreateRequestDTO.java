package com.fpt.sba301_su26_groupproject.dto.payment;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentMomoCreateRequestDTO(
        @NotBlank
        @Schema(example = "ORDER001")
        String orderId,

        @NotNull
        @Min(100)
        @Schema(example = "100000")
        Integer amount,

        @Schema(example = "Test payment")
        String orderInfo,

        @Schema(example = "captureWallet", defaultValue = "captureWallet")
        String requestType
) {}
