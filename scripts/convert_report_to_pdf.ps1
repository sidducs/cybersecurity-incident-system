$docx = "D:\DBMS Mini Project\docs\FINAL_DBMS_MINI_PROJECT_REPORT.docx"
$pdf = "D:\DBMS Mini Project\docs\FINAL_DBMS_MINI_PROJECT_REPORT.pdf"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($docx)
    $doc.ExportAsFixedFormat($pdf, 17) # 17 = wdExportFormatPDF
    $doc.Close([ref]$false)
    Write-Host "PDF exported successfully!"
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
