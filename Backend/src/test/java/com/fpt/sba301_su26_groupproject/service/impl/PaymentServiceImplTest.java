package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.config.MomoConfig;
import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCreateRequestDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import com.fpt.sba301_su26_groupproject.entity.Order;
import com.fpt.sba301_su26_groupproject.repository.*;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceImplTest {
    private final MomoConfig config = mock(MomoConfig.class);
    private final OrderRepository orders = mock(OrderRepository.class);
    private final PaymentRepository payments = mock(PaymentRepository.class);
    private final PaymentServiceImpl service = new PaymentServiceImpl(config, mock(EnumRepository.class),
            payments, orders, mock(UserRepository.class), mock(CoinTransactionRepository.class));

    private PaymentMomoCreateRequestDTO request() {
        return new PaymentMomoCreateRequestDTO(UUID.randomUUID().toString(), 10000,
                "Test order", "captureWallet", "MOBILE", null);
    }

    @Test
    void missingRedirectStopsBeforeDatabaseAndGateway() {
        when(config.getRedirectUrl()).thenReturn("");
        ApiException ex = assertThrows(ApiException.class, () -> service.createMomoPayment(request()));
        assertEquals(CommonErrorCode.SERVICE_UNAVAILABLE, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("DEV_MOMO_REDIRECT_URL"));
        verifyNoInteractions(orders, payments);
    }

    @Test
    void missingOrLocalIpnStopsBeforeDatabaseAndGateway() {
        when(config.getRedirectUrl()).thenReturn("https://backend.example/payment-result.html");
        for (String ipn : new String[]{"", "http://localhost:8080/api/orders/momo/callback",
                "https://127.0.0.1/api/orders/momo/callback", "relative/path"}) {
            when(config.getIpnUrl()).thenReturn(ipn);
            ApiException ex = assertThrows(ApiException.class, () -> service.createMomoPayment(request()));
            assertEquals(CommonErrorCode.SERVICE_UNAVAILABLE, ex.getErrorCode());
        }
        verifyNoInteractions(orders, payments);
    }

    @Test
    void blankMobileRedirectFallsBackToConfiguredWebUrl() {
        when(config.getRedirectUrl()).thenReturn("https://backend.example/payment-result.html");
        when(config.getMobileRedirectUrl()).thenReturn("");
        when(config.getIpnUrl()).thenReturn("https://backend.example/api/orders/momo/callback");
        when(orders.findById(any())).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.createMomoPayment(request()));
        assertEquals(CommonErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
        verify(orders).findById(any());
    }

    @Test
    void gatewayRejectionPreservesOriginalMomoCode() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/create", exchange -> {
            exchange.getRequestBody().readAllBytes();
            byte[] body = "{\"resultCode\":99,\"message\":\"Declined due to general reasons\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (var output = exchange.getResponseBody()) { output.write(body); }
        });
        server.start();
        try {
            when(config.getRedirectUrl()).thenReturn("https://backend.example/payment-result.html");
            when(config.getIpnUrl()).thenReturn("https://backend.example/api/orders/momo/callback");
            when(config.getEndpoint()).thenReturn("http://127.0.0.1:" + server.getAddress().getPort());
            when(config.getSecretKey()).thenReturn("test-only-secret");
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.PENDING);
            when(order.getCoins()).thenReturn(100);
            when(orders.findById(any())).thenReturn(Optional.of(order));
            ApiException ex = assertThrows(ApiException.class, () -> service.createMomoPayment(request()));
            assertEquals(CommonErrorCode.EXTERNAL_SERVICE_ERROR, ex.getErrorCode());
            assertTrue(ex.getMessage().contains("MoMo resultCode=99"));
            assertTrue(ex.getMessage().contains("Declined due to general reasons"));
        } finally {
            server.stop(0);
        }
    }
}
