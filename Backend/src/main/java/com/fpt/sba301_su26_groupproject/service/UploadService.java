package com.fpt.sba301_su26_groupproject.service;

import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    String uploadImage(MultipartFile file);
    String uploadAudio(byte[] audioBytes, String publicId);
}
