package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.summary.ChapterSummaryRequest;
import com.fpt.sba301_su26_groupproject.dto.summary.ChapterSummaryResponse;
import com.fpt.sba301_su26_groupproject.service.SummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summary")
@Tag(name = "Summary APIs", description = "AI Summarization APIs")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @Operation(summary = "Summarize a chapter using Gemini")
    @PostMapping("/chapter")
    public ResponseEntity<ApiResponse<ChapterSummaryResponse>> summarizeChapter(
            @Valid @RequestBody ChapterSummaryRequest request) {
        ChapterSummaryResponse response = summaryService.summarize(request.getText());
        if (response != null) {
            return ResponseEntity.ok(ApiResponse.<ChapterSummaryResponse>builder()
                    .code(200)
                    .message("Tóm tắt chương thành công")
                    .result(response)
                    .build());
        } else {
            return ResponseEntity.status(500).body(ApiResponse.<ChapterSummaryResponse>builder()
                    .code(500)
                    .message("Không thể tóm tắt chương")
                    .build());
        }
    }
}
