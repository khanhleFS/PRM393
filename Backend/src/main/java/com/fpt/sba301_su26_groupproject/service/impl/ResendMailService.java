package com.fpt.sba301_su26_groupproject.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.sba301_su26_groupproject.service.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailSendException;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** HTTPS delivery for hosts that block SMTP. Preserves the existing email templates. */
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "resend")
public class ResendMailService implements MailService {
    private final TemplateEngine templateEngine;
    private final String apiKey;
    private final String from;
    private final URI endpoint;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10)).build();

    public ResendMailService(TemplateEngine templateEngine,
            @Value("${app.mail.resend.api-key:}") String apiKey,
            @Value("${app.mail.from:}") String from,
            @Value("${app.mail.resend.endpoint:https://api.resend.com/emails}") String endpoint) {
        this.templateEngine = templateEngine;
        this.apiKey = apiKey;
        this.from = from;
        this.endpoint = URI.create(endpoint);
    }

    @Override
    public void sendPlainText(String to, String subject, String body) {
        send(to, subject, "text", body);
    }

    @Override
    public void sendHtml(String to, String subject, String htmlBody) {
        send(to, subject, "html", htmlBody);
    }

    @Override
    public void sendWithTemplate(String to, String subject, String templateName, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        sendHtml(to, subject, templateEngine.process(templateName, context));
    }

    private void send(String to, String subject, String contentType, String body) {
        if (apiKey == null || apiKey.isBlank() || from == null || from.isBlank()) {
            throw new MailSendException("Configure RESEND_API_KEY and MAIL_FROM before sending email.");
        }
        try {
            String json = mapper.writeValueAsString(Map.of(
                    "from", from, "to", List.of(to), "subject", subject, contentType, body));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                // Provider bodies can contain recipient addresses or message contents. Do not expose them.
                throw new MailSendException("Email API rejected the request (HTTP " + response.statusCode()
                        + "). Check sender verification, API credentials and sending quota in Resend.");
            }
            var id = mapper.readTree(response.body()).path("id");
            if (!id.isTextual() || id.asText().isBlank()) {
                throw new MailSendException("Email API returned no delivery request ID.");
            }
        } catch (IOException ex) {
            throw new MailSendException("Could not reach the email API or read its response.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new MailSendException("Email API request interrupted.");
        }
    }
}
