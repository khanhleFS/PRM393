package com.fpt.sba301_su26_groupproject.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.v3.oas.annotations.media.Schema;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaymentMomoCallbackDTO(
        @Schema(example = "MOMO")
        String partnerCode,
        @Schema(example = "REQUEST_ID_123")
        String requestId,
        @Schema(example = "ORDER001")
        String orderId,
        @Schema(example = "100000")
        Integer amount,
        @Schema(example = "test order")
        String orderInfo,
        @Schema(example = "captureWallet")
        String orderType,
        @Schema(example = "0")
        String resultCode,
        @Schema(example = "Payment successful")
        String message,
        @Schema(example = "QR_CODE")
        String payType,
        @Schema(example = "some transaction id")
        String transId,
        @Schema(example = "1710000000000")
        Long responseTime,
        @Schema(example = "")
        String extraData,
        @Schema(example = "signature-value")
        String signature
) {}
