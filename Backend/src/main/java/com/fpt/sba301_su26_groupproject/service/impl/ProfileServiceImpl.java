package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.profile.ProfileDTO;
import com.fpt.sba301_su26_groupproject.dto.profile.CoinTransactionResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.CoinTransaction;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.CoinTransactionType;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.CoinTransactionRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final CoinTransactionRepository coinTransactionRepository;

    @Override
    public ProfileDTO getProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(CommonErrorCode.INVALID_INPUT, "Người dùng không tồn tại"));
        return ProfileDTO.builder()
                .fullName(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .coinBalance(user.getCoinBalance())
                .build();
    }

    @Override
    @Transactional
    public void updateProfile(UUID id, ProfileDTO profile) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(CommonErrorCode.INVALID_INPUT, "Người dùng không tồn tại"));
        userRepository.findByEmail(profile.email()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(id)) {
                throw new ApiException(CommonErrorCode.CONFLICT, "Email đã tồn tại");
            }
        });
        userRepository.findByPhone(profile.phone()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(id)) {
                throw new ApiException(CommonErrorCode.CONFLICT, "Số điện thoại đã tồn tại");
            }
        });
        user.setUsername(profile.fullName());
        user.setEmail(profile.email());
        user.setPhone(profile.phone());
        user.setAddress(profile.address());
        userRepository.save(user);
    }

    @Override
    public Page<CoinTransactionResponseDTO> getCoinTransactions(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.UNAUTHORIZED, "Người dùng không tồn tại"));

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return coinTransactionRepository.findByUserId(user.getId(), sortedPageable)
                .map(tx -> {
                    String paymentMethod = "COIN_WALLET";
                    if (tx.getType() == CoinTransactionType.TOPUP) {
                        paymentMethod = "ONLINE_PAYMENT";
                    }
                    return CoinTransactionResponseDTO.builder()
                            .transactionId(tx.getId())
                            .userName(user.getUsername())
                            .packageName(tx.getCoinPackage() != null ? tx.getCoinPackage().getName() : tx.getNote())
                            .amount(tx.getAmount())
                            .transactionType(tx.getType().name())
                            .paymentMethod(paymentMethod)
                            .status("SUCCESS")
                            .createdAt(tx.getCreatedAt())
                            .build();
                });
    }
}
