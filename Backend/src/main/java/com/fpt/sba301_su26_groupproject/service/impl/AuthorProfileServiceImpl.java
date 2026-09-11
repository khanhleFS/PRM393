package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorDashboardDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorPaymentTicketDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.author.CreateAuthorRequestDTO;
import com.fpt.sba301_su26_groupproject.entity.AuthorProfile;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.AuthorStatus;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.UserRole;
import com.fpt.sba301_su26_groupproject.entity.Novel;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.*;
import com.fpt.sba301_su26_groupproject.service.AuthorPaymentTicketService;
import com.fpt.sba301_su26_groupproject.service.AuthorProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorProfileServiceImpl implements AuthorProfileService {

    private final AuthorProfileRepository authorProfileRepository;
    private final UserRepository userRepository;
    private final AuthorPaymentTicketService ticketService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthorProfileResponseDTO createAuthorAccountByAdmin(CreateAuthorRequestDTO requestDTO) {
        if (userRepository.findByUsername(requestDTO.username()).isPresent()) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.existsByEmail(requestDTO.email())) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Email đã được sử dụng.");
        }
        if (requestDTO.phone() != null && !requestDTO.phone().isBlank() && userRepository.findByPhone(requestDTO.phone()).isPresent()) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Số điện thoại đã được sử dụng.");
        }
        if (authorProfileRepository.existsByPenName(requestDTO.penName())) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Bút danh này đã được sử dụng.");
        }

        String phoneToUse = (requestDTO.phone() != null && !requestDTO.phone().isBlank())
                ? requestDTO.phone()
                : "0" + Math.abs(requestDTO.username().hashCode() % 1000000000);

        User user = User.builder()
                .username(requestDTO.username())
                .email(requestDTO.email())
                .password(passwordEncoder.encode(requestDTO.password()))
                .phone(phoneToUse)
                .address(requestDTO.address())
                .role(UserRole.AUTHOR)
                .isAuthor(true)
                .isActive(true)
                .coinBalance(0)
                .build();

        User savedUser = userRepository.save(user);

        AuthorProfile profile = AuthorProfile.builder()
                .user(savedUser)
                .penName(requestDTO.penName())
                .bio(requestDTO.bio())
                .authorCoinBalance(0)
                .bankName(requestDTO.bankName())
                .bankAccountNumber(requestDTO.bankAccountNumber())
                .bankAccountHolder(requestDTO.bankAccountHolder())
                .status(AuthorStatus.APPROVED)
                .build();

        AuthorProfile savedProfile = authorProfileRepository.save(profile);
        log.info("[Admin Action] Đã tạo tài khoản Tác giả thành công: Username={}, Email={}, PenName={}",
                savedUser.getUsername(), savedUser.getEmail(), savedProfile.getPenName());
        return mapToResponseDTO(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorProfileResponseDTO getMyAuthorProfile(String userEmail) {
        AuthorProfile profile = authorProfileRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ tác giả cho tài khoản này."));
        return mapToResponseDTO(profile);
    }

    @Override
    @Transactional
    public AuthorProfileResponseDTO updateMyAuthorProfile(AuthorProfileRequestDTO requestDTO, String userEmail) {
        AuthorProfile profile = authorProfileRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ tác giả cho tài khoản này."));

        if (!profile.getPenName().equalsIgnoreCase(requestDTO.penName()) &&
                authorProfileRepository.existsByPenNameAndUserIdNot(requestDTO.penName(), profile.getUser().getId())) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Bút danh này đã được sử dụng.");
        }

        profile.setPenName(requestDTO.penName());
        profile.setBio(requestDTO.bio());
        profile.setBankName(requestDTO.bankName());
        profile.setBankAccountNumber(requestDTO.bankAccountNumber());
        profile.setBankAccountHolder(requestDTO.bankAccountHolder());

        AuthorProfile updated = authorProfileRepository.save(profile);
        return mapToResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthorProfileResponseDTO> getAllAuthorProfiles() {
        return authorProfileRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorDashboardDTO getAuthorDashboard(String userEmail) {
        AuthorProfile profile = authorProfileRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ tác giả cho tài khoản này."));

        long totalNovels = profile.getTotalNovels() != null ? profile.getTotalNovels() : 0L;
        long totalChapters = profile.getTotalChapters() != null ? profile.getTotalChapters() : 0L;
        long totalViews = profile.getTotalViews() != null ? profile.getTotalViews() : 0L;

        List<AuthorPaymentTicketDTO> tickets = ticketService.getMyTickets(userEmail);
        int estimatedVnd = profile.getAuthorCoinBalance() * 1000;

        return AuthorDashboardDTO.builder()
                .profile(mapToResponseDTO(profile))
                .totalNovels(totalNovels)
                .totalChapters(totalChapters)
                .totalViews(totalViews)
                .authorCoinBalance(profile.getAuthorCoinBalance())
                .estimatedEarningsVnd(estimatedVnd)
                .recentTickets(tickets)
                .build();
    }

    private AuthorProfileResponseDTO mapToResponseDTO(AuthorProfile profile) {
        return AuthorProfileResponseDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .userEmail(profile.getUser().getEmail())
                .penName(profile.getPenName())
                .bio(profile.getBio())
                .authorCoinBalance(profile.getAuthorCoinBalance())
                .totalNovels(profile.getTotalNovels())
                .totalChapters(profile.getTotalChapters())
                .totalViews(profile.getTotalViews())
                .bankName(profile.getBankName())
                .bankAccountNumber(profile.getBankAccountNumber())
                .bankAccountHolder(profile.getBankAccountHolder())
                .status(profile.getStatus())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
