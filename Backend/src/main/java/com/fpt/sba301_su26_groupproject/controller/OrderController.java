package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCallbackDTO;
import com.fpt.sba301_su26_groupproject.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order APIs", description = "User order and payment management APIs")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Tạo đơn hàng mua gói coin")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @Valid @RequestBody OrderRequestDTO request,
            Authentication authentication) {
        OrderResponseDTO result = orderService.createOrder(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<OrderResponseDTO>builder()
                .code(201)
                .message("Tạo đơn hàng mua gói coin thành công")
                .result(result)
                .build());
    }

    @Operation(summary = "Lấy chi tiết đơn hàng")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<OrderResponseDTO>builder()
                .code(200)
                .message("Lấy chi tiết đơn hàng thành công")
                .result(orderService.getOrderById(id))
                .build());
    }

    @Operation(summary = "Lấy danh sách đơn hàng của tôi")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<OrderResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách đơn hàng thành công")
                .result(orderService.getOrdersByUser(authentication.getName()))
                .build());
    }

    @Operation(summary = "MoMo IPN callback (webhook)")
    @PostMapping("/momo/callback")
    public ResponseEntity<ApiResponse<Void>> momoCallback(@RequestBody PaymentMomoCallbackDTO callback) {
        log.info("Received MoMo IPN callback: orderId={}", callback.orderId());
        orderService.handleMomoCallback(callback);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Callback received")
                .build());
    }

    @Operation(summary = "Sync payment status with MoMo (Query DR)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/sync")
    public ResponseEntity<ApiResponse<Void>> syncPayment(@PathVariable UUID orderId) {
        log.info("Manual sync requested for orderId={}", orderId);
        orderService.syncPaymentStatus(orderId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Payment status synced successfully")
                .build());
    }

    @Operation(summary = "Get payment enums")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.<List<EnumResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách enums thành công")
                .result(orderService.getPaymentEnums())
                .build());
    }

    @Operation(summary = "Tạo lại link thanh toán MoMo cho đơn hàng PENDING")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/payment")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> recreatePayment(
            @PathVariable UUID orderId,
            @RequestParam(required = false, defaultValue = "captureWallet") String requestType) {
        OrderResponseDTO result = orderService.recreatePayment(orderId, requestType);
        return ResponseEntity.ok(ApiResponse.<OrderResponseDTO>builder()
                .code(200)
                .message("Tạo link thanh toán MoMo thành công")
                .result(result)
                .build());
    }
}
