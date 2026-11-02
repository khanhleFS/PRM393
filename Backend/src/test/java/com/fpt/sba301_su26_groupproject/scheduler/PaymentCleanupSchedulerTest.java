package com.fpt.sba301_su26_groupproject.scheduler;

import com.fpt.sba301_su26_groupproject.entity.*;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import com.fpt.sba301_su26_groupproject.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentCleanupSchedulerTest {
    @Test
    void doesNotOverwriteWebhookThatCompletedAfterStaleScan() {
        PaymentRepository payments = mock(PaymentRepository.class);
        OrderRepository orders = mock(OrderRepository.class);
        EntityManager em = mock(EntityManager.class);
        Order order = Order.builder().status(OrderStatus.PENDING).build();
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(Instant.now().minusSeconds(3600));
        when(payments.findByStatusAndCreatedAtBefore(eq(PaymentStatus.PENDING), any()))
                .thenReturn(List.of(payment));
        doAnswer(invocation -> {
            order.setStatus(OrderStatus.COMPLETED);
            return null;
        }).when(em).refresh(order, LockModeType.PESSIMISTIC_WRITE);
        doAnswer(invocation -> {
            payment.setStatus(PaymentStatus.SUCCESS);
            return null;
        }).when(em).refresh(payment, LockModeType.PESSIMISTIC_WRITE);
        new PaymentCleanupScheduler(payments, orders, em).cleanupStalePendingPayments();
        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(payments, never()).save(any());
        verify(orders, never()).save(any());
        var sequence = inOrder(em);
        sequence.verify(em).refresh(order, LockModeType.PESSIMISTIC_WRITE);
        sequence.verify(em).refresh(payment, LockModeType.PESSIMISTIC_WRITE);
    }
}
