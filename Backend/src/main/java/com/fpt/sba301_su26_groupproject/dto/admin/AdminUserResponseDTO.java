package com.fpt.sba301_su26_groupproject.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AdminUserResponseDTO(
        UUID id,
        String username,
        String email,
        String role,
        boolean isAuthor,
        boolean isActive,
        int coinBalance,
        LocalDateTime createdAt
) {}
