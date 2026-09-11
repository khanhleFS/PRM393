package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.admin.AdminDashboardResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.admin.AdminUserResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorPaymentTicketDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;
import com.fpt.sba301_su26_groupproject.service.AdminDashboardService;
import com.fpt.sba301_su26_groupproject.service.AdminManagementService;
import com.fpt.sba301_su26_groupproject.service.AuthorPaymentTicketService;
import com.fpt.sba301_su26_groupproject.service.AuthorProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.fpt.sba301_su26_groupproject.dto.author.CreateAuthorRequestDTO;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin APIs", description = "Admin management APIs (dashboard, users, orders, author payouts)")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminDashboardService adminDashboardService;
    private final AdminManagementService adminManagementService;
    private final AuthorProfileService authorProfileService;
    private final AuthorPaymentTicketService authorPaymentTicketService;

    @Operation(
            summary = "Get admin dashboard statistics",
            description = "Trả về tổng số user, tác giả, truyện, doanh thu, biểu đồ theo tháng và giao dịch gần đây."
    )
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponseDTO>> getDashboard() {
        AdminDashboardResponseDTO result = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.<AdminDashboardResponseDTO>builder()
                .code(200)
                .message("Lấy thống kê dashboard thành công")
                .result(result)
                .build());
    }

    @Operation(
            summary = "Get all users",
            description = "Trả về toàn bộ danh sách người dùng cho Admin."
    )
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponseDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.<List<AdminUserResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách người dùng thành công")
                .result(adminManagementService.getAllUsers())
                .build());
    }

    @Operation(
            summary = "Get all orders",
            description = "Trả về toàn bộ danh sách đơn hàng cho Admin."
    )
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.<List<OrderResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách đơn hàng thành công")
                .result(adminManagementService.getAllOrders())
                .build());
    }

    @Operation(
            summary = "Toggle user ban status",
            description = "Banned/unbanned user bằng cách đảo trạng thái isActive."
    )
    @PutMapping("/users/{userId}/toggle-ban")
    public ResponseEntity<ApiResponse<Void>> toggleBanUser(@PathVariable UUID userId) {
        adminManagementService.toggleBanUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Thay đổi trạng thái tài khoản thành công")
                .build());
    }

    // =========================================================================
    // Author Profiles & Payout Tickets Management
    // =========================================================================

    @Operation(summary = "Admin tạo tài khoản Tác giả", description = "Tạo mới tài khoản User vai trò AUTHOR và khởi tạo AuthorProfile đi kèm")
    @PostMapping("/authors")
    public ResponseEntity<ApiResponse<AuthorProfileResponseDTO>> createAuthorAccount(
            @Valid @RequestBody CreateAuthorRequestDTO requestDTO) {
        AuthorProfileResponseDTO result = authorProfileService.createAuthorAccountByAdmin(requestDTO);
        return ResponseEntity.ok(ApiResponse.<AuthorProfileResponseDTO>builder()
                .code(200)
                .message("Tạo tài khoản Tác giả thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Admin xem danh sách tất cả hồ sơ Tác giả")
    @GetMapping("/author-profiles")
    public ResponseEntity<ApiResponse<List<AuthorProfileResponseDTO>>> getAllAuthorProfiles() {
        List<AuthorProfileResponseDTO> result = authorProfileService.getAllAuthorProfiles();
        return ResponseEntity.ok(ApiResponse.<List<AuthorProfileResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách hồ sơ tác giả thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Admin xem danh sách phiếu quyết toán Ticket hàng tháng", description = "Lọc theo status UNPAID, PAID, CANCELLED")
    @GetMapping("/author-payouts/tickets")
    public ResponseEntity<ApiResponse<List<AuthorPaymentTicketDTO>>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {
        List<AuthorPaymentTicketDTO> result = authorPaymentTicketService.getAllTickets(status);
        return ResponseEntity.ok(ApiResponse.<List<AuthorPaymentTicketDTO>>builder()
                .code(200)
                .message("Lấy danh sách phiếu quyết toán thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Admin xác nhận đã chuyển khoản thanh toán cho Ticket")
    @PutMapping("/author-payouts/tickets/{ticketId}/pay")
    public ResponseEntity<ApiResponse<AuthorPaymentTicketDTO>> processTicketPayment(
            @PathVariable UUID ticketId,
            @RequestParam(required = false) String transactionRef,
            @RequestParam(defaultValue = "PAID") TicketStatus status) {
        AuthorPaymentTicketDTO result = authorPaymentTicketService.processTicketPayment(ticketId, transactionRef, status);
        return ResponseEntity.ok(ApiResponse.<AuthorPaymentTicketDTO>builder()
                .code(200)
                .message("Xác nhận thanh toán Ticket thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Kích hoạt thủ công chốt sổ doanh thu tháng này (Scheduler Test)")
    @PostMapping("/author-payouts/trigger-scheduler")
    public ResponseEntity<ApiResponse<Void>> triggerMonthlyScheduler() {
        authorPaymentTicketService.generateMonthlyTickets();
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Đã kích hoạt thủ công chốt sổ doanh thu tháng thành công")
                .build());
    }
}
