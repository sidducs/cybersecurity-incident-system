import subprocess

code = """
Get-Service | Where-Object { $_.DisplayName -match 'postgres' -or $_.Name -match 'postgres' -or $_.DisplayName -match 'pgsql' } | Select-Object Name, DisplayName, Status | Format-Table -AutoSize
"""
cmd = ['powershell', '-NoProfile', '-Command', code]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout)
