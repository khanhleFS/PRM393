package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.NovelCategory;
import com.fpt.sba301_su26_groupproject.entity.NovelCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NovelCategoryRepository extends JpaRepository<NovelCategory, NovelCategoryId> {
    void deleteByNovelId(Long novelId);
    List<NovelCategory> findByNovelId(Long novelId);
    void  deleteByCategoryId(UUID categoryId);
    boolean existsByNovelIdAndCategoryId(Long novelId, UUID categoryId);
}
