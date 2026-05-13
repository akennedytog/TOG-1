#!/usr/bin/env python3
"""
Sample Data Generator for Scout Testing
Creates mock sales data in Excel format
"""

import pandas as pd
from datetime import datetime, timedelta
import random
import os

def generate_sample_data(output_dir='/Users/aleckennedy/.openclaw/workspace/data/sales_reports'):
    """Generate sample sales data for testing Scout"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Sample account names by industry
    accounts = [
        ("Acme Manufacturing", "Manufacturing", 50000),
        ("TechCorp Solutions", "Technology", 75000),
        ("Summit Logistics", "Transportation", 30000),
        ("Metro Health Systems", "Healthcare", 85000),
        ("Coastal Construction", "Construction", 45000),
        ("Global Retail Partners", "Retail", 60000),
        ("Industrial Supply Co", "Industrial", 25000),
        ("Premier Financial", "Finance", 95000),
        ("Food Services Inc", "Food", 35000),
        ("Green Energy Corp", "Energy", 40000),
        ("Urban Development", "Real Estate", 55000),
        ("DataFlow Analytics", "Technology", 70000),
    ]
    
    # Sales reps
    reps = ["Sarah Johnson", "Mike Chen", "Jessica Williams", "David Park"]
    
    # Generate 90 days of transactions
    transactions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    for account_name, industry, avg_monthly in accounts:
        # Simulate some accounts being down, some hot
        trend = random.choice([-0.3, -0.1, 0, 0.1, 0.3, 0.5])
        
        # Number of orders varies by trend
        num_orders = random.randint(3, 15) if trend >= 0 else random.randint(1, 6)
        
        for i in range(num_orders):
            # Order date weighted toward recent for healthy accounts, old for declining
            if trend < 0:
                # Down accounts: more orders in the past
                days_ago = random.randint(15, 90) if i < num_orders * 0.7 else random.randint(1, 14)
            else:
                # Healthy accounts: recent orders
                days_ago = random.randint(1, 60)
            
            order_date = end_date - timedelta(days=days_ago)
            
            # Order amount varies around average
            base_amount = avg_monthly / 4  # Quarterly average
            variation = random.uniform(0.5, 1.5)
            amount = base_amount * variation
            
            # Apply trend adjustment
            if trend < 0 and days_ago < 30:
                amount = amount * (1 + trend)  # Down trend for recent orders
            elif trend > 0 and days_ago < 30:
                amount = amount * (1 + trend * 0.5)  # Up trend
            
            transactions.append({
                'Customer': account_name,
                'Industry': industry,
                'Order Date': order_date.strftime('%Y-%m-%d'),
                'Amount': round(amount, 2),
                'Sales Rep': random.choice(reps),
                'Product Line': random.choice(['Enterprise', 'Standard', 'Basic']),
                'Territory': random.choice(['North', 'South', 'East', 'West']),
            })
    
    # Create DataFrame
    df = pd.DataFrame(transactions)
    df = df.sort_values('Order Date')
    
    # Save to Excel
    output_file = os.path.join(output_dir, f'sales_data_sample_{datetime.now().strftime("%Y%m%d")}.xlsx')
    df.to_excel(output_file, index=False, engine='openpyxl')
    
    print(f"✅ Sample data generated: {output_file}")
    print(f"📊 {len(df)} transactions across {len(accounts)} accounts")
    
    # Summary
    summary = df.groupby('Customer').agg({
        'Amount': 'sum',
        'Order Date': 'count'
    }).reset_index()
    summary.columns = ['Account', 'Total Revenue', 'Orders']
    summary = summary.sort_values('Total Revenue', ascending=False)
    
    print("\n📈 Top 5 Accounts by Revenue:")
    for _, row in summary.head().iterrows():
        print(f"   {row['Account']}: ${row['Total Revenue']:,.0f} ({int(row['Orders'])} orders)")
    
    return output_file

if __name__ == "__main__":
    generate_sample_data()