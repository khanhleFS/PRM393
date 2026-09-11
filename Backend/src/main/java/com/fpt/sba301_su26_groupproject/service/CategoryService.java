package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.category.CategoryRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.category.CategoryResponseDTO;
import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponseDTO> getAllCategories();
    CategoryResponseDTO getCategoryById(UUID id);
    CategoryResponseDTO createCategory(CategoryRequestDTO request);
    CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO request);
    void deleteCategory(UUID id);
}
