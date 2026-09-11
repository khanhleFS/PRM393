package com.fpt.sba301_su26_groupproject.dto.author;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record AuthorProfileRequestDTO(
    @NotBlank(message = "Bút danh không được để trống")
    String penName,
    String bio,
    String bankName,
    String bankAccountNumber,
    String bankAccountHolder
) {}
