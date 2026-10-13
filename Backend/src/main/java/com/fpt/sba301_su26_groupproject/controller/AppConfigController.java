package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.app.AppConfigResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app")
@Tag(name = "App Config APIs", description = "APIs for Mobile App configuration and version check")
public class AppConfigController {

    @Value("${app.mobile.latest-version:1.0.0}")
    private String latestVersion;

    @Value("${app.mobile.min-supported-version:1.0.0}")
    private String minSupportedVersion;

    @Value("${app.mobile.force-update:false}")
    private Boolean forceUpdate;

    @Value("${app.mobile.download-url:https://example.com/novel-app.apk}")
    private String downloadUrl;

    @Value("${app.mobile.maintenance:false}")
    private Boolean maintenanceMode;

    @Value("${app.mobile.announcement:}")
    private String announcement;

    @Operation(summary = "Get Mobile App configuration and version info")
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<AppConfigResponseDTO>> getAppConfig() {
        AppConfigResponseDTO config = AppConfigResponseDTO.builder()
                .latestVersion(latestVersion)
                .minSupportedVersion(minSupportedVersion)
                .forceUpdate(forceUpdate)
                .downloadUrl(downloadUrl)
                .maintenanceMode(maintenanceMode)
                .announcement(announcement)
                .build();

        return ResponseEntity.ok(ApiResponse.<AppConfigResponseDTO>builder()
                .code(200)
                .message("Lấy thông tin cấu hình ứng dụng thành công")
                .result(config)
                .build());
    }
}
