package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
    Optional<Category> findBySlug(String slug);
}
