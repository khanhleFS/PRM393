package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.order.OrderResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCallbackDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCreateRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCreateResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.CoinPackage;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import com.fpt.sba301_su26_groupproject.entity.Order;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.CoinPackageRepository;
import com.fpt.sba301_su26_groupproject.repository.OrderRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.OrderService;
import com.fpt.sba301_su26_groupproject.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CoinPackageRepository coinPackageRepository;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.UNAUTHORIZED, "Người dùng không tồn tại"));

        CoinPackage coinPackage = coinPackageRepository.findById(request.coinPackageId())
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Gói coin không tồn tại hoặc đã bị ẩn"));

        if (!coinPackage.getIsActive()) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Gói coin hiện không hoạt động");
        }

        int qty = request.quantity() == null || request.quantity() < 1 ? 1 : request.quantity();

        Integer totalCoins = coinPackage.getBaseCoins() * qty;
        Integer totalVnd = coinPackage.getPriceVnd() * qty;

        Order order = Order.builder()
                .user(user)
                .coinPackage(coinPackage)
                .amountVnd(totalVnd)
                .coins(totalCoins)
                .quantity(qty)
                .status(OrderStatus.PENDING)
                .build();

        Order saved = orderRepository.save(order);

        String orderInfo = request.orderInfo() == null || request.orderInfo().isBlank()
                ? "Nap " + totalCoins + " Coins cho tai khoan"
                : request.orderInfo();
        String requestType = request.requestType() == null || request.requestType().isBlank()
                ? "captureWallet"
                : request.requestType();

        PaymentMomoCreateResponseDTO momoRes = paymentService.createMomoPayment(
                new PaymentMomoCreateRequestDTO(
                        saved.getId().toString(),
                        saved.getAmountVnd(),
                        orderInfo,
                        requestType
                )
        );

        return mapToResponse(saved, momoRes.payUrl());
    }

    @Override
    public OrderResponseDTO getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));
        return mapToResponse(order, null);
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(CommonErrorCode.UNAUTHORIZED, "Người dùng không tồn tại"));

        return orderRepository.findByUserId(user.getId()).stream()
                .map(order -> mapToResponse(order, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void handleMomoCallback(PaymentMomoCallbackDTO callback) {
        paymentService.handleMomoCallback(callback);
    }

    @Override
    @Transactional
    public void syncPaymentStatus(UUID orderId) {
        paymentService.syncPaymentStatus(orderId);
    }

    @Override
    public List<EnumResponseDTO> getPaymentEnums() {
        return paymentService.getEnums();
    }

    @Override
    @Transactional
    public OrderResponseDTO recreatePayment(UUID orderId, String requestType) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Đơn hàng đã được xử lý hoặc đã hủy");
        }

        String orderInfo = "Nap " + order.getCoins() + " Coins cho tai khoan";
        String type = requestType == null || requestType.isBlank() ? "captureWallet" : requestType;

        PaymentMomoCreateResponseDTO momoRes = paymentService.createMomoPayment(
                new PaymentMomoCreateRequestDTO(
                        order.getId().toString(),
                        order.getAmountVnd(),
                        orderInfo,
                        type
                )
        );

        return mapToResponse(order, momoRes.payUrl());
    }

    private OrderResponseDTO mapToResponse(Order order, String payUrl) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .coinPackageId(order.getCoinPackage().getId())
                .coinPackageName(order.getCoinPackage().getName())
                .amountVnd(order.getAmountVnd())
                .coins(order.getCoins())
                .quantity(order.getQuantity())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .payUrl(payUrl)
                .build();
    }
}
