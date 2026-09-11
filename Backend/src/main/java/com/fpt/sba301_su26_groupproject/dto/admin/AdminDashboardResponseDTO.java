package com.fpt.sba301_su26_groupproject.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record AdminDashboardResponseDTO(
        @Schema(example = "1284")
        long totalUsers,

        @Schema(example = "98")
        long totalAuthors,

        @Schema(example = "342")
        long totalNovels,

        @Schema(description = "Tổng doanh thu VND từ đơn hàng COMPLETED", example = "125000000")
        long totalRevenueVnd,

        @Schema(description = "Doanh thu ròng của nền tảng (25% hoa hồng)", example = "31250000")
        long platformRevenueVnd,

        @Schema(description = "Doanh thu theo từng tháng trong năm hiện tại (index 0 = Tháng 1)")
        List<Long> monthlyRevenueVnd,

        @Schema(description = "Doanh thu nạp ví theo 7 ngày trong tuần hiện tại (T2 đến CN)")
        List<Long> weeklyRevenueVnd,

        @Schema(description = "5 giao dịch gần đây nhất")
        List<RecentOrderDTO> recentOrders
) {
    @Builder
    public record RecentOrderDTO(
            UUID orderId,
            String userEmail,
            String username,
            @Schema(example = "100000")
            int amountVnd,
            @Schema(example = "550")
            int coins,
            @Schema(example = "COMPLETED")
            String status,
            @Schema(example = "2025-07-20T08:00:00")
            String createdAt
    ) {}
}
