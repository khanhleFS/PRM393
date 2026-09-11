package com.fpt.sba301_su26_groupproject.common.exception;

import org.springframework.http.HttpStatus;

public enum CategoryErrorCode implements ErrorCode {
    CATEGORY_NOT_FOUND(1001, "Thể loại không tồn tại.", HttpStatus.NOT_FOUND, "category.not_found"),
    CATEGORY_ALREADY_EXISTS(1002, "Thể loại đã tồn tại.", HttpStatus.BAD_REQUEST, "category.already_exists"),
    CATEGORY_NAME_TOO_SHORT(1003, "Tên thể loại phải có ít nhất 3 ký tự.", HttpStatus.BAD_REQUEST, "category.name_too_short"),
    CATEGORY_NAME_TOO_LONG(1004, "Tên thể loại không được vượt quá 50 ký tự.", HttpStatus.BAD_REQUEST, "category.name_too_long"),
    CATEGORY_NAME_INVALID(1005, "Tên thể loại chỉ được chứa chữ cái và khoảng trắng.", HttpStatus.BAD_REQUEST, "category.name_invalid"),
    CATEGORY_NOVEL_ASSOCIATED_FAILED(1006, "Không thể xóa thể loại vì có sản phẩm liên quan.", HttpStatus.BAD_REQUEST, "category.novel_associated_failed"),
    CATEGORY_DELETE_FAILED(1007, "Xóa thể loại thất bại", HttpStatus.BAD_REQUEST, "category.delete_failed"),
    CATEGORY_UPDATE_FAILED(1008, "Cập nhật thể loại thất bại", HttpStatus.BAD_REQUEST, "category.update_failed");


    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String errorKey;

    CategoryErrorCode(int code, String message, HttpStatus status, String errorKey) {
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
