package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.AuthorProfile;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.AuthorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthorProfileRepository extends JpaRepository<AuthorProfile, UUID> {
    Optional<AuthorProfile> findByUserId(UUID userId);
    Optional<AuthorProfile> findByUserEmail(String email);
    List<AuthorProfile> findByStatus(AuthorStatus status);
    List<AuthorProfile> findByAuthorCoinBalanceGreaterThan(Integer minCoins);
    boolean existsByPenName(String penName);
    boolean existsByPenNameAndUserIdNot(String penName, UUID userId);
}
