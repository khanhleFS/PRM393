package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelPageResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Novel;

import java.util.List;
import java.util.UUID;

public interface NovelService {
    NovelResponseDTO createNovel(NovelRequestDTO requestDTO, String authorEmail);
    NovelResponseDTO updateNovel(Long novelId, NovelRequestDTO requestDTO, String authorEmail);
    void deleteNovel(Long novelId, String authorEmail);
    NovelResponseDTO getNovelById(Long novelId);
    NovelResponseDTO getNovelByIdentifier(String identifier);
    Novel findEntityByIdentifier(String identifier);
    List<NovelResponseDTO> getAllNovelsByAuthor(String authorEmail);
    List<EnumResponseDTO> getEnums();
    NovelPageResponseDTO searchNovels(String title, String status, String categoryName, Integer minChapters, int page, int size);
    com.fpt.sba301_su26_groupproject.dto.novel.NovelStatsResponseDTO getNovelStats(Long novelId, String authorEmail);
}

