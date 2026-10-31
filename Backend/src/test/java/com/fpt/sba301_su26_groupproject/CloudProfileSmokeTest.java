package com.fpt.sba301_su26_groupproject;

import com.fpt.sba301_su26_groupproject.service.MailService;
import com.fpt.sba301_su26_groupproject.service.impl.ResendMailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import com.fpt.sba301_su26_groupproject.repository.*;
import com.fpt.sba301_su26_groupproject.service.impl.SepayPaymentService;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

/** Exercises the real web/security/cloud wiring without Azure, Upstash, or sending email. */
@ActiveProfiles("cloud")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:cloud-smoke;MODE=MSSQLServer;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "JPA_DDL_AUTO=create-drop",
        "DB_HOST=unused.database.windows.net", "DB_NAME=unused", "DB_USERNAME=unused", "DB_PASSWORD=unused",
        "REDIS_HOST=127.0.0.1", "REDIS_PORT=1", "REDIS_PASSWORD=test-only",
        "spring.jpa.open-in-view=false",
        "MAIL_PROVIDER=resend", "sepay.bank-code=VCB", "sepay.bank-name=Vietcombank",
        "sepay.account-number=0000000001", "sepay.webhook-secret=integration-test-only"
})
class CloudProfileSmokeTest {
    @LocalServerPort int port;
    @Autowired MailService mail;
    @Autowired Environment environment;
    @Autowired JdbcTemplate jdbc;
    @Autowired UserRepository users;
    @Autowired CoinPackageRepository packages;
    @Autowired OrderRepository orders;
    @Autowired SepayPaymentService sepay;
    @Autowired NovelRepository novels;
    @Autowired ChapterRepository chapters;

    @Test
    void populatedLibraryCanBeReadWithOpenSessionInViewDisabled() throws Exception {
        User author = users.saveAndFlush(User.builder().username("Library Author")
                .email("library@example.invalid").phone("library-test").password("unused")
                .role(UserRole.AUTHOR).isAuthor(true).build());
        Novel novel = new Novel();
        novel.setAuthor(author); novel.setTitle("Library Fixture"); novel.setSlug("library-fixture");
        novel.setViewCount(0); novel.setCreatedAt(Instant.now()); novel.setUpdatedAt(Instant.now());
        novel = novels.saveAndFlush(novel);
        Chapter chapter = new Chapter();
        chapter.setNovel(novel); chapter.setChapterNumber(1); chapter.setTitle("Free Chapter");
        chapter.setSlug("library-fixture-1"); chapter.setContent("Original demo chapter content.");
        chapter.setStatus(ChapterStatus.FREE); chapter.setCoinPrice(0); chapter.setViewCount(0);
        chapter = chapters.saveAndFlush(chapter);
        try (HttpClient client = HttpClient.newHttpClient()) {
            for (String path : new String[]{"/api/novels?size=2", "/api/novels/" + novel.getId(),
                    "/api/novels/" + novel.getId() + "/chapters"}) {
                var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                        .GET().build(), HttpResponse.BodyHandlers.ofString());
                assertEquals(200, response.statusCode(), response.body());
                assertTrue(response.body().contains(path.endsWith("/chapters") ? "Free Chapter" : "Library Fixture"));
            }
        } finally {
            chapters.deleteById(chapter.getId()); novels.deleteById(novel.getId()); users.deleteById(author.getId());
        }
    }

    @Test
    void apiKeyAuthorizationPassesThroughJwtFilterToWebhook() throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(sepay, "authMode", "apikey");
        org.springframework.test.util.ReflectionTestUtils.setField(sepay, "apiKey", "http-test-key");
        try (HttpClient client = HttpClient.newHttpClient()) {
            var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/payments/sepay/test/webhook"))
                    .header("Content-Type", "application/json").header("Authorization", "Apikey http-test-key")
                    .POST(HttpRequest.BodyPublishers.ofString("{\"id\":1,\"transferType\":\"in\",\"content\":\"unrelated\"}"));
            var response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), response.body());
            assertEquals("{\"success\":true}", response.body());
            assertEquals(401, postWebhook(client, "{}", false).statusCode());
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(sepay, "authMode", "hmac");
        }
    }

    @Test
    void signedWebhookCommitsOneCreditAndRejectsUnsignedAndWrongAmount() throws Exception {
        User user = users.saveAndFlush(User.builder().username("sepay-test").email("sepay@example.invalid")
                .phone("test-only").password("unused").role(UserRole.USER).build());
        CoinPackage pack = packages.saveAndFlush(CoinPackage.builder().name("test")
                .priceVnd(10000).baseCoins(100).isActive(true).build());
        Order order = orders.saveAndFlush(Order.builder().user(user).coinPackage(pack).quantity(1)
                .amountVnd(10000).coins(100).status(OrderStatus.PENDING).build());
        try {
            assertTrue(sepay.createQr(order).contains("acc=0000000001"));
            String payload = "{\"id\":900001,\"gateway\":\"Vietcombank\",\"accountNumber\":\"0000000001\","
                    + "\"transferType\":\"in\",\"transferAmount\":10000,\"content\":\""
                    + SepayPaymentService.paymentCode(order.getId()) + "\"}";
            try (HttpClient client = HttpClient.newHttpClient()) {
                assertEquals(401, postWebhook(client, payload, false).statusCode());
                assertEquals(400, postWebhook(client, payload.replace(":10000", ":9999"), true).statusCode());
                assertEquals(0, users.findById(user.getId()).orElseThrow().getCoinBalance());
                var success = postWebhook(client, payload, true);
                assertEquals(200, success.statusCode(), success.body());
                assertEquals("{\"success\":true}", success.body());
                assertEquals(200, postWebhook(client, payload, true).statusCode());
            }
            assertEquals(100, users.findById(user.getId()).orElseThrow().getCoinBalance());
            assertEquals(OrderStatus.COMPLETED, orders.findById(order.getId()).orElseThrow().getStatus());
            assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM coin_transactions WHERE user_id = ?", Integer.class, user.getId()));
            assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM sepay_test_receipts", Integer.class));
        } finally {
            jdbc.update("DELETE FROM coin_transactions WHERE user_id = ?", user.getId());
            jdbc.update("DELETE FROM sepay_test_receipts WHERE order_id = ?", order.getId());
            jdbc.update("DELETE FROM payments WHERE order_id = ?", order.getId());
            orders.deleteById(order.getId());
            packages.deleteById(pack.getId());
            users.deleteById(user.getId());
        }
    }

    private HttpResponse<String> postWebhook(HttpClient client, String body, boolean signed) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/payments/sepay/test/webhook"))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body));
        if (signed) {
            String timestamp = Long.toString(Instant.now().getEpochSecond());
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec("integration-test-only".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String signature = HexFormat.of().formatHex(mac.doFinal((timestamp + "." + body).getBytes(StandardCharsets.UTF_8)));
            request.header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", "sha256=" + signature);
        }
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void cloudStartsWithoutDestructiveSeedAndExposesUnauthenticatedLiveness() throws Exception {
        assertInstanceOf(ResendMailService.class, mail);
        assertEquals("never", environment.getProperty("spring.sql.init.mode"));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class));
        try (HttpClient client = HttpClient.newHttpClient()) {
            for (String path : new String[]{"/api/app/health", "/payment-result.html"}) {
                var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                        .GET().build(), HttpResponse.BodyHandlers.ofString());
                assertEquals(200, response.statusCode(), path);
                assertFalse(response.body().isBlank());
            }
        }
    }
}
