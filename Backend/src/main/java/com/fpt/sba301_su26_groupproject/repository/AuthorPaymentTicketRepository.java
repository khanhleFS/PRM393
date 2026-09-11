package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.AuthorPaymentTicket;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthorPaymentTicketRepository extends JpaRepository<AuthorPaymentTicket, UUID> {
    List<AuthorPaymentTicket> findByAuthorProfileIdOrderByCreatedAtDesc(UUID authorProfileId);
    List<AuthorPaymentTicket> findByAuthorProfileUserEmailOrderByCreatedAtDesc(String email);
    List<AuthorPaymentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<AuthorPaymentTicket> findByMonthYear(String monthYear);
    boolean existsByAuthorProfileIdAndMonthYear(UUID authorProfileId, String monthYear);
}
