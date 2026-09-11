package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.OrderStatus;
import com.fpt.sba301_su26_groupproject.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId);
    boolean existsByUserIdAndStatus(UUID userId, OrderStatus status);

    @Query("SELECT SUM(o.amountVnd) FROM Order o WHERE o.status = 'COMPLETED'")
    Long sumCompletedRevenue();

    /**
     * Returns 12 rows: [month_number, revenue_sum] for the current year.
     * Months without orders return 0 (achieved via COALESCE on outer join below).
     */
    @Query(value = """
        SELECT m.month_num, COALESCE(SUM(o.amount_vnd), 0)
        FROM (
            SELECT 1 AS month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
            UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
            UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
        ) m
        LEFT JOIN orders o
          ON MONTH(o.created_at) = m.month_num
         AND YEAR(o.created_at) = :year
         AND o.status = 'COMPLETED'
        GROUP BY m.month_num
        ORDER BY m.month_num
        """, nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("year") int year);

    @Query("SELECT o FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startOfWeek AND o.createdAt <= :endOfWeek")
    List<Order> findCompletedOrdersBetween(@Param("startOfWeek") java.time.LocalDateTime startOfWeek, @Param("endOfWeek") java.time.LocalDateTime endOfWeek);

    @Query("SELECT o FROM Order o WHERE o.status = 'COMPLETED' ORDER BY o.createdAt DESC")
    Page<Order> findAllCompletedOrders(Pageable pageable);
}
