package fundflow_bff.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fundflow_bff.model.Fund;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    // RestClient is the new Spring Boot 4 HTTP client.
    // It replaces RestTemplate (deprecated) and is more fluent.
    // Interview angle: "I used RestClient introduced in Spring Boot 3.2
    // as it's the modern replacement for the deprecated RestTemplate."
    private final RestClient restClient = RestClient.create();

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public String chat(Fund fund, String userMessage) {
        // Build a context-rich prompt so Gemini answers
        // specifically about this fund, not generically
        String prompt = buildPrompt(fund, userMessage);

        try {
            // Build the Gemini request body as JSON
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("GEMINI_API_KEY is not configured");
            }
            String responseBody = restClient.post()
                .uri(GEMINI_URL)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .body(requestBody.toString())
                .retrieve()
                .onStatus(status -> status.isError(), (req, res) -> {
                    throw new RuntimeException("Gemini API error: " + res.getStatusCode());
                })
                .body(String.class);

            // Parse the response and extract the text
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                log.error("Invalid Gemini response: {}", responseBody);
                return "No response from AI.";
            }
            return root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText("Sorry, I could not generate a response.");

        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return "Sorry, the AI assistant is currently unavailable.";
        }
    }

    private String buildPrompt(Fund fund, String userMessage) {
        // We inject fund data as context so Gemini answers
        // specifically about this fund, not generically.
        // This is called "prompt engineering" — a key skill for AI integration.
        return String.format("""
            You are a helpful financial advisor assistant for FundFlow, \
            an asset management dashboard.
            
            The user is asking about the following investment fund:
            - Name: %s
            - Category: %s
            - Risk Level: %s
            - YTD Return: %.2f%%
            - 1-Year Return: %.2f%%
            - 3-Year Return: %.2f%%
            - Assets Under Management: %.0f million EUR
            - Currency: %s
            - Description: %s
            
            Rules:
            - Answer in maximum 3 sentences.
            - Be direct and concise, no filler phrases.
            - Only answer questions related to this fund or investing in general.
            - If the question is unrelated to finance, reply: "I can only answer questions about this fund."
            - Same language as the user.
            
            Question: %s
            """,
            fund.getName(),
            fund.getCategory(),
            fund.getRiskLevel(),
            fund.getReturnYtd() != null ? fund.getReturnYtd() : 0.0,
            fund.getReturnOneYear() != null ? fund.getReturnOneYear() : 0.0,
            fund.getReturnThreeYear() != null ? fund.getReturnThreeYear() : 0.0,
            fund.getAum() != null ? fund.getAum() : 0.0,
            fund.getCurrency(),
            fund.getDescription(),
            userMessage
        );
    }
}