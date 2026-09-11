package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.authen.*;

import java.util.List;
import java.util.UUID;

public interface AuthenService {
    LoginResponseDTO login(LoginRequestDTO request);

    void logout(String authHeader);
    void register(RegisterRequestDTO request);

    ForgotPasswordResponseDTO forgotPassword(String email);

    ResetPasswordResponseDTO resetPassword(ResetPasswordRequestDTO request);

    boolean isEmailValid(String email);

    boolean verifyRegisterOtp(String email, String otpCode);

    LoginResponseDTO refreshToken(TokenRefreshRequestDTO request);

    List<EnumResponseDTO> getEnums();

    void changeAuthorStatus(UUID userId, boolean isAuthor);
}
