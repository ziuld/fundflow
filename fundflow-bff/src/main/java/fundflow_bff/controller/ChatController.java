package fundflow_bff.controller;

import fundflow_bff.model.ChatRequest;
import fundflow_bff.model.ChatResponse;
import fundflow_bff.service.FundService;
import fundflow_bff.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final FundService fundService;
    private final GeminiService geminiService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("Chat request for fund: {}", request.getFundId());

        return fundService.getFundById(request.getFundId())
            .map(fund -> {
                String reply = geminiService.chat(fund, request.getMessage());
                return ResponseEntity.ok(new ChatResponse(reply));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}