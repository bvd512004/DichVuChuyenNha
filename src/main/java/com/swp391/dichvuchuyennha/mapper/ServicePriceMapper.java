package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.PriceDTO;
import com.swp391.dichvuchuyennha.dto.response.ServicePriceDTO;
import com.swp391.dichvuchuyennha.entity.Prices;
import com.swp391.dichvuchuyennha.entity.Services;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ServicePriceMapper {

    @Mapping(target = "prices", source = "prices")
    @Mapping(target = "imageUrl",source = "imageUrl")
    ServicePriceDTO toDTO(Services service);

    List<PriceDTO> toPriceDTOs(List<Prices> prices);
}


