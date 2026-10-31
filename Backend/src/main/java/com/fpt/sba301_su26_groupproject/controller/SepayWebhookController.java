package com.fpt.sba301_su26_groupproject.controller;
import com.fpt.sba301_su26_groupproject.service.impl.SepayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SepayWebhookController {
    private final SepayPaymentService service;
    @PostMapping(value = "/api/payments/sepay/test/webhook", consumes = "application/json")
    public Map<String, Boolean> webhook(@RequestBody byte[] body,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-SePay-Signature", required = false) String signature,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        service.authenticate(body, timestamp, signature, authorization);
        service.receive(body);
        return Map.of("success", true);
    }
}
