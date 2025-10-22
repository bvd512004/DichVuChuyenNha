package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.SurveyImageRequest;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import com.swp391.dichvuchuyennha.repository.SurveyFloorRepository;
import com.swp391.dichvuchuyennha.repository.SurveyImageRepository;
import com.swp391.dichvuchuyennha.service.SurveyImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/survey-images")
@RequiredArgsConstructor
public class SurveyImageController {

    private final SurveyImageService surveyImageService;
    private final SurveyImageRepository surveyImageRepository;
    private final SurveyFloorRepository surveyFloorRepository;

    @PostMapping("/upload")
    public ResponseEntity<SurveyImage> uploadImage(
            @RequestParam("floorId") Integer floorId,
            @RequestParam("note") String note,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        // Kiểm tra tầng tồn tại
        SurveyFloor floor = surveyFloorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found"));

        // Tạo thư mục lưu ảnh nếu chưa có
        String uploadDir = "C:/SWP391/DichVuChuyenNha/uploads/survey/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        // Tạo tên file duy nhất
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File dest = new File(uploadDir + fileName);
        file.transferTo(dest);

        // Tạo và lưu bản ghi SurveyImage
        SurveyImage image = new SurveyImage();
        image.setFloor(floor);
        image.setNote(note);
        image.setImageUrl(fileName);
        surveyImageRepository.save(image);

        // Trả về bản ghi vừa lưu
        return ResponseEntity.ok(image);
    }



    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteSurveyImage(@PathVariable Integer imageId) {
        surveyImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
