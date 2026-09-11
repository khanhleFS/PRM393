package com.fpt.sba301_su26_groupproject.dto.coin;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CoinCreateRequestDTO(
        @NotBlank(message = "Tên gói coin không được để trống.")
        @Size(max = 100, message = "Tên gói tối đa 100 ký tự.")
        @Schema(example = "Starter Pack")
        String name,
        @NotNull(message = "Giá tiền không được để trống.")
        @Min(value = 1000, message = "Giá tiền tối thiểu là 1,000 VNĐ.")
        @Schema(example = "50000")
        Integer priceVnd,
        @NotNull(message = "Số lượng coin gốc không được để trống.")
        @Min(value = 1, message = "Số lượng coin tối thiểu là 1.")
        @Schema(example = "50")
        Integer baseCoins,
        @NotNull(message = "Vui lòng chỉ định trạng thái kích hoạt của gói.")
        @Schema(example = "true")
        Boolean isActive
) {
    public CoinCreateRequestDTO {
        if (isActive == null) {
            isActive = true;
        }
    }
}
