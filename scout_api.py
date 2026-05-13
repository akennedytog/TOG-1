#!/usr/bin/env python3
"""
Scout API - Backend server for Scout CRM
Handles file uploads and serves analysis results
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Add workspace to path
sys.path.insert(0, '/Users/aleckennedy/.openclaw/workspace')
from scout_analyzer import analyze_report, get_all_reports, get_report

UPLOAD_DIR = Path('/Users/aleckennedy/.openclaw/workspace/scout_uploads')
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and analysis"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    # Validate extension
    allowed = ['.csv', '.xlsx', '.xls', '.pdf']
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        return jsonify({"error": f"Invalid file type. Allowed: {', '.join(allowed)}"}), 400
    
    # Save file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{file.filename}"
    filepath = UPLOAD_DIR / filename
    file.save(filepath)
    
    # Analyze
    try:
        report = analyze_report(str(filepath))
        return jsonify({
            "success": True,
            "report": report,
            "message": "Report analyzed successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reports', methods=['GET'])
def list_reports():
    """Get all analyzed reports"""
    try:
        reports = get_all_reports()
        return jsonify({"reports": reports})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/report/<report_id>', methods=['GET'])
def get_report_endpoint(report_id):
    """Get specific report"""
    report = get_report(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(report)

@app.route('/report/<report_id>', methods=['DELETE'])
def delete_report_endpoint(report_id):
    """Delete a report"""
    from scout_analyzer import REPORTS_DIR
    report_path = REPORTS_DIR / f"{report_id}.json"
    if report_path.exists():
        report_path.unlink()
        return jsonify({"success": True})
    return jsonify({"error": "Report not found"}), 404

if __name__ == '__main__':
    print("🚀 Scout API starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
