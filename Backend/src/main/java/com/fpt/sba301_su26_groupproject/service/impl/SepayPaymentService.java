package com.fpt.sba301_su26_groupproject.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.sba301_su26_groupproject.common.exception.*;
import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import com.fpt.sba301_su26_groupproject.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

/** SePay bank-transfer TEST MODE only. No live bank transfer is initiated here. */
@Service
@RequiredArgsConstructor
public class SepayPaymentService {
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final UserRepository users;
    private final CoinTransactionRepository transactions;
    private final SepayReceiptRepository receipts;
    @Value("${sepay.bank-code:}") private String bankCode;
    @Value("${sepay.bank-name:}") private String bankName;
    @Value("${sepay.account-number:}") private String accountNumber;
    @Value("${sepay.virtual-account:}") private String virtualAccount = "";
    @Value("${sepay.webhook-secret:}") private String secret;
    @Value("${sepay.webhook-auth-mode:hmac}") private String authMode = "hmac";
    @Value("${sepay.webhook-api-key:}") private String apiKey;
    private static final Pattern CODE = Pattern.compile("(?i)(?<![A-Z0-9])NV[0-9A-F]{32}(?![A-Z0-9])");

    public static String paymentCode(UUID orderId) {
        return "NV" + orderId.toString().replace("-", "").toUpperCase(Locale.ROOT);
    }

    @Transactional
    public String createQr(Order requestedOrder) {
        if (bankCode.isBlank() || bankName.isBlank() || accountNumber.isBlank() || !authenticationConfigured()) {
            throw new ApiException(CommonErrorCode.SERVICE_UNAVAILABLE, "SePay Test Mode is not configured.");
        }
        Order order = orders.findByIdForUpdate(requestedOrder.getId()).orElseThrow(
                () -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND));
        if (order.getStatus() != OrderStatus.PENDING) throw new ApiException(CommonErrorCode.CONFLICT);
        String code = paymentCode(order.getId());
        Payment payment = payments.findByTransactionRefForUpdate(code).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
            payment.setUser(order.getUser());
            payment.setAmountVnd(order.getAmountVnd());
            payment.setCoinsReceived(order.getCoins());
            payment.setProvider("SEPAY_TEST");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionRef(code);
            payment.setCreatedAt(Instant.now());
            payments.save(payment);
        }
        String recipient = virtualAccount.isBlank() ? accountNumber : virtualAccount;
        return "https://vietqr.app/img?acc=" + encode(recipient) + "&bank=" + encode(bankCode)
                + "&amount=" + order.getAmountVnd() + "&des=" + encode(code);
    }

    public void authenticate(byte[] body, String timestamp, String signature) {
        authenticate(body, timestamp, signature, null);
    }

    public void authenticate(byte[] body, String timestamp, String signature, String authorization) {
        if ("apikey".equalsIgnoreCase(authMode)) {
            if (apiKey == null || apiKey.isBlank()) throw new ApiException(CommonErrorCode.SERVICE_UNAVAILABLE);
            String expected = "Apikey " + apiKey;
            if (authorization == null || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {
                throw new ApiException(CommonErrorCode.UNAUTHORIZED, "Invalid SePay webhook API key.");
            }
            return;
        }
        if (!"hmac".equalsIgnoreCase(authMode)) throw new ApiException(CommonErrorCode.SERVICE_UNAVAILABLE);
        if (secret == null || secret.isBlank()) throw new ApiException(CommonErrorCode.SERVICE_UNAVAILABLE);
        try {
            long signedAt = Long.parseLong(timestamp);
            long now = Instant.now().getEpochSecond();
            if (signedAt < now - 300 || signedAt > now + 300) throw new IllegalArgumentException();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            mac.update((timestamp + ".").getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + HexFormat.of().formatHex(mac.doFinal(body));
            if (signature == null || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII),
                    signature.getBytes(StandardCharsets.US_ASCII))) throw new IllegalArgumentException();
        } catch (Exception ex) {
            throw new ApiException(CommonErrorCode.UNAUTHORIZED, "Invalid or expired SePay webhook signature.");
        }
    }

    private boolean authenticationConfigured() {
        return ("apikey".equalsIgnoreCase(authMode) && apiKey != null && !apiKey.isBlank())
                || ("hmac".equalsIgnoreCase(authMode) && secret != null && !secret.isBlank());
    }

    @Transactional
    public void receive(byte[] body) {
        JsonNode data;
        try { data = new ObjectMapper().readTree(body); }
        catch (Exception ex) { throw new ApiException(CommonErrorCode.BAD_REQUEST, "Invalid webhook JSON."); }
        if (data == null || !data.isObject()) throw new ApiException(CommonErrorCode.BAD_REQUEST);
        if (!"in".equals(data.path("transferType").asText())) return;
        String id = data.path("id").asText("");
        if (!id.matches("[0-9]{1,30}") || new BigDecimal(id).signum() <= 0) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Missing transaction ID.");
        }
        Set<String> codes = new HashSet<>();
        for (String field : List.of("code", "content")) {
            var matcher = CODE.matcher(data.path(field).asText(""));
            while (matcher.find()) codes.add(matcher.group().toUpperCase(Locale.ROOT));
        }
        if (codes.isEmpty()) return; // unrelated incoming transaction
        if (codes.size() != 1) throw new ApiException(CommonErrorCode.BAD_REQUEST, "Ambiguous payment code.");
        if (!accountNumber.equals(data.path("accountNumber").asText())
                || !bankName.equalsIgnoreCase(data.path("gateway").asText())
                || !virtualAccount.equals(data.path("subAccount").asText(""))) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Unexpected test bank account.");
        }
        String paymentCode = codes.iterator().next();
        String hex = paymentCode.substring(2);
        UUID orderId = UUID.fromString(hex.substring(0, 8) + "-" + hex.substring(8, 12) + "-"
                + hex.substring(12, 16) + "-" + hex.substring(16, 20) + "-" + hex.substring(20));
        // Consistent lock order for checkout/retry/webhook: order -> payment -> user.
        Order order = orders.findByIdForUpdate(orderId).orElse(null);
        if (order == null) return;
        Payment payment = payments.findByTransactionRefForUpdate(paymentCode).orElse(null);
        if (payment == null || !"SEPAY_TEST".equals(payment.getProvider())) return;
        if (payment.getOrder() == null || !orderId.equals(payment.getOrder().getId())) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST);
        }
        if (payment.getStatus() != PaymentStatus.PENDING || order.getStatus() != OrderStatus.PENDING) return;
        BigDecimal amount;
        try { amount = new BigDecimal(data.path("transferAmount").asText()); }
        catch (Exception ex) { throw new ApiException(CommonErrorCode.BAD_REQUEST, "Invalid amount."); }
        if (amount.compareTo(BigDecimal.valueOf(payment.getAmountVnd())) != 0
                || !payment.getAmountVnd().equals(order.getAmountVnd())) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Payment amount does not match the order.");
        }
        if (receipts.existsById(id)) return;
        SepayReceipt receipt = new SepayReceipt();
        receipt.setTransactionId(id);
        receipt.setOrderId(order.getId());
        receipt.setReceivedAt(Instant.now());
        // Unique transaction ID is flushed before crediting. Concurrent replay rolls back safely.
        receipts.saveAndFlush(receipt);
        User user = users.findByIdForUpdate(payment.getUser().getId()).orElseThrow(
                () -> new ApiException(CommonErrorCode.RESOURCE_NOT_FOUND));
        int balance = Math.addExact(user.getCoinBalance(), payment.getCoinsReceived());
        user.setCoinBalance(balance);
        users.save(user);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());
        payments.save(payment);
        order.setStatus(OrderStatus.COMPLETED);
        orders.save(order);
        CoinTransaction tx = new CoinTransaction();
        tx.setUser(user);
        tx.setType(CoinTransactionType.TOPUP);
        tx.setAmount(payment.getCoinsReceived());
        tx.setBalanceAfter(balance);
        tx.setRefId(payment.getId());
        tx.setNote("SePay TEST - Order " + order.getId());
        tx.setCreatedAt(Instant.now());
        transactions.save(tx);
    }

    private static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
