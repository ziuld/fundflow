package fundflow_bff.repository;

import fundflow_bff.model.Fund;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// MongoRepository<Fund, String>:
//   - Fund  → the document type
//   - String → the type of the @Id field
//
// By extending MongoRepository, Spring Data auto-generates
// at runtime: findAll, findById, save, delete, count, etc.
// You write zero implementation code for these.
@Repository
public interface FundRepository extends MongoRepository<Fund, String> {

    // Spring Data reads the method name and generates the query automatically.
    // "findBy" + "Category" → db.funds.find({ category: "Equity" })
    // This is called "derived queries" — no @Query annotation needed.
    List<Fund> findByCategory(String category);

    // "findBy" + "RiskLevel" → db.funds.find({ riskLevel: "High" })
    List<Fund> findByRiskLevel(String riskLevel);

    // Combining two fields with And
    // → db.funds.find({ category: "Equity", riskLevel: "Low" })
    List<Fund> findByCategoryAndRiskLevel(String category, String riskLevel);
}