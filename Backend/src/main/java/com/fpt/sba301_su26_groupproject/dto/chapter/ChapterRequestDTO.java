package com.fpt.sba301_su26_groupproject.dto.chapter;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.ChapterStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChapterRequestDTO(
        @NotBlank(message = "Tiêu đề chương không được để trống.")
        @Size(max = 255, message = "Tiêu đề chương không vượt quá 255 ký tự.")
        @Pattern(regexp = "^[^<>]*$", message = "Tiêu đề chương không được phép chứa các ký tự đặc biệt < hoặc >.")
        @Schema(example = "Chapter 1: The Beginning")
        String title,

        @NotBlank(message = "Nội dung chương không được để trống.")
        @Pattern(regexp = "^[^<>]*$", message = "Nội dung chương không được phép chứa các ký tự đặc biệt < hoặc >.")
        @Schema(example = "The night was silent when the journey began...")
        String content,

        @NotNull(message = "Vui lòng chọn trạng thái chương.")
        @Schema(example = "UNLOCKED")
        ChapterStatus status,

        @NotNull(message = "số thứ tự chương không được để trống.")
        @Schema(example = "1")
        Integer chapterNumber,

        @NotNull(message = "Vui lòng chọn chương miễn phí hay trả phí.")
        @Min(value = 0, message = "Giá coin không được là số âm.")
        @Schema(example = "0")
        Integer coinPrice
) {
}
