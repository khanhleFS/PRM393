package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.service.EncryptionService;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
public class EncryptionServiceImpl implements EncryptionService {

    @Override
    public Map<String, String> encrypt(String plainText, String contextId) {
        if (plainText == null) {
            plainText = "";
        }
        try {
            // 1. Tạo IV ngẫu nhiên 16 bytes cho mỗi lần mã hóa
            byte[] iv = new byte[16];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            String ivHex = bytesToHex(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // 2. Tạo Dynamic Key từ SHA-256(contextId + ":" + ivHex)
            String seed = (contextId != null ? contextId : "default") + ":" + ivHex;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = md.digest(seed.getBytes(StandardCharsets.UTF_8));
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

            // 3. Khởi tạo Cipher mã hóa AES/CBC/PKCS5Padding
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

            // 4. Mã hóa chuỗi
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // 5. Trả về Map chứa chuỗi HEX của Encrypted Data và IV
            Map<String, String> result = new HashMap<>();
            result.put("encryptedData", bytesToHex(encryptedBytes));
            result.put("iv", ivHex);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa dữ liệu: " + e.getMessage(), e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
