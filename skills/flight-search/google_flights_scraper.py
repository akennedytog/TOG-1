#!/usr/bin/env python3
"""
Google Flights Scraper using browser-use
Searches for flights and extracts pricing information
"""

import subprocess
import json
import re
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class GoogleFlightsScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.session_active = False
    
    def _run_browser(self, cmd: str) -> str:
        """Execute browser-use command and return output"""
        browser_flag = "--browser chromium" if self.headless else "--browser chromium --headed"
        full_cmd = f"browser-use {browser_flag} {cmd}"
        result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True)
        return result.stdout + result.stderr
    
    def build_google_flights_url(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        travel_class: str = "business",
        direct_only: bool = False
    ) -> str:
        """Build Google Flights search URL"""
        # Convert travel class
        class_map = {
            "economy": "1",
            "premium": "2", 
            "business": "3",
            "first": "4"
        }
        cabin_class = class_map.get(travel_class.lower(), "3")
        
        # Build URL
        base_url = "https://www.google.com/travel/flights"
        
        if return_date:
            # Round trip
            url = f"{base_url}?hl=en&gl=us&curr=USD"
            url += f"&tfs=CBwQAhooagwIAhIIL20vMDMyMGcSCjIwMjYtMDktMDhyDAgCEggvbS8wMXFmMCI6Cg0IAxIKL20vMDMyMGcaCjIwMjYtMDktMjZyDAgCEggvbS8wMXFmMCoCCAMwAUgC"
            url += f"&f=0&tfu=CnhDalJJTDIxdlpzQmlkV1Z6ZEdsdmJsUnZhMlZ1S0dobGVTaHRiMlI1S0dobGVTaHRiMlI1S0dobGVTaHRiMlI1S0dobGVTaHRiMlI1&tt=m&tc=1&sc=1"
        else:
            # One way
            url = f"{base_url}?hl=en&gl=us&curr=USD"
            url += f"&tfs=CBwQAhooagwIAhIIL20vMDMyMGcSCjIwMjYtMDktMDhyDAgCEggvbS8wMXFmMCoCCAMwAUgC"
        
        return url
    
    def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        travel_class: str = "business",
        flexible_dates: bool = False,
        direct_only: bool = False
    ) -> List[Dict]:
        """
        Search Google Flights
        
        Args:
            origin: IATA code (e.g., "MIA")
            destination: IATA code (e.g., "MAD")
            departure_date: YYYY-MM-DD
            return_date: YYYY-MM-DD (optional)
            travel_class: economy, premium, business, first
            flexible_dates: search nearby dates
            direct_only: show only non-stop
        
        Returns:
            List of flight options with pricing
        """
        print(f"Searching Google Flights: {origin} → {destination}")
        print(f"Dates: {departure_date} - {return_date or 'One way'}")
        print(f"Class: {travel_class}")
        
        # Build search URL
        url = self.build_google_flights_url(
            origin, destination, departure_date, return_date,
            travel_class, direct_only
        )
        
        # Navigate to Google Flights
        output = self._run_browser(f'open "https://www.google.com/travel/flights?q=Flights%20from%20{origin}%20to%20{destination}"')
        time.sleep(2)
        
        # Get initial state
        state = self._run_browser("state")
        print("Page loaded. Analyzing...")
        
        # Try to extract flight data using JavaScript
        js_code = """
        (() => {
            const flights = [];
            const cards = document.querySelectorAll('[data-result-index]');
            cards.forEach((card, i) => {
                try {
                    const airline = card.querySelector('[aria-label*="airline"], img[alt]')?.alt || 'Unknown';
                    const price = card.textContent.match(/\\$[\\d,]+/)?.[0] || 'N/A';
                    const duration = card.textContent.match(/(\\d+h \\d+m|\\d+h)/)?.[0] || '';
                    const stops = card.textContent.includes('Non-stop') ? 'Non-stop' : 
                                  card.textContent.match(/(\\d+) stop/)?.[0] || 'Unknown';
                    flights.push({airline, price, duration, stops});
                } catch(e) {}
            });
            return JSON.stringify(flights.slice(0, 5));
        })()
        """
        
        result = self._run_browser(f'eval "{js_code}"')
        
        # Parse results
        flights = []
        try:
            # Extract JSON from output
            match = re.search(r'\[.*\]', result)
            if match:
                flights = json.loads(match.group())
        except Exception as e:
            print(f"Parse error: {e}")
            flights = [{"error": "Could not parse results", "raw": result[:500]}]
        
        return flights
    
    def close(self):
        """Close browser session"""
        self._run_browser("close --all")


def main():
    """CLI usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Search Google Flights")
    parser.add_argument("--origin", required=True, help="Origin airport (e.g., MIA)")
    parser.add_argument("--destination", required=True, help="Destination airport (e.g., MAD)")
    parser.add_argument("--depart", required=True, help="Departure date (YYYY-MM-DD)")
    parser.add_argument("--return", dest="return_date", help="Return date (YYYY-MM-DD)")
    parser.add_argument("--class", dest="travel_class", default="business", 
                       choices=["economy", "premium", "business", "first"])
    parser.add_argument("--flexible", action="store_true", help="Search flexible dates")
    parser.add_argument("--direct", action="store_true", help="Direct flights only")
    parser.add_argument("--headed", action="store_true", help="Show browser window")
    
    args = parser.parse_args()
    
    scraper = GoogleFlightsScraper(headless=not args.headed)
    
    try:
        results = scraper.search_flights(
            origin=args.origin,
            destination=args.destination,
            departure_date=args.depart,
            return_date=args.return_date,
            travel_class=args.travel_class,
            flexible_dates=args.flexible,
            direct_only=args.direct
        )
        
        print("\\n" + "="*60)
        print("SEARCH RESULTS")
        print("="*60)
        
        if results:
            for i, flight in enumerate(results, 1):
                print(f"\\n{i}. {flight.get('airline', 'Unknown Airline')}")
                print(f"   Price: {flight.get('price', 'N/A')}")
                print(f"   Duration: {flight.get('duration', 'N/A')}")
                print(f"   Stops: {flight.get('stops', 'N/A')}")
        else:
            print("No results found")
            
    finally:
        scraper.close()


if __name__ == "__main__":
    main()
