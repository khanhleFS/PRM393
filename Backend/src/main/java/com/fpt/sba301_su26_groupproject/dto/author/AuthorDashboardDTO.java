package com.fpt.sba301_su26_groupproject.dto.author;

import lombok.Builder;

import java.util.List;

@Builder
public record AuthorDashboardDTO(
    AuthorProfileResponseDTO profile,
    Long totalNovels,
    Long totalChapters,
    Long totalViews,
    Integer authorCoinBalance,
    Integer estimatedEarningsVnd,
    List<AuthorPaymentTicketDTO> recentTickets
) {}
