package com.fpt.sba301_su26_groupproject.common.exception;

import org.springframework.http.HttpStatus;

public enum ChapterErrorCode implements ErrorCode {
    CHAPTER_NOT_FOUND(3001, "Chương không tồn tại.", HttpStatus.NOT_FOUND, "chapter.not_found"),
    CHAPTER_ALREADY_EXISTS(3002, "Chương đã tồn tại.", HttpStatus.BAD_REQUEST, "chapter.already_exists"),
    CHAPTER_INVALID(3003, "Dữ liệu chương không hợp lệ.", HttpStatus.BAD_REQUEST, "chapter.invalid"),
    CHAPTER_DELETE_FAILED(3004, "Xóa chương thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "chapter.delete_failed"),
    CHAPTER_UPDATE_FAILED(3005, "Cập nhật chương thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "chapter.update_failed"),
    CHAPTER_UNAUTHORIZED(3006, "Bạn không có quyền thực hiện hành động này.", HttpStatus.FORBIDDEN, "chapter.unauthorized"),
    CHAPTER_NOVEL_NOT_FOUND(3007, "Truyện của chương không tồn tại.", HttpStatus.NOT_FOUND, "chapter.novel_not_found"),
    CHAPTER_STATUS_INVALID(3008, "Trạng thái chương không hợp lệ.", HttpStatus.BAD_REQUEST, "chapter.status_invalid"),
    CHAPTER_LOCKED(3009, "Chương này yêu cầu trả phí để đọc.", HttpStatus.FORBIDDEN, "chapter.locked"),
    CHAPTER_ALREADY_UNLOCKED(3010, "Chương đã được mở khóa trước đó.", HttpStatus.BAD_REQUEST, "chapter.already_unlocked"),
    INSUFFICIENT_COINS(3011, "Số dư coin không đủ để mở khóa chương.", HttpStatus.BAD_REQUEST, "chapter.insufficient_coins"),
    CHAPTER_FREE(3012, "Chương này miễn phí, không cần mở khóa.", HttpStatus.BAD_REQUEST, "chapter.free");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String errorKey;

    ChapterErrorCode(int code, String message, HttpStatus status, String errorKey) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.errorKey = errorKey;
    }

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatus getStatus() {
        return status;
    }

    @Override
    public String getErrorKey() {
        return errorKey;
    }
}
