package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.common.security.JwtService;
import com.fpt.sba301_su26_groupproject.common.security.TokenBlacklistService;
import com.fpt.sba301_su26_groupproject.dto.authen.*;
import com.fpt.sba301_su26_groupproject.entity.RefreshTokenRedis;
import com.fpt.sba301_su26_groupproject.repository.RefreshTokenRedisRepository;
import com.fpt.sba301_su26_groupproject.service.AuthenService;
import com.fpt.sba301_su26_groupproject.common.security.CustomUserDetail;
import com.fpt.sba301_su26_groupproject.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth APIs", description = "Authentication APIs (login, register, password management, token refresh)")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenService authenService;

    @Operation(summary = "Login", description = "Authenticate user and return JWT access token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        LoginResponseDTO loginResponse = authenService.login(loginRequestDTO);
        
        ResponseCookie cookie = ResponseCookie.from("refreshToken", loginResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.<LoginResponseDTO>builder()
                        .code(200)
                        .message("Đăng nhập thành công")
                        .result(loginResponse)
                        .build());
    }


    @Operation(
            summary = "Logout",
            description = "Blacklist current JWT access token",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        authenService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Đăng xuất thành công")
                .build());
    }

    @Operation(summary = "Register", description = "Register new user account and send OTP")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        authenService.register(registerRequestDTO);
        return ResponseEntity.ok(ApiResponse.<RegisterResponseDTO>builder()
                .code(200)
                .message("Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.")
                .build());
    }

    @Operation(summary = "Forgot password", description = "Send new password to user's email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<ForgotPasswordResponseDTO>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO requestDTO) {
        ForgotPasswordResponseDTO result = authenService.forgotPassword(requestDTO.email());
        return ResponseEntity.ok(ApiResponse.<ForgotPasswordResponseDTO>builder()
                .code(200)
                .message("Yêu cầu quên mật khẩu thành công")
                .result(result)
                .build());
    }

    @Operation(
            summary = "Reset password",
            description = "Reset password using old password",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<ResetPasswordResponseDTO>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO requestDTO) {
        ResetPasswordResponseDTO result = authenService.resetPassword(requestDTO);
        return ResponseEntity.ok(ApiResponse.<ResetPasswordResponseDTO>builder()
                .code(200)
                .message("Đặt lại mật khẩu thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Verify register OTP", description = "Activate account by register OTP")
    @PostMapping("/verify-register-otp")
    public ResponseEntity<ApiResponse<Void>> verifyRegisterOtp(
            @Valid @RequestBody VerifyOTPRequestDTO requestDTO) {
        authenService.verifyRegisterOtp(requestDTO.email(), requestDTO.otpCode());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Xác thực thành công. Tài khoản đã được kích hoạt.")
                .build());
    }

    @Operation(summary = "Refresh token", description = "Generate new access token and refresh token using existing refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> refresh(
            @RequestBody(required = false) TokenRefreshRequestDTO requestDTO,
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String cookieRefreshToken) {
        
        String tokenToUse = null;
        if (requestDTO != null && requestDTO.refreshToken() != null && !requestDTO.refreshToken().isBlank()) {
            tokenToUse = requestDTO.refreshToken();
        } else if (cookieRefreshToken != null && !cookieRefreshToken.isBlank()) {
            tokenToUse = cookieRefreshToken;
        }

        if (tokenToUse == null) {
            throw new com.fpt.sba301_su26_groupproject.common.exception.ApiException(
                    com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode.UNAUTHORIZED, 
                    "Không tìm thấy Refresh Token");
        }

        LoginResponseDTO refreshResponse = authenService.refreshToken(new TokenRefreshRequestDTO(tokenToUse));

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.<LoginResponseDTO>builder()
                        .code(200)
                        .message("Lấy token mới thành công")
                        .result(refreshResponse)
                        .build());
    }


    @Operation(summary = "Get enums")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(authenService.getEnums())
                .build());
    }

    @Operation(
            summary = "Change author status",
            description = "Admin cấp/thu hồi quyền tác giả cho một user",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/users/{userId}/author-status")
    public ResponseEntity<ApiResponse<Void>> changeAuthorStatus(
            @PathVariable UUID userId,
            @RequestParam boolean isAuthor) {
        authenService.changeAuthorStatus(userId, isAuthor);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message(isAuthor ? "Cấp quyền tác giả thành công" : "Thu hồi quyền tác giả thành công")
                .build());
    }
}
