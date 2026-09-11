package com.fpt.sba301_su26_groupproject.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterSummaryResponse {

    private String chapter_title;
    private String summary_text;
    private List<String> key_characters;
    private List<String> main_events;

}
