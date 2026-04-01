package fundflow_bff.model;

import lombok.Data;

@Data
public class ChatRequest {
    private String fundId;    // which fund the user is asking about
    private String message;   // the user's question
}