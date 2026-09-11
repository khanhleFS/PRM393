package com.fpt.sba301_su26_groupproject.controller;

import com.fpt.sba301_su26_groupproject.common.response.ApiResponse;
import com.fpt.sba301_su26_groupproject.dto.category.CategoryRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.category.CategoryResponseDTO;
import com.fpt.sba301_su26_groupproject.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "Category APIs", description = "Category public and admin APIs")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Get all categories")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponseDTO>>builder()
                .code(200)
                .message("Lấy danh sách danh mục thành công")
                .result(categoryService.getAllCategories())
                .build());
    }

    @Operation(summary = "Get category by ID")
    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> getCategoryById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponseDTO>builder()
                .code(200)
                .message("Lấy thông tin danh mục thành công")
                .result(categoryService.getCategoryById(id))
                .build());
    }

    @Operation(
            summary = "Create category",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUTHOR')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(
            @Valid @RequestBody CategoryRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CategoryResponseDTO>builder()
                .code(201)
                .message("Tạo danh mục thành công")
                .result(categoryService.createCategory(request))
                .build());
    }

    @Operation(
            summary = "Update category",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUTHOR')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponseDTO>builder()
                .code(200)
                .message("Cập nhật danh mục thành công")
                .result(categoryService.updateCategory(id, request))
                .build());
    }

    @Operation(
            summary = "Delete category",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUTHOR')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable UUID id) {
        categoryService.deleteCategory(id);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Xóa danh mục thành công")
                .build());
    }
}