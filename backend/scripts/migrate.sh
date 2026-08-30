#!/usr/bin/env sh
set -eu

: "${ConnectionStrings__WebApiDatabase:?ConnectionStrings__WebApiDatabase must be set before running migrations}"
dotnet ef database update \
  --project "$(dirname "$0")/../backend.csproj" \
  --startup-project "$(dirname "$0")/../backend.csproj"
