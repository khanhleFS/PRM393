package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.common.security.CustomUserDetail;
import com.fpt.sba301_su26_groupproject.dto.profile.ProfileDTO;
import com.fpt.sba301_su26_groupproject.dto.profile.CoinTransactionResponseDTO;
import com.fpt.sba301_su26_groupproject.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile APIs", description = "User profile and coin transaction history APIs")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @Operation(
            summary = "Get profile",
            description = "Get current authenticated user's profile",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileDTO>> getProfile() {
        CustomUserDetail userDetail = (CustomUserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ProfileDTO profile = profileService.getProfile(userDetail.getUser().getId());
        return ResponseEntity.ok(ApiResponse.<ProfileDTO>builder()
                .code(200)
                .message("Lấy thông tin cá nhân thành công")
                .result(profile)
                .build());
    }

    @Operation(
            summary = "Update profile",
            description = "Update current authenticated user's profile",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @Valid @RequestBody ProfileDTO profileDTO) {
        CustomUserDetail userDetail = (CustomUserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        profileService.updateProfile(userDetail.getUser().getId(), profileDTO);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Cập nhật thông tin cá nhân thành công")
                .build());
    }

    @Operation(
            summary = "Get coin transaction history",
            description = "Get current authenticated user's coin package purchase history",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<CoinTransactionResponseDTO>>> getCoinTransactions(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<Page<CoinTransactionResponseDTO>>builder()
                .code(200)
                .message("Lấy lịch sử giao dịch coin thành công")
                .result(profileService.getCoinTransactions(authentication.getName(), pageable))
                .build());
    }
}
