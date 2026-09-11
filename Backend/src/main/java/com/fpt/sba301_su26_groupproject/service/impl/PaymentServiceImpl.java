package com.fpt.sba301_su26_groupproject.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.sba301_su26_groupproject.common.config.MomoConfig;
import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.common.util.MomoCryptoUtil;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCallbackDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCreateRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCreateResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.CoinTransaction;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.CoinTransactionType;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus;
import com.fpt.sba301_su26_groupproject.entity.Order;
import com.fpt.sba301_su26_groupproject.entity.Payment;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.CoinTransactionRepository;
import com.fpt.sba301_su26_groupproject.repository.EnumRepository;
import com.fpt.sba301_su26_groupproject.repository.OrderRepository;
import com.fpt.sba301_su26_groupproject.repository.PaymentRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final MomoConfig momoConfig;
    private final EnumRepository enumRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CoinTransactionRepository coinTransactionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    @Transactional
    public PaymentMomoCreateResponseDTO createMomoPayment(PaymentMomoCreateRequestDTO request) {
        Order order = orderRepository.findById(UUID.fromString(request.orderId()))
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST,
                    "Đơn hàng không ở trạng thái PENDING, không thể tạo thanh toán");
        }

        String requestId = UUID.randomUUID().toString();
        String orderInfo = request.orderInfo() == null || request.orderInfo().isBlank()
                ? "Thanh toan don hang " + request.orderId()
                : request.orderInfo();

        Payment pendingPayment = new Payment();
        pendingPayment.setUser(order.getUser());
        pendingPayment.setOrder(order);
        pendingPayment.setAmountVnd(request.amount());
        pendingPayment.setCoinsReceived(order.getCoins());
        pendingPayment.setStatus(PaymentStatus.PENDING);
        pendingPayment.setProvider("MOMO");
        pendingPayment.setTransactionRef(requestId);
        pendingPayment.setCreatedAt(Instant.now());
        paymentRepository.save(pendingPayment);

        log.info("[Payment] Persisted PENDING payment: transactionRef={}, orderId={}", requestId, request.orderId());

        String requestType = request.requestType() != null ? request.requestType() : "captureWallet";
        String signature = MomoCryptoUtil.hmacSHA256(buildCreateSignatureRaw(
                requestId, requestId, request.amount(), orderInfo, requestType), momoConfig.getSecretKey());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", momoConfig.getPartnerCode());
        payload.put("accessKey", momoConfig.getAccessKey());
        payload.put("requestId", requestId);
        payload.put("amount", String.valueOf(request.amount()));
        payload.put("orderId", requestId);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", momoConfig.getRedirectUrl());
        payload.put("ipnUrl", momoConfig.getIpnUrl());
        payload.put("extraData", "");
        payload.put("requestType", requestType);
        payload.put("lang", "vi");
        payload.put("signature", signature);

        Map<String, Object> response = callMoMoApi(normalizeCreateEndpoint(momoConfig.getEndpoint()), payload);
        String resultCode = String.valueOf(response.getOrDefault("resultCode", ""));
        if (!"0".equals(resultCode)) {
            String message = String.valueOf(response.getOrDefault("message", "MoMo create payment failed"));
            throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR, message);
        }

        String payUrl = String.valueOf(response.get("payUrl"));
        if (payUrl == null || payUrl.isBlank() || "null".equalsIgnoreCase(payUrl)) {
            throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR, "MoMo response did not contain payUrl");
        }

        return new PaymentMomoCreateResponseDTO(payUrl, request.orderId());
    }

    @Override
    @Transactional
    public void handleMomoCallback(PaymentMomoCallbackDTO callback) {
        log.info("[MoMo IPN] Received callback: orderId={}, resultCode={}, transId={}",
                callback.orderId(), callback.resultCode(), callback.transId());

        if (!MomoCryptoUtil.verifyCallbackSignature(callback, momoConfig.getSecretKey(), momoConfig.getAccessKey())) {
            log.warn("[MoMo IPN] INVALID SIGNATURE — Possible fake request! orderId={}", callback.orderId());
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Invalid MoMo callback signature");
        }

        Payment payment = paymentRepository.findByTransactionRefForUpdate(callback.requestId())
                .orElseGet(() -> {
                    log.warn("[MoMo IPN] No payment found by requestId={}, orderId={}",
                            callback.requestId(), callback.orderId());
                    return null;
                });

        if (payment == null) {
            log.error("[MoMo IPN] Cannot find Payment record for requestId={}", callback.requestId());
            return;
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.info("[MoMo IPN] Payment already processed (status={}), skipping. orderId={}",
                    payment.getStatus(), callback.orderId());
            return;
        }

        Order order = payment.getOrder();

        if ("0".equals(callback.resultCode())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);

            User user = payment.getUser();
            int newBalance = user.getCoinBalance() + payment.getCoinsReceived();
            user.setCoinBalance(newBalance);
            userRepository.save(user);
            CoinTransaction tx = new CoinTransaction();
            tx.setUser(user);
            tx.setType(CoinTransactionType.TOPUP);
            tx.setAmount(payment.getCoinsReceived());
            tx.setBalanceAfter(newBalance);
            tx.setRefId(payment.getId());
            tx.setNote("Nạp coin qua MoMo - Order " + order.getId());
            tx.setCreatedAt(Instant.now());
            coinTransactionRepository.save(tx);

            log.info("[MoMo IPN] SUCCESS — orderId={}, coinsAdded={}, newBalance={}",
                    order.getId(), payment.getCoinsReceived(), newBalance);

        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);

            log.warn("[MoMo IPN] FAILED — orderId={}, resultCode={}, message={}",
                    callback.orderId(), callback.resultCode(), callback.message());
        }
    }

    @Override
    @Transactional
    public void syncPaymentStatus(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        Payment payment = paymentRepository.findByTransactionRef(
                paymentRepository.findAll().stream()
                        .filter(p -> p.getOrder() != null && p.getOrder().getId().equals(orderId))
                        .findFirst()
                        .map(Payment::getTransactionRef)
                        .orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND,
                                "Không tìm thấy giao dịch cho đơn hàng này"))
        ).orElseThrow(() -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Payment record"));

        log.info("[QueryDR] Syncing payment status for orderId={}, transactionRef={}",
                orderId, payment.getTransactionRef());

        String requestId = UUID.randomUUID().toString();
        String rawSignature = "accessKey=" + momoConfig.getAccessKey()
                + "&orderId=" + payment.getTransactionRef()
                + "&partnerCode=" + momoConfig.getPartnerCode()
                + "&requestId=" + requestId;
        String signature = MomoCryptoUtil.hmacSHA256(rawSignature, momoConfig.getSecretKey());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", momoConfig.getPartnerCode());
        payload.put("requestId", requestId);
        payload.put("orderId", payment.getTransactionRef());
        payload.put("lang", "vi");
        payload.put("signature", signature);

        String queryEndpoint = normalizeQueryEndpoint(momoConfig.getEndpoint());
        Map<String, Object> response = callMoMoApi(queryEndpoint, payload);

        String resultCode = String.valueOf(response.getOrDefault("resultCode", ""));
        log.info("[QueryDR] MoMo query result: orderId={}, resultCode={}", orderId, resultCode);

        if ("0".equals(resultCode) && payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);

            User user = payment.getUser();
            int newBalance = user.getCoinBalance() + payment.getCoinsReceived();
            user.setCoinBalance(newBalance);
            userRepository.save(user);

            CoinTransaction tx = new CoinTransaction();
            tx.setUser(user);
            tx.setType(CoinTransactionType.TOPUP);
            tx.setAmount(payment.getCoinsReceived());
            tx.setBalanceAfter(newBalance);
            tx.setRefId(payment.getId());
            tx.setNote("[QueryDR] Đối soát tự động - Order " + orderId);
            tx.setCreatedAt(Instant.now());
            coinTransactionRepository.save(tx);

            log.info("[QueryDR] Auto-reconciled SUCCESS for orderId={}", orderId);
        } else if (!"0".equals(resultCode) && payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);
            log.warn("[QueryDR] Marked FAILED for orderId={}, resultCode={}", orderId, resultCode);
        } else {
            log.info("[QueryDR] No state change needed for orderId={}, current status={}", orderId, payment.getStatus());
        }
    }

    private String buildCreateSignatureRaw(String requestId, String orderId, int amount,
                                           String orderInfo, String requestType) {
        return "accessKey=" + momoConfig.getAccessKey()
                + "&amount=" + amount
                + "&extraData="
                + "&ipnUrl=" + momoConfig.getIpnUrl()
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + momoConfig.getPartnerCode()
                + "&redirectUrl=" + momoConfig.getRedirectUrl()
                + "&requestId=" + requestId
                + "&requestType=" + requestType;
    }

    private Map<String, Object> callMoMoApi(String endpoint, Map<String, Object> payload) {
        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR,
                        "MoMo HTTP error " + httpResponse.statusCode() + ": " + httpResponse.body());
            }

            return objectMapper.readValue(httpResponse.body(), new TypeReference<>() {});
        } catch (IOException e) {
            throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR, "Failed to call MoMo: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR, "MoMo request interrupted");
        }
    }

    private String normalizeCreateEndpoint(String endpoint) {
        return endpoint.endsWith("/create") ? endpoint : endpoint + "/create";
    }

    private String normalizeQueryEndpoint(String endpoint) {
        String base = endpoint.replaceAll("/create$", "");
        return base.endsWith("/query") ? base : base + "/query";
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return enumRepository.getPaymentEnums();
    }
}
