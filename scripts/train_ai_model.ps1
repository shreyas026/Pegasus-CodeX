param(
  [string]$DataPath = "ml_workspace\data\sample_cases.csv",
  [string]$ArtifactsPath = "ml_workspace\artifacts"
)

$ErrorActionPreference = "Stop"

Write-Host "Training domestic violence AI model..."
Write-Host "Data:" $DataPath
Write-Host "Artifacts:" $ArtifactsPath

if (-not (Test-Path $DataPath)) {
  throw "Dataset file not found: $DataPath. Create it first or use ml_workspace\data\sample_cases.csv."
}

python "ml_workspace\src\train_baselines.py" --data $DataPath --artifacts $ArtifactsPath

if ($LASTEXITCODE -ne 0) {
  throw "Model training failed."
}

Write-Host ""
Write-Host "Training complete."
Write-Host "Restart the FastAPI backend so the new model artifacts are loaded."
