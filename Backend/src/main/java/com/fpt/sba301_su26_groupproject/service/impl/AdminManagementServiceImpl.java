package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.admin.AdminUserResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Order;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.OrderRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.AdminManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminManagementServiceImpl implements AdminManagementService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public List<AdminUserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return users.stream()
                .map(u -> AdminUserResponseDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .role(u.getRole() != null ? u.getRole().name() : "USER")
                        .isAuthor(Boolean.TRUE.equals(u.getIsAuthor()))
                        .isActive(Boolean.TRUE.equals(u.getIsActive()))
                        .coinBalance(u.getCoinBalance() != null ? u.getCoinBalance() : 0)
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return orders.stream()
                .map(o -> OrderResponseDTO.builder()
                        .id(o.getId())
                        .userId(o.getUser().getId())
                        .username(o.getUser().getUsername())
                        .coinPackageId(o.getCoinPackage().getId())
                        .coinPackageName(o.getCoinPackage().getName())
                        .amountVnd(o.getAmountVnd())
                        .coins(o.getCoins())
                        .quantity(o.getQuantity())
                        .status(o.getStatus())
                        .createdAt(o.getCreatedAt())
                        .payUrl(null)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleBanUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
    }
}
