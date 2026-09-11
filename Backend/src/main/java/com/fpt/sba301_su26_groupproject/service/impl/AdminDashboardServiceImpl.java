package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.dto.admin.AdminDashboardResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Order;
import com.fpt.sba301_su26_groupproject.repository.NovelRepository;
import com.fpt.sba301_su26_groupproject.repository.OrderRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final NovelRepository novelRepository;
    private final OrderRepository orderRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public AdminDashboardResponseDTO getDashboardStats() {
        // === User / Author counts ===
        long totalUsers = userRepository.count();
        long totalAuthors = userRepository.countByIsAuthorTrue();

        // === Novel count ===
        long totalNovels = novelRepository.count();

        // === Revenue ===
        Long rawRevenue = orderRepository.sumCompletedRevenue();
        long totalRevenueVnd = rawRevenue != null ? rawRevenue : 0L;
        long platformRevenueVnd = Math.round(totalRevenueVnd * 0.25);

        // === Monthly revenue (current year) ===
        int currentYear = LocalDateTime.now().getYear();
        List<Object[]> monthlyRows = orderRepository.getMonthlyRevenue(currentYear);
        List<Long> monthlyRevenueVnd = new ArrayList<>();
        for (Object[] row : monthlyRows) {
            // row[0] = month_num (int), row[1] = sum (BigDecimal or Long)
            Number sum = (Number) row[1];
            monthlyRevenueVnd.add(sum != null ? sum.longValue() : 0L);
        }

        // === Weekly revenue (current week: Monday to Sunday) ===
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime startOfWeek = monday.atStartOfDay();
        LocalDateTime endOfWeek = monday.plusDays(7).atStartOfDay();

        List<Order> weeklyOrders = orderRepository.findCompletedOrdersBetween(startOfWeek, endOfWeek);
        long[] weeklyArr = new long[7];
        for (Order o : weeklyOrders) {
            if (o.getCreatedAt() != null) {
                int dayIdx = o.getCreatedAt().getDayOfWeek().getValue() - 1; // 1 (Mon) -> 0 ... 7 (Sun) -> 6
                if (dayIdx >= 0 && dayIdx < 7) {
                    weeklyArr[dayIdx] += o.getAmountVnd();
                }
            }
        }
        List<Long> weeklyRevenueVnd = java.util.Arrays.stream(weeklyArr).boxed().toList();

        // === Recent orders (last 20 completed) ===
        Page<Order> orderPage = orderRepository.findAllCompletedOrders(PageRequest.of(0, 5));
        List<Order> recentOrders = orderPage.getContent(); // Lấy danh sách từ Page
        List<AdminDashboardResponseDTO.RecentOrderDTO> recentOrderDTOs = recentOrders.stream()
                .map(o -> AdminDashboardResponseDTO.RecentOrderDTO.builder()
                        .orderId(o.getId())
                        .userEmail(o.getUser().getEmail())
                        .username(o.getUser().getUsername())
                        .amountVnd(o.getAmountVnd())
                        .coins(o.getCoins() != null ? o.getCoins() : 0)
                        .status(o.getStatus().name())
                        .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().format(FORMATTER) : null)
                        .build())
                .toList();

        return AdminDashboardResponseDTO.builder()
                .totalUsers(totalUsers)
                .totalAuthors(totalAuthors)
                .totalNovels(totalNovels)
                .totalRevenueVnd(totalRevenueVnd)
                .platformRevenueVnd(platformRevenueVnd)
                .monthlyRevenueVnd(monthlyRevenueVnd)
                .weeklyRevenueVnd(weeklyRevenueVnd)
                .recentOrders(recentOrderDTOs)
                .build();
    }
}
