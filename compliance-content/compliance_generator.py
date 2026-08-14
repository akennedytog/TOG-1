#!/usr/bin/env python3
"""
The One Group - Compliance Content Generator
AI + regulated industries content (HIPAA, SOC2, GDPR)
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

class ComplianceContentGenerator:
    """Generate compliance-focused content for regulated industries"""
    
    INDUSTRIES = {
        "healthcare": {
            "regulation": "HIPAA",
            "pain_points": [
                "Patient scheduling without exposing PHI",
                "Secure communication with patients",
                "Automated billing compliance",
                "Appointment reminders without privacy violations"
            ],
            "risks": ["$50K+ fines per violation", "Loss of patient trust", "State medical board sanctions"],
            "solutions": ["HIPAA-compliant AI scheduling", "Encrypted patient portals", "Automated compliance checks"]
        },
        "legal": {
            "regulation": "Attorney-Client Privilege + State Bar Rules",
            "pain_points": [
                "Client intake without exposing case details",
                "Secure document automation",
                "Conflict checking at scale",
                "Billing transparency requirements"
            ],
            "risks": ["Malpractice exposure", "Bar disciplinary action", "Client confidentiality breaches"],
            "solutions": ["Secure AI intake forms", "Automated conflict checking", "Client portal with audit trails"]
        },
        "accounting": {
            "regulation": "SOC2 + IRS Circular 230",
            "pain_points": [
                "Client data security in cloud tools",
                "Automated tax prep without errors",
                "Audit trail requirements",
                "Secure document exchange"
            ],
            "risks": ["PTIN suspension", "Client lawsuits", "IRS penalties"],
            "solutions": ["SOC2-compliant automation", "Automated audit trails", "Secure client portals"]
        },
        "financial_services": {
            "regulation": "FINRA + SEC",
            "pain_points": [
                "Communication monitoring",
                "Transaction documentation",
                "Client suitability checks",
                "Marketing compliance"
            ],
            "risks": ["FINRA fines", "SEC enforcement", "License revocation"],
            "solutions": ["AI-powered compliance monitoring", "Automated suitability checks", "Marketing review automation"]
        }
    }
    
    CONTENT_TEMPLATES = {
        "twitter_thread": {
            "hook": "🔒 Most {industry} firms are one mistake away from a ${fine} fine.\n\nHere's how AI keeps you compliant:\n\n🧵",
            "thread_item": "{number}/ {pain_point}\n\nAI Solution: {solution}\n\nResult: {benefit}",
            "cta": "Want a free compliance audit?\n\nDM me 'COMPLIANCE' and I'll send you our checklist."
        },
        "linkedin_article": {
            "title": "AI for {industry}: Compliance Doesn't Have to Be a Barrier",
            "intro": "I talk to {industry} professionals every week. The same concern comes up:\n\n'Can we actually use AI without getting fined?'",
            "section": "## {heading}\n\n{content}",
            "conclusion": "The firms embracing compliant AI now will dominate in 2 years.\n\nThe ones waiting? They'll spend that time catching up."
        },
        "checklist": {
            "title": "{regulation} Compliance Checklist for AI Tools",
            "items": [
                "☐ Data encryption at rest and in transit",
                "☐ Access controls and role-based permissions",
                "☐ Audit logging for all AI interactions",
                "☐ Business Associate Agreements (BAAs) signed",
                "☐ Regular security assessments",
                "☐ Employee training on AI usage",
                "☐ Incident response plan documented"
            ]
        },
        "case_study": {
            "title": "How {firm_type} Saved ${savings}/Year While Staying Compliant",
            "challenge": "{firm_type} was spending {hours} hours/week on {task}",
            "solution": "Implemented {solution} with built-in {regulation} compliance",
            "results": [
                "{time_saved} hours saved per week",
                "Zero compliance violations",
                "${roi} ROI in first year"
            ]
        }
    }
    
    def __init__(self):
        self.workspace = Path(os.path.expanduser("~/.openclaw/workspace"))
        self.output_dir = self.workspace / "compliance-content" / "generated"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_content_package(self, industry: str) -> Dict:
        """Generate a complete content package for an industry"""
        if industry not in self.INDUSTRIES:
            return {"error": f"Unknown industry: {industry}. Available: {list(self.INDUSTRIES.keys())}"}
            
        data = self.INDUSTRIES[industry]
        
        package = {
            "industry": industry,
            "regulation": data["regulation"],
            "generated_at": datetime.now().isoformat(),
            "content": {
                "twitter_thread": self._generate_twitter_thread(industry, data),
                "linkedin_article": self._generate_linkedin_article(industry, data),
                "compliance_checklist": self._generate_checklist(industry, data),
                "case_study_outline": self._generate_case_study_outline(industry, data)
            }
        }
        
        return package
    
    def _generate_twitter_thread(self, industry: str, data: Dict) -> str:
        """Generate Twitter thread content"""
        template = self.CONTENT_TEMPLATES["twitter_thread"]
        
        hook = template["hook"].format(
            industry=industry.title(),
            fine="50K+"
        )
        
        thread_items = []
        for i, (pain, solution) in enumerate(zip(data["pain_points"][:4], data["solutions"][:4]), 1):
            item = template["thread_item"].format(
                number=i,
                pain_point=pain,
                solution=solution,
                benefit="Compliance + Efficiency"
            )
            thread_items.append(item)
        
        thread = hook + "\n\n" + "\n\n---\n\n".join(thread_items) + "\n\n---\n\n" + template["cta"]
        
        return thread
    
    def _generate_linkedin_article(self, industry: str, data: Dict) -> str:
        """Generate LinkedIn article"""
        template = self.CONTENT_TEMPLATES["linkedin_article"]
        
        title = template["title"].format(industry=industry.title())
        intro = template["intro"].format(industry=industry.title())
        
        sections = []
        sections.append(template["section"].format(
            heading="The Real Risk",
            content=f"\n".join([f"• {risk}" for risk in data["risks"]])
        ))
        
        sections.append(template["section"].format(
            heading="The Smart Approach",
            content=f"\n".join([f"• {sol}" for sol in data["solutions"]])
        ))
        
        article = f"{title}\n\n{intro}\n\n" + "\n\n".join(sections) + f"\n\n{template['conclusion']}"
        
        return article
    
    def _generate_checklist(self, industry: str, data: Dict) -> str:
        """Generate compliance checklist"""
        template = self.CONTENT_TEMPLATES["checklist"]
        
        title = template["title"].format(regulation=data["regulation"])
        items = "\n".join(template["items"])
        
        return f"{title}\n\n{items}\n\n✅ Download the full checklist at theonegroup.info/compliance"
    
    def _generate_case_study_outline(self, industry: str, data: Dict) -> Dict:
        """Generate case study outline"""
        template = self.CONTENT_TEMPLATES["case_study"]
        
        return {
            "title": template["title"].format(
                firm_type=f"{industry.title()} Practice",
                savings="25K"
            ),
            "challenge": template["challenge"].format(
                firm_type=f"A 5-person {industry} firm",
                hours="15",
                task="manual data entry and compliance checks"
            ),
            "solution": template["solution"].format(
                solution=data["solutions"][0],
                regulation=data["regulation"]
            ),
            "results": [r.format(time_saved="12", roi="340%") for r in template["results"]]
        }
    
    def save_package(self, industry: str) -> str:
        """Save generated package to file"""
        package = self.generate_content_package(industry)
        
        timestamp = datetime.now().strftime("%Y%m%d")
        filename = f"{industry}_compliance_{timestamp}.json"
        filepath = self.output_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(package, f, indent=2)
            
        return str(filepath)
    
    def generate_all(self) -> List[str]:
        """Generate packages for all industries"""
        files = []
        for industry in self.INDUSTRIES.keys():
            filepath = self.save_package(industry)
            files.append(filepath)
            print(f"Generated: {filepath}")
        return files

if __name__ == "__main__":
    import sys
    
    generator = ComplianceContentGenerator()
    
    if len(sys.argv) > 1:
        industry = sys.argv[1].lower()
        if industry == "all":
            generator.generate_all()
        else:
            package = generator.generate_content_package(industry)
            print(json.dumps(package, indent=2))
            filepath = generator.save_package(industry)
            print(f"\nSaved to: {filepath}")
    else:
        print("Usage: python compliance_generator.py [industry|all]")
        print(f"Available industries: {', '.join(generator.INDUSTRIES.keys())}")
