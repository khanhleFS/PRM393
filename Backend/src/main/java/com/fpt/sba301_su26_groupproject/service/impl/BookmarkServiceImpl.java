package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.BookmarkErrorCode;
import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.bookmark.BookmarkResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Bookmark;
import com.fpt.sba301_su26_groupproject.entity.Chapter;
import com.fpt.sba301_su26_groupproject.entity.Novel;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.BookmarkRepository;
import com.fpt.sba301_su26_groupproject.repository.ChapterRepository;
import com.fpt.sba301_su26_groupproject.repository.NovelRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final NovelRepository novelRepository;
    private final ChapterRepository chapterRepository;

    @Override
    @Transactional
    public BookmarkResponseDTO upsertBookmark(BookmarkRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_USER_NOT_FOUND,
                        "Không tìm thấy người dùng với email: " + userEmail));

        Novel novel = novelRepository.findById(request.novelId())
                .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_NOVEL_NOT_FOUND,
                        "Không tìm thấy truyện với ID: " + request.novelId()));

        Chapter lastChapter = null;
        if (request.lastChapterId() != null) {
            lastChapter = chapterRepository.findById(request.lastChapterId())
                    .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_CHAPTER_NOT_FOUND,
                            "Không tìm thấy chương với ID: " + request.lastChapterId()));
        }

        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndNovelId(user.getId(), novel.getId());
        Bookmark bookmark = existing.orElseGet(() -> {
            Bookmark b = new Bookmark();
            b.setUser(user);
            b.setNovel(novel);
            b.setIsFavorite(false);
            b.setReadingProgressPercent(0);
            b.setCreatedAt(Instant.now());
            return b;
        });

        if (request.isFavorite() != null) {
            bookmark.setIsFavorite(request.isFavorite());
        }
        if (lastChapter != null) {
            bookmark.setLastChapter(lastChapter);
        }
        if (request.readingProgressPercent() != null) {
            bookmark.setReadingProgressPercent(request.readingProgressPercent());
        }
        bookmark.setUpdatedAt(Instant.now());

        Bookmark saved;
        try {
            saved = bookmarkRepository.save(bookmark);
        } catch (Exception e) {
            throw new ApiException(BookmarkErrorCode.BOOKMARK_SAVE_FAILED, "Lưu bookmark thất bại: " + e.getMessage());
        }

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public void removeBookmark(Long novelId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_USER_NOT_FOUND,
                        "Không tìm thấy người dùng"));

        if (!bookmarkRepository.existsByUserIdAndNovelId(user.getId(), novelId)) {
            throw new ApiException(BookmarkErrorCode.BOOKMARK_NOT_FOUND,
                    "Bookmark không tồn tại cho novel này");
        }

        try {
            bookmarkRepository.deleteByUserIdAndNovelId(user.getId(), novelId);
        } catch (Exception e) {
            throw new ApiException(BookmarkErrorCode.BOOKMARK_DELETE_FAILED, "Xóa bookmark thất bại: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookmarkResponseDTO getBookmark(Long novelId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_USER_NOT_FOUND,
                        "Không tìm thấy người dùng"));

        return bookmarkRepository.findByUserIdAndNovelId(user.getId(), novelId)
                .map(this::mapToResponseDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookmarkResponseDTO> getMyBookmarks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(BookmarkErrorCode.BOOKMARK_USER_NOT_FOUND,
                        "Không tìm thấy người dùng"));

        return bookmarkRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private BookmarkResponseDTO mapToResponseDTO(Bookmark bookmark) {
        Novel novel = bookmark.getNovel();
        Chapter lastChapter = bookmark.getLastChapter();

        Integer totalChapters = 0;
        try {
            totalChapters = chapterRepository.findMaxChapterNumberByNovelId(novel.getId());
            if (totalChapters == null) totalChapters = 0;
        } catch (Exception ignored) {}

        return BookmarkResponseDTO.builder()
                .id(bookmark.getId())
                .novelId(novel.getId())
                .novelTitle(novel.getTitle())
                .novelSlug(novel.getSlug())
                .coverImageUrl(novel.getCoverImageUrl())
                .authorName(novel.getAuthor() != null ? novel.getAuthor().getUsername() : null)
                .lastChapterId(lastChapter != null ? lastChapter.getId() : null)
                .lastChapterNumber(lastChapter != null ? lastChapter.getChapterNumber() : null)
                .lastChapterTitle(lastChapter != null ? lastChapter.getTitle() : null)
                .lastChapterSlug(lastChapter != null ? lastChapter.getSlug() + "-" + lastChapter.getId() : null)
                .totalChapters(totalChapters)
                .isFavorite(bookmark.getIsFavorite())
                .readingProgressPercent(bookmark.getReadingProgressPercent())
                .createdAt(bookmark.getCreatedAt())
                .updatedAt(bookmark.getUpdatedAt())
                .build();
    }
}
