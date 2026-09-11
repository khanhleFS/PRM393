package com.fpt.sba301_su26_groupproject.common.util;

import com.fpt.sba301_su26_groupproject.common.security.CustomUserDetail;
import com.fpt.sba301_su26_groupproject.entity.User;

import lombok.experimental.UtilityClass;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

@UtilityClass
public class SecurityUtils {

    public static UUID getCurrentUserId() {
        User user = getCurrentUser();
        return (user != null) ? user.getId() : null;
    }

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetail userDetails) {
            return userDetails.getUser();
        }

        return null;
    }

    public static boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + roleName));
    }
}
