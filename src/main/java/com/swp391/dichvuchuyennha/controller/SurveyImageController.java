package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.QuotationServiceRequest;
import com.swp391.dichvuchuyennha.dto.response.ImageAnalysisResponse;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import com.swp391.dichvuchuyennha.repository.PriceRepository;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.repository.SurveyFloorRepository;
import com.swp391.dichvuchuyennha.repository.SurveyImageRepository;
import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.service.ImageAnalysisService;
import com.swp391.dichvuchuyennha.service.QuotationService;
import com.swp391.dichvuchuyennha.service.QuotationSvService;
import com.swp391.dichvuchuyennha.service.SurveyImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/survey-images")
@RequiredArgsConstructor
public class SurveyImageController {

    private final SurveyImageService surveyImageService;
    private final SurveyImageRepository surveyImageRepository;
    private final SurveyFloorRepository surveyFloorRepository;
    private final ImageAnalysisService imageAnalysisService;
    private final QuotationSvService quotationSvService;
    private final QuotationService quotationService;
    private final QuotationRepository quotationRepository;
    private final PriceRepository priceRepository;

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

    /**
     * Phân tích hình ảnh với AI để tính diện tích và nhận diện đồ đạc
     */
    @PostMapping("/analyze")
    public ResponseEntity<ImageAnalysisResponse> analyzeImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        // Tạo file tạm để phân tích
        String uploadDir = "C:/SWP391/DichVuChuyenNha/uploads/temp/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String tempFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File tempFile = new File(uploadDir + tempFileName);
        file.transferTo(tempFile);

        try {
            // Phân tích hình ảnh
            ImageAnalysisResponse analysis = imageAnalysisService.analyzeImage(tempFile);
            return ResponseEntity.ok(analysis);
        } finally {
            // Xóa file tạm
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    /**
     * Phân tích một ảnh đã upload trước đó
     */
    @PostMapping("/{imageId}/analyze")
    public ResponseEntity<ImageAnalysisResponse> analyzeExistingImage(
            @PathVariable Integer imageId
    ) throws IOException {
        SurveyImage image = surveyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        String uploadDir = "C:/SWP391/DichVuChuyenNha/uploads/survey/";
        File imageFile = new File(uploadDir + image.getImageUrl());

        if (!imageFile.exists()) {
            throw new RuntimeException("Image file not found: " + image.getImageUrl());
        }

        // Phân tích hình ảnh
        ImageAnalysisResponse analysis = imageAnalysisService.analyzeImage(imageFile);
        return ResponseEntity.ok(analysis);
    }

    /**
     * Tự động thêm dịch vụ đóng gói vào báo giá dựa trên kết quả phân tích
     * Service ID = 5 (Đóng gói chuyên nghiệp), Price ID = 12 (Theo bộ)
     */
    @PostMapping("/{floorId}/add-packing-service")
    public ResponseEntity<String> addPackingServiceToQuotation(
            @PathVariable Integer floorId,
            @RequestBody ImageAnalysisResponse analysisResult
    ) {
        try {
            // Lấy floor và survey
            SurveyFloor floor = surveyFloorRepository.findById(floorId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tầng với ID: " + floorId));
            
            var survey = floor.getSurvey();
            if (survey == null) {
                return ResponseEntity.badRequest()
                        .body("Không tìm thấy khảo sát cho tầng này.");
            }

            // Tìm quotation từ survey, nếu chưa có thì tự động tạo
            var quotation = quotationRepository.findBySurvey_SurveyId(survey.getSurveyId())
                    .orElse(null);

            if (quotation == null) {
                // Tự động tạo quotation nếu chưa có
                try {
                    // Kiểm tra survey status
                    if (!"DONE".equalsIgnoreCase(survey.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body("Khảo sát chưa hoàn thành (status: " + survey.getStatus() + "). " +
                                      "Vui lòng hoàn thành khảo sát trước khi thêm dịch vụ.");
                    }
                    
                    // Tạo quotation mới
                    QuotationCreateRequest createRequest = new QuotationCreateRequest();
                    createRequest.setSurveyId(survey.getSurveyId());
                    quotation = quotationService.createQuotation(createRequest);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body("Không thể tự động tạo báo giá: " + e.getMessage() + 
                                  ". Vui lòng tạo báo giá thủ công trước.");
                }
            }

            if (analysisResult == null || analysisResult.getDetectedFurniture() == null || analysisResult.getDetectedFurniture().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Không có đồ đạc nào được phát hiện để thêm dịch vụ.");
            }

            // Đảm bảo matching đã được thực hiện - nếu chưa có priceId, thực hiện matching lại
            for (var furniture : analysisResult.getDetectedFurniture()) {
                if (furniture.getSuggestedPriceId() == null && furniture.getName() != null) {
                    // Tìm giá dựa trên tên đồ đạc (matching chính xác hơn)
                    String furnitureName = furniture.getName().toLowerCase().trim();
                    String priceType = null;
                    
                    // Kiểm tra bàn (nhiều từ khóa)
                    if (furnitureName.contains("bàn") || furnitureName.contains("table") || 
                        furnitureName.contains("desk") || furnitureName.contains("bàn ăn") ||
                        furnitureName.contains("bàn làm việc") || furnitureName.contains("bàn trà")) {
                        priceType = "Theo chiếc - Bàn";
                    }
                    // Kiểm tra ghế
                    else if (furnitureName.contains("ghế") || furnitureName.contains("chair") ||
                             furnitureName.contains("ghế ngồi") || furnitureName.contains("ghế tựa") ||
                             furnitureName.contains("ghế xoay") || furnitureName.contains("ghế văn phòng")) {
                        priceType = "Theo chiếc - Ghế";
                    }
                    // Các đồ vật khác
                    else {
                        priceType = "Theo chiếc - Đồ vật khác";
                    }
                    
                    // Tìm price với price_type chính xác
                    var price = priceRepository
                            .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                                    5, priceType);
                    if (price.isPresent()) {
                        furniture.setSuggestedPriceId(price.get().getPriceId());
                        furniture.setPriceType(priceType);
                    } else {
                        // Fallback: tìm giá "Đồ vật khác" nếu không tìm thấy
                        var fallbackPrice = priceRepository
                                .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                                        5, "Theo chiếc - Đồ vật khác");
                        if (fallbackPrice.isPresent()) {
                            furniture.setSuggestedPriceId(fallbackPrice.get().getPriceId());
                            furniture.setPriceType("Theo chiếc - Đồ vật khác");
                        }
                    }
                }
            }

            // Nhóm đồ đạc theo loại giá (bàn, ghế, đồ vật khác)
            Map<Integer, Integer> priceQuantityMap = new HashMap<>(); // priceId -> tổng số lượng
            
            for (var furniture : analysisResult.getDetectedFurniture()) {
                Integer priceId = furniture.getSuggestedPriceId();
                if (priceId == null) {
                    // Nếu vẫn không có priceId, tìm giá "Đồ vật khác" làm mặc định
                    var otherPrice = priceRepository
                            .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                                    5, "Theo chiếc - Đồ vật khác");
                    if (otherPrice.isPresent()) {
                        priceId = otherPrice.get().getPriceId();
                    } else {
                        // Nếu vẫn không tìm thấy, bỏ qua đồ đạc này
                        continue;
                    }
                }
                
                int quantity = furniture.getQuantity() != null && furniture.getQuantity() > 0 
                        ? furniture.getQuantity() : 1;
                priceQuantityMap.put(priceId, priceQuantityMap.getOrDefault(priceId, 0) + quantity);
            }

            if (priceQuantityMap.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Không thể xác định giá cho các đồ đạc được phát hiện. Vui lòng kiểm tra lại cấu hình giá trong hệ thống.");
            }

            // Thêm từng loại dịch vụ vào quotation
            StringBuilder resultMessage = new StringBuilder("Đã thêm dịch vụ đóng gói vào báo giá:\n");
            
            for (Map.Entry<Integer, Integer> entry : priceQuantityMap.entrySet()) {
                Integer priceId = entry.getKey();
                Integer quantity = entry.getValue();
                
                if (priceId == null || quantity == null || quantity <= 0) {
                    continue;
                }
                
                // Lấy thông tin price để hiển thị
                var priceOpt = priceRepository.findById(priceId);
                if (priceOpt.isEmpty()) {
                    continue; // Bỏ qua nếu không tìm thấy price
                }
                
                String priceTypeName = priceOpt.get().getPriceType();
                
                QuotationServiceRequest request = QuotationServiceRequest.builder()
                        .quotationId(quotation.getQuotationId())
                        .serviceId(5) // Đóng gói chuyên nghiệp
                        .priceId(priceId)
                        .quantity(quantity)
                        .build();

                quotationSvService.create(request);
                resultMessage.append(String.format("- %s: %d chiếc\n", priceTypeName, quantity));
            }

            if (resultMessage.length() <= "Đã thêm dịch vụ đóng gói vào báo giá:\n".length()) {
                return ResponseEntity.badRequest()
                        .body("Không thể thêm dịch vụ. Vui lòng kiểm tra lại cấu hình giá trong hệ thống.");
            }

            return ResponseEntity.ok(resultMessage.toString());
        } catch (Exception e) {
            e.printStackTrace(); // Log để debug
            return ResponseEntity.badRequest()
                    .body("Lỗi khi thêm dịch vụ: " + e.getMessage() + 
                          (e.getCause() != null ? " - " + e.getCause().getMessage() : ""));
        }
    }
}
