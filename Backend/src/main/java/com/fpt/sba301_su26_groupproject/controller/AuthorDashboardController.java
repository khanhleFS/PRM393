package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorDashboardDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorPaymentTicketDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileResponseDTO;
import com.fpt.sba301_su26_groupproject.service.AuthorPaymentTicketService;
import com.fpt.sba301_su26_groupproject.service.AuthorProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/author")
@Tag(name = "Author Dashboard APIs", description = "APIs dành cho phân hệ Tác giả (hồ sơ, ví coin tác giả, dashboard, tickets)")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class AuthorDashboardController {

    private final AuthorProfileService authorProfileService;
    private final AuthorPaymentTicketService authorPaymentTicketService;

    @Operation(summary = "Lấy hồ sơ Tác giả cá nhân")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AuthorProfileResponseDTO>> getMyProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        AuthorProfileResponseDTO result = authorProfileService.getMyAuthorProfile(userEmail);
        return ResponseEntity.ok(ApiResponse.<AuthorProfileResponseDTO>builder()
                .code(200)
                .message("Lấy hồ sơ tác giả thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Cập nhật hồ sơ Tác giả cá nhân")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthorProfileResponseDTO>> updateMyProfile(
            @Valid @RequestBody AuthorProfileRequestDTO requestDTO,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AuthorProfileResponseDTO result = authorProfileService.updateMyAuthorProfile(requestDTO, userEmail);
        return ResponseEntity.ok(ApiResponse.<AuthorProfileResponseDTO>builder()
                .code(200)
                .message("Cập nhật hồ sơ tác giả thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Lấy tổng quan Author Dashboard", description = "Bao gồm thống kê truyện, views, ví coin tác giả và tickets gần nhất")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AuthorDashboardDTO>> getDashboard(Authentication authentication) {
        String userEmail = authentication.getName();
        AuthorDashboardDTO result = authorProfileService.getAuthorDashboard(userEmail);
        return ResponseEntity.ok(ApiResponse.<AuthorDashboardDTO>builder()
                .code(200)
                .message("Lấy thông tin Author Dashboard thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Lấy danh sách Ticket quyết toán doanh thu hàng tháng")
    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<AuthorPaymentTicketDTO>>> getMyTickets(Authentication authentication) {
        String userEmail = authentication.getName();
        List<AuthorPaymentTicketDTO> result = authorPaymentTicketService.getMyTickets(userEmail);
        return ResponseEntity.ok(ApiResponse.<List<AuthorPaymentTicketDTO>>builder()
                .code(200)
                .message("Lấy danh sách phiếu quyết toán thành công")
                .result(result)
                .build());
    }
}
