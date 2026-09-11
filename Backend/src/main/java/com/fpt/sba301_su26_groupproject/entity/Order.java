package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.common.infrastructure.BaseEntity;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "orders")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Order extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coin_package_id", nullable = false)
    private CoinPackage coinPackage;

    @NotNull
    @Column(name = "amount_vnd", nullable = false)
    private Integer amountVnd; // Snapshot giá

    @NotNull
    @Column(name = "coins", nullable = false)
    private Integer coins; // Snapshot số lượng coin nhận

    @NotNull
    @ColumnDefault("1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1; // Số lượng gói mua, mặc định 1

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;
}
