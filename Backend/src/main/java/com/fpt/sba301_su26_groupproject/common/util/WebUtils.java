package com.fpt.sba301_su26_groupproject.common.util;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

public class WebUtils {

    private WebUtils() {
    }

    public static Map<String, String> extractQueryParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }

    public static String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
