package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.common.security.CustomUserDetail;
import com.fpt.sba301_su26_groupproject.common.security.JwtService;
import com.fpt.sba301_su26_groupproject.common.security.TokenBlacklistService;
import com.fpt.sba301_su26_groupproject.dto.authen.*;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.UserRole;
import com.fpt.sba301_su26_groupproject.entity.OTP;
import com.fpt.sba301_su26_groupproject.entity.RefreshTokenRedis;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.EnumRepository;
import com.fpt.sba301_su26_groupproject.repository.OTPRepository;
import com.fpt.sba301_su26_groupproject.repository.RefreshTokenRedisRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.AuthenService;
import com.fpt.sba301_su26_groupproject.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthenServiceImpl implements AuthenService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final MailService mailService;

    private final OTPRepository otpRepository;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenRedisRepository refreshTokenRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final EnumRepository enumRepository;

    @Override
    @Transactional
    public LoginResponseDTO refreshToken(TokenRefreshRequestDTO request) {
        String refreshToken = request.refreshToken();

        try {
            jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new ApiException(CommonErrorCode.UNAUTHORIZED, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        RefreshTokenRedis tokenRedis = refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new ApiException(CommonErrorCode.UNAUTHORIZED, "Refresh token không tồn tại hoặc đã hết hạn"));

        User user = userRepository.findByEmail(tokenRedis.getEmail())
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));

        if (!user.getIsActive()) {
            throw new ApiException(CommonErrorCode.FORBIDDEN, "Tài khoản chưa được kích hoạt");
        }

        CustomUserDetail userDetail = new CustomUserDetail(user);

        String newAccessToken = jwtService.generateAccessToken(userDetail);
        String newRefreshToken = jwtService.generateRefreshToken(userDetail);

        refreshTokenRepository.delete(tokenRedis);

        long expirationInSeconds = 7 * 24 * 60 * 60;
        RefreshTokenRedis newTokenRedis = RefreshTokenRedis.builder()
                .token(newRefreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .ttlInSeconds(expirationInSeconds)
                .build();
        refreshTokenRepository.save(newTokenRedis);

        return new LoginResponseDTO(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getIsAuthor()
        );
    }

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        CustomUserDetail userDetail = (CustomUserDetail) authentication.getPrincipal();
        User user = userDetail.getUser();
        if (!user.getIsActive()) {
            throw new ApiException(CommonErrorCode.FORBIDDEN, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }
        String accessToken = jwtService.generateAccessToken(userDetail);
        String refreshToken = jwtService.generateRefreshToken(userDetail);
        long expirationInSeconds = 7 * 24 * 60 * 60;
        RefreshTokenRedis tokenRedis = RefreshTokenRedis.builder()
                .token(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .ttlInSeconds(expirationInSeconds)
                .build();
        refreshTokenRepository.save(tokenRedis);
        return new LoginResponseDTO(
                accessToken,
                refreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getIsAuthor()
        );
    }

    @Override
    @Transactional
    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                Date expiration = jwtService.extractExpiration(jwt);
                long remainingTimeMs = expiration.getTime() - System.currentTimeMillis();
                if (remainingTimeMs > 0) {
                    tokenBlacklistService.blacklistToken(jwt, remainingTimeMs);
                }
            } catch (Exception e) {
                throw new ApiException(CommonErrorCode.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn");
            }
        }
    }

    @Override
    @Transactional
    public void register(RegisterRequestDTO request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(CommonErrorCode.INVALID_INPUT, "Mật khẩu và xác nhận mật khẩu không khớp.");
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ApiException(CommonErrorCode.CONFLICT, "Email đã tồn tại");
        }
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new ApiException(CommonErrorCode.CONFLICT, "Số điện thoại đã tồn tại");
        }

        User user = User.builder()
                .username(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .address(request.address() != null && !request.address().isBlank() ? request.address() : "Chưa cập nhật")
                .role(UserRole.USER)
                .isActive(false) 
                .build();
        userRepository.save(user);
        
        String otpCode = String.format("%06d", new SecureRandom().nextInt(999999));
        otpRepository.deleteByEmail(request.email());
        OTP otp = OTP.builder()
                .email(request.email())
                .otpCode(otpCode)
                .expiryTime(Instant.now().plusSeconds(5 * 60))
                .build();
        otpRepository.save(otp);
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", request.fullName());
            variables.put("otpCode", otpCode);
            mailService.sendWithTemplate(
                    request.email(),
                    "Xác nhận đăng ký tài khoản",
                    "email/otp-email",
                    variables
            );
        } catch (Exception e) {
            throw new ApiException(CommonErrorCode.INTERNAL_ERROR, "Lỗi gửi email: " + e.getMessage());
        }
    }

    @Override
    public ForgotPasswordResponseDTO forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new ApiException(CommonErrorCode.INVALID_INPUT, "Email không tồn tại");
        }
        String newPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", user.getUsername());
            variables.put("newPassword", newPassword);

            mailService.sendWithTemplate(
                    email,
                    "Quên mật khẩu",
                    "email/forgot-password-email",
                    variables
            );
        } catch (Exception e) {
            throw new ApiException(CommonErrorCode.INTERNAL_ERROR, "Lỗi gửi email: " + e.getMessage());
        }
        return new ForgotPasswordResponseDTO(email, "Mật khẩu mới đã được gửi đến email của bạn.", true, null);
    }

    @Override
    public ResetPasswordResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            throw new ApiException(CommonErrorCode.INVALID_INPUT, "Người dùng không tồn tại");
        }
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new ApiException(CommonErrorCode.INVALID_INPUT, "Mật khẩu cũ không khớp");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return new ResetPasswordResponseDTO(request.email(), "Mật khẩu đã được cập nhật thành công.", user.getId(), null);
    }

    @Override
    public boolean isEmailValid(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    @Transactional
    public boolean verifyRegisterOtp(String email, String otpCode) {
        OTP otp = otpRepository.findByEmailAndOtpCode(email, otpCode)
                .orElseThrow(() -> new ApiException(CommonErrorCode.INVALID_INPUT, "Mã OTP không hợp lệ"));
        if (otp.getExpiryTime().isBefore(Instant.now())) {
            throw new ApiException(CommonErrorCode.INVALID_INPUT, "Mã OTP đã hết hạn");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        user.setIsActive(true);
        userRepository.save(user);
        otpRepository.deleteByEmail(email);
        return true;
    }

    public String generateRandomPassword() {
        int length = 10;
        String charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(charSet.length());
            password.append(charSet.charAt(randomIndex));
        }
        return password.toString();
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return enumRepository.getAuthEnums();
    }

    @Override
    @Transactional
    public void changeAuthorStatus(UUID userId, boolean isAuthor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        user.setIsAuthor(isAuthor);
        userRepository.save(user);
    }
}