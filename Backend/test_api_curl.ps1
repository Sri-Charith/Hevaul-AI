$env:GEMINI_API_KEY = Get-Content .env | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }
$response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$env:GEMINI_API_KEY" -Method Get
$response.models | ForEach-Object { Write-Output $_.name }
