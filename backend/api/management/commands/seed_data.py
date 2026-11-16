from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import (
    UserRole, CitizenProfile, UniversityProfile, Department,
    IndustryPartnerProfile, Expertise, ChallengeCategory,
    Challenge, ChallengeStatus, ChallengeSeverity, ChallengeAnalysis,
    SolutionProposal, ProposalStatus, ProjectMilestone, ProgressUpdate,
    Comment, ActivityLog
)
from ai_service.analyzer import analyze_challenge

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic, high-quality demonstration data for CivicSync.'

    def handle(self, *args, **options):
        self.stdout.write("Starting CivicSync database seeding...")

        # 1. Create Categories
        categories_data = [
            ("Water & Sanitation", "water-sanitation", "Groundwater depletion, drinking water quality, sewage systems, and urban drainage.", "Droplets", 1),
            ("Waste Management", "waste-management", "Plastic pollution, municipal solid waste segregation, landfill mitigation, and circular economy.", "Trash2", 2),
            ("Urban Mobility & Traffic", "urban-mobility", "Traffic congestion, intersection safety, pedestrian pathways, and public transit connectivity.", "Car", 3),
            ("Public Infrastructure", "public-infrastructure", "Street lighting, roads, bridges, public spaces, and storm drains.", "Building2", 4),
            ("Air Quality & Environment", "air-environment", "Urban smog, dust mitigation, vehicular emissions, and community greenery.", "Wind", 5),
            ("Accessibility & Inclusion", "accessibility-inclusion", "Barrier-free access for persons with disabilities, tactile paving, and ramps in public transit.", "Accessibility", 6),
            ("Community Health", "community-health", "Primary healthcare access, vector-borne disease control, and sanitation hygiene.", "HeartPulse", 7),
            ("Clean & Sustainable Energy", "clean-energy", "Rooftop solar, energy microgrids, public power efficiency, and community storage.", "Zap", 8),
        ]

        category_objs = {}
        for name, slug, desc, icon, order in categories_data:
            cat, _ = ChallengeCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc, 'icon': icon, 'order': order}
            )
            category_objs[slug] = cat

        self.stdout.write("Created categories.")

        # 2. Create Users
        # Admin
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@civicsync.org',
                'role': UserRole.ADMIN,
                'organization_name': 'CivicSync Platform Administration',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        # Citizens
        citizen1, _ = User.objects.get_or_create(
            username='arun_kumar',
            defaults={
                'email': 'arun.kumar@gmail.com',
                'role': UserRole.CITIZEN,
                'organization_name': 'Whitefield Residents Welfare Association',
                'bio': 'Civic activist advocating for rainwater harvesting and sustainable mobility.'
            }
        )
        citizen1.set_password('citizen123')
        citizen1.save()
        CitizenProfile.objects.get_or_create(user=citizen1, defaults={'city': 'Bengaluru', 'state': 'Karnataka', 'reputation_score': 35})

        citizen2, _ = User.objects.get_or_create(
            username='priya_sharma',
            defaults={
                'email': 'priya.sharma@outlook.com',
                'role': UserRole.CITIZEN,
                'organization_name': 'Adyar Green Action Forum',
                'bio': 'Passionate about coastal waste management and zero-plastic initiatives.'
            }
        )
        citizen2.set_password('citizen123')
        citizen2.save()
        CitizenProfile.objects.get_or_create(user=citizen2, defaults={'city': 'Chennai', 'state': 'Tamil Nadu', 'reputation_score': 28})

        citizen3, _ = User.objects.get_or_create(
            username='rahul_verma',
            defaults={
                'email': 'rahul.verma@gmail.com',
                'role': UserRole.CITIZEN,
                'organization_name': 'Andheri Urban Collective',
                'bio': 'Urban commuter working towards accessible footpaths and road safety.'
            }
        )
        citizen3.set_password('citizen123')
        citizen3.save()
        CitizenProfile.objects.get_or_create(user=citizen3, defaults={'city': 'Mumbai', 'state': 'Maharashtra', 'reputation_score': 19})

        # Universities
        uni1_user, _ = User.objects.get_or_create(
            username='iit_madras',
            defaults={
                'email': 'research@iitm.ac.in',
                'role': UserRole.UNIVERSITY,
                'organization_name': 'Indian Institute of Technology Madras'
            }
        )
        uni1_user.set_password('uni123')
        uni1_user.save()
        uni1_profile, _ = UniversityProfile.objects.get_or_create(
            user=uni1_user,
            defaults={
                'institution_name': 'IIT Madras - Centre for Urban Technology',
                'campus_location': 'Chennai, Tamil Nadu',
                'website': 'https://www.iitm.ac.in',
                'accreditation': 'NIRF #1 Overall & Engineering',
                'contact_email': 'urban-tech@iitm.ac.in'
            }
        )

        uni2_user, _ = User.objects.get_or_create(
            username='rv_college',
            defaults={
                'email': 'innovations@rvce.edu.in',
                'role': UserRole.UNIVERSITY,
                'organization_name': 'RV College of Engineering'
            }
        )
        uni2_user.set_password('uni123')
        uni2_user.save()
        uni2_profile, _ = UniversityProfile.objects.get_or_create(
            user=uni2_user,
            defaults={
                'institution_name': 'RV College of Engineering - Smart Mobility Lab',
                'campus_location': 'Bengaluru, Karnataka',
                'website': 'https://www.rvce.edu.in',
                'accreditation': 'NAAC A+ / Autonomous',
                'contact_email': 'smartmobility@rvce.edu.in'
            }
        )

        # Industry Partners
        ind1_user, _ = User.objects.get_or_create(
            username='cleantech_labs',
            defaults={
                'email': 'partnerships@cleantechlabs.com',
                'role': UserRole.INDUSTRY,
                'organization_name': 'CleanTech Innovations India'
            }
        )
        ind1_user.set_password('ind123')
        ind1_user.save()
        IndustryPartnerProfile.objects.get_or_create(
            user=ind1_user,
            defaults={
                'company_name': 'CleanTech Innovations India Pvt Ltd',
                'industry_sector': 'Environmental Technology & Circular Economy',
                'website': 'https://cleantechlabs.example.com',
                'csr_focus_areas': 'Water conservation, decentralized waste management, solar microgrids',
                'mentorship_available': True,
                'funding_available': True
            }
        )

        self.stdout.write("Created demo users and profiles.")

        # 3. Create Departments and Expertises
        dept1, _ = Department.objects.get_or_create(
            university=uni1_profile,
            name='Department of Civil & Environmental Engineering',
            defaults={'head_of_department': 'Prof. K. Sundararajan', 'description': 'Specialized in hydro-geology, wastewater treatment, and stormwater modelling.'}
        )
        dept2, _ = Department.objects.get_or_create(
            university=uni1_profile,
            name='Department of Computer Science & AI',
            defaults={'head_of_department': 'Prof. A. Meenakshi', 'description': 'Pioneering IoT edge sensing, computer vision for public safety, and sensor grids.'}
        )
        dept3, _ = Department.objects.get_or_create(
            university=uni2_profile,
            name='Department of Transportation & Mobility Systems',
            defaults={'head_of_department': 'Dr. Suresh V.', 'description': 'Focused on traffic flow simulation, adaptive traffic lights, and public bus prioritization.'}
        )

        exp_tags = [
            "Water Purification", "Groundwater Recharge", "Stormwater Modeling",
            "Waste Segregation", "Plastic Recycling", "Traffic Flow Simulation",
            "IoT Sensor Grids", "Air Quality Monitoring", "Universal Accessibility", "Rooftop Solar Integration"
        ]
        for tag in exp_tags:
            exp, _ = Expertise.objects.get_or_create(name=tag)
            if tag in ["Water Purification", "Groundwater Recharge", "Stormwater Modeling"]:
                exp.departments.add(dept1)
            elif tag in ["IoT Sensor Grids", "Air Quality Monitoring"]:
                exp.departments.add(dept2)
            elif tag in ["Traffic Flow Simulation", "Universal Accessibility"]:
                exp.departments.add(dept3)

        self.stdout.write("Created departments and expertise tags.")

        # 4. Realistic Societal Challenges
        challenges_data = [
            {
                "title": "Severe Groundwater Depletion and Contamination in Borewells across Varthur Ward",
                "description": "Residents and educational institutions across Varthur and Kadugodi are experiencing deep borewell failure at 1200+ feet depth. The residual water extracted tests high for fluorides and total dissolved solids (TDS > 1800 ppm). Tanker dependency has risen by 400% over the last dry season, posing health and financial stress on middle and lower-income clusters.",
                "category": category_objs['water-sanitation'],
                "city": "Bengaluru",
                "location": "Varthur, East Bengaluru (Ward 149)",
                "affected": "Over 45,000 residents across 14 residential apartment communities and 3 municipal schools",
                "severity": ChallengeSeverity.CRITICAL,
                "outcome": "Installation of community-scale percolation pits, injection wells for aquifer recharge, and automated testing sensors to monitor potable water levels.",
                "status": ChallengeStatus.IN_PROGRESS,
                "reporter": citizen1
            },
            {
                "title": "Unsegregated Plastic Debris Clogging Adyar Estuary and Stormwater Outlets",
                "description": "Single-use plastic waste and unsegregated commercial refuse are accumulating along the Adyar river basin and coastal creeks. During pre-monsoon showers, this debris blocks key culverts and back-flows into residential storm drains, causing localized inundation and microplastic pollution affecting coastal marine life.",
                "category": category_objs['waste-management'],
                "city": "Chennai",
                "location": "Adyar Estuary & Kotturpuram Canal Bridge",
                "affected": "Coastal fishermen settlements, adjoining neighbourhoods of Adyar and Besant Nagar",
                "severity": ChallengeSeverity.HIGH,
                "outcome": "Deployable floating debris capture booms, decentralized plastic shredding kiosks, and community incentive schemes for segregated drop-offs.",
                "status": ChallengeStatus.VERIFIED,
                "reporter": citizen2
            },
            {
                "title": "Chronic Bottleneck and Pedestrian Risk at Silk Board - HSR Layout Junction",
                "description": "Severe traffic gridlock during peak hours at the junction causes commuters up to 55 minutes to navigate a 1.2 km corridor. Pedestrians, especially senior citizens and persons with disabilities, have no safe grade-separated crossings or continuous sidewalks, resulting in frequent near-miss collisions with two-wheelers mounting kerbs.",
                "category": category_objs['urban-mobility'],
                "city": "Bengaluru",
                "location": "Central Silk Board Junction, Outer Ring Road",
                "affected": "120,000+ daily commuters, local tech park workforce, and local HSR sector residents",
                "severity": ChallengeSeverity.HIGH,
                "outcome": "Simulated dynamic signal phasing, tactile pedestrian skywalk integration, and synchronized bus feeder bays.",
                "status": ChallengeStatus.VERIFIED,
                "reporter": citizen1
            },
            {
                "title": "Winter Particulate Matter Spikes (PM2.5 > 380) Near Industrial Cluster Corridors",
                "description": "Unpaved road shoulders combined with unmonitored stone crushing and diesel freight transit create persistent dust bowls. Primary health centres report a 35% surge in pediatric respiratory conditions during November to February.",
                "category": category_objs['air-environment'],
                "city": "Delhi NCR",
                "location": "Okhla Phase II and surrounding residential periphery",
                "affected": "25,000 residents including 4,000 school children in government primary schools",
                "severity": ChallengeSeverity.CRITICAL,
                "outcome": "Deployment of hyper-local low-cost optical air quality sensor grids, automated misting nozzles on key arterial roads, and green dust mitigation barriers.",
                "status": ChallengeStatus.VERIFIED,
                "reporter": citizen3
            },
            {
                "title": "Inaccessible Railway Station Footbridges and Kerbs for Wheelchair Users",
                "description": "The suburban railway station foot-overbridges have steep 1:4 slopes with no tactile guidance lines or working elevators. Wheelchair users and blind commuters are forced to cross active tracks or depend on paid porters, posing grave physical danger daily.",
                "category": category_objs['accessibility-inclusion'],
                "city": "Mumbai",
                "location": "Kurla Suburban Rail Station and West Footbridge",
                "affected": "Estimated 8,500 daily commuters with physical, visual, or mobility disabilities",
                "severity": ChallengeSeverity.HIGH,
                "outcome": "Implementation of 1:12 standardized ramps, tactile paving paths connected to ticket counters, and auditory station navigational aids.",
                "status": ChallengeStatus.IN_PROGRESS,
                "reporter": citizen3
            },
            {
                "title": "Frequent Low-Voltage Fluctuation and Transformer Failures in Rural Health Centers",
                "description": "Unscheduled load shedding and extreme voltage dips (under 160V) repeatedly shut down cold-chain vaccine storage refrigerators and neonatal warmers in three sub-district health centres, jeopardizing essential immunization drives.",
                "category": category_objs['clean-energy'],
                "city": "Hyderabad Periphery",
                "location": "Moinabad & Chevella Primary Health Centres",
                "affected": "18 surrounding rural villages reliant on these centres for primary emergency care",
                "severity": ChallengeSeverity.CRITICAL,
                "outcome": "Installation of 10kW hybrid solar microgrid with lithium-iron-phosphate battery backup dedicated to clinical refrigeration and basic diagnostic labs.",
                "status": ChallengeStatus.RESOLVED,
                "reporter": citizen1
            },
            {
                "title": "Broken Stormwater Drainage Slabs Causing Severe Fall Hazards in Dense Market Street",
                "description": "Reinforced concrete drainage cover slabs along Market Main Street have caved in at 11 separate spots. During evening markets when pedestrian footfall exceeds 5,000 people per hour, these open trenches filled with stagnant wastewater represent an imminent safety hazard.",
                "category": category_objs['public-infrastructure'],
                "city": "Pune",
                "location": "Tulshibaug and Mandai Market Corridor",
                "affected": "Local street vendors, shoppers, and surrounding shopkeepers",
                "severity": ChallengeSeverity.MEDIUM,
                "outcome": "Replacement of damaged slabs with modular composite fiber gratings that allow easy silt cleaning while supporting heavy pedestrian loads.",
                "status": ChallengeStatus.PENDING,
                "reporter": citizen3
            },
            {
                "title": "Seasonal Dengue Outbreak Correlated with Open Storm Drain Stagnation",
                "description": "Stagnant stormwater channels spanning 2.5 kilometers through residential blocks act as breeding grounds for Aedes mosquitoes. Over 80 confirmed cases of dengue have been recorded in the past two months within a 500-meter radius.",
                "category": category_objs['community-health'],
                "city": "Coimbatore",
                "location": "R.S. Puram Ward 22",
                "affected": "Approx. 12,000 residents across 6 residential colonies",
                "severity": ChallengeSeverity.HIGH,
                "outcome": "Continuous natural bio-larvicide spraying, drain regrading to prevent pooling, and citizen-led larvicide monitoring via smartphone reporting.",
                "status": ChallengeStatus.PENDING,
                "reporter": citizen2
            },
            {
                "title": "Excessive Commercial Construction Dust Blanketing Residential Corridors",
                "description": "Continuous demolition and construction on 5 multi-storey commercial towers without mandatory green mesh dust barriers or wheel-washing stations has coated houses, solar panels, and trees in fine silica dust for six straight months.",
                "category": category_objs['air-environment'],
                "city": "Jaipur",
                "location": "Mansarovar Sector 9 Extension",
                "affected": "3,200 households and 2 nearby community hospitals",
                "severity": ChallengeSeverity.MEDIUM,
                "outcome": "Enforcement of dust control standards with IoT PM10 monitors connected to public alert dashboards.",
                "status": ChallengeStatus.VERIFIED,
                "reporter": citizen1
            },
            {
                "title": "Absence of Rainwater Harvesting in Municipal Parks Resulting in Localised Flash Floods",
                "description": "Concrete hardscaping in community parks has reduced natural infiltration to under 5%. During cloudbursts, park runoff floods surrounding low-lying homes within 20 minutes.",
                "category": category_objs['water-sanitation'],
                "city": "Chennai",
                "location": "Nungambakkam Corporation Playground Area",
                "affected": "400 low-lying independent houses and ground-floor residential units",
                "severity": ChallengeSeverity.MEDIUM,
                "outcome": "Conversion of park perimeters into bioswales, rain gardens, and dry detention ponds for natural flood attenuation.",
                "status": ChallengeStatus.VERIFIED,
                "reporter": citizen2
            }
        ]

        created_challenges = []
        for ch_data in challenges_data:
            ch, created = Challenge.objects.get_or_create(
                title=ch_data["title"],
                defaults={
                    "description": ch_data["description"],
                    "category": ch_data["category"],
                    "city": ch_data["city"],
                    "location_description": ch_data["location"],
                    "affected_community": ch_data["affected"],
                    "estimated_severity": ch_data["severity"],
                    "desired_outcome": ch_data["outcome"],
                    "status": ch_data["status"],
                    "reported_by": ch_data["reporter"],
                    "views_count": 42
                }
            )
            created_challenges.append(ch)

            # Generate AI analysis
            if created or not hasattr(ch, 'ai_analysis'):
                analysis_dict = analyze_challenge(
                    title=ch.title,
                    description=ch.description,
                    category_name=ch.category.name if ch.category else "",
                    city=ch.city
                )
                ChallengeAnalysis.objects.get_or_create(
                    challenge=ch,
                    defaults={
                        'status': 'COMPLETED',
                        'summary': analysis_dict['summary'],
                        'suggested_category': analysis_dict['suggested_category'],
                        'extracted_location': analysis_dict['extracted_location'],
                        'main_problem': analysis_dict['main_problem'],
                        'suggested_outcomes': analysis_dict['suggested_outcomes'],
                        'suggested_priority': analysis_dict['suggested_priority'],
                        'keywords': analysis_dict['keywords'],
                        'possible_stakeholders': analysis_dict['possible_stakeholders'],
                        'measurable_indicators': analysis_dict['measurable_indicators'],
                        'model_source': 'CivicSync Advisory AI Engine v1.0 (Demo Mode)'
                    }
                )

        self.stdout.write(f"Created {len(created_challenges)} societal challenges with AI analysis.")

        # 5. Create Sample Solution Proposals & Milestones
        # Proposal 1 for Varthur Groundwater Challenge
        target_ch1 = created_challenges[0] # Varthur water challenge
        p1, _ = SolutionProposal.objects.get_or_create(
            challenge=target_ch1,
            proposed_by=uni1_user,
            defaults={
                'title': 'Decentralized Aquifer Recharge and Community Filtration Pilot',
                'problem_understanding': 'Rapid urbanisation has paved natural recharge lakes and over-extracted the deep fractured hard-rock aquifers beyond replenishing capacity. High fluoride concentration is leaching from deep granite formations.',
                'proposed_solution': 'Design and install 8 rapid recharge percolation shafts connected to rooftop rainwater systems of public buildings, coupled with low-cost bio-sand fluoride absorption filters.',
                'technical_approach': 'Geophysical electrical resistivity surveys to map fault fractures, hydro-geological modelling of recharge rates, followed by gravity-fed dual filtration chambers.',
                'expected_impact': 'Recharging 12 million litres of stormwater annually into shallow aquifers and reducing local fluoride levels below BIS 10500 standards (1.0 mg/L).',
                'estimated_duration': '4 months',
                'required_resources': 'Hydro-geological survey equipment, excavation assistance from municipal ward office, community participation for maintenance.',
                'success_indicators': 'Measured water table recovery (piezometer readings) and 95% compliance in monthly water potability tests.',
                'status': ProposalStatus.IN_PROGRESS,
                'admin_review_comments': 'Approved by CivicSync Review Panel. High relevance and technically sound implementation strategy.'
            }
        )

        # Milestones for Proposal 1
        m1, _ = ProjectMilestone.objects.get_or_create(
            proposal=p1,
            title='Hydrogeological Survey & Community Consultation',
            defaults={
                'description': 'Identified optimal recharge fracture locations across Varthur and formed the Citizen Water Watch Committee.',
                'is_completed': True,
                'completion_date': timezone.now().date(),
                'order': 1
            }
        )
        m2, _ = ProjectMilestone.objects.get_or_create(
            proposal=p1,
            title='Construction of Recharge Shafts & Bio-Sand Filters',
            defaults={
                'description': 'Civil construction of 4 percolation wells and modular absorption filtration chambers.',
                'is_completed': True,
                'completion_date': timezone.now().date(),
                'order': 2
            }
        )
        m3, _ = ProjectMilestone.objects.get_or_create(
            proposal=p1,
            title='IoT Sensor Calibration & Community Handover',
            defaults={
                'description': 'Deploy continuous water level transducers and hand over monitoring dashboards to ward officials.',
                'is_completed': False,
                'order': 3
            }
        )

        ProgressUpdate.objects.get_or_create(
            proposal=p1,
            author=uni1_user,
            title='Milestone 2 Achieved: 4 Injection Wells Commissioned Ahead of Monsoon',
            defaults={
                'content': 'We have successfully completed civil testing on the first 4 percolation shafts at Varthur Municipal School ground. Initial infiltration rate tests show 15,000 liters/hour recharge capacity during heavy cloudbursts.'
            }
        )

        # Comments
        Comment.objects.get_or_create(
            challenge=target_ch1,
            author=citizen1,
            defaults={'content': 'Great progress by the IIT Madras team! Our residents association is ready to support with ongoing maintenance.'}
        )
        Comment.objects.get_or_create(
            challenge=target_ch1,
            author=ind1_user,
            defaults={'content': 'CleanTech Innovations India is interested in sponsoring 4 additional sensor telemetry units for this project under our CSR program.'}
        )

        # Proposal 2 for Wheelchair Access Challenge
        target_ch2 = created_challenges[4] # Wheelchair access Kurla
        p2, _ = SolutionProposal.objects.get_or_create(
            challenge=target_ch2,
            proposed_by=uni2_user,
            defaults={
                'title': 'Modular Accessible Transit Ramp & Tactile Navigation System',
                'problem_understanding': 'Standard concrete modifications take months of railway approvals. Commuters with disabilities need immediate, modular, non-intrusive accessibility retrofits.',
                'proposed_solution': 'Pre-fabricated modular recycled-steel ramps with anti-skid polyurethane coating, paired with Bluetooth Low Energy (BLE) audio beacons for the visually impaired.',
                'technical_approach': 'Ergonomic 1:12 modular ramp assembly adhering to Harmonised Guidelines and Space Standards for Barrier Free Built Environment.',
                'expected_impact': 'Direct unassisted mobility for over 8,500 daily commuters across platforms 1 to 5.',
                'estimated_duration': '3 months',
                'required_resources': 'Modular ramp components, station master coordination, student volunteer testing.',
                'success_indicators': '100% compliance with access audit and 90%+ positive feedback from disabled commuters union.',
                'status': ProposalStatus.IN_PROGRESS,
                'admin_review_comments': 'Commendable modular approach reducing construction downtime.'
            }
        )
        ProjectMilestone.objects.get_or_create(
            proposal=p2,
            title='Universal Accessibility Audit & 3D Scanning',
            defaults={'description': 'Digital mapping of footbridges and platform heights.', 'is_completed': True, 'completion_date': timezone.now().date(), 'order': 1}
        )
        ProjectMilestone.objects.get_or_create(
            proposal=p2,
            title='Prototype Modular Ramp Assembly',
            defaults={'description': 'Fabrication and load testing of modular anti-skid ramp modules.', 'is_completed': False, 'order': 2}
        )

        self.stdout.write("Created solution proposals, milestones, updates, and comments.")

        # 6. Activity Logs
        ActivityLog.objects.create(
            user=citizen1,
            action_type='CHALLENGE_SUBMITTED',
            description='Reported: Severe Groundwater Depletion in Varthur Ward'
        )
        ActivityLog.objects.create(
            user=admin_user,
            action_type='CHALLENGE_VERIFIED',
            description='Admin verified challenge: Unsegregated Plastic Debris in Adyar Estuary'
        )
        ActivityLog.objects.create(
            user=uni1_user,
            action_type='PROPOSAL_SUBMITTED',
            description='IIT Madras submitted proposal for Varthur Groundwater Pilot'
        )

        self.stdout.write(self.style.SUCCESS("CivicSync demo database seeding successfully completed!"))
