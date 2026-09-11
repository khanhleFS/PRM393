package com.fpt.sba301_su26_groupproject.common.exception;

import org.springframework.http.HttpStatus;

public enum CoinPackageErrorCode implements ErrorCode {
    COIN_PACKAGE_NOT_FOUND(4001, "Gói coin không tồn tại.", HttpStatus.NOT_FOUND, "coin_package.not_found"),
    COIN_PACKAGE_ALREADY_EXISTS(4002, "Gói coin đã tồn tại.", HttpStatus.BAD_REQUEST, "coin_package.already_exists"),
    COIN_PACKAGE_INVALID(4003, "Dữ liệu gói coin không hợp lệ.", HttpStatus.BAD_REQUEST, "coin_package.invalid"),
    COIN_PACKAGE_DELETE_FAILED(4004, "Xóa gói coin thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "coin_package.delete_failed"),
    COIN_PACKAGE_UPDATE_FAILED(4005, "Cập nhật gói coin thất bại.", HttpStatus.INTERNAL_SERVER_ERROR, "coin_package.update_failed");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String errorKey;

    CoinPackageErrorCode(int code, String message, HttpStatus status, String errorKey) {
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
