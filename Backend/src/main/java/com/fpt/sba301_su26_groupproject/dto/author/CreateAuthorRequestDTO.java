package com.fpt.sba301_su26_groupproject.dto.author;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateAuthorRequestDTO(
    @NotBlank(message = "Tên đăng nhập không được để trống")
    String username,

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống")
    String password,

    String phone,
    String address,

    @NotBlank(message = "Bút danh không được để trống")
    String penName,

    String bio,
    String bankName,
    String bankAccountNumber,
    String bankAccountHolder
) {}
