#!/usr/bin/env python3
"""
Flight Search Tool - Main entry point
Supports: Google Flights (browser), Duffel API
"""

import argparse
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from google_flights_scraper import GoogleFlightsScraper


class FlightSearcher:
    """Main flight search interface"""
    
    def __init__(self):
        self.results = []
    
    def search_google_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        travel_class: str = "business",
        flexible: bool = False,
        direct_only: bool = False
    ) -> List[Dict]:
        """Search using Google Flights browser automation"""
        scraper = GoogleFlightsScraper(headless=True)
        try:
            results = scraper.search_flights(
                origin=origin,
                destination=destination,
                departure_date=departure_date,
                return_date=return_date,
                travel_class=travel_class,
                flexible_dates=flexible,
                direct_only=direct_only
            )
            return results
        finally:
            scraper.close()
    
    def search_date_range(
        self,
        origin: str,
        destination: str,
        start_date: str,
        end_date: str,
        return_start: str,
        return_end: str,
        travel_class: str = "business"
    ) -> Dict:
        """Search across a range of dates to find cheapest"""
        print(f"Searching {origin} → {destination}")
        print(f"Outbound: {start_date} to {end_date}")
        print(f"Return: {return_start} to {return_end}")
        
        all_results = []
        
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        ret_start = datetime.strptime(return_start, "%Y-%m-%d")
        ret_end = datetime.strptime(return_end, "%Y-%m-%d")
        
        # Sample dates (every 2 days to avoid rate limits)
        current = start
        while current <= end:
            dep_str = current.strftime("%Y-%m-%d")
            
            # Try a few return dates
            ret_current = max(ret_start, current + timedelta(days=7))
            while ret_current <= ret_end and ret_current <= current + timedelta(days=21):
                ret_str = ret_current.strftime("%Y-%m-%d")
                
                print(f"\\nChecking {dep_str} → {ret_str}...")
                results = self.search_google_flights(
                    origin, destination, dep_str, ret_str, travel_class
                )
                
                if results:
                    for r in results:
                        r["outbound_date"] = dep_str
                        r["return_date"] = ret_str
                    all_results.extend(results)
                
                ret_current += timedelta(days=2)
            
            current += timedelta(days=2)
        
        # Sort by price
        def extract_price(result):
            price_str = result.get("price", "")
            match = __import__('re').search(r'[\d,]+', price_str)
            if match:
                return int(match.group().replace(",", ""))
            return float('inf')
        
        all_results.sort(key=extract_price)
        
        return {
            "search_params": {
                "origin": origin,
                "destination": destination,
                "outbound_range": f"{start_date} to {end_date}",
                "return_range": f"{return_start} to {return_end}",
                "class": travel_class
            },
            "total_combinations_checked": len(all_results),
            "best_options": all_results[:10]
        }


def main():
    parser = argparse.ArgumentParser(description="Flight Search Tool")
    parser.add_argument("--origin", default="MIA", help="Origin airport")
    parser.add_argument("--destination", required=True, help="Destination airport")
    parser.add_argument("--depart", help="Departure date (YYYY-MM-DD)")
    parser.add_argument("--return", dest="return_date", help="Return date (YYYY-MM-DD)")
    parser.add_argument("--depart-range", help="Departure range: start,end (YYYY-MM-DD,YYYY-MM-DD)")
    parser.add_argument("--return-range", help="Return range: start,end (YYYY-MM-DD,YYYY-MM-DD)")
    parser.add_argument("--class", dest="travel_class", default="business",
                       choices=["economy", "premium", "business", "first"])
    parser.add_argument("--output", "-o", help="Save results to JSON file")
    parser.add_argument("--format", default="text", choices=["text", "json"],
                       help="Output format")
    
    args = parser.parse_args()
    
    searcher = FlightSearcher()
    
    # Determine search mode
    if args.depart_range and args.return_range:
        # Range search
        dep_start, dep_end = args.depart_range.split(",")
        ret_start, ret_end = args.return_range.split(",")
        
        results = searcher.search_date_range(
            args.origin,
            args.destination,
            dep_start.strip(),
            dep_end.strip(),
            ret_start.strip(),
            ret_end.strip(),
            args.travel_class
        )
        
    elif args.depart:
        # Single date search
        results = searcher.search_google_flights(
            args.origin,
            args.destination,
            args.depart,
            args.return_date,
            args.travel_class
        )
    else:
        print("Error: Specify --depart or --depart-range/--return-range")
        return
    
    # Output results
    if args.format == "json":
        print(json.dumps(results, indent=2))
    else:
        print("\\n" + "="*70)
        print("FLIGHT SEARCH RESULTS")
        print("="*70)
        
        if isinstance(results, dict) and "best_options" in results:
            # Range search results
            print(f"\\nSearch: {results['search_params']['origin']} → {results['search_params']['destination']}")
            print(f"Dates: {results['search_params']['outbound_range']} | {results['search_params']['return_range']}")
            print(f"Class: {results['search_params']['class']}")
            print(f"\\nTop {len(results['best_options'])} cheapest options:\\n")
            
            for i, opt in enumerate(results['best_options'], 1):
                print(f"{i}. {opt.get('airline', 'Unknown')}")
                print(f"   Price: {opt.get('price', 'N/A')}")
                print(f"   Outbound: {opt.get('outbound_date', 'N/A')}")
                print(f"   Return: {opt.get('return_date', 'N/A')}")
                print(f"   Duration: {opt.get('duration', 'N/A')} | Stops: {opt.get('stops', 'N/A')}")
                print()
        else:
            # Single search results
            for i, flight in enumerate(results, 1):
                print(f"{i}. {flight.get('airline', 'Unknown')}")
                print(f"   Price: {flight.get('price', 'N/A')}")
                print(f"   Duration: {flight.get('duration', 'N/A')}")
                print(f"   Stops: {flight.get('stops', 'N/A')}")
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\\nResults saved to: {args.output}")


if __name__ == "__main__":
    main()
