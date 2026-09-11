package com.fpt.sba301_su26_groupproject.scheduler;

import com.fpt.sba301_su26_groupproject.service.AuthorPaymentTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler tự động chốt sổ doanh thu cho Tác giả vào 00:00:00 ngày đầu tiên của mỗi tháng.
 * Quét các AuthorProfile có authorCoinBalance > 0 và sinh ra AuthorPaymentTicket (UNPAID).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyAuthorPayoutScheduler {

    private final AuthorPaymentTicketService authorPaymentTicketService;

    // Chạy vào 00:00:00 ngày 1 hàng tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    public void scheduleMonthlyAuthorPayout() {
        log.info("[Scheduler] Kích hoạt tự động chốt sổ doanh thu tác giả hàng tháng...");
        try {
            authorPaymentTicketService.generateMonthlyTickets();
            log.info("[Scheduler] Hoàn tất chốt sổ doanh thu tác giả thành công.");
        } catch (Exception e) {
            log.error("[Scheduler] Lỗi khi thực hiện chốt sổ doanh thu tác giả hàng tháng: ", e);
        }
    }
}
