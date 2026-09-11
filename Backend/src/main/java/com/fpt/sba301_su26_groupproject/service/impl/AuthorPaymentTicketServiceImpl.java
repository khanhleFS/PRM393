package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorPaymentTicketDTO;
import com.fpt.sba301_su26_groupproject.entity.AuthorPaymentTicket;
import com.fpt.sba301_su26_groupproject.entity.AuthorProfile;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;
import com.fpt.sba301_su26_groupproject.repository.AuthorPaymentTicketRepository;
import com.fpt.sba301_su26_groupproject.repository.AuthorProfileRepository;
import com.fpt.sba301_su26_groupproject.service.AuthorPaymentTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorPaymentTicketServiceImpl implements AuthorPaymentTicketService {

    private final AuthorPaymentTicketRepository ticketRepository;
    private final AuthorProfileRepository authorProfileRepository;

    private static final int DEFAULT_COIN_RATE = 1000; // 1 coin = 1,000 VND

    @Override
    @Transactional(readOnly = true)
    public List<AuthorPaymentTicketDTO> getMyTickets(String userEmail) {
        return ticketRepository.findByAuthorProfileUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthorPaymentTicketDTO> getAllTickets(TicketStatus status) {
        List<AuthorPaymentTicket> tickets = (status != null)
                ? ticketRepository.findByStatusOrderByCreatedAtDesc(status)
                : ticketRepository.findAll();

        return tickets.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AuthorPaymentTicketDTO processTicketPayment(UUID ticketId, String transactionRef, TicketStatus status) {
        AuthorPaymentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ticket quyết toán"));

        if (ticket.getStatus() == TicketStatus.PAID) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Ticket này đã được thanh toán trước đó.");
        }

        ticket.setStatus(status);
        if (status == TicketStatus.PAID) {
            ticket.setPaidAt(Instant.now());
            ticket.setTransactionRef(transactionRef);
        }

        AuthorPaymentTicket saved = ticketRepository.save(ticket);
        log.info("[Payout Ticket] Admin đã cập nhật Ticket {} sang trạng thái {}", ticketId, status);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void generateMonthlyTickets() {
        String currentMonthYear = LocalDate.now().format(DateTimeFormatter.ofPattern("MM/yyyy"));
        log.info("[Payout Scheduler] Bắt đầu tự động chốt sổ doanh thu tháng {}", currentMonthYear);

        List<AuthorProfile> eligibleProfiles = authorProfileRepository.findByAuthorCoinBalanceGreaterThan(0);
        int generatedCount = 0;

        for (AuthorProfile profile : eligibleProfiles) {
            boolean alreadyExists = ticketRepository.existsByAuthorProfileIdAndMonthYear(profile.getId(), currentMonthYear);
            if (alreadyExists) {
                log.info("[Payout Scheduler] Ticket tháng {} cho tác giả {} đã tồn tại, bỏ qua.", currentMonthYear, profile.getPenName());
                continue;
            }

            int coinsToSettle = profile.getAuthorCoinBalance();
            int amountVnd = coinsToSettle * DEFAULT_COIN_RATE;

            AuthorPaymentTicket ticket = AuthorPaymentTicket.builder()
                    .authorProfile(profile)
                    .monthYear(currentMonthYear)
                    .totalCoins(coinsToSettle)
                    .coinRate(DEFAULT_COIN_RATE)
                    .amountVnd(amountVnd)
                    .status(TicketStatus.UNPAID)
                    .build();

            ticketRepository.save(ticket);

            // Chốt sổ: trừ số coin đã được ghi nhận sang Ticket
            profile.setAuthorCoinBalance(0);
            authorProfileRepository.save(profile);
            generatedCount++;

            log.info("[Payout Scheduler] Đã tạo Ticket {} coin ({} VNĐ) cho tác giả {}", coinsToSettle, amountVnd, profile.getPenName());
        }

        log.info("[Payout Scheduler] Hoàn tất chốt sổ tháng {}. Tổng số Ticket đã tạo: {}", currentMonthYear, generatedCount);
    }

    private AuthorPaymentTicketDTO mapToDTO(AuthorPaymentTicket ticket) {
        AuthorProfile ap = ticket.getAuthorProfile();
        return AuthorPaymentTicketDTO.builder()
                .id(ticket.getId())
                .authorProfileId(ap.getId())
                .penName(ap.getPenName())
                .userEmail(ap.getUser().getEmail())
                .bankName(ap.getBankName())
                .bankAccountNumber(ap.getBankAccountNumber())
                .bankAccountHolder(ap.getBankAccountHolder())
                .monthYear(ticket.getMonthYear())
                .totalCoins(ticket.getTotalCoins())
                .coinRate(ticket.getCoinRate())
                .amountVnd(ticket.getAmountVnd())
                .status(ticket.getStatus())
                .paidAt(ticket.getPaidAt())
                .transactionRef(ticket.getTransactionRef())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
