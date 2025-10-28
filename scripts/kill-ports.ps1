Param(
  [int[]]$Ports = @(3000,8001),
  [switch]$Verbose
)

function Kill-ByPid([int]$kpid) {
  try {
    $proc = Get-Process -Id $kpid -ErrorAction Stop
    $path = $null
    try { $path = $proc.Path } catch {}
    if ($proc.ProcessName -in @('Code','Code - Insiders','code') -or ($path -and $path -like '*Microsoft VS Code*')) {
      if ($Verbose) { Write-Host "Skip VS Code/Extension Host pid=$kpid ($path)" -ForegroundColor Yellow }
      return
    }
    Stop-Process -Id $kpid -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 200
    if (-not $proc.HasExited) {
      Stop-Process -Id $kpid -Force -ErrorAction SilentlyContinue
    }
    if ($Verbose) { Write-Host "Killed pid=$kpid" -ForegroundColor Cyan }
  } catch {}
}

$killed = @()
$myPid = $PID

foreach ($p in $Ports) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
      ($conns | Select-Object -ExpandProperty OwningProcess -Unique) | ForEach-Object {
        $foundPid = [int]$_
        if ($foundPid -and $foundPid -ne $myPid) {
          Kill-ByPid $foundPid; $killed += $foundPid
        }
      }
      continue
    }
  } catch {}

  try {
    $lines = netstat -ano | Select-String ":$p\s"
    foreach ($line in $lines) {
      $cols = ($line.ToString() -split '\s+') | Where-Object { $_ -ne '' }
      $pidStr = $cols[-1]
      if ($pidStr -match '^\d+$') {
        $foundPid = [int]$pidStr
        if ($foundPid -ne $myPid) { Kill-ByPid $foundPid; $killed += $foundPid }
      }
    }
  } catch {}
}

$unique = ($killed | Sort-Object -Unique)
Write-Output ("Killed PIDs: {0}" -f ($unique -join ', '))