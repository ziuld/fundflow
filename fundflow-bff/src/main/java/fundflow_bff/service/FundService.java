package fundflow_bff.service;

import fundflow_bff.model.Fund;
import fundflow_bff.repository.FundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// @Service marks this as a Spring-managed bean in the service layer.
// It's semantically different from @Component — it signals this class
// contains business logic, not just utility functions.
//
// @RequiredArgsConstructor (Lombok) generates a constructor that injects
// all final fields. This is constructor injection — the recommended way
// to inject dependencies in Spring (vs @Autowired on the field).
//
// Why constructor injection over @Autowired?
// - Makes dependencies explicit and immutable (final)
// - Easier to test — you can instantiate the class without Spring context
// - Fails at startup if a dependency is missing, not at runtime
@Service
@RequiredArgsConstructor
@Slf4j  // Lombok: generates a logger → log.info(), log.debug(), etc.
public class FundService {

    private final FundRepository fundRepository;

    public List<Fund> getAllFunds() {
        log.debug("Fetching all funds from MongoDB");
        return fundRepository.findAll();
    }

    public Optional<Fund> getFundById(String id) {
        log.debug("Fetching fund by id: {}", id);
        return fundRepository.findById(id);
    }

    public List<Fund> getFundsByCategory(String category) {
        return fundRepository.findByCategory(category);
    }

    public List<Fund> getFundsByRiskLevel(String riskLevel) {
        return fundRepository.findByRiskLevel(riskLevel);
    }

    public Fund createFund(Fund fund) {
        fund.setCreatedAt(LocalDateTime.now());
        fund.setUpdatedAt(LocalDateTime.now());
        log.info("Creating new fund: {}", fund.getName());
        return fundRepository.save(fund);
    }

    public Optional<Fund> updateFund(String id, Fund updatedFund) {
        return fundRepository.findById(id).map(existing -> {
            // Only update fields that are allowed to change.
            // We never update the id or createdAt — immutable fields.
            existing.setName(updatedFund.getName());
            existing.setCategory(updatedFund.getCategory());
            existing.setRiskLevel(updatedFund.getRiskLevel());
            existing.setReturnYtd(updatedFund.getReturnYtd());
            existing.setReturnOneYear(updatedFund.getReturnOneYear());
            existing.setReturnThreeYear(updatedFund.getReturnThreeYear());
            existing.setAum(updatedFund.getAum());
            existing.setDescription(updatedFund.getDescription());
            existing.setUpdatedAt(LocalDateTime.now());
            log.info("Updating fund: {}", id);
            return fundRepository.save(existing);
        });
    }

    public void deleteFund(String id) {
        log.info("Deleting fund: {}", id);
        fundRepository.deleteById(id);
    }
}