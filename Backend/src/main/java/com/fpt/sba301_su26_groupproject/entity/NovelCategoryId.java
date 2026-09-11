package com.fpt.sba301_su26_groupproject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class NovelCategoryId implements Serializable {
    private static final long serialVersionUID = 3745906987118040220L;
    @NotNull
    @Column(name = "novel_id", nullable = false)
    private Long novelId;

    @NotNull
    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        NovelCategoryId entity = (NovelCategoryId) o;
        return Objects.equals(this.novelId, entity.novelId) &&
                Objects.equals(this.categoryId, entity.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(novelId, categoryId);
    }

}