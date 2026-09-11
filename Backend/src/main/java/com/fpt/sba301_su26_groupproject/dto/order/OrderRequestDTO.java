package com.fpt.sba301_su26_groupproject.dto.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OrderRequestDTO(
    @NotNull(message = "ID gói coin không được để trống")
    UUID coinPackageId,

    @Schema(example = "Nap coin cho tai khoan", description = "Mô tả đơn hàng hiển thị trên MoMo (tuỳ chọn)")
    String orderInfo,

    @Schema(example = "captureWallet", defaultValue = "captureWallet",
            description = "Phương thức thanh toán MoMo: captureWallet | payWithATM | payWithCC")
    String requestType,

    @Schema(example = "1", defaultValue = "1", description = "Số lượng gói coin cần mua (mặc định là 1)")
    Integer quantity
) {}
