package com.fpt.sba301_su26_groupproject.dto.author;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AuthorPaymentTicketDTO(
    UUID id,
    UUID authorProfileId,
    String penName,
    String userEmail,
    String bankName,
    String bankAccountNumber,
    String bankAccountHolder,
    String monthYear,
    Integer totalCoins,
    Integer coinRate,
    Integer amountVnd,
    TicketStatus status,
    Instant paidAt,
    String transactionRef,
    LocalDateTime createdAt
) {}
