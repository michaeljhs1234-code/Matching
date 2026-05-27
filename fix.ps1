$files = Get-ChildItem -Path "c:\Users\micha\OneDrive\바탕 화면\시분설\matching" -Recurse -Include *.ts,*.tsx
foreach ($file in $files) {
    if ($file.FullName -match "node_modules") { continue }
    if ($file.FullName -match "\.next") { continue }
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace "'/auth/login", "'/login" `
                           -replace '"/auth/login', '"/login' `
                           -replace "`/auth/login", "`/login" `
                           -replace "'/auth/signup", "'/signup" `
                           -replace '"/auth/signup', '"/signup' `
                           -replace "`/auth/signup", "`/signup" `
                           -replace "'/auth/verify", "'/verify" `
                           -replace '"/auth/verify', '"/verify' `
                           -replace "`/auth/verify", "`/verify" `
                           -replace "'/auth/signout", "'/signout" `
                           -replace '"/auth/signout', '"/signout' `
                           -replace "`/auth/signout", "`/signout"
    if ($content -cne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($file.FullName)"
    }
}
