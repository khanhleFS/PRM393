package com.fpt.sba301_su26_groupproject.dto.order;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record OrderResponseDTO(
    UUID id,
    UUID userId,
    String username,
    UUID coinPackageId,
    String coinPackageName,
    Integer amountVnd,
    Integer coins,
    Integer quantity,
    OrderStatus status,
    LocalDateTime createdAt,

    @Schema(description = "Link thanh toán MoMo — chỉ có khi vừa tạo order, null khi query lại")
    String payUrl
) {}
