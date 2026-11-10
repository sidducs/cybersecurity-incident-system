import subprocess

ps_script = """
Get-CimInstance win32_service | Where-Object { $_.PathName -like '*postgres*' } | Select-Object Name, State, StartMode, PathName | Format-List
"""

cmd = ['powershell', '-NoProfile', '-Command', ps_script]
res = subprocess.run(cmd, capture_output=True, text=True)
print('POSTGRESQL SERVICES FOUND:')
print(res.stdout)
