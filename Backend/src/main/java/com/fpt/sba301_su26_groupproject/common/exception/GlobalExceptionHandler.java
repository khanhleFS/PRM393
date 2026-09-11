package com.fpt.sba301_su26_groupproject.common.exception;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.Instant;
import java.util.Map;
import java.util.LinkedHashMap;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity.status(errorCode.getStatus())
                .body(buildError(errorCode, ex.getMessage(), request.getRequestURI(), null));

    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(ConstraintViolationException ex,
                                                                                  HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));

        ErrorCode ec = CommonErrorCode.VALIDATION_FAILED;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec, "Validation failed", request.getRequestURI(), errors));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }

        ErrorCode ec = CommonErrorCode.VALIDATION_FAILED;
        ApiResponse<Object> body = buildError(ec, "Validation failed", extractPath(request), errors);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        ErrorCode ec = CommonErrorCode.INVALID_INPUT;
        ApiResponse<Object> body = buildError(ec, "Malformed JSON or invalid input", extractPath(request), null);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex,
                                                                  HttpServletRequest request) {
        ErrorCode ec = CommonErrorCode.FORBIDDEN;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec, ec.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException ex,
                                                                             HttpServletRequest request) {
        ErrorCode ec = CommonErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec, "Email hoặc mật khẩu không chính xác", request.getRequestURI(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error:", ex);
        ErrorCode ec = CommonErrorCode.UNEXPECTED_ERROR;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec, ec.getMessage(), request.getRequestURI(), null));
    }

    private ApiResponse<Object> buildError(ErrorCode errorCode, String message, String path,
                                           Map<String, String> errors) {
        return ApiResponse.builder()
                .code(errorCode.getCode())
                .errorKey(errorCode.getErrorKey())
                .message(message)
                .result(null)
                .errors(errors)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    private String extractPath(WebRequest request) {
        String desc = request.getDescription(false);
        return desc.startsWith("uri=") ? desc.substring(4) : desc;
    }

}

