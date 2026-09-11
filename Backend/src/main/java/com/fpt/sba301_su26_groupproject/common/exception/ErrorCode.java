package com.fpt.sba301_su26_groupproject.common.exception;

import org.springframework.http.HttpStatus;

public interface ErrorCode {

    int getCode();

    String getMessage();

    HttpStatus getStatus();

    String getErrorKey();

    default String getDomain() {
        return "COMMON";
    }

    default boolean isClientError() {
        return getStatus().is4xxClientError();
    }

    default boolean isServerError() {
        return getStatus().is5xxServerError();
    }

    default boolean isSuccess() {
        return getStatus().is2xxSuccessful();
    }
}

