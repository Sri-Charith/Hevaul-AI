$env:GEMINI_API_KEY = Get-Content .env | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }
try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=$env:GEMINI_API_KEY" -Method Get
    Write-Output "gemini-1.5-flash is AVAILABLE"
    Write-Output $response
} catch {
    Write-Output "gemini-1.5-flash is NOT AVAILABLE"
    Write-Output $_.Exception.Message
}
