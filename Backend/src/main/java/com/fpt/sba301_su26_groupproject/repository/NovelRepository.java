package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Novel;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.NovelStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NovelRepository extends JpaRepository<Novel, Long>, JpaSpecificationExecutor<Novel> {
    List<Novel> findByAuthorId(UUID authorId);

    Optional<Novel> findBySlug(String slug);

    boolean existsByTitle(String title);

    @Query("SELECT COUNT(n) > 0 FROM Novel n WHERE n.title = :title AND n.id <> :id")
    boolean existsByTitleAndIdNot(@Param("title") String title, @Param("id") Long id);

    @Query("""
        SELECT DISTINCT n FROM Novel n
        LEFT JOIN NovelCategory nc ON nc.id.novelId = n.id
        LEFT JOIN Category c ON c.id = nc.id.categoryId
        WHERE (:title IS NULL OR n.title LIKE %:title%)
          AND (:status IS NULL OR n.status = :status)
          AND (:categoryName IS NULL OR c.name = :categoryName)
        ORDER BY n.createdAt DESC
    """)
    Page<Novel> searchNovels(
        @Param("title") String title,
        @Param("status") NovelStatus status,
        @Param("categoryName") String categoryName,
        Pageable pageable
    );
}

//TODO: can we not use @query? 
