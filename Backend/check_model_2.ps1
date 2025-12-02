$env:GEMINI_API_KEY = Get-Content .env | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }
try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25?key=$env:GEMINI_API_KEY" -Method Get
    Write-Output "gemini-2.5-pro-preview-03-25 is AVAILABLE"
    Write-Output $response
} catch {
    Write-Output "gemini-2.5-pro-preview-03-25 is NOT AVAILABLE"
    Write-Output $_.Exception.Message
}
