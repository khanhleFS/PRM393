package com.fpt.sba301_su26_groupproject.dto.authen;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO (
    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Email không đúng định dạng.")
    @Schema(example = "user@sba.com")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Schema(example = "Password123")
    String password
){}
