package com.fpt.sba301_su26_groupproject.scheduler;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus;
import com.fpt.sba301_su26_groupproject.entity.Payment;
import com.fpt.sba301_su26_groupproject.repository.OrderRepository;
import com.fpt.sba301_su26_groupproject.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Background job dọn dẹp các Payment/Order bị treo (PENDING quá 30 phút).
 * Chạy mỗi 15 phút để đảm bảo hệ thống không bị "tắc" bởi các giao dịch zombie.
 *
 * Đây là "lưới an toàn" cho trường hợp:
 * - User tắt ngang trình duyệt
 * - MoMo không gọi IPN về được
 * - Network timeout ở phía Gateway
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCleanupScheduler {

    private static final int EXPIRY_MINUTES = 30;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Scheduled(cron = "0 */15 * * * *") // Chạy mỗi 15 phút
    @Transactional
    public void cleanupStalePendingPayments() {
        Instant cutoff = Instant.now().minus(EXPIRY_MINUTES, ChronoUnit.MINUTES);

        List<Payment> stalePayments = paymentRepository
                .findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, cutoff);

        if (stalePayments.isEmpty()) {
            log.debug("[Cleanup] No stale PENDING payments found.");
            return;
        }

        log.info("[Cleanup] Found {} stale PENDING payment(s) older than {} minutes. Expiring...",
                stalePayments.size(), EXPIRY_MINUTES);

        for (Payment payment : stalePayments) {
            payment.setStatus(PaymentStatus.EXPIRED);
            paymentRepository.save(payment);

            if (payment.getOrder() != null
                    && payment.getOrder().getStatus() == OrderStatus.PENDING) {
                payment.getOrder().setStatus(OrderStatus.CANCELLED);
                orderRepository.save(payment.getOrder());
                log.info("[Cleanup] Expired payment={} and cancelled order={}",
                        payment.getId(), payment.getOrder().getId());
            } else {
                log.info("[Cleanup] Expired payment={} (no linked order or order already resolved)",
                        payment.getId());
            }
        }

        log.info("[Cleanup] Done. Expired {} payment(s).", stalePayments.size());
    }
}
