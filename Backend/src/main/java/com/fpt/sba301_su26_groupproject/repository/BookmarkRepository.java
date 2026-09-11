package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<Bookmark> findByUserIdAndNovelId(UUID userId, Long novelId);

    boolean existsByUserIdAndNovelId(UUID userId, Long novelId);

    void deleteByUserIdAndNovelId(UUID userId, Long novelId);
}
