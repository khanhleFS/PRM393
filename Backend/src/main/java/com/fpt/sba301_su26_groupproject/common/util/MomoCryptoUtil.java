package com.fpt.sba301_su26_groupproject.common.util;

import com.fpt.sba301_su26_groupproject.dto.payment.PaymentMomoCallbackDTO;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Slf4j
public final class MomoCryptoUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private MomoCryptoUtil() {
    }

    public static String hmacSHA256(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexBuilder = new StringBuilder(rawHmac.length * 2);
            for (byte b : rawHmac) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexBuilder.append('0');
                hexBuilder.append(hex);
            }
            return hexBuilder.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to compute MoMo HMAC-SHA256 signature", e);
        }
    }

    public static boolean verifyCallbackSignature(PaymentMomoCallbackDTO callback, String secretKey, String accessKey) {
        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + callback.amount()
                + "&extraData=" + (callback.extraData() != null ? callback.extraData() : "")
                + "&message=" + callback.message()
                + "&orderId=" + callback.orderId()
                + "&orderInfo=" + callback.orderInfo()
                + "&orderType=" + callback.orderType()
                + "&partnerCode=" + callback.partnerCode()
                + "&payType=" + callback.payType()
                + "&requestId=" + callback.requestId()
                + "&responseTime=" + callback.responseTime()
                + "&resultCode=" + callback.resultCode()
                + "&transId=" + callback.transId();

        String computedSignature = hmacSHA256(rawSignature, secretKey);
        boolean valid = computedSignature.equals(callback.signature());

        if (!valid) {
            log.warn("[MoMo IPN] Signature mismatch! orderId={}, expected={}, received={}",
                    callback.orderId(), computedSignature, callback.signature());
        }

        return valid;
    }
}
