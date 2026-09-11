package com.fpt.sba301_su26_groupproject.dto.app;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
public record AppConfigResponseDTO(
        @Schema(example = "1.0.0", description = "Phiên bản mới nhất của ứng dụng di động")
        String latestVersion,

        @Schema(example = "1.0.0", description = "Phiên bản tối thiểu được hỗ trợ")
        String minSupportedVersion,

        @Schema(example = "false", description = "Bắt buộc người dùng phải cập nhật lên bản mới")
        Boolean forceUpdate,

        @Schema(example = "https://example.com/novel-app.apk", description = "Đường dẫn tải file APK hoặc link Store")
        String downloadUrl,

        @Schema(example = "false", description = "Trạng thái bảo trì hệ thống cho app")
        Boolean maintenanceMode,

        @Schema(example = "Chào mừng bạn đến với ứng dụng đọc truyện!", description = "Thông báo hệ thống hoặc tin tức nổi bật")
        String announcement
) {}
