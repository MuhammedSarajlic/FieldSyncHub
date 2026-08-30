param(
    [string]$ConnectionString = $env:ConnectionStrings__WebApiDatabase
)

if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    throw "ConnectionStrings__WebApiDatabase must be set before running migrations."
}

$env:ConnectionStrings__WebApiDatabase = $ConnectionString
dotnet ef database update --project "$PSScriptRoot\..\backend.csproj" --startup-project "$PSScriptRoot\..\backend.csproj"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
