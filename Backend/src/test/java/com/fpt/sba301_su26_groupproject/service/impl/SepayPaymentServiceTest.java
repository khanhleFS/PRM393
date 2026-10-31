package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import com.fpt.sba301_su26_groupproject.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SepayPaymentServiceTest {
    final OrderRepository orders = mock(OrderRepository.class);
    final PaymentRepository payments = mock(PaymentRepository.class);
    final UserRepository users = mock(UserRepository.class);
    final CoinTransactionRepository txs = mock(CoinTransactionRepository.class);
    final SepayReceiptRepository receipts = mock(SepayReceiptRepository.class);
    final SepayPaymentService service = new SepayPaymentService(orders, payments, users, txs, receipts);
    final Order order = new Order();
    final User user = new User();
    final Payment payment = new Payment();
    String code;

    @BeforeEach void setup() {
        ReflectionTestUtils.setField(service, "bankCode", "VCB");
        ReflectionTestUtils.setField(service, "bankName", "Vietcombank");
        ReflectionTestUtils.setField(service, "accountNumber", "0000000001");
        ReflectionTestUtils.setField(service, "secret", "test-secret");
        order.setId(UUID.randomUUID()); order.setStatus(OrderStatus.PENDING);
        order.setAmountVnd(10000); order.setCoins(100);
        user.setId(UUID.randomUUID()); user.setCoinBalance(5); order.setUser(user);
        code = SepayPaymentService.paymentCode(order.getId());
        payment.setId(UUID.randomUUID()); payment.setOrder(order); payment.setUser(user);
        payment.setStatus(PaymentStatus.PENDING); payment.setProvider("SEPAY_TEST");
        payment.setAmountVnd(10000); payment.setCoinsReceived(100); payment.setTransactionRef(code);
    }
    byte[] body(String direction, String account, String amount, String content) {
        return ("{\"id\":12345,\"gateway\":\"Vietcombank\",\"transferType\":\""+direction
                +"\",\"accountNumber\":\""+account+"\",\"transferAmount\":"+amount
                +",\"content\":\""+content+"\"}").getBytes(StandardCharsets.UTF_8);
    }
    void pending() {
        when(orders.findByIdForUpdate(order.getId())).thenReturn(Optional.of(order));
        when(payments.findByTransactionRefForUpdate(code)).thenReturn(Optional.of(payment));
        when(users.findByIdForUpdate(user.getId())).thenReturn(Optional.of(user));
    }
    String sign(byte[] body, String timestamp) throws Exception {
        Mac mac=Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test-secret".getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
        mac.update((timestamp+".").getBytes(StandardCharsets.UTF_8));
        return "sha256="+HexFormat.of().formatHex(mac.doFinal(body));
    }
    @Test void validSignatureUsesExactRawBody() throws Exception {
        byte[] b=body("in","0000000001","10000",code);
        String time=Long.toString(Instant.now().getEpochSecond());
        service.authenticate(b,time,sign(b,time));
        assertThrows(ApiException.class,()->service.authenticate((new String(b,StandardCharsets.UTF_8)+" ").getBytes(StandardCharsets.UTF_8),time,sign(b,time)));
    }
    @Test void expiredOrMissingSignatureIsRejected() throws Exception {
        byte[] b=body("in","0000000001","10000",code);
        String old=Long.toString(Instant.now().getEpochSecond()-3600);
        assertThrows(ApiException.class,()->service.authenticate(b,old,sign(b,old)));
        assertThrows(ApiException.class,()->service.authenticate(b,null,null));
        verifyNoInteractions(orders,payments,users,txs,receipts);
    }
    @Test void apiKeyModeRequiresExactSePayAuthorizationHeader() {
        ReflectionTestUtils.setField(service, "authMode", "apikey");
        ReflectionTestUtils.setField(service, "apiKey", "unit-test-key");
        assertDoesNotThrow(() -> service.authenticate(new byte[0], null, null, "Apikey unit-test-key"));
        assertThrows(ApiException.class, () -> service.authenticate(new byte[0], null, null, null));
        assertThrows(ApiException.class, () -> service.authenticate(new byte[0], null, null, "Bearer unit-test-key"));
        assertThrows(ApiException.class, () -> service.authenticate(new byte[0], null, null, "Apikey wrong"));
    }
    @Test void invalidAuthenticationModeFailsClosed() {
        ReflectionTestUtils.setField(service, "authMode", "none");
        assertThrows(ApiException.class, () -> service.authenticate(new byte[0], null, null, "Apikey anything"));
    }
    @Test void correctTransferCreditsOnceAndUpdatesBothStatuses() {
        pending(); byte[] b=body("in","0000000001","10000.00",code);
        service.receive(b); service.receive(b);
        assertEquals(105,user.getCoinBalance());
        assertEquals(PaymentStatus.SUCCESS,payment.getStatus());
        assertEquals(OrderStatus.COMPLETED,order.getStatus());
        verify(txs,times(1)).save(any()); verify(receipts,times(1)).saveAndFlush(any());
    }
    @Test void wrongAmountNeverCredits() {
        pending(); assertThrows(ApiException.class,()->service.receive(body("in","0000000001","9999",code)));
        verifyNoInteractions(txs,receipts); assertEquals(5,user.getCoinBalance());
    }
    @Test void wrongBankAccountNeverCredits() {
        assertThrows(ApiException.class,()->service.receive(body("in","0000000002","10000",code)));
        verifyNoInteractions(orders,payments,users,txs,receipts);
    }
    @Test void outgoingOrUnrelatedTransfersAreAcknowledgedWithoutCredit() {
        service.receive(body("out","0000000001","10000",code));
        service.receive(body("in","0000000001","10000","Unrelated transfer"));
        verifyNoInteractions(orders,payments,users,txs,receipts);
    }
    @Test void reusedTransactionIdCannotPayAnotherOrder() {
        pending(); when(receipts.existsById("12345")).thenReturn(true);
        service.receive(body("in","0000000001","10000",code));
        verifyNoInteractions(txs); verify(users,never()).save(any());
    }
    @Test void expiredPaymentOrCancelledOrderCannotCredit() {
        pending(); payment.setStatus(PaymentStatus.EXPIRED);
        service.receive(body("in","0000000001","10000",code));
        payment.setStatus(PaymentStatus.PENDING); order.setStatus(OrderStatus.CANCELLED);
        service.receive(body("in","0000000001","10000",code));
        verifyNoInteractions(txs,receipts);
    }
    @Test void ambiguousCodeAndMalformedBodyAreRejected() {
        String second=SepayPaymentService.paymentCode(UUID.randomUUID());
        assertThrows(ApiException.class,()->service.receive(body("in","0000000001","10000",code+" "+second)));
        assertThrows(ApiException.class,()->service.receive("[]".getBytes(StandardCharsets.UTF_8)));
        verifyNoInteractions(orders,payments,users,txs,receipts);
    }
    @Test void qrRetryReusesExistingPayment() {
        pending(); String qr=service.createQr(order);
        assertTrue(qr.contains("acc=0000000001")); assertTrue(qr.contains(code));
        verify(payments,never()).save(any());
    }
    @Test void configuredVirtualAccountCreditsOnceAndUsesVaInQr() {
        pending();
        ReflectionTestUtils.setField(service, "virtualAccount", "SBSEPAYTEST00000001");
        assertTrue(service.createQr(order).contains("acc=SBSEPAYTEST00000001"));
        byte[] payload = withVa("SBSEPAYTEST00000001");
        service.receive(payload);
        service.receive(payload);
        assertEquals(105, user.getCoinBalance());
        verify(txs, times(1)).save(any());
    }
    @Test void wrongOrMissingVirtualAccountCannotCredit() {
        ReflectionTestUtils.setField(service, "virtualAccount", "SBSEPAYTEST00000001");
        assertThrows(ApiException.class, () -> service.receive(withVa("SBSEPAYOTHER")));
        assertThrows(ApiException.class, () -> service.receive(body("in", "0000000001", "10000", code)));
        verifyNoInteractions(orders, payments, users, txs, receipts);
    }
    @Test void unsolicitedVirtualAccountCannotCreditWithoutVaConfiguration() {
        assertThrows(ApiException.class, () -> service.receive(withVa("SBSEPAYTEST00000001")));
        verifyNoInteractions(orders, payments, users, txs, receipts);
    }
    byte[] withVa(String va) {
        String json = new String(body("in", "0000000001", "10000", code), StandardCharsets.UTF_8);
        return (json.substring(0, json.length() - 1) + ",\"subAccount\":\"" + va + "\"}")
                .getBytes(StandardCharsets.UTF_8);
    }
}
