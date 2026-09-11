package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.ChapterErrorCode;
import com.fpt.sba301_su26_groupproject.common.exception.NovelErrorCode;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.chapter.ChapterUnlockResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Chapter;
import com.fpt.sba301_su26_groupproject.entity.ChapterUnlock;
import com.fpt.sba301_su26_groupproject.entity.CoinTransaction;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.ChapterStatus;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.CoinTransactionType;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.UserRole;
import com.fpt.sba301_su26_groupproject.entity.Novel;
import com.fpt.sba301_su26_groupproject.entity.User;
import com.fpt.sba301_su26_groupproject.repository.*;
import com.fpt.sba301_su26_groupproject.service.ChapterService;
import com.fpt.sba301_su26_groupproject.service.EncryptionService;
import com.fpt.sba301_su26_groupproject.service.TtsService;
import com.fpt.sba301_su26_groupproject.service.UploadService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    @Value("${app.chapter.coin-price:10}")
    private int chapterCoinPrice;

    private final ChapterRepository chapterRepository;

    private final NovelRepository novelRepository;

    private final TtsService ttsService;

    private final UploadService uploadService;

    private final EnumRepository enumRepository;

    private final UserRepository userRepository;

    private final ChapterUnlockRepository chapterUnlockRepository;

    private final CoinTransactionRepository coinTransactionRepository;

    private final EncryptionService encryptionService;

    private final AuthorProfileRepository authorProfileRepository;

    @Override
    @Transactional
    public ChapterResponseDTO createChapter(Long novelId, ChapterRequestDTO requestDTO, String authorEmail) {
        // 1. Kiểm tra sự tồn tại của truyện
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOVEL_NOT_FOUND, "Không tìm thấy truyện tương ứng."));
        // 2. Xác thực quyền sở hữu (Tác giả)
        if (!novel.getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(NovelErrorCode.NOVEL_UNAUTHORIZED, "Bạn không có quyền đăng chương cho bộ truyện này.");
        }
        
        // 2b. Kiểm tra xem tài khoản có quyền tác giả hay không
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Người dùng không tồn tại."));
        if (!Boolean.TRUE.equals(author.getIsAuthor())) {
            throw new ApiException(com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode.FORBIDDEN, "Tài khoản của bạn không có quyền đăng chương truyện.");
        }

        validateChapterRequest(requestDTO);

        // 6. Tự động tính số thứ tự chương tiếp theo (Ngăn ngừa lỗi tác giả nhập trùng số chương)
        Integer maxChapterNum = chapterRepository.findMaxChapterNumberByNovelId(novelId);
        Integer nextChapterNum = maxChapterNum + 1;

        // 7. Tạo mới thực thể chương truyện
        Chapter chapter = new Chapter();
        chapter.setNovel(novel);
        chapter.setChapterNumber(nextChapterNum);
        chapter.setTitle(requestDTO.title());
        chapter.setSlug(generateSlug(nextChapterNum, requestDTO.title()));
        chapter.setContent(requestDTO.content());
        chapter.setStatus(requestDTO.status());
        chapter.setCoinPrice(requestDTO.status().equals(ChapterStatus.FREE) ? 0 : chapterCoinPrice);
        chapter.setViewCount(0);
        chapter.setCreatedAt(Instant.now());
        // 8. Cập nhật thời gian update mới nhất của Truyện (để đẩy truyện lên danh sách vừa cập nhật)
        novel.setUpdatedAt(Instant.now());
        novelRepository.save(novel);
        Chapter savedChapter = chapterRepository.save(chapter);

        authorProfileRepository.findByUserId(novel.getAuthor().getId()).ifPresent(ap -> {
            ap.setTotalChapters((ap.getTotalChapters() != null ? ap.getTotalChapters() : 0L) + 1);
            authorProfileRepository.save(ap);
        });

        return mapToResponseDTO(savedChapter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponseDTO> getChaptersByNovel(Long novelId, String userEmail) {
        if (!novelRepository.existsById(novelId)) {
            throw new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Không tìm thấy truyện tương ứng.");
        }
        return chapterRepository.findByNovelIdOrderByChapterNumberAsc(novelId)
                .stream()
                .map(chapter -> mapToResponseDTO(chapter, userEmail))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChapterResponseDTO getChapterDetails(Long novelId, Long chapterId, String userEmail) {
        Chapter chapter = chapterRepository.findByNovelIdAndId(novelId, chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND, "Không tìm thấy chương truyện tương ứng."));
        // Kiểm tra phí nếu là chương trả phí (VIP)
        if (!chapter.getStatus().equals(ChapterStatus.FREE)) {
            if (userEmail == null) {
                throw new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Bạn cần đăng nhập để đọc chương này.");
            }
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Người dùng không tồn tại."));

            boolean isAuthor = chapter.getNovel().getAuthor().getEmail().equals(userEmail);
            boolean isAdmin = user.getRole() == UserRole.ADMIN;
            boolean isUnlocked = chapterUnlockRepository.existsByUserIdAndChapterId(user.getId(), chapter.getId());

            if (!isAuthor && !isAdmin && !isUnlocked) {
                throw new ApiException(ChapterErrorCode.CHAPTER_LOCKED, "Chương này yêu cầu trả phí để đọc.");
            }
        }
        return mapToResponseDTO(chapter, userEmail);
    }

    @Override
    @Transactional
    public ChapterResponseDTO readChapter(Long novelId, Long chapterId, String userEmail) {
        Chapter chapter = chapterRepository.findByNovelIdAndId(novelId, chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND, "Không tìm thấy chương truyện tương ứng."));
        // Kiểm tra phí nếu là chương trả phí (VIP)
        if (!chapter.getStatus().equals(ChapterStatus.FREE)) {
            if (userEmail == null) {
                throw new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Bạn cần đăng nhập để đọc chương này.");
            }
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Người dùng không tồn tại."));

            boolean isAuthor = chapter.getNovel().getAuthor().getEmail().equals(userEmail);
            boolean isAdmin = user.getRole() == UserRole.ADMIN;
            boolean isUnlocked = chapterUnlockRepository.existsByUserIdAndChapterId(user.getId(), chapter.getId());

            if (!isAuthor && !isAdmin && !isUnlocked) {
                throw new ApiException(ChapterErrorCode.CHAPTER_LOCKED, "Chương này yêu cầu trả phí để đọc.");
            }
        }
        
        // Tăng view count của chương truyện, truyện và hồ sơ tác giả
        chapter.setViewCount(chapter.getViewCount() + 1);
        chapterRepository.save(chapter);

        Novel novel = chapter.getNovel();
        novel.setViewCount((novel.getViewCount() != null ? novel.getViewCount() : 0) + 1);
        novelRepository.save(novel);

        authorProfileRepository.findByUserId(novel.getAuthor().getId()).ifPresent(ap -> {
            ap.setTotalViews((ap.getTotalViews() != null ? ap.getTotalViews() : 0L) + 1);
            authorProfileRepository.save(ap);
        });
        
        return mapToResponseDTO(chapter, userEmail);
    }

    @Override
    @Transactional
    public ChapterResponseDTO updateChapter(Long novelId, Long chapterId, ChapterRequestDTO requestDTO, String authorEmail) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND, "Không tìm thấy chương truyện cần sửa."));
        
        if (!chapter.getNovel().getId().equals(novelId)) {
            throw new ApiException(com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode.BAD_REQUEST, "Chương truyện không thuộc về bộ truyện này");
        }

        if (!chapter.getNovel().getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Bạn không có quyền chỉnh sửa chương này.");
        }

        validateChapterRequest(requestDTO);

        if (requestDTO.chapterNumber() != null &&
                !requestDTO.chapterNumber().equals(chapter.getChapterNumber())) {

            if (chapterRepository.existsByNovelIdAndChapterNumber(
                    chapter.getNovel().getId(), requestDTO.chapterNumber())) {
                throw new ApiException(ChapterErrorCode.CHAPTER_ALREADY_EXISTS,
                        "Chương số " + requestDTO.chapterNumber() + " đã tồn tại.");
            }
            chapter.setChapterNumber(requestDTO.chapterNumber());
        }

        chapter.setTitle(requestDTO.title());
        chapter.setSlug(generateSlug(chapter.getChapterNumber(), requestDTO.title()));
        chapter.setContent(requestDTO.content());
        chapter.setStatus(requestDTO.status());
        Chapter updatedChapter = chapterRepository.save(chapter);
        return mapToResponseDTO(updatedChapter);
    }

    @Override
    @Transactional
    public void deleteChapter(Long novelId, Long chapterId, String authorEmail) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND, "Không tìm thấy chương truyện cần xóa."));
        
        if (!chapter.getNovel().getId().equals(novelId)) {
            throw new ApiException(com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode.BAD_REQUEST, "Chương truyện không thuộc về bộ truyện này");
        }

        if (!chapter.getNovel().getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Bạn không có quyền xóa chương này.");
        }
        chapterRepository.delete(chapter);
    }

    @Override
    @Transactional
    public ChapterResponseDTO generateChapterAudio(Long novelId, Long chapterId) {
        // 1. Tìm chapter
        Chapter chapter = chapterRepository.findByNovelIdAndId(novelId, chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND,
                        "Không tìm thấy chương truyện tương ứng."));

        log.info("[TTS] Bắt đầu tạo audio cho chapter {} của novel {}", chapterId, novelId);

        // 2. Gọi Google TTS → nhận MP3 bytes
        byte[] audioBytes = ttsService.synthesizeSpeech(chapter.getContent());
        log.info("[TTS] Đã nhận {} bytes audio từ Google TTS", audioBytes.length);

        // 3. Upload MP3 lên Cloudinary
        String publicId = "chapter-" + chapter.getId().toString();
        String audioUrl = uploadService.uploadAudio(audioBytes, publicId);
        log.info("[TTS] Audio đã được upload lên Cloudinary: {}", audioUrl);

        // 4. Lưu URL vào database
        chapter.setAudioUrl(audioUrl);
        Chapter saved = chapterRepository.save(chapter);

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ChapterUnlockResponseDTO unlockChapter(Long novelId, Long chapterId, String userEmail) {
        if (userEmail == null) {
            throw new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Bạn cần đăng nhập để mở khóa chương này.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_UNAUTHORIZED, "Người dùng không tồn tại."));

        Chapter chapter = chapterRepository.findByNovelIdAndId(novelId, chapterId)
                .orElseThrow(() -> new ApiException(ChapterErrorCode.CHAPTER_NOT_FOUND, "Không tìm thấy chương truyện tương ứng."));

        // Kiểm tra xem chương có phải chương trả phí không
        if (chapter.getStatus().equals(ChapterStatus.FREE)) {
            throw new ApiException(ChapterErrorCode.CHAPTER_FREE, "Chương này miễn phí, không cần mở khóa.");
        }

        // Kiểm tra xem user có phải tác giả hoặc admin không (không mua chapter)
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.AUTHOR || chapter.getNovel().getAuthor().getEmail().equals(userEmail)) {
            throw new ApiException(ChapterErrorCode.CHAPTER_ALREADY_UNLOCKED, "Tài khoản Admin hoặc Tác giả không thực hiện mua chương trả phí.");
        }

        // Kiểm tra xem user đã mở khóa chương này chưa
        boolean alreadyUnlocked = chapterUnlockRepository.existsByUserIdAndChapterId(user.getId(), chapter.getId());
        if (alreadyUnlocked) {
            throw new ApiException(ChapterErrorCode.CHAPTER_ALREADY_UNLOCKED, "Chương đã được mở khóa trước đó.");
        }

        // Kiểm tra số dư coin của Độc giả
        Integer cost = chapter.getCoinPrice();
        if (user.getCoinBalance() < cost) {
            throw new ApiException(ChapterErrorCode.INSUFFICIENT_COINS, "Số dư coin không đủ để mở khóa chương.");
        }

        // 1. Thực hiện trừ coin của Độc giả
        user.setCoinBalance(user.getCoinBalance() - cost);
        userRepository.save(user);

        // 2. Lưu bản ghi mở khóa
        ChapterUnlock unlock = new ChapterUnlock();
        unlock.setUser(user);
        unlock.setChapter(chapter);
        unlock.setCoinsSpent(cost);
        unlock.setUnlockedAt(Instant.now());
        ChapterUnlock savedUnlock = chapterUnlockRepository.save(unlock);

        // 3. Lưu lịch sử giao dịch coin của Độc giả
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUser(user);
        transaction.setType(CoinTransactionType.UNLOCKED_CHAPTER);
        transaction.setAmount(-cost); // Ghi nhận số coin bị trừ (số âm)
        transaction.setBalanceAfter(user.getCoinBalance());
        transaction.setRefId(savedUnlock.getId());
        transaction.setNote("Mở khóa chương " + chapter.getChapterNumber() + " - " + chapter.getNovel().getTitle());
        transaction.setCoinPackage(null);
        transaction.setCreatedAt(Instant.now());
        coinTransactionRepository.save(transaction);

        // 4. Trích % coin cho Tác giả (Tỉ lệ mặc định: 70% số coin bán chapter)
        User authorUser = chapter.getNovel().getAuthor();
        if (authorUser != null) {
            authorProfileRepository.findByUserId(authorUser.getId()).ifPresent(authorProfile -> {
                int authorEarned = Math.max(1, (int) Math.floor(cost * 0.70));
                authorProfile.setAuthorCoinBalance(authorProfile.getAuthorCoinBalance() + authorEarned);
                authorProfileRepository.save(authorProfile);

                // Log giao dịch thu nhập cho Tác giả
                CoinTransaction authorTx = new CoinTransaction();
                authorTx.setUser(authorUser);
                authorTx.setType(CoinTransactionType.AUTHOR_REVENUE);
                authorTx.setAmount(authorEarned);
                authorTx.setBalanceAfter(authorProfile.getAuthorCoinBalance());
                authorTx.setRefId(savedUnlock.getId());
                authorTx.setNote("Thu nhập từ lượt mua chương " + chapter.getChapterNumber() + " - " + chapter.getNovel().getTitle());
                authorTx.setCreatedAt(Instant.now());
                coinTransactionRepository.save(authorTx);

                log.info("[Author Revenue] Tác giả {} nhận {} coin từ độc giả {}", authorProfile.getPenName(), authorEarned, user.getEmail());
            });
        }

        return ChapterUnlockResponseDTO.builder()
                .chapterId(chapter.getId())
                .novelId(novelId)
                .chapterNumber(chapter.getChapterNumber())
                .title(chapter.getTitle())
                .coinsSpent(cost)
                .remainingCoins(user.getCoinBalance())
                .unlockedAt(savedUnlock.getUnlockedAt())
                .build();
    }

    private ChapterResponseDTO mapToResponseDTO(Chapter chapter) {
        return mapToResponseDTO(chapter, null);
    }

    private ChapterResponseDTO mapToResponseDTO(Chapter chapter, String userEmail) {
        String userIdentifier = (userEmail != null && !userEmail.isBlank()) ? userEmail : "GUEST_JWT";
        String contextId = userIdentifier + ":novel:" + chapter.getNovel().getId() + ":chapter:" + chapter.getChapterNumber();
        Map<String, String> encryptedMap = encryptionService.encrypt(chapter.getContent(), contextId);

        ChapterStatus currentStatus = chapter.getStatus();
        if (currentStatus == ChapterStatus.LOCKED && userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                boolean isAuthor = chapter.getNovel().getAuthor().getEmail().equals(userEmail);
                boolean isAdmin = user.getRole() == com.fpt.sba301_su26_groupproject.entity.Enumeration.UserRole.ADMIN;
                boolean isUnlocked = chapterUnlockRepository.existsByUserIdAndChapterId(user.getId(), chapter.getId());
                if (isAuthor || isAdmin || isUnlocked) {
                    currentStatus = ChapterStatus.UNLOCKED;
                }
            }
        }

        return ChapterResponseDTO.builder()
                .id(chapter.getId())
                .novelId(chapter.getNovel().getId())
                .chapterNumber(chapter.getChapterNumber())
                .title(chapter.getTitle())
                .slug(chapter.getSlug())
                .content(null)
                .encryptedData(encryptedMap.get("encryptedData"))
                .iv(encryptedMap.get("iv"))
                .audioUrl(chapter.getAudioUrl())
                .status(currentStatus)
                .coinPrice(chapter.getCoinPrice())
                .viewCount(chapter.getViewCount())
                .createdAt(chapter.getCreatedAt())
                .updateAt(chapter.getUpdateAt())
                .build();
    }

    private String generateSlug(Integer chapterNumber, String title) {
        if (title == null) return "chuong-" + chapterNumber;
        String titleSlug = title.toLowerCase().replaceAll("[^a-z0-9\\p{L}]+", "-").replaceAll("(^-|-$)", "");
        return "chuong-" + chapterNumber + "-" + titleSlug;
    }

    private void validateChapterRequest(ChapterRequestDTO requestDTO) {
        // 3. Validate status
        if (requestDTO.status() == null) {
            throw new ApiException(ChapterErrorCode.CHAPTER_STATUS_INVALID);
        }
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return enumRepository.getChapterEnums();
    }
}
