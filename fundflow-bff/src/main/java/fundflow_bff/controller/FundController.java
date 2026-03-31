package fundflow_bff.controller;

import fundflow_bff.model.Fund;
import fundflow_bff.service.FundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController = @Controller + @ResponseBody
// Every method automatically serializes the return value to JSON.
//
// @RequestMapping sets the base path for all endpoints in this class.
// All fund endpoints live under /api/v1/funds.
//
// Why versioning (/v1/)? If you need to change the API contract in the
// future, you create /v2/ without breaking existing consumers.
// Belfius will definitely ask about API versioning strategy.
@RestController
@RequestMapping("/api/v1/funds")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000") // allows React dev server to call this API
public class FundController {

    private final FundService fundService;

    // GET /api/v1/funds
    // GET /api/v1/funds?category=Equity
    // GET /api/v1/funds?riskLevel=High
    // @RequestParam is optional — if not provided, returns all funds
    @GetMapping
    public ResponseEntity<List<Fund>> getFunds(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String riskLevel) {

        List<Fund> funds;

        if (category != null) {
            funds = fundService.getFundsByCategory(category);
        } else if (riskLevel != null) {
            funds = fundService.getFundsByRiskLevel(riskLevel);
        } else {
            funds = fundService.getAllFunds();
        }

        return ResponseEntity.ok(funds);
    }

    // GET /api/v1/funds/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Fund> getFundById(@PathVariable String id) {
        return fundService.getFundById(id)
                .map(ResponseEntity::ok)                          // fund found → 200 OK
                .orElse(ResponseEntity.notFound().build());       // not found → 404
    }

    // POST /api/v1/funds
    // @RequestBody deserializes the JSON body into a Fund object
    @PostMapping
    public ResponseEntity<Fund> createFund(@RequestBody Fund fund) {
        Fund created = fundService.createFund(fund);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201 Created
    }

    // PUT /api/v1/funds/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Fund> updateFund(
            @PathVariable String id,
            @RequestBody Fund fund) {

        return fundService.updateFund(id, fund)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/v1/funds/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFund(@PathVariable String id) {
        fundService.deleteFund(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}