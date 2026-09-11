package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.coin.CoinCreateRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.coin.CoinCreateResponseDTO;
import com.fpt.sba301_su26_groupproject.service.CoinPackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coin-packages")
@Tag(name = "Coin Package APIs", description = "Coin package public and admin APIs")
@RequiredArgsConstructor
public class CoinController {

    private final CoinPackageService coinPackageService;

    @Operation(summary = "Get active coin packages")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CoinCreateResponseDTO>>> getActivePackages() {
        return ResponseEntity.ok(ApiResponse.<List<CoinCreateResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách gói coin thành công")
                .result(coinPackageService.getActivePackages())
                .build());
    }

    @Operation(
            summary = "Get all coin packages",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CoinCreateResponseDTO>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.<List<CoinCreateResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách tất cả gói coin thành công")
                .result(coinPackageService.getAllPackages())
                .build());
    }

    @Operation(
            summary = "Create coin package",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CoinCreateResponseDTO>> createPackage(
            @Valid @RequestBody CoinCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CoinCreateResponseDTO>builder()
                .code(201)
                .message("Tạo gói coin thành công")
                .result(coinPackageService.createPackage(request))
                .build());
    }

    @Operation(
            summary = "Update coin package",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CoinCreateResponseDTO>> updatePackage(
            @PathVariable UUID id,
            @Valid @RequestBody CoinCreateRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.<CoinCreateResponseDTO>builder()
                .code(200)
                .message("Cập nhật gói coin thành công")
                .result(coinPackageService.updatePackage(id, request))
                .build());
    }

    @Operation(
            summary = "Toggle coin package status",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CoinCreateResponseDTO>> togglePackage(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<CoinCreateResponseDTO>builder()
                .code(200)
                .message("Cập nhật trạng thái gói coin thành công")
                .result(coinPackageService.togglePackageStatus(id))
                .build());
    }

    @Operation(
            summary = "Delete coin package",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePackage(
            @PathVariable UUID id) {
        coinPackageService.deletePackage(id);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Xóa gói coin thành công")
                .build());
    }

    @Operation(summary = "Get enums")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(coinPackageService.getEnums())
                .build());
    }
}
