package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;

@Entity
@Table(name = "quotation_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationServices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    @JsonIgnore

    private Quotations quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Services service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_id")
    private Prices price;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "subtotal")
    private Double subtotal;
}
