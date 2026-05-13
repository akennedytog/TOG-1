import json

with open('../data/scout_output/briefing_latest.json') as f:
    data = json.load(f)

# Create HTML with embedded data
html = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Scout Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: Inter, sans-serif; background: #0f172a; color: #f1f5f9; }
        .glass { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.1); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    </style>
</head>
<body class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Scout Dashboard</h1>
            <p class="text-slate-400">Road to Cinco - B-F FY26 Q4 H&R</p>
        </header>
        
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">'''

# Add KPI cards from the data
reports = data.get('reports', [])
total_sheets = sum(r.get('sheet_count', 0) for r in reports)
total_records = sum(
    s.get('summary', {}).get('record_count', 0) 
    for r in reports 
    for s in r.get('sheets', [])
)

html += f'''
            <div class="glass rounded-xl p-5 card-hover">
                <p class="text-sm text-slate-400">Programs</p>
                <p class="text-2xl font-bold mt-1">{len(reports)}</p>
            </div>
            <div class="glass rounded-xl p-5 card-hover">
                <p class="text-sm text-slate-400">Total Sheets</p>
                <p class="text-2xl font-bold mt-1">{total_sheets}</p>
            </div>
            <div class="glass rounded-xl p-5 card-hover">
                <p class="text-sm text-slate-400">Total Records</p>
                <p class="text-2xl font-bold mt-1">{total_records}</p>
            </div>
            <div class="glass rounded-xl p-5 card-hover">
                <p class="text-sm text-slate-400">Report Types</p>
                <p class="text-2xl font-bold mt-1">{len(data.get('overall_report_type_counts', {}))}</p>
            </div>
        </div>
'''

# Add program details
html += '''
        <!-- Programs -->
        <div class="space-y-6">'''

for report in reports:
    prog_name = report.get('file_name', '').replace('.xlsx', '').replace('B-F FY26 ', '')
    sheets = report.get('sheets', [])
    
    html += f'''
            <div class="glass rounded-xl p-6">
                <h2 class="text-xl font-semibold mb-4 text-white">{prog_name}</h2>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-700 text-left text-sm text-slate-400">
                                <th class="pb-3 px-4">Sheet</th>
                                <th class="pb-3 px-4">Type</th>
                                <th class="pb-3 px-4">Records</th>
                                <th class="pb-3 px-4">Summary</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800">'''
    
    for sheet in sheets:
        sheet_name = sheet.get('sheet_name', '')
        report_type = sheet.get('report_type', 'unknown')
        summary = sheet.get('summary', {})
        record_count = summary.get('record_count', 0)
        
        # Build summary text
        summary_parts = []
        if 'brands' in summary:
            brands = summary['brands'][:2]  # Top 2
            summary_parts.append(f"Brands: {', '.join(b[0] for b in brands)}")
        if 'promotion_types' in summary:
            promos = summary['promotion_types'][:2]
            summary_parts.append(f"Promos: {', '.join(p[0] for p in promos)}")
        
        summary_text = '; '.join(summary_parts) if summary_parts else '-'
        
        html += f'''
                            <tr class="hover:bg-slate-800/50 transition">
                                <td class="py-4 px-4 font-medium">{sheet_name}</td>
                                <td class="py-4 px-4"><span class="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">{report_type}</span></td>
                                <td class="py-4 px-4">{record_count}</td>
                                <td class="py-4 px-4 text-sm text-slate-400">{summary_text}</td>
                            </tr>'''
    
    html += '''
                        </tbody>
                    </table>
                </div>
            </div>'''

html += '''
        </div>
        
        <footer class="mt-8 text-center text-sm text-slate-500">
            <p>Generated: ''' + data.get('generated_at', 'Unknown') + '''</p>
        </footer>
    </div>
</body>
</html>'''

# Save
with open('scout_dashboard_embedded.html', 'w') as f:
    f.write(html)

print('✅ Dashboard created: scout_dashboard_embedded.html')
print(f'   Programs: {len(reports)}')
print(f'   Total sheets: {total_sheets}')
