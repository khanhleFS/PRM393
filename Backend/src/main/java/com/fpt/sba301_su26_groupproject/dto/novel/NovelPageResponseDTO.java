package com.fpt.sba301_su26_groupproject.dto.novel;

import lombok.Builder;

import java.util.List;

@Builder
public record NovelPageResponseDTO(
        List<NovelResponseDTO> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
