package com.fpt.sba301_su26_groupproject.dto.authen;

import io.swagger.v3.oas.annotations.media.Schema;

public record TokenRefreshRequestDTO(
        @Schema(description = "Refresh token (tùy chọn nếu dùng cookie)", example = "eyJhbGciOiJIUzI1NiJ9...")
        String refreshToken
) {
}
