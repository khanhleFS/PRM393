package com.fpt.sba301_su26_groupproject.service.impl;

import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import com.fpt.sba301_su26_groupproject.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileTransactionHistoryTest {
    @Test void returnsSignedLedgerAmountsAndBalancesForCurrentUserOnly() {
        var users = mock(UserRepository.class);
        var ledger = mock(CoinTransactionRepository.class);
        User user = User.builder().id(UUID.randomUUID()).username("Reader").build();
        when(users.findByEmail("reader@example.invalid")).thenReturn(Optional.of(user));
        CoinTransaction debit = entry(user, CoinTransactionType.UNLOCKED_CHAPTER, -10, 90);
        CoinTransaction credit = entry(user, CoinTransactionType.TOPUP, 100, 100);
        when(ledger.findByUserId(eq(user.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(debit, credit)));
        var page = new ProfileServiceImpl(users, ledger).getCoinTransactions(
                "reader@example.invalid", PageRequest.of(0, 20));
        var first = page.getContent().getFirst();
        assertEquals(-10, first.amount());
        assertEquals(90, first.balanceAfter());
        assertEquals("UNLOCKED_CHAPTER", first.transactionType());
        assertEquals(debit.getId(), first.transactionId());
        assertEquals(debit.getNote(), first.note());
        assertEquals(debit.getRefId(), first.refId());
        assertEquals(100, page.getContent().get(1).amount());
        verify(ledger).findByUserId(eq(user.getId()), argThat(p -> p.getSort().getOrderFor("createdAt").isDescending()));
    }
    private CoinTransaction entry(User user, CoinTransactionType type, int amount, int balance) {
        var tx = new CoinTransaction();
        tx.setId(UUID.randomUUID()); tx.setUser(user); tx.setType(type);
        tx.setAmount(amount); tx.setBalanceAfter(balance); tx.setRefId(UUID.randomUUID());
        tx.setNote("Demo ledger entry"); tx.setCreatedAt(Instant.now());
        return tx;
    }
}
