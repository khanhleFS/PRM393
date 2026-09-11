package com.fpt.sba301_su26_groupproject.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequestDTO(
        @NotBlank(message = "Tên thể loại không được để trống.")
        @Size(max = 100, message = "Tên thể loại không vượt quá 100 ký tự.")
        @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Tên thể loại chỉ được chứa chữ cái và khoảng trắng.")
        @Schema(example = "Fantasy")
        String name
) {}
