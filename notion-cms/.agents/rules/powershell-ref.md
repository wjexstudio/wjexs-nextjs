---
trigger: model_decision
---

# Ref: PowerShell Commands (Windows)
> ใช้คำสั่ง PowerShell เท่านั้น ห้ามใช้ Linux bash หรือ CMD flags

---

## คำสั่งที่ใช้บ่อย

| ห้ามใช้ (Linux/CMD) | ใช้แทน (PowerShell) |
|---|---|
| `cat file` | `Get-Content file` |
| `grep "text" file` | `Select-String "text" file` |
| `cat file \| grep` | `Get-Content file \| Select-String "text"` |
| `ls` | `Get-ChildItem` |
| `ls -la` | `Get-ChildItem -Force` |
| `find . -name "*.ts"` | `Get-ChildItem -Recurse -Filter "*.ts"` |
| `rm file` | `Remove-Item file` |
| `rmdir /s /q folder` | `Remove-Item -Recurse -Force folder` |
| `touch file` | `New-Item file` |
| `mkdir folder` | `New-Item -ItemType Directory folder` |
| `cp src dst` | `Copy-Item src dst` |
| `mv src dst` | `Move-Item src dst` |
| `echo text >> file` | `Add-Content file "text"` |
| `echo text > file` | `Set-Content file "text"` |
| `type file.txt` | `Get-Content file.txt` |
| `findstr "text" file` | `Select-String "text" file` |
| `cls` | `Clear-Host` |
| `where node` | `Get-Command node` |
| `tasklist` | `Get-Process` |
| `taskkill /f /im node.exe` | `Stop-Process -Name node -Force` |
| `set VAR=value` | `$VAR = "value"` |
| `echo %VAR%` | `Write-Output $VAR` |
| `cd /d D:\path` | `Set-Location D:\path` |
| `ren old new` | `Rename-Item old new` |
| `dir /s /b *.ts` | `Get-ChildItem -Recurse -Filter "*.ts" \| Select-Object FullName` |
