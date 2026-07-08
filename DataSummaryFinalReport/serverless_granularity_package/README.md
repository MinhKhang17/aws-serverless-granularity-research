# AWS Serverless Granularity Research - Analysis Package

## Scope
This package analyzes the final experimental dataset in `dataFinal.zip` for the AWS serverless granularity experiment. The study scope is limited to G1-G4 and excludes G5 by design.

## Inputs detected
- 12 Artillery result files: G1-G4 x 128/512/1024 MB.
- CloudWatch summary files for G1-G4.
- Detailed CloudWatch CSV files for G1-128, G1-512, and G1-1024.

## Main outputs
- `serverless_granularity_research_report.docx`: formal research-style analysis report.
- `serverless_granularity_analysis.xlsx`: cleaned workbook with dashboard, scenario summary, granularity summary, component metrics, and data quality notes.
- `scenario_summary.csv`: normalized scenario-level metrics and cost estimates.
- `granularity_summary.csv`: aggregate comparison by granularity level.
- `component_cloudwatch_detail.csv`: CloudWatch Lambda-side component metrics.
- `data_quality_notes.txt`: assumptions, caveats, and detected inconsistencies.

## Pricing model
The analysis uses marginal runtime cost, excluding AWS Free Tier and excluding data transfer, CloudWatch Logs, X-Ray, and operational labor. The cost model includes:
- Lambda Arm duration charge using GB-seconds.
- Lambda request charge per Lambda invocation.
- API Gateway HTTP API request charge per external workflow request.

## Key findings
- Best mean latency: G3-512 at 359.9 ms.
- Best p95 latency: G3-1024 at 376.2 ms, but this scenario had 1 failed request.
- Lowest estimated marginal cost: G1-128 at approximately $0.001550 per 1,000 external requests.
- G4 is the least attractive cost-performance option in this dataset because the additional decomposition increases orchestration overhead.

## Important data-quality notes
- CloudWatch/G1 summary file contained only G1-1024, so G1-128 and G1-512 metrics were reconstructed from detailed CloudWatch CSV files.
- G3/G4 child Lambda functions are not memory-suffixed in CloudWatch. The cost model treats those child functions as 128 MB child functions shared across orchestrator memory variants.
- Each scenario appears to have one main run. Additional repeated runs are recommended before making statistical claims.
