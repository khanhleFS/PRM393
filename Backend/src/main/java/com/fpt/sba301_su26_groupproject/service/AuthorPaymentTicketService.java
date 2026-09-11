package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.author.AuthorPaymentTicketDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;

import java.util.List;
import java.util.UUID;

public interface AuthorPaymentTicketService {
    List<AuthorPaymentTicketDTO> getMyTickets(String userEmail);
    List<AuthorPaymentTicketDTO> getAllTickets(TicketStatus status);
    AuthorPaymentTicketDTO processTicketPayment(UUID ticketId, String transactionRef, TicketStatus status);
    void generateMonthlyTickets();
}
