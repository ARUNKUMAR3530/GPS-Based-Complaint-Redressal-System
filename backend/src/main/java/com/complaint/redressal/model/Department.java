package com.complaint.redressal.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "departments", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
@Data
@NoArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name; // Roads, Sanitation, Water, Electricity
    
    public Department(String name) {
        this.name = name;
    }
}
