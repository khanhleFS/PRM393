package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus;
import com.fpt.sba301_su26_groupproject.entity.Payment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByTransactionRef(String transactionRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.transactionRef = :ref")
    Optional<Payment> findByTransactionRefForUpdate(@Param("ref") String ref);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.createdAt < :cutoff")
    List<Payment> findByStatusAndCreatedAtBefore(@Param("status") PaymentStatus status,
                                                  @Param("cutoff") Instant cutoff);

    @Modifying
    @Query("UPDATE Payment p SET p.status = com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus.EXPIRED " +
           "WHERE p.status = com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus.PENDING " +
           "AND p.createdAt < :cutoff")
    int expireStalePayments(@Param("cutoff") Instant cutoff);
}

//TODO: can we not use @query? 