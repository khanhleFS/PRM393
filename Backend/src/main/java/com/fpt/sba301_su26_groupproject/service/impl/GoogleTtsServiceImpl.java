package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.service.TtsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@Transactional(readOnly = true)
public class GoogleTtsServiceImpl implements TtsService {

    //TODO: move this to properties
    private static final String GOOGLE_TTS_URL =
            "https://texttospeech.googleapis.com/v1/text:synthesize";

    private static final int MAX_CHUNK_SIZE = 5000;

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.tts.language-code:vi-VN}")
    private String languageCode;

    @Value("${google.tts.voice-name:vi-VN-Wavenet-A}")
    private String voiceName;

    @Value("${google.tts.speaking-rate:1.0}")
    private double speakingRate;

    private final RestTemplate restTemplate;

    public GoogleTtsServiceImpl() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15_000);
        factory.setReadTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public byte[] synthesizeSpeech(String text) {
        String plainText = stripHtml(text);
        if (plainText == null || plainText.isBlank()) {
            throw new ApiException(CommonErrorCode.BAD_REQUEST, "Nội dung chương trống, không thể tạo audio.");
        }

        List<String> chunks = splitIntoChunks(plainText, MAX_CHUNK_SIZE);
        log.info("[GoogleTTS] Synthesizing {} chunk(s) from {} characters of text", chunks.size(), plainText.length());

        List<byte[]> audioParts = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            log.info("[GoogleTTS] Processing chunk {}/{} ({} chars)", i + 1, chunks.size(), chunks.get(i).length());
            byte[] part = callGoogleTtsApi(chunks.get(i));
            audioParts.add(part);
        }

        return concatenateBytes(audioParts);
    }


    @SuppressWarnings("unchecked")
    private byte[] callGoogleTtsApi(String text) {
        String url = GOOGLE_TTS_URL + "?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "input", Map.of("text", text),
                "voice", Map.of(
                        "languageCode", languageCode,
                        "name", voiceName
                ),
                "audioConfig", Map.of(
                        "audioEncoding", "MP3",
                        "speakingRate", speakingRate
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR,
                        "Google TTS API trả về lỗi: " + response.getStatusCode());
            }

            String audioContent = (String) response.getBody().get("audioContent");
            if (audioContent == null || audioContent.isBlank()) {
                throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR,
                        "Google TTS API không trả về dữ liệu audio.");
            }

            return Base64.getDecoder().decode(audioContent);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[GoogleTTS] API call failed: {}", e.getMessage(), e);
            throw new ApiException(CommonErrorCode.EXTERNAL_SERVICE_ERROR,
                    "Gọi Google TTS thất bại: " + e.getMessage());
        }
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        String noHtml = HTML_TAG_PATTERN.matcher(html).replaceAll(" ");
        return WHITESPACE_PATTERN.matcher(noHtml).replaceAll(" ").trim();
    }

    private List<String> splitIntoChunks(String text, int maxSize) {
        List<String> chunks = new ArrayList<>();
        if (text.length() <= maxSize) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + maxSize, text.length());

            if (end < text.length()) {
                int lastPeriod = text.lastIndexOf(". ", end);
                if (lastPeriod > start) {
                    end = lastPeriod + 2;
                }
            }

            chunks.add(text.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }

    private byte[] concatenateBytes(List<byte[]> parts) {
        int totalLength = parts.stream().mapToInt(b -> b.length).sum();
        byte[] result = new byte[totalLength];
        int offset = 0;
        for (byte[] part : parts) {
            System.arraycopy(part, 0, result, offset, part.length);
            offset += part.length;
        }
        return result;
    }
}
