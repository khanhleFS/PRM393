package com.fpt.sba301_su26_groupproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sepay_test_receipts")
@Getter
@Setter
public class SepayReceipt {
    @Id
    @Column(length = 100)
    private String transactionId;
    @Column(nullable = false, columnDefinition = "uniqueidentifier")
    private UUID orderId;
    @Column(nullable = false)
    private Instant receivedAt;
}
