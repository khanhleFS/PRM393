package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkResponseDTO;

import java.util.List;
import java.util.UUID;

public interface BookmarkService {

    BookmarkResponseDTO upsertBookmark(BookmarkRequestDTO request, String userEmail);

    void removeBookmark(Long novelId, String userEmail);

    BookmarkResponseDTO getBookmark(Long novelId, String userEmail);

    List<BookmarkResponseDTO> getMyBookmarks(String userEmail);
}
