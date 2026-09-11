package com.fpt.sba301_su26_groupproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coin_packages")
public class CoinPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID id;

    @NotNull
    @Size(max = 100)
    @Nationalized
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotNull
    @Min(1000)
    @Column(name = "price_vnd", nullable = false)
    private Integer priceVnd;

    @NotNull
    @Min(1)
    @Column(name = "base_coins", nullable = false)
    private Integer baseCoins;



    @NotNull
    @ColumnDefault("1")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (isActive == null)      isActive = true;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // Tính tổng coin thực nhận
    public Integer getTotalCoins() {
        return baseCoins;
    }
}
