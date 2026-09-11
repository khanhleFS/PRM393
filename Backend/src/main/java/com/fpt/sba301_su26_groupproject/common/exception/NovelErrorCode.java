package com.fpt.sba301_su26_groupproject.common.exception;

import org.springframework.http.HttpStatus;

public enum NovelErrorCode implements ErrorCode{
    NOVEL_NOT_FOUND(2001, "Truyện không tồn tại.", HttpStatus.NOT_FOUND, "novel.not_found"),
    NOVEL_ALREADY_EXISTS(2002, "Truyện đã tồn tại.", HttpStatus.BAD_REQUEST, "novel.already_exists"),
    NOVEL_INVALID(2003, "Dữ liệu truyện không hợp lệ.", HttpStatus.BAD_REQUEST, "novel.invalid"),
    NOVEL_DELETE_FAILED(2004, "Xóa truyện thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "novel.delete_failed"),
    NOVEL_UPDATE_FAILED(2005, "Cập nhật truyện thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "novel.update_failed"),
    NOVEL_UNAUTHORIZED(2006, "Bạn không có quyền thực hiện hành động này.", HttpStatus.FORBIDDEN, "novel.unauthorized"),
    NOVEL_CATEGORY_NOT_FOUND(2007, "Thể loại không tồn tại.", HttpStatus.NOT_FOUND, "novel.category_not_found"),
    NOVEL_CATEGORY_ALREADY_ASSIGNED(2008, "Thể loại đã được gán cho truyện.", HttpStatus.BAD_REQUEST, "novel.category_already_assigned"),
    NOVEL_CATEGORY_NOT_ASSIGNED(2009, "Thể loại chưa được gán cho truyện.", HttpStatus.BAD_REQUEST, "novel.category_not_assigned"),
    NOVEL_AUTHOR_NOT_FOUND(2010, "Tác giả không tồn tại.", HttpStatus.NOT_FOUND, "novel.author_not_found"),
    NOVEL_STATUS_INVALID(2011, "Trạng thái truyện không hợp lệ.", HttpStatus.BAD_REQUEST, "novel.status_invalid");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String errorKey;

    NovelErrorCode(int code, String message, HttpStatus status, String errorKey) {
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
