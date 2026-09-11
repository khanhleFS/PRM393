package com.fpt.sba301_su26_groupproject.dto.author;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.AuthorStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AuthorProfileResponseDTO(
    UUID id,
    UUID userId,
    String userEmail,
    String penName,
    String bio,
    Integer authorCoinBalance,
    Long totalNovels,
    Long totalChapters,
    Long totalViews,
    String bankName,
    String bankAccountNumber,
    String bankAccountHolder,
    AuthorStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
