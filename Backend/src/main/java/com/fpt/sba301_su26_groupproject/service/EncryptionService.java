package com.fpt.sba301_su26_groupproject.service;

import java.util.Map;

public interface EncryptionService {
    /**
     * Mã hóa chuỗi văn bản bằng Dynamic Key sinh theo contextId + IV
     * 
     * @param plainText Văn bản thô cần mã hóa
     * @param contextId Định danh bối cảnh (ví dụ: novel:1:chapter:2)
     * @return Map chứa "encryptedData" (HEX) và "iv" (HEX)
     */
    Map<String, String> encrypt(String plainText, String contextId);
}
