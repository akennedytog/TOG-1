#!/usr/bin/env python3
"""
Flight Search Tool v2 - Using SerpAPI/Google Flights API
Fallback: Direct airline website scraping
"""

import argparse
import json
import os
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import urllib.request
import urllib.parse


class FlightSearcherV2:
    """Flight search without browser automation"""
    
    def __init__(self):
        self.serpapi_key = os.getenv("SERPAPI_KEY")
    
    def search_serpapi(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        travel_class: str = "business"
    ) -> List[Dict]:
        """Search using SerpAPI (Google Flights)"""
        if not self.serpapi_key:
            print("⚠️  SERPAPI_KEY not set. Set it to use SerpAPI.")
            return []
        
        # Build SerpAPI URL
        base_url = "https://serpapi.com/search"
        params = {
            "engine": "google_flights",
            "departure_id": origin,
            "arrival_id": destination,
            "outbound_date": departure_date,
            "travel_class": travel_class.lower(),
            "api_key": self.serpapi_key,
            "currency": "USD",
            "hl": "en",
            "gl": "us"
        }
        
        if return_date:
            params["return_date"] = return_date
        
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        
        try:
            print(f"Searching SerpAPI for flights...")
            with urllib.request.urlopen(url, timeout=30) as response:
                data = json.loads(response.read().decode())
                
                flights = []
                for result in data.get("best_flights", [])[:5]:
                    flights.append({
                        "airline": result.get("airline", "Unknown"),
                        "price": f"${result.get('price', 'N/A')}",
                        "duration": result.get("duration", "N/A"),
                        "stops": f"{result.get('layovers', 0)} stop(s)",
                        "source": "SerpAPI"
                    })
                return flights
        except Exception as e:
            print(f"SerpAPI error: {e}")
            return []
    
    def search_skycanner_redirect(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        travel_class: int = 3
    ) -> List[Dict]:
        """Generate Skyscanner search URL (user opens manually)"""
        # Skyscanner search URL format
        dep = datetime.strptime(departure_date, "%Y-%m-%d").strftime("%y%m%d")
        
        if return_date:
            ret = datetime.strptime(return_date, "%Y-%m-%d").strftime("%y%m%d")
            url = f"https://www.skyscanner.com/transport/flights/{origin.lower()}/{destination.lower()}/{dep}/{ret}/?adults=1&adultsv2=1&cabinclass={travel_class}&children=0&childrenv2=&inboundalts=enabled&ref=home&outboundalts=enabled&oym={dep[:4]}&iym={ret[:4]}&rtn=1"
        else:
            url = f"https://www.skyscanner.com/transport/flights/{origin.lower()}/{destination.lower()}/{dep}/?adults=1&adultsv2=1&cabinclass={travel_class}&children=0&childrenv2=&outboundalts=enabled&ref=home&rtn=0"
        
        return [{"url": url, "source": "Skyscanner", "type": "redirect"}]
    
    def search_google_flights_redirect(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None
    ) -> List[Dict]:
        """Generate Google Flights search URL"""
        dep = datetime.strptime(departure_date, "%Y-%m-%d").strftime("%Y-%m-%d")
        
        if return_date:
            ret = datetime.strptime(return_date, "%Y-%m-%d").strftime("%Y-%m-%d")
            url = f"https://www.google.com/travel/flights?q=Flights%20from%20{origin}%20to%20{destination}%20on%20{dep}%20-%20{return_date}%20business%20class"
        else:
            url = f"https://www.google.com/travel/flights?q=Flights%20from%20{origin}%20to%20{destination}%20on%20{dep}%20business%20class"
        
        return [{"url": url, "source": "Google Flights", "type": "redirect"}]
    
    def search_tap_air_portugal(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None
    ) -> List[Dict]:
        """TAP Air Portugal - often cheapest to Lisbon"""
        dep = datetime.strptime(departure_date, "%Y-%m-%d").strftime("%d/%m/%Y")
        
        if return_date:
            ret = datetime.strptime(return_date, "%Y-%m-%d").strftime("%d/%m/%Y")
            url = f"https://www.flytap.com/en-us/booking/flights?origin={origin}&destination={destination}&outboundDate={dep}&inboundDate={ret}&adults=1&children=0&infants=0&promoCode=&outboundFlightClass=Business"
        else:
            url = f"https://www.flytap.com/en-us/booking/flights?origin={origin}&destination={destination}&outboundDate={dep}&adults=1&children=0&infants=0&promoCode=&outboundFlightClass=Business"
        
        return [{"url": url, "source": "TAP Air Portugal", "type": "redirect"}]
    
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
        """Search across date range - generate comparison links"""
        print(f"\n{'='*70}")
        print(f"FLIGHT SEARCH: {origin} → {destination}")
        print(f"Business Class | {start_date} to {end_date} → {return_start} to {return_end}")
        print(f"{'='*70}\n")
        
        # Try SerpAPI first
        results = []
        if self.serpapi_key:
            print("🔍 Checking SerpAPI...")
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            
            # Check a few sample dates
            current = start
            while current <= end:
                dep_str = current.strftime("%Y-%m-%d")
                
                # Try mid-range return
                ret = datetime.strptime(return_start, "%Y-%m-%d")
                ret_str = ret.strftime("%Y-%m-%d")
                
                serp_results = self.search_serpapi(
                    origin, destination, dep_str, ret_str, travel_class
                )
                if serp_results:
                    for r in serp_results:
                        r["outbound_date"] = dep_str
                        r["return_date"] = ret_str
                    results.extend(serp_results)
                
                current += timedelta(days=2)
        
        # Generate comparison links
        print("\n📎 Direct Booking Links:")
        print("-" * 70)
        
        # Google Flights (best overall comparison)
        mid_outbound = datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=2)
        mid_return = datetime.strptime(return_start, "%Y-%m-%d") + timedelta(days=2)
        gf_url = self.search_google_flights_redirect(
            origin, destination,
            mid_outbound.strftime("%Y-%m-%d"),
            mid_return.strftime("%Y-%m-%d")
        )[0]["url"]
        
        print(f"\n1. Google Flights (Best for comparison):")
        print(f"   {gf_url}")
        
        # Skyscanner
        sky_url = self.search_skycanner_redirect(
            origin, destination,
            mid_outbound.strftime("%Y-%m-%d"),
            mid_return.strftime("%Y-%m-%d")
        )[0]["url"]
        print(f"\n2. Skyscanner:")
        print(f"   {sky_url}")
        
        # Direct airlines
        if destination.upper() in ["LIS", "LISBON"]:
            tap_url = self.search_tap_air_portugal(
                origin, destination,
                mid_outbound.strftime("%Y-%m-%d"),
                mid_return.strftime("%Y-%m-%d")
            )[0]["url"]
            print(f"\n3. TAP Air Portugal (often cheapest to Lisbon):")
            print(f"   {tap_url}")
        
        if destination.upper() in ["MAD", "MADRID"]:
            print(f"\n3. Iberia (direct to Madrid):")
            print(f"   https://www.iberia.com")
        
        print(f"\n{'='*70}")
        print("💡 Tips:")
        print("   - Book directly with airline for better customer service")
        print("   - Use Google Flights to compare, then book direct")
        print("   - Business class often cheaper 6-8 weeks in advance")
        print("   - Consider positioning flights from FLL or PBI")
        print(f"{'='*70}\n")
        
        return {
            "search_params": {
                "origin": origin,
                "destination": destination,
                "outbound_range": f"{start_date} to {end_date}",
                "return_range": f"{return_start} to {return_end}",
                "class": travel_class
            },
            "serpapi_results": results,
            "google_flights_url": gf_url,
            "skyscanner_url": sky_url,
            "note": "Open links in browser to see live prices"
        }


def main():
    parser = argparse.ArgumentParser(description="Flight Search Tool v2")
    parser.add_argument("--origin", default="MIA", help="Origin airport")
    parser.add_argument("--destination", required=True, help="Destination airport")
    parser.add_argument("--depart", help="Departure date (YYYY-MM-DD)")
    parser.add_argument("--return", dest="return_date", help="Return date (YYYY-MM-DD)")
    parser.add_argument("--depart-range", help="Departure range: start,end")
    parser.add_argument("--return-range", help="Return range: start,end")
    parser.add_argument("--class", dest="travel_class", default="business",
                       choices=["economy", "premium", "business", "first"])
    parser.add_argument("--output", "-o", help="Save results to JSON")
    
    args = parser.parse_args()
    
    searcher = FlightSearcherV2()
    
    # Determine search mode
    if args.depart_range and args.return_range:
        dep_start, dep_end = args.depart_range.split(",")
        ret_start, ret_end = args.return_range.split(",")
        
        results = searcher.search_date_range(
            args.origin, args.destination,
            dep_start.strip(), dep_end.strip(),
            ret_start.strip(), ret_end.strip(),
            args.travel_class
        )
    else:
        print("Use --depart-range and --return-range for best results")
        return
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to: {args.output}")


if __name__ == "__main__":
    main()
