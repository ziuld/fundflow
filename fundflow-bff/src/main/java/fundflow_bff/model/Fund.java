package fundflow_bff.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

// @Document tells Spring Data this class maps to a MongoDB collection.
// If you don't specify the collection name, Spring uses the class name
// in lowercase ("fund"). We're explicit here — always be explicit.
@Document(collection = "funds")
@Data               // Lombok: generates getters, setters, equals, hashCode, toString
@Builder            // Lombok: enables Fund.builder().name("x").build() pattern
@NoArgsConstructor  // Lombok: required by Spring Data for deserialization
@AllArgsConstructor // Lombok: required by @Builder
public class Fund {

    // @Id maps to MongoDB's _id field.
    // MongoDB auto-generates this as an ObjectId if you don't set it.
    @Id
    private String id;

    private String name;           // "Belfius Equities Europe"
    private String category;       // "Equity", "Bond", "Mixed", "Money Market"
    private String riskLevel;      // "Low", "Medium", "High"
    private Double returnYtd;      // Year-to-date return percentage e.g. 4.5
    private Double returnOneYear;  // 1-year return percentage
    private Double returnThreeYear;// 3-year return percentage
    private Double aum;            // Assets Under Management in millions EUR
    private String currency;       // "EUR", "USD"
    private String isin;           // International Securities Identification Number
    private String description;    // used as context for Gemini AI chat
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}