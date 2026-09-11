package com.fpt.sba301_su26_groupproject.dto.summary;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterSummaryRequest {

    @NotBlank(message = "Text for summarization cannot be blank")
    private String text;

}
