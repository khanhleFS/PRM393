package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.common.exception.ApiException;
import com.fpt.sba301_su26_groupproject.common.exception.CategoryErrorCode;
import com.fpt.sba301_su26_groupproject.dto.category.CategoryRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.category.CategoryResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Category;
import com.fpt.sba301_su26_groupproject.repository.CategoryRepository;
import com.fpt.sba301_su26_groupproject.repository.NovelCategoryRepository;
import com.fpt.sba301_su26_groupproject.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    private final NovelCategoryRepository novelCategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(CategoryErrorCode.CATEGORY_NOT_FOUND, "Thể loại không tồn tại."));
        return mapToResponseDTO(category);
    }

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new ApiException(CategoryErrorCode.CATEGORY_ALREADY_EXISTS, "Thể loại '" + request.name() + "' đã tồn tại.");
        }

        validateCategoryName(request.name());

        Category category = new Category();
        category.setName(request.name());
        category.setSlug(generateSlug(request.name()));
        Category savedCategory = categoryRepository.save(category);
        return mapToResponseDTO(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(CategoryErrorCode.CATEGORY_NOT_FOUND, "Thể loại không tồn tại."));
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new ApiException(CategoryErrorCode.CATEGORY_ALREADY_EXISTS, "Thể loại '" + request.name() + "' đã tồn tại.");
        }

        validateCategoryName(request.name());

        category.setName(request.name());
        category.setSlug(generateSlug(request.name()));

        Category updatedCategory;
        try {
            updatedCategory = categoryRepository.save(category);
        } catch (Exception e) {
            throw new ApiException(CategoryErrorCode.CATEGORY_UPDATE_FAILED,
                    "Cập nhật thể loại thất bại.");
        }

        return mapToResponseDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NOT_FOUND, "Thể loại không tồn tại.");
        }

        try {
            novelCategoryRepository.deleteByCategoryId(id);
        } catch (Exception e) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NOVEL_ASSOCIATED_FAILED,
                    "Không thể xóa thể loại vì có truyện liên quan.");
        }

        try {
            categoryRepository.deleteById(id);
        } catch (Exception e) {
            throw new ApiException(CategoryErrorCode.CATEGORY_DELETE_FAILED,
                    "Xóa thể loại thất bại.");
        }
    }

    private CategoryResponseDTO mapToResponseDTO(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getSlug()
        );
    }

    private String generateSlug(String name) {
        if (name == null) return "";
        String normalized = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD);
        String noDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return noDiacritics.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private void validateCategoryName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NAME_INVALID,
                    "Tên thể loại không được để trống.");
        }

        if (name.length() < 3) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NAME_TOO_SHORT,
                    "Tên thể loại phải có ít nhất 3 ký tự.");
        }

        if (name.length() > 50) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NAME_TOO_LONG,
                    "Tên thể loại không được vượt quá 50 ký tự.");
        }

        if (!name.matches("^[\\p{L}\\s]+$")) {
            throw new ApiException(CategoryErrorCode.CATEGORY_NAME_INVALID,
                    "Tên thể loại chỉ được chứa chữ cái và khoảng trắng.");
        }
    }
}
