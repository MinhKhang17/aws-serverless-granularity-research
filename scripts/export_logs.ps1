param(
  [string]$FunctionName,
  [string]$StartTimeIso,
  [string]$EndTimeIso,
  [string]$OutputFile
)

$startEpoch = [DateTimeOffset]::Parse($StartTimeIso).ToUnixTimeMilliseconds()
$endEpoch = [DateTimeOffset]::Parse($EndTimeIso).ToUnixTimeMilliseconds()
$logGroup = "/aws/lambda/$FunctionName"

aws logs filter-log-events `
  --log-group-name $logGroup `
  --filter-pattern '"benchmark_metric"' `
  --start-time $startEpoch `
  --end-time $endEpoch `
  --output json `
  > $OutputFile