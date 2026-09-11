package com.fpt.sba301_su26_groupproject.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookmarkErrorCode implements ErrorCode {

    BOOKMARK_NOT_FOUND(5001, "Bookmark không tồn tại", HttpStatus.NOT_FOUND, "bookmark.not_found"),
    BOOKMARK_NOVEL_NOT_FOUND(5002, "Không tìm thấy truyện để bookmark", HttpStatus.NOT_FOUND, "bookmark.novel_not_found"),
    BOOKMARK_USER_NOT_FOUND(5003, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND, "bookmark.user_not_found"),
    BOOKMARK_CHAPTER_NOT_FOUND(5004, "Không tìm thấy chương truyện", HttpStatus.NOT_FOUND, "bookmark.chapter_not_found"),
    BOOKMARK_SAVE_FAILED(5005, "Lưu bookmark thất bại", HttpStatus.INTERNAL_SERVER_ERROR, "bookmark.save_failed"),
    BOOKMARK_DELETE_FAILED(5006, "Xóa bookmark thất bại", HttpStatus.INTERNAL_SERVER_ERROR, "bookmark.delete_failed");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String errorKey;

    @Override
    public String getDomain() {
        return "BOOKMARK";
    }
}
