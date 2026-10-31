package com.fpt.sba301_su26_groupproject.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.sba301_su26_groupproject.service.MailService;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class ResendMailServiceTest {
    private HttpServer server;
    private TemplateEngine templates;
    private String endpoint;
    private final AtomicReference<String> requestBody = new AtomicReference<>();
    private final AtomicReference<String> authorization = new AtomicReference<>();
    private final AtomicInteger status = new AtomicInteger(200);
    private final AtomicReference<String> response = new AtomicReference<>("{\"id\":\"test-email\"}");

    @BeforeEach
    void setup() throws Exception {
        templates = new SpringTemplateEngine();
        templates.setTemplateResolver(new StringTemplateResolver());
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] bytes = response.get().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status.get(), bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
        });
        server.start();
        endpoint = "http://127.0.0.1:" + server.getAddress().getPort() + "/emails";
    }

    @AfterEach
    void stop() { server.stop(0); }

    private ResendMailService service() {
        return new ResendMailService(templates, "test-only-api-key", "Luminovels <otp@example.com>", endpoint);
    }

    @Test
    void sendsUnicodeTextUsingHttpsApiPayloadAndBearerAuthentication() throws Exception {
        service().sendPlainText("reader@example.com", "Xác thực tài khoản", "Mã OTP: 123456");
        JsonNode json = new ObjectMapper().readTree(requestBody.get());
        assertEquals("Bearer test-only-api-key", authorization.get());
        assertEquals("reader@example.com", json.path("to").get(0).asText());
        assertEquals("Luminovels <otp@example.com>", json.path("from").asText());
        assertEquals("Xác thực tài khoản", json.path("subject").asText());
        assertEquals("Mã OTP: 123456", json.path("text").asText());
        assertFalse(json.has("html"));
    }

    @Test
    void rendersExistingThymeleafContractAsHtml() throws Exception {
        service().sendWithTemplate("reader@example.com", "OTP", "<p th:text='${otp}'></p>", Map.of("otp", "123456"));
        JsonNode json = new ObjectMapper().readTree(requestBody.get());
        assertTrue(json.path("html").asText().contains("123456"));
        assertFalse(json.has("text"));
    }

    @Test
    void rejectionDoesNotExposeProviderResponseOrPretendEmailWasSent() {
        status.set(403);
        response.set("{\"message\":\"private-recipient@example.com secret-otp-123456\"}");
        MailSendException ex = assertThrows(MailSendException.class,
                () -> service().sendPlainText("reader@example.com", "OTP", "123456"));
        assertTrue(ex.getMessage().contains("HTTP 403"));
        assertFalse(ex.getMessage().contains("private-recipient"));
        assertFalse(ex.getMessage().contains("123456"));
    }

    @Test
    void invalidSuccessResponseIsNotTreatedAsDeliveryAcceptance() {
        response.set("{}");
        assertThrows(MailSendException.class, () -> service().sendPlainText("reader@example.com", "OTP", "123456"));
    }

    @Test
    void missingCredentialsDoNotSendAnything() {
        ResendMailService missing = new ResendMailService(templates, "", "", endpoint);
        assertThrows(MailSendException.class, () -> missing.sendPlainText("reader@example.com", "OTP", "123456"));
        assertNull(requestBody.get());
    }

    private ApplicationContextRunner mailContext() {
        return new ApplicationContextRunner()
                .withBean(TemplateEngine.class, () -> templates)
                .withBean(JavaMailSender.class, () -> mock(JavaMailSender.class))
                .withUserConfiguration(MailServiceImpl.class, ResendMailService.class);
    }

    @Test
    void localDefaultsToSmtp() {
        mailContext().run(context -> {
            assertNull(context.getStartupFailure());
            assertInstanceOf(MailServiceImpl.class, context.getBean(MailService.class));
            assertEquals(1, context.getBeansOfType(MailService.class).size());
        });
    }

    @Test
    void cloudSelectionUsesOnlyResend() {
        mailContext().withPropertyValues("app.mail.provider=resend", "app.mail.resend.endpoint=" + endpoint)
                .run(context -> {
                    assertNull(context.getStartupFailure());
                    assertInstanceOf(ResendMailService.class, context.getBean(MailService.class));
                    assertEquals(1, context.getBeansOfType(MailService.class).size());
                });
    }
}
