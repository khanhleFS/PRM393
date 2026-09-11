package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CommonErrorCode;
import com.fpt.sba301_su26_groupproject.common.exception.NovelErrorCode;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelPageResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.NovelStatus;
import com.fpt.sba301_su26_groupproject.repository.CategoryRepository;
import com.fpt.sba301_su26_groupproject.repository.ChapterRepository;
import com.fpt.sba301_su26_groupproject.repository.EnumRepository;
import com.fpt.sba301_su26_groupproject.repository.NovelCategoryRepository;
import com.fpt.sba301_su26_groupproject.repository.NovelRepository;
import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import com.fpt.sba301_su26_groupproject.repository.ChapterUnlockRepository;
import com.fpt.sba301_su26_groupproject.repository.AuthorProfileRepository;
import com.fpt.sba301_su26_groupproject.service.NovelService;
import com.fpt.sba301_su26_groupproject.dto.novel.NovelStatsResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.novel.ChapterStatsDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.ChapterStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NovelServiceImpl implements NovelService {

    private final NovelRepository novelRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final NovelCategoryRepository novelCategoryRepository;
    private final EnumRepository enumRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterUnlockRepository chapterUnlockRepository;
    private final AuthorProfileRepository authorProfileRepository;

    @Override
    @Transactional
    public NovelResponseDTO createNovel(NovelRequestDTO requestDTO, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_AUTHOR_NOT_FOUND, "Bạn không có quyền đăng truyện"));

        if (!Boolean.TRUE.equals(author.getIsAuthor())) {
            throw new ApiException(CommonErrorCode.FORBIDDEN, "Tài khoản của bạn chưa được đăng ký làm tác giả.");
        }

        validateRequest(requestDTO, null);

        Novel novel = new Novel();
        novel.setTitle(requestDTO.title());
        novel.setSlug(generateSlug(requestDTO.title()));
        novel.setDescription(requestDTO.description());
        novel.setCoverImageUrl(requestDTO.coverImageUrl());
        novel.setStatus(requestDTO.status());
        novel.setViewCount(0);
        novel.setCreatedAt(Instant.now());
        novel.setUpdatedAt(Instant.now());
        novel.setAuthor(author);

        Novel savedNovel = novelRepository.save(novel);

        if (requestDTO.categoryIds() != null && !requestDTO.categoryIds().isEmpty()) {
            assignCategoriesToNovel(savedNovel, requestDTO.categoryIds());
        }

        authorProfileRepository.findByUserId(author.getId()).ifPresent(ap -> {
            ap.setTotalNovels((ap.getTotalNovels() != null ? ap.getTotalNovels() : 0L) + 1);
            authorProfileRepository.save(ap);
        });

        return mapToResponseDTO(savedNovel);
    }

    @Override
    @Transactional
    public NovelResponseDTO updateNovel(Long novelId, NovelRequestDTO requestDTO, String authorEmail) {
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Không tìm thấy truyện tương ứng"));

        if (!novel.getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(NovelErrorCode.NOVEL_UNAUTHORIZED, "Bạn không có quyền chỉnh sửa truyện này");
        }

        validateRequest(requestDTO, novelId);

        novel.setTitle(requestDTO.title());
        novel.setSlug(generateSlug(requestDTO.title()));
        novel.setDescription(requestDTO.description());
        novel.setCoverImageUrl(requestDTO.coverImageUrl());
        novel.setStatus(requestDTO.status());
        novel.setUpdatedAt(Instant.now());

        Novel updatedNovel;
        try {
            updatedNovel = novelRepository.save(novel);
        } catch (Exception e) {
            throw new ApiException(NovelErrorCode.NOVEL_UPDATE_FAILED);
        }

        if (requestDTO.categoryIds() != null) {
            try {
                novelCategoryRepository.deleteByNovelId(updatedNovel.getId());
            } catch (Exception e) {
                throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_NOT_ASSIGNED);
            }

            if (!requestDTO.categoryIds().isEmpty()) {
                List<Category> categories = categoryRepository.findAllById(requestDTO.categoryIds());
                if (categories.size() != requestDTO.categoryIds().size()) {
                    throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_NOT_FOUND);
                }
                assignCategoriesToNovel(updatedNovel, requestDTO.categoryIds());
            }
        }
        return mapToResponseDTO(updatedNovel);
    }

    @Override
    @Transactional
    public void deleteNovel(Long novelId, String authorEmail) {
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Truyện không tồn tại"));

        if (!novel.getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(NovelErrorCode.NOVEL_UNAUTHORIZED, "Bạn không có quyền xóa truyện này");
        }

        try {
            novelCategoryRepository.deleteByNovelId(novelId);
        } catch (Exception e) {
            throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_NOT_ASSIGNED);
        }

        try {
            novelRepository.delete(novel);
        } catch (Exception e) {
            throw new ApiException(NovelErrorCode.NOVEL_DELETE_FAILED);
        }
    }

    @Override
    public NovelResponseDTO getNovelById(Long novelId) {
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Novel not found"));
        return mapToResponseDTO(novel);
    }

    @Override
    public NovelResponseDTO getNovelByIdentifier(String identifier) {
        Novel novel = findEntityByIdentifier(identifier);
        return mapToResponseDTO(novel);
    }

    @Override
    public Novel findEntityByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Novel not found");
        }

        // 1. Try direct numeric ID
        try {
            Long id = Long.parseLong(identifier);
            Optional<Novel> byId = novelRepository.findById(id);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {}

        // 2. Try extracting trailing numeric ID from slug (e.g. "my-novel-slug-21")
        if (identifier.contains("-")) {
            String lastPart = identifier.substring(identifier.lastIndexOf("-") + 1);
            try {
                Long id = Long.parseLong(lastPart);
                Optional<Novel> byId = novelRepository.findById(id);
                if (byId.isPresent()) {
                    return byId.get();
                }
            } catch (NumberFormatException ignored) {}
        }

        // 3. Try exact slug match
        Optional<Novel> bySlug = novelRepository.findBySlug(identifier);
        if (bySlug.isPresent()) {
            return bySlug.get();
        }

        // 4. Try slug without trailing ID suffix
        if (identifier.contains("-")) {
            String slugWithoutId = identifier.substring(0, identifier.lastIndexOf("-"));
            Optional<Novel> bySlugNoId = novelRepository.findBySlug(slugWithoutId);
            if (bySlugNoId.isPresent()) {
                return bySlugNoId.get();
            }
        }

        throw new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Novel not found with identifier: " + identifier);
    }

    @Override
    public List<NovelResponseDTO> getAllNovelsByAuthor(String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_AUTHOR_NOT_FOUND, "Author not found"));

        if (!Boolean.TRUE.equals(author.getIsAuthor())) {
            throw new ApiException(CommonErrorCode.FORBIDDEN, "Tài khoản của bạn không phải là tác giả.");
        }

        return novelRepository.findByAuthorId(author.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return enumRepository.getNovelEnums();
    }

    @Override
    public NovelPageResponseDTO searchNovels(String title, String status, String categoryName, Integer minChapters, int page, int size) {
        NovelStatus novelStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                novelStatus = NovelStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        String titleParam = (title != null && !title.isBlank()) ? title.trim() : null;
        String categoryParam = (categoryName != null && !categoryName.isBlank()) ? categoryName.trim() : null;

        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());

        org.springframework.data.jpa.domain.Specification<Novel> spec =
                com.fpt.sba301_su26_groupproject.repository.specification.NovelSpecification.filterNovels(
                        titleParam, novelStatus, categoryParam, minChapters
                );

        Page<Novel> novelPage = novelRepository.findAll(spec, pageable);

        List<NovelResponseDTO> content = novelPage.getContent()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return NovelPageResponseDTO.builder()
                .content(content)
                .page(novelPage.getNumber())
                .size(novelPage.getSize())
                .totalElements(novelPage.getTotalElements())
                .totalPages(novelPage.getTotalPages())
                .build();
    }

    @Override
    public NovelStatsResponseDTO getNovelStats(Long novelId, String authorEmail) {
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new ApiException(NovelErrorCode.NOVEL_NOT_FOUND, "Không tìm thấy truyện tương ứng"));

        if (!novel.getAuthor().getEmail().equals(authorEmail)) {
            throw new ApiException(NovelErrorCode.NOVEL_UNAUTHORIZED, "Bạn không có quyền xem thống kê của truyện này");
        }

        List<Chapter> chapters = chapterRepository.findByNovelIdOrderByChapterNumberAsc(novelId);

        // === Revenue map (xu thu được per chapter) ===
        List<Object[]> revenueData = chapterUnlockRepository.findRevenueByChapterGroupId(novelId);
        java.util.Map<Long, Long> revenueMap = new java.util.HashMap<>();
        for (Object[] row : revenueData) {
            Long chapterId = row[0] instanceof Number ? ((Number) row[0]).longValue()
                    : Long.parseLong(row[0].toString());
            Number revenue = (Number) row[1];
            revenueMap.put(chapterId, revenue != null ? revenue.longValue() : 0L);
        }

        // === Unlock count map (số lượt mua per chapter) ===
        List<Object[]> unlockData = chapterUnlockRepository.findUnlockCountByChapterGroupId(novelId);
        java.util.Map<Long, Long> unlockCountMap = new java.util.HashMap<>();
        for (Object[] row : unlockData) {
            Long chapterId = row[0] instanceof Number ? ((Number) row[0]).longValue()
                    : Long.parseLong(row[0].toString());
            Number count = (Number) row[1];
            unlockCountMap.put(chapterId, count != null ? count.longValue() : 0L);
        }

        long totalViews = 0;
        long totalRevenue = 0;

        long firstChapterViews = chapters.isEmpty() ? 0 : chapters.get(0).getViewCount();
        List<ChapterStatsDTO> chapterStatsList = new java.util.ArrayList<>();
        // Chỉ lấy conversionRate của các chương VIP để tính trung bình
        java.util.List<Double> vipConversionRates = new java.util.ArrayList<>();

        for (Chapter chapter : chapters) {
            long revenue = revenueMap.getOrDefault(chapter.getId(), 0L);
            totalViews += chapter.getViewCount();
            totalRevenue += revenue;

            boolean isVip = (chapter.getStatus() != ChapterStatus.FREE);
            String statusStr = isVip ? "VIP" : "FREE";

            double conversionRate = 0.0;

            if (isVip) {
                // Tỉ lệ chuyển đổi mua: lượt mua / lượt xem
                long unlocks = unlockCountMap.getOrDefault(chapter.getId(), 0L);
                if (chapter.getViewCount() > 0) {
                    conversionRate = ((double) unlocks / chapter.getViewCount()) * 100.0;
                }
                vipConversionRates.add(conversionRate);
            } else {
                // Tỉ lệ giữ chân: lượt xem chương N / lượt xem chương 1
                if (firstChapterViews > 0) {
                    conversionRate = ((double) chapter.getViewCount() / firstChapterViews) * 100.0;
                }
            }

            // Không bao giờ vượt 100%
            conversionRate = Math.min(conversionRate, 100.0);

            chapterStatsList.add(ChapterStatsDTO.builder()
                    .chapterId(chapter.getId())
                    .chapterNumber(chapter.getChapterNumber())
                    .title(chapter.getTitle())
                    .status(statusStr)
                    .viewCount(chapter.getViewCount())
                    .revenue(revenue)
                    .conversionRate(Math.round(conversionRate * 100.0) / 100.0)
                    .build());
        }

        // Trung bình conversion rate: ưu tiên chỉ tính chương VIP
        double avgConversionRate = 0.0;
        if (!vipConversionRates.isEmpty()) {
            avgConversionRate = vipConversionRates.stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);
        } else if (!chapterStatsList.isEmpty()) {
            // Chưa có chương VIP → dùng trung bình retention rate của chương Free
            avgConversionRate = chapterStatsList.stream()
                    .mapToDouble(ChapterStatsDTO::conversionRate)
                    .average()
                    .orElse(0.0);
        }

        return NovelStatsResponseDTO.builder()
                .totalViews(totalViews)
                .totalRevenue(totalRevenue)
                .avgConversionRate(Math.round(avgConversionRate * 100.0) / 100.0)
                .chapters(chapterStatsList)
                .build();
    }

    // =========================================================
    // Private helpers
    // =========================================================

    private void assignCategoriesToNovel(Novel novel, List<UUID> categoryIds) {
        List<Category> categories = categoryRepository.findAllById(categoryIds);

        if (categories.size() != categoryIds.size()) {
            throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_NOT_FOUND);
        }

        for (Category category : categories) {
            boolean alreadyAssigned = novelCategoryRepository.existsByNovelIdAndCategoryId(
                    novel.getId(), category.getId()
            );

            if (alreadyAssigned) {
                throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_ALREADY_ASSIGNED);
            }

            NovelCategory novelCategory = new NovelCategory();
            NovelCategoryId id = new NovelCategoryId();
            id.setNovelId(novel.getId());
            id.setCategoryId(category.getId());

            novelCategory.setId(id);
            novelCategory.setNovel(novel);
            novelCategory.setCategory(category);

            try {
                novelCategoryRepository.save(novelCategory);
            } catch (Exception e) {
                throw new ApiException(NovelErrorCode.NOVEL_INVALID);
            }
        }
    }

    private NovelResponseDTO mapToResponseDTO(Novel novel) {
        List<String> categoryNames = List.of();

        try {
            List<NovelCategory> novelCategories = novelCategoryRepository.findByNovelId(novel.getId());
            if (novelCategories != null && !novelCategories.isEmpty()) {
                categoryNames = novelCategories.stream()
                        .map(nc -> nc.getCategory().getName())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            categoryNames = List.of();
        }

        Integer chapterCount = 0;
        Integer viewCount = 0;
        try {
            chapterCount = chapterRepository.findMaxChapterNumberByNovelId(novel.getId());
            if (chapterCount == null) chapterCount = 0;

            viewCount = chapterRepository.findLatestChapterViewCountByNovelId(novel.getId());
            if (viewCount == null) viewCount = 0;
        } catch (Exception ignored) {}

        return NovelResponseDTO.builder()
                .id(novel.getId())
                .title(novel.getTitle())
                .slug(novel.getSlug())
                .description(novel.getDescription())
                .coverImageUrl(novel.getCoverImageUrl())
                .status(novel.getStatus())
                .viewCount(viewCount)
                .chapterCount(chapterCount)
                .createdAt(novel.getCreatedAt())
                .updatedAt(novel.getUpdatedAt())
                .authorId(novel.getAuthor() != null ? novel.getAuthor().getId() : null)
                .authorName(novel.getAuthor() != null ? novel.getAuthor().getUsername() : null)
                .categories(categoryNames)
                .build();
    }

    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private void validateRequest(NovelRequestDTO requestDTO, Long novelId) {
        if (requestDTO.title() == null || requestDTO.title().trim().isEmpty()) {
            throw new ApiException(NovelErrorCode.NOVEL_INVALID);
        }

        boolean titleExists = novelId == null
                ? novelRepository.existsByTitle(requestDTO.title())
                : novelRepository.existsByTitleAndIdNot(requestDTO.title(), novelId);
        if (titleExists) {
            throw new ApiException(NovelErrorCode.NOVEL_ALREADY_EXISTS);
        }

        if (requestDTO.status() == null) {
            throw new ApiException(NovelErrorCode.NOVEL_STATUS_INVALID);
        }

        if (requestDTO.categoryIds() != null && !requestDTO.categoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(requestDTO.categoryIds());
            if (categories.size() != requestDTO.categoryIds().size()) {
                throw new ApiException(NovelErrorCode.NOVEL_CATEGORY_NOT_FOUND);
            }
        }
    }
}
