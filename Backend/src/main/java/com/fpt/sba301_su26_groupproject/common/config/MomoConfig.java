package com.fpt.sba301_su26_groupproject.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MomoConfig {

    @Value("${momo.dev.endpoint:https://test-payment.momo.vn/v2/gateway/api}")
    private String endpoint;

    @Value("${momo.dev.access-key:mTCKt9W3eU1m39TW}")
    private String accessKey;

    @Value("${momo.dev.partner-code:MOMOLRJZ20181206}")
    private String partnerCode;

    @Value("${momo.dev.secret-key:SetA5RDnLHvt51AULf51DyauxUo3kDU6}")
    private String secretKey;

    @Value("${momo.dev.redirect-url:http://localhost:8080/swagger-ui.html}")
    private String redirectUrl;

    @Value("${momo.dev.ipn-url:http://localhost:8080/api/orders/momo/callback}")
    private String ipnUrl;

    public String getEndpoint() {
        return endpoint;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getPartnerCode() {
        return partnerCode;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }
}
