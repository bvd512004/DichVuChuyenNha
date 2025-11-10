package com.swp391.dichvuchuyennha.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.dichvuchuyennha.dto.response.ImageAnalysisResponse;
import com.swp391.dichvuchuyennha.entity.Prices;
import com.swp391.dichvuchuyennha.entity.Services;
import com.swp391.dichvuchuyennha.repository.PriceRepository;
import com.swp391.dichvuchuyennha.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageAnalysisService {

    private final ServiceRepository serviceRepository;
    private final PriceRepository priceRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    /**
     * Phân tích hình ảnh để tính diện tích và nhận diện đồ đạc
     */
    public ImageAnalysisResponse analyzeImage(File imageFile) throws IOException {
        // Đọc file và chuyển sang base64
        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        // Tạo prompt cho AI
        String systemPrompt = buildAnalysisPrompt();

        // Gọi Gemini Vision API
        String aiResponse = callGeminiVisionAPI(systemPrompt, base64Image);

        // Parse kết quả từ AI
        return parseAIResponse(aiResponse);
    }

    /**
     * Xây dựng prompt cho AI phân tích
     */
    private String buildAnalysisPrompt() {
        // Lấy danh sách dịch vụ từ database
        List<Services> services = serviceRepository.findByIsActiveTrue();
        StringBuilder servicesInfo = new StringBuilder();
        for (Services service : services) {
            servicesInfo.append("- Service ID: ").append(service.getServiceId())
                    .append(", Tên: ").append(service.getServiceName())
                    .append(", Mô tả: ").append(service.getDescription() != null ? service.getDescription() : "")
                    .append("\n");
        }

        return "Bạn là một chuyên gia phân tích hình ảnh không gian nội thất cho dịch vụ chuyển nhà tại Việt Nam. " +
                "QUAN TRỌNG: Tất cả phản hồi phải bằng TIẾNG VIỆT.\n\n" +
                "Nhiệm vụ của bạn:\n\n" +
                "1. TÍNH TOÁN DIỆN TÍCH: Dựa vào hình ảnh, ước tính diện tích mặt sàn của căn phòng (đơn vị: m²). " +
                "Hãy quan sát kỹ không gian, so sánh với các vật thể có kích thước chuẩn (cửa, cửa sổ, đồ đạc) để tính toán.\n\n" +
                "2. NHẬN DIỆN ĐỒ ĐẠC: Liệt kê tất cả đồ đạc có trong phòng, bao gồm:\n" +
                "   - Tên đồ đạc BẰNG TIẾNG VIỆT (ví dụ: bàn, ghế, giường, tủ, tủ lạnh, máy giặt, tivi, sofa, kệ sách, v.v.)\n" +
                "   - Số lượng\n" +
                "   - Mô tả ngắn gọn BẰNG TIẾNG VIỆT (kích thước, loại, tình trạng nếu có thể nhận biết)\n\n" +
                "3. ƯỚC LƯỢNG KẾ HOẠCH VẬN CHUYỂN: Dựa trên tổng số lượng, kích thước và khối lượng ước tính của đồ đạc, hãy " +
                "đề xuất loại xe phù hợp thuộc service_id = 3 (các lựa chọn: xe nhỏ, xe to, xe container). " +
                "Gợi ý: xe nhỏ ~ 500kg, xe to ~ 1.5 tấn, xe container > 3 tấn. Tính toán số lượng xe cần dùng đồng thời và số chuyến cho mỗi xe. " +
                "Nếu không đủ dữ liệu, hãy nêu rõ giả định được sử dụng.\n\n" +
                "4. DANH SÁCH DỊCH VỤ CÓ SẴN:\n" + servicesInfo.toString() + "\n\n" +
                "5. ĐỊNH DẠNG KẾT QUẢ: Trả về kết quả theo định dạng JSON chính xác như sau:\n" +
                "{\n" +
                "  \"estimatedArea\": <số thực>, // Diện tích ước tính (m²)\n" +
                "  \"detectedFurniture\": [\n" +
                "    {\n" +
                "      \"name\": \"<tên đồ đạc BẰNG TIẾNG VIỆT>\",\n" +
                "      \"quantity\": <số lượng>,\n" +
                "      \"description\": \"<mô tả BẰNG TIẾNG VIỆT>\",\n" +
                "      \"suggestedServiceId\": <service_id hoặc null>,\n" +
                "      \"suggestedServiceName\": \"<tên dịch vụ hoặc null>\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"vehiclePlan\": [\n" +
                "    {\n" +
                "      \"vehicleType\": \"xe nhỏ | xe to | xe container\",\n" +
                "      \"vehicleCount\": <số lượng xe sử dụng cùng lúc>,\n" +
                "      \"estimatedTrips\": <số chuyến mỗi xe>,\n" +
                "      \"estimatedDistanceKm\": <quãng đường 1 chiều dự kiến hoặc null nếu không biết>,\n" +
                "      \"reason\": \"<giải thích bằng TIẾNG VIỆT>\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"analysisNote\": \"<ghi chú tổng quan về căn phòng BẰNG TIẾNG VIỆT>\"\n" +
                "}\n\n" +
                "LƯU Ý QUAN TRỌNG:\n" +
                "- TẤT CẢ văn bản phải bằng TIẾNG VIỆT (tên đồ đạc, mô tả, ghi chú)\n" +
                "- Chỉ trả về JSON, không thêm text nào khác\n" +
                "- estimatedArea phải là số thực (ví dụ: 25.5)\n" +
                "- detectedFurniture là mảng, có thể rỗng nếu không thấy đồ đạc\n" +
                "- vehiclePlan là mảng, có thể rỗng nếu không thể đề xuất phương tiện (nhưng cố gắng đưa ra đề xuất hợp lý nhất)\n" +
                "- Nếu không chắc chắn về diện tích, hãy ước tính dựa trên các vật thể chuẩn trong ảnh\n" +
                "- suggestedServiceId và suggestedServiceName có thể là null nếu không match được với dịch vụ nào\n" +
                "- Tên đồ đạc phải là tiếng Việt thuần túy, ví dụ: 'bàn' không phải 'table', 'ghế' không phải 'chair'";
    }

    /**
     * Gọi Gemini Vision API
     */
    private String callGeminiVisionAPI(String prompt, String base64Image) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

            // Tạo content array
            List<Map<String, Object>> contents = new ArrayList<>();

            // Thêm text content
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(textPart);

            // Thêm image
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", "image/jpeg");
            inlineData.put("data", base64Image);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);
            contents.add(content);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            // Cấu hình generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.3); // Thấp hơn để kết quả chính xác hơn
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            generationConfig.put("maxOutputTokens", 2048); // Tăng để có đủ không gian cho JSON
            requestBody.put("generationConfig", generationConfig);

            // Gửi request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");

                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content2 = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts2 = (List<Map<String, Object>>) content2.get("parts");

                    if (parts2 != null && !parts2.isEmpty()) {
                        String text = (String) parts2.get(0).get("text");
                        // Làm sạch text để lấy JSON
                        return extractJSON(text);
                    }
                }
            }

            throw new RuntimeException("Không thể nhận được phản hồi từ AI");

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi AI: " + e.getMessage(), e);
        }
    }

    /**
     * Trích xuất JSON từ response của AI (có thể có text thừa)
     */
    private String extractJSON(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new RuntimeException("Response từ AI rỗng");
        }

        // Tìm JSON object trong text
        int startIdx = text.indexOf("{");
        int endIdx = text.lastIndexOf("}");

        if (startIdx == -1 || endIdx == -1 || endIdx <= startIdx) {
            throw new RuntimeException("Không tìm thấy JSON trong response: " + text);
        }

        return text.substring(startIdx, endIdx + 1);
    }

    /**
     * Parse kết quả từ AI thành ImageAnalysisResponse
     */
    private ImageAnalysisResponse parseAIResponse(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});

            ImageAnalysisResponse.ImageAnalysisResponseBuilder builder = ImageAnalysisResponse.builder();

            // Parse estimatedArea
            Object areaObj = responseMap.get("estimatedArea");
            if (areaObj != null) {
                Double area = areaObj instanceof Number ? ((Number) areaObj).doubleValue() : Double.parseDouble(areaObj.toString());
                builder.estimatedArea(area);
            }

            // Parse detectedFurniture
            Object furnitureObj = responseMap.get("detectedFurniture");
            if (furnitureObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> furnitureList = (List<Map<String, Object>>) furnitureObj;
                List<ImageAnalysisResponse.DetectedFurniture> detectedFurniture = furnitureList.stream()
                        .map(this::parseFurniture)
                        .collect(Collectors.toList());
                builder.detectedFurniture(detectedFurniture);
            }

            // Parse analysisNote
            Object noteObj = responseMap.get("analysisNote");
            if (noteObj != null) {
                builder.analysisNote(noteObj.toString());
            }

            // Parse vehiclePlan
            Object vehiclePlanObj = responseMap.get("vehiclePlan");
            if (vehiclePlanObj instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> vehiclePlanList = (List<Map<String, Object>>) vehiclePlanObj;
                List<ImageAnalysisResponse.VehiclePlan> plans = vehiclePlanList.stream()
                        .map(this::parseVehiclePlan)
                        .collect(Collectors.toList());
                builder.vehiclePlan(plans);
            }

            ImageAnalysisResponse response = builder.build();

            // Matching với dịch vụ
            matchFurnitureWithServices(response);
            matchVehiclePlanWithServices(response);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi parse kết quả từ AI: " + e.getMessage() + "\nResponse: " + jsonResponse, e);
        }
    }

    /**
     * Parse một furniture object
     */
    private ImageAnalysisResponse.DetectedFurniture parseFurniture(Map<String, Object> furnitureMap) {
        ImageAnalysisResponse.DetectedFurniture.DetectedFurnitureBuilder builder =
                ImageAnalysisResponse.DetectedFurniture.builder();

        if (furnitureMap.get("name") != null) {
            builder.name(furnitureMap.get("name").toString());
        }

        if (furnitureMap.get("quantity") != null) {
            Integer quantity = furnitureMap.get("quantity") instanceof Number
                    ? ((Number) furnitureMap.get("quantity")).intValue()
                    : Integer.parseInt(furnitureMap.get("quantity").toString());
            builder.quantity(quantity);
        } else {
            builder.quantity(1); // Mặc định là 1
        }

        if (furnitureMap.get("description") != null) {
            builder.description(furnitureMap.get("description").toString());
        }

        return builder.build();
    }

    /**
     * Parse vehicle plan object
     */
    private ImageAnalysisResponse.VehiclePlan parseVehiclePlan(Map<String, Object> planMap) {
        ImageAnalysisResponse.VehiclePlan.VehiclePlanBuilder builder = ImageAnalysisResponse.VehiclePlan.builder();

        if (planMap.get("vehicleType") != null) {
            builder.vehicleType(planMap.get("vehicleType").toString());
        }
        if (planMap.get("vehicleCount") != null) {
            Integer count = planMap.get("vehicleCount") instanceof Number
                    ? ((Number) planMap.get("vehicleCount")).intValue()
                    : Integer.parseInt(planMap.get("vehicleCount").toString());
            builder.vehicleCount(count);
        }
        if (planMap.get("estimatedTrips") != null) {
            Integer trips = planMap.get("estimatedTrips") instanceof Number
                    ? ((Number) planMap.get("estimatedTrips")).intValue()
                    : Integer.parseInt(planMap.get("estimatedTrips").toString());
            builder.estimatedTrips(trips);
        }
        if (planMap.get("estimatedDistanceKm") != null) {
            Double distance = planMap.get("estimatedDistanceKm") instanceof Number
                    ? ((Number) planMap.get("estimatedDistanceKm")).doubleValue()
                    : Double.parseDouble(planMap.get("estimatedDistanceKm").toString());
            builder.estimatedDistanceKm(distance);
        }
        if (planMap.get("reason") != null) {
            builder.reason(planMap.get("reason").toString());
        }

        return builder.build();
    }

    /**
     * Matching đồ đạc với dịch vụ và giá
     */
    private void matchFurnitureWithServices(ImageAnalysisResponse response) {
        if (response.getDetectedFurniture() == null) {
            return;
        }

        // Service ID = 5 (Đóng gói chuyên nghiệp)
        Integer serviceId = 5;
        Optional<Services> service = serviceRepository.findById(serviceId);
        if (service.isEmpty()) {
            return;
        }

        Services packingService = service.get();

        for (ImageAnalysisResponse.DetectedFurniture furniture : response.getDetectedFurniture()) {
            if (furniture.getName() == null) continue;

            String furnitureName = furniture.getName().toLowerCase().trim();

            // Set service
            furniture.setSuggestedServiceId(serviceId);
            furniture.setSuggestedServiceName(packingService.getServiceName());

            // Xác định loại giá dựa trên tên đồ đạc (matching chính xác hơn)
            String priceType = null;
            
            // Kiểm tra xem có phải bàn không (kiểm tra nhiều từ khóa)
            if (furnitureName.contains("bàn") || furnitureName.contains("table") || 
                furnitureName.contains("desk") || furnitureName.contains("bàn ăn") ||
                furnitureName.contains("bàn làm việc") || furnitureName.contains("bàn trà") ||
                furnitureName.contains("bàn học")) {
                priceType = "Theo chiếc - Bàn";
            }
            // Kiểm tra xem có phải ghế không
            else if (furnitureName.contains("ghế") || furnitureName.contains("chair") ||
                     furnitureName.contains("ghế ngồi") || furnitureName.contains("ghế tựa") ||
                     furnitureName.contains("ghế xoay") || furnitureName.contains("ghế văn phòng")) {
                priceType = "Theo chiếc - Ghế";
            }
            // Các đồ vật khác
            else {
                priceType = "Theo chiếc - Đồ vật khác";
            }

            // Tìm price_id từ database
            Optional<Prices> price = priceRepository
                    .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                            serviceId, priceType);

            if (price.isPresent()) {
                furniture.setSuggestedPriceId(price.get().getPriceId());
                furniture.setPriceType(priceType);
            } else {
                // Fallback: tìm giá "Đồ vật khác" nếu không tìm thấy
                if (!priceType.equals("Theo chiếc - Đồ vật khác")) {
                    Optional<Prices> fallbackPrice = priceRepository
                            .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                                    serviceId, "Theo chiếc - Đồ vật khác");
                    if (fallbackPrice.isPresent()) {
                        furniture.setSuggestedPriceId(fallbackPrice.get().getPriceId());
                        furniture.setPriceType("Theo chiếc - Đồ vật khác");
                    }
                }
            }
        }
    }

    /**
     * Matching kế hoạch phương tiện với service và price
     */
    private void matchVehiclePlanWithServices(ImageAnalysisResponse response) {
        if (response.getVehiclePlan() == null) {
            return;
        }

        for (ImageAnalysisResponse.VehiclePlan plan : response.getVehiclePlan()) {
            if (plan.getVehicleType() == null) {
                continue;
            }

            plan.setSuggestedServiceId(3); // Service vận chuyển bằng xe

            String vehicleTypeLower = plan.getVehicleType().toLowerCase(Locale.ROOT);
            String priceType;
            if (vehicleTypeLower.contains("container")) {
                priceType = "xe container";
            } else if (vehicleTypeLower.contains("to") || vehicleTypeLower.contains("lớn")) {
                priceType = "xe to";
            } else {
                priceType = "xe nhỏ";
            }

            Optional<Prices> price = priceRepository
                    .findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
                            3, priceType);

            price.ifPresent(pr -> {
                plan.setSuggestedPriceId(pr.getPriceId());
                plan.setPriceType(pr.getPriceType());
            });
        }
    }
}

