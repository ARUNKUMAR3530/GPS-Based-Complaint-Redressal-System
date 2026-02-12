package com.complaint.redressal.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "municipalities", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
@Data
@NoArgsConstructor
public class Municipality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String district;

    public Municipality(String name, String district) {
        this.name = name;
        this.district = district;
    }
}
