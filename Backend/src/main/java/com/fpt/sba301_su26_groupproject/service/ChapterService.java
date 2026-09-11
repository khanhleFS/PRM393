package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterResponseDTO;

import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterUnlockResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ChapterService {
    ChapterResponseDTO createChapter(Long novelId, ChapterRequestDTO requestDTO, String authorEmail);

    List<ChapterResponseDTO> getChaptersByNovel(Long novelId, String userEmail);

    ChapterResponseDTO getChapterDetails(Long novelId, Long chapterId, String userEmail);

    ChapterResponseDTO readChapter(Long novelId, Long chapterId, String userEmail);

    ChapterResponseDTO updateChapter(Long novelId, Long chapterId, ChapterRequestDTO requestDTO, String authorEmail);

    void deleteChapter(Long novelId, Long chapterId, String authorEmail);

    ChapterResponseDTO generateChapterAudio(Long novelId, Long chapterId);

    ChapterUnlockResponseDTO unlockChapter(Long novelId, Long chapterId, String userEmail);

    List<EnumResponseDTO> getEnums();
}
