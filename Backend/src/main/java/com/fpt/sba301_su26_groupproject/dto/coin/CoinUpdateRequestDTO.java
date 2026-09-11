package com.fpt.sba301_su26_groupproject.dto.coin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

public record CoinUpdateRequestDTO(
        @Size(max = 100, message = "Tên gói coin tối đa 100 ký tự.")
        @Schema(example = "Premium Pack")
        String name,
        @Min(value = 1000, message = "Giá tiền cập nhật tối thiểu là 1,000 VNĐ.")
        @Schema(example = "100000")
        Integer priceVnd,
        @Min(value = 1, message = "Số lượng coin cập nhật tối thiểu là 1.")
        @Schema(example = "120")
        Integer baseCoins,
        @Schema(example = "true")
        Boolean isActive
) {}
