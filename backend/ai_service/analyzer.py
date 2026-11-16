"""
CivicSync AI Service - Challenge Analyzer
Provides structured analysis of societal challenges.
Supports a local deterministic/heuristic engine that works completely offline with zero API keys,
as well as a pluggable provider-independent interface for LLMs.
"""

import re
from typing import Dict, Any, List

KEYWORD_MAP = {
    'water': ['groundwater', 'drinking water', 'pipeline', 'contamination', 'drainage', 'sewage', 'scarcity', 'tanker'],
    'waste': ['garbage', 'plastic', 'landfill', 'littering', 'recycling', 'dumping', 'sanitation', 'compost'],
    'traffic': ['congestion', 'potholes', 'signals', 'road safety', 'accidents', 'parking', 'bus route', 'junction'],
    'air': ['smog', 'pollution', 'dust', 'industrial emissions', 'air quality', 'aqi', 'stubble', 'vehicle emissions'],
    'health': ['clinic', 'hospital', 'doctor', 'vaccination', 'ambulance', 'medicines', 'dengue', 'malaria'],
    'accessibility': ['wheelchair', 'ramp', 'braille', 'tactile', 'disabled', 'elderly', 'footpath', 'pedestrian'],
    'infrastructure': ['streetlight', 'bridge', 'pavement', 'power outage', 'storm drain', 'public park', 'broken pipe'],
    'energy': ['solar', 'power cut', 'electricity', 'transformer', 'renewable', 'energy efficiency']
}

STAKEHOLDER_MAP = {
    'water': ['Municipal Water Supply Board', 'Local Residents Welfare Association', 'Public Health Department', 'Groundwater Authority'],
    'waste': ['Solid Waste Management Division', 'Pollution Control Board', 'Commercial Vendors Union', 'Green NGOs'],
    'traffic': ['City Traffic Police', 'Department of Transportation', 'Municipal Corporation Roads Wing', 'Commuters Guild'],
    'air': ['State Pollution Control Board', 'Ministry of Environment', 'Urban Planning Board', 'Public Transit Authority'],
    'health': ['District Health Mission', 'Primary Health Centre Staff', 'Municipal Sanitation Officers'],
    'accessibility': ['Department of Empowerment of Persons with Disabilities', 'Urban Development Authority', 'Public Works Department (PWD)'],
    'infrastructure': ['Public Works Department (PWD)', 'Electricity Supply Board (DISCOM)', 'Municipal Ward Councillor'],
    'energy': ['Renewable Energy Development Agency', 'Power Distribution Corporation', 'Consumer Energy Forum']
}

INDICATOR_MAP = {
    'water': ['Reduction in household water tanker dependency (%)', 'Groundwater table level increase (meters)', 'Water potability index compliance'],
    'waste': ['Segregation compliance rate (%)', 'Daily waste diversion from landfill (tonnes)', 'Zero-dumping inspection reports'],
    'traffic': ['Peak-hour transit delay reduction (minutes)', 'Intersection collision reduction rate (%)', 'Pedestrian sidewalk satisfaction score'],
    'air': ['Average PM2.5 and PM10 level reduction (µg/m³)', 'Compliant air quality days per month', 'Public complaint resolution rate'],
    'health': ['Average wait time for primary treatment (minutes)', 'Essential medication stock availability (%)', 'Vaccination coverage percentage'],
    'accessibility': ['Universal accessibility audit compliance score', 'Barrier-free pedestrian corridor length (km)', 'Community accessibility rating'],
    'infrastructure': ['Repair completion turnaround time (days)', 'Operational streetlight uptime (%)', 'Citizen satisfaction index'],
    'energy': ['Rooftop solar energy generation (kWh)', 'Power outage frequency reduction (%)', 'Municipal grid energy savings']
}

def analyze_challenge(title: str, description: str, category_name: str = "", city: str = "") -> Dict[str, Any]:
    """
    Performs deterministic and heuristic extraction to produce structured civic challenge analysis.
    Works offline with no external dependencies or API keys.
    """
    text = f"{title} {description}".lower()
    
    # 1. Detect dominant theme
    detected_theme = 'infrastructure'
    highest_score = 0
    for theme, keywords in KEYWORD_MAP.items():
        score = sum(1 for kw in keywords if kw in text)
        if category_name and theme in category_name.lower():
            score += 3
        if score > highest_score:
            highest_score = score
            detected_theme = theme

    # 2. Extract keywords present in text
    found_keywords = []
    for keywords in KEYWORD_MAP.values():
        for kw in keywords:
            if kw in text and kw not in found_keywords:
                found_keywords.append(kw.title())
    if not found_keywords:
        words = [w.strip(".,;:?!") for w in title.split() if len(w) > 4]
        found_keywords = list(dict.fromkeys(words))[:5]
    else:
        found_keywords = found_keywords[:6]

    # 3. Priority suggestion
    high_urgency_words = ['urgent', 'emergency', 'danger', 'hazard', 'critical', 'hospital', 'accident', 'toxic', 'broken', 'contamination']
    if any(w in text for w in high_urgency_words):
        suggested_priority = 'High'
    else:
        suggested_priority = 'Medium'

    # 4. Generate summary
    clean_desc = re.sub(r'\s+', ' ', description).strip()
    sentences = re.split(r'(?<=[.!?]) +', clean_desc)
    if len(sentences) > 0 and len(sentences[0]) > 25:
        summary_core = sentences[0]
        if len(sentences) > 1 and len(summary_core) < 100:
            summary_core += " " + sentences[1]
    else:
        summary_core = clean_desc[:140] + ("..." if len(clean_desc) > 140 else "")

    summary = f"Reported issue in {city or 'the community'}: {summary_core}"

    # 5. Suggested category title
    category_titles = {
        'water': 'Water Scarcity & Sanitation',
        'waste': 'Waste Management & Circular Economy',
        'traffic': 'Urban Mobility & Road Safety',
        'air': 'Air Quality & Environment',
        'health': 'Community Healthcare Access',
        'accessibility': 'Accessibility & Universal Inclusion',
        'infrastructure': 'Public Infrastructure & Maintenance',
        'energy': 'Clean Energy & Power Grids'
    }
    suggested_category = category_titles.get(detected_theme, 'Public Infrastructure')

    # 6. Outcomes and Stakeholders
    stakeholders = STAKEHOLDER_MAP.get(detected_theme, STAKEHOLDER_MAP['infrastructure'])
    indicators = INDICATOR_MAP.get(detected_theme, INDICATOR_MAP['infrastructure'])
    
    main_problem = f"Citizen-identified systemic issue regarding {detected_theme} affecting everyday public welfare and safety."
    suggested_outcomes = (
        f"Collaborative intervention involving academic research, local civic authorities, "
        f"and structured monitoring to implement a sustainable, long-term solution for {city or 'affected residents'}."
    )

    return {
        "summary": summary,
        "suggested_category": suggested_category,
        "extracted_location": city or "Local Community Area",
        "main_problem": main_problem,
        "suggested_outcomes": suggested_outcomes,
        "suggested_priority": suggested_priority,
        "keywords": found_keywords,
        "possible_stakeholders": stakeholders,
        "measurable_indicators": indicators,
        "model_source": "CivicSync Advisory AI Engine v1.0 (Local Heuristic Pipeline)",
    }
