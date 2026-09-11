package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.admin.AdminUserResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderResponseDTO;

import java.util.List;
import java.util.UUID;

public interface AdminManagementService {
    List<AdminUserResponseDTO> getAllUsers();
    List<OrderResponseDTO> getAllOrders();
    void toggleBanUser(UUID userId);
}
