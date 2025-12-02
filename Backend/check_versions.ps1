$env:GEMINI_API_KEY = Get-Content .env | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }

function Check-Model ($modelName) {
    try {
        $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/$modelName?key=$env:GEMINI_API_KEY" -Method Get
        Write-Output "$modelName is AVAILABLE"
    } catch {
        Write-Output "$modelName is NOT AVAILABLE"
    }
}

Check-Model "gemini-1.5-flash-001"
Check-Model "gemini-1.0-pro"
