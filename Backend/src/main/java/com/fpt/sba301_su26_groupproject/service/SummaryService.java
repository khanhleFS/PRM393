package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.summary.ChapterSummaryResponse;

public interface SummaryService {
    ChapterSummaryResponse summarize(String text);
}
