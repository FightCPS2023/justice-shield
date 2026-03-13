"""CourtListener routes - case law search, judges, law library"""
import uuid
import httpx
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query

from database import get_db
from auth import get_current_user
from config import COURTLISTENER_API_KEY, EMERGENT_LLM_KEY
from utils.credits import require_tier, check_ai_credits, increment_ai_credits, get_user_tier

router = APIRouter()

@router.get("/api/courtlistener/search")
async def search_court_opinions(
    q: str = Query(..., description="Search query"),
    court: Optional[str] = None,
    filed_after: Optional[str] = None,
    filed_before: Optional[str] = None,
    current_user: dict = Depends(require_tier("attorney"))
):
    """Search CourtListener for case law"""
    try:
        params = {
            "q": q,
            "type": "o",
            "order_by": "score desc",
            "format": "json"
        }
        
        if court:
            params["court"] = court
        if filed_after:
            params["filed_after"] = filed_after
        if filed_before:
            params["filed_before"] = filed_before
        
        headers = {"Accept": "application/json"}
        if COURTLISTENER_API_KEY:
            headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.courtlistener.com/api/rest/v4/search/",
                params=params,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                # Format results for frontend
                formatted_results = []
                for r in data.get("results", [])[:20]:
                    # Handle citation - it can be a list of strings
                    citation = r.get("citation", [])
                    if isinstance(citation, list) and len(citation) > 0:
                        citation_str = citation[0] if isinstance(citation[0], str) else str(citation[0])
                    else:
                        citation_str = str(citation) if citation else ""
                    
                    formatted_results.append({
                        "caseName": r.get("caseName", "Unknown Case"),
                        "citation": citation_str,
                        "court": r.get("court", r.get("court_id", "Unknown Court")),
                        "court_id": r.get("court_id", ""),
                        "dateFiled": r.get("dateFiled", "Unknown"),
                        "docketNumber": r.get("docketNumber", ""),
                        "snippet": r.get("syllabus", "") or r.get("posture", "") or f"Case: {r.get('caseName', '')}",
                        "absolute_url": f"https://www.courtlistener.com{r.get('absolute_url', '')}",
                        "judge": r.get("judge", ""),
                        "citeCount": r.get("citeCount", 0)
                    })
                return {
                    "count": data.get("count", 0),
                    "results": formatted_results,
                    "query": q
                }
            else:
                return {"error": f"CourtListener API returned {response.status_code}", "results": [], "count": 0}
    except Exception as e:
        return {"error": str(e), "results": [], "count": 0}

@router.get("/api/courtlistener/judges")
async def search_judges(
    name: str,
    current_user: dict = Depends(require_tier("attorney"))
):
    """Search CourtListener judge database"""
    try:
        params = {
            "name_full__icontains": name,
            "is_alias_of__isnull": "true",
            "format": "json"
        }
        
        headers = {"Accept": "application/json"}
        if COURTLISTENER_API_KEY:
            headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.courtlistener.com/api/rest/v4/people/",
                params=params,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "count": data.get("count", 0),
                    "results": data.get("results", [])[:20]
                }
            else:
                return {"error": f"API returned {response.status_code}", "results": []}
    except Exception as e:
        return {"error": str(e), "results": []}


# ============== LAW LIBRARY ==============

STATES_INFO = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming"
}

# Comprehensive pre-built state CPS law database - INSTANT LOADING
STATE_CPS_DATABASE = {
    "TX": {
        "agency": "Texas Department of Family and Protective Services (DFPS)",
        "statutes": "Texas Family Code, Chapters 261-266",
        "timeframes": {
            "Emergency Removal Hearing": "14 days (adversary hearing)",
            "Status Hearing": "60 days from temporary order",
            "Permanency Hearing": "12 months from removal",
            "Dismissal Deadline": "12 months (18 with extension)"
        },
        "key_statutes": [
            "§261.001 - Definitions of abuse and neglect",
            "§262.101 - Filing suit without prior investigation",
            "§262.102 - Emergency removal without court order",
            "§262.201 - Full adversary hearing requirements",
            "§263.401 - Dismissal date and extensions",
            "§161.001 - Grounds for TPR"
        ],
        "discovery": "Texas Rules of Civil Procedure; DFPS must produce case file within 30 days of motion",
        "key_cases": ["In re E.R., 385 S.W.3d 552 (Tex. 2012)", "In re J.F.C., 96 S.W.3d 256 (Tex. 2002)"],
        "constitution": "Texas Constitution Art. I, §19 - Due process"
    },
    "CA": {
        "agency": "California Department of Social Services (CDSS)",
        "statutes": "Welfare & Institutions Code §300-395",
        "timeframes": {
            "Detention Hearing": "48 hours (court days)",
            "Jurisdiction Hearing": "15 court days from detention",
            "Disposition Hearing": "10 court days from jurisdiction",
            "Review Hearing": "Every 6 months",
            "Permanency Hearing": "12 months from removal"
        },
        "key_statutes": [
            "WIC §300 - Definitions of dependent child",
            "WIC §306 - Emergency removal authority",
            "WIC §319 - Detention hearing procedures",
            "WIC §361 - Removal (clear and convincing)",
            "WIC §366.26 - TPR procedures"
        ],
        "discovery": "WIC §827; petition juvenile court for case access",
        "key_cases": ["In re Jasmon O. (1994) 8 Cal.4th 398", "In re Malinda S. (1990) 51 Cal.3d 368"],
        "constitution": "California Constitution Art. I, §7 - Due process"
    },
    "NY": {
        "agency": "Office of Children and Family Services (OCFS)",
        "statutes": "Family Court Act Article 10",
        "timeframes": {
            "Initial Hearing": "24 hours of removal",
            "Fact-Finding": "60 days from filing",
            "Disposition": "50 days from fact-finding",
            "Permanency Hearing": "12 months maximum"
        },
        "key_statutes": [
            "FCA §1012 - Definitions",
            "FCA §1024 - Emergency removal",
            "FCA §1028 - Return of child hearing",
            "FCA §1046 - Evidence rules",
            "FCA §1052 - Dispositional alternatives"
        ],
        "discovery": "FCA §1038; records available to respondent",
        "key_cases": ["Nicholson v. Scoppetta (2004)", "In re Marino S. (1993)"],
        "constitution": "NY Constitution Art. I, §6 - Due process"
    },
    "FL": {
        "agency": "Department of Children and Families (DCF)",
        "statutes": "Florida Statutes Chapter 39",
        "timeframes": {
            "Shelter Hearing": "24 hours",
            "Arraignment": "28 days",
            "Adjudication": "30 days of arraignment",
            "Disposition": "15 days of adjudication",
            "Judicial Review": "Every 6 months"
        },
        "key_statutes": [
            "§39.01 - Definitions",
            "§39.401 - Taking child into custody",
            "§39.402 - Shelter placement",
            "§39.521 - Disposition hearing",
            "§39.806 - TPR grounds"
        ],
        "discovery": "Florida Rules of Juvenile Procedure 8.245",
        "key_cases": ["Padgett v. Dept. of HRS (1991)", "In re D.A.D. (2006)"],
        "constitution": "Florida Constitution Art. I, §9 - Due process"
    },
    "IL": {
        "agency": "Department of Children and Family Services (DCFS)",
        "statutes": "705 ILCS 405 (Juvenile Court Act)",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudicatory Hearing": "90 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "705 ILCS 405/2-3 - Neglected/abused minor",
            "705 ILCS 405/2-10 - Temporary custody",
            "705 ILCS 405/2-21 - Adjudicatory hearing",
            "705 ILCS 405/2-28 - TPR"
        ],
        "discovery": "Illinois Supreme Court Rule 411",
        "key_cases": ["In re D.T. (2008)", "In re M.M. (2016)"],
        "constitution": "Illinois Constitution Art. I, §2 - Due process"
    },
    "PA": {
        "agency": "Department of Human Services",
        "statutes": "42 Pa.C.S. Chapter 63 (Juvenile Act)",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "10 days (child in care)",
            "Dispositional Hearing": "20 days",
            "Permanency Hearing": "6 months"
        },
        "key_statutes": [
            "23 Pa.C.S. §6303 - Definitions",
            "42 Pa.C.S. §6324 - Taking into custody",
            "42 Pa.C.S. §6341 - Adjudicatory hearing"
        ],
        "discovery": "Pa.R.J.C.P. 340",
        "key_cases": ["In re L.M. (2011)", "In re Adoption of R.B.F. (2002)"],
        "constitution": "Pennsylvania Constitution Art. I, §9 - Due process"
    },
    "OH": {
        "agency": "Ohio Department of Job and Family Services",
        "statutes": "Ohio Revised Code Chapter 2151",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "30 days (90 if continued)",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 12 months"
        },
        "key_statutes": [
            "ORC §2151.03 - Neglected child",
            "ORC §2151.031 - Abused child",
            "ORC §2151.414 - TPR"
        ],
        "discovery": "Ohio Juv. R. 24",
        "key_cases": ["In re C.F. (2007)", "In re Adoption of Masa (2001)"],
        "constitution": "Ohio Constitution Art. I, §16 - Due process"
    },
    "GA": {
        "agency": "Division of Family and Children Services (DFCS)",
        "statutes": "O.C.G.A. Title 15, Chapter 11",
        "timeframes": {
            "Preliminary Protective Hearing": "72 hours",
            "Adjudicatory Hearing": "10 days",
            "Dispositional Hearing": "30 days",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "O.C.G.A. §15-11-2 - Definitions",
            "O.C.G.A. §15-11-133 - Emergency custody",
            "O.C.G.A. §15-11-310 - TPR"
        ],
        "discovery": "O.C.G.A. §15-11-170",
        "key_cases": ["In re R.M. (2009)", "In re M.K.S. (2011)"],
        "constitution": "Georgia Constitution Art. I, §1, ¶1 - Due process"
    },
    "NC": {
        "agency": "Division of Social Services",
        "statutes": "N.C.G.S. Chapter 7B",
        "timeframes": {
            "Nonsecure Custody Hearing": "7 days",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "90 days, then every 6 months"
        },
        "key_statutes": [
            "N.C.G.S. §7B-101 - Definitions",
            "N.C.G.S. §7B-500 - Taking into custody",
            "N.C.G.S. §7B-1111 - TPR grounds"
        ],
        "discovery": "N.C.G.S. §7B-700",
        "key_cases": ["In re J.N. (2010)", "In re Montgomery (2009)"],
        "constitution": "North Carolina Constitution Art. I, §19 - Due process"
    },
    "MI": {
        "agency": "Michigan Department of Health and Human Services",
        "statutes": "MCL Chapter 712A (Probate Code)",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudication": "63 days (child in care)",
            "Disposition": "28 days after adjudication",
            "Review Hearing": "Every 91 days"
        },
        "key_statutes": [
            "MCL §712A.2 - Jurisdiction",
            "MCL §712A.13a - Preliminary hearing",
            "MCL §712A.19b - TPR"
        ],
        "discovery": "MCR 3.922",
        "key_cases": ["In re Sanders (2007)", "In re Rood (2009)"],
        "constitution": "Michigan Constitution Art. I, §17 - Due process"
    },
    "AZ": {
        "agency": "Arizona Department of Child Safety (DCS)",
        "statutes": "Arizona Revised Statutes Title 8",
        "timeframes": {
            "Preliminary Protective Hearing": "5-7 days",
            "Dependency Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "A.R.S. §8-201 - Definitions",
            "A.R.S. §8-821 - Taking child into custody",
            "A.R.S. §8-533 - TPR grounds"
        ],
        "discovery": "Arizona Rules of Procedure for Juvenile Court",
        "key_cases": ["Michael J. v. Arizona DES (2006)", "In re Maricopa County (2004)"],
        "constitution": "Arizona Constitution Art. 2, §4 - Due process"
    },
    "CO": {
        "agency": "Colorado Department of Human Services",
        "statutes": "Colorado Children's Code (C.R.S. Title 19)",
        "timeframes": {
            "Temporary Custody Hearing": "72 hours",
            "Adjudicatory Hearing": "90 days",
            "Dispositional Hearing": "45 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "C.R.S. §19-1-103 - Definitions",
            "C.R.S. §19-3-401 - Taking child into custody",
            "C.R.S. §19-3-604 - TPR criteria"
        ],
        "discovery": "C.R.C.P. 26; §19-1-303",
        "key_cases": ["People in Interest of A.M. (2020)", "In re D.I.S. (2009)"],
        "constitution": "Colorado Constitution Art. II, §25 - Due process"
    },
    "NJ": {
        "agency": "Division of Child Protection and Permanency (DCP&P)",
        "statutes": "N.J.S.A. Title 9, Title 30",
        "timeframes": {
            "Order to Show Cause": "2 days",
            "Fact-Finding": "120 days",
            "Disposition": "60 days after fact-finding",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "N.J.S.A. 9:6-8.21 - Definitions",
            "N.J.S.A. 9:6-8.28 - Temporary removal",
            "N.J.S.A. 30:4C-15 - TPR"
        ],
        "discovery": "N.J. Court Rules 5:12",
        "key_cases": ["In re Guardianship of J.C. (2006)", "DYFS v. A.W. (2005)"],
        "constitution": "New Jersey Constitution Art. I, §1 - Due process"
    },
    "VA": {
        "agency": "Virginia Department of Social Services",
        "statutes": "Virginia Code Title 16.1",
        "timeframes": {
            "Preliminary Removal Hearing": "5 days",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "60 days after adjudication",
            "Foster Care Review": "Every 6 months"
        },
        "key_statutes": [
            "Va. Code §16.1-228 - Definitions",
            "Va. Code §16.1-251 - Emergency removal",
            "Va. Code §16.1-283 - TPR"
        ],
        "discovery": "Va. Code §16.1-264",
        "key_cases": ["Roanoke DSS v. Burns (2005)", "Bristol DSS v. Welch (2008)"],
        "constitution": "Virginia Constitution Art. I, §11 - Due process"
    },
    "WA": {
        "agency": "Department of Children, Youth, and Families (DCYF)",
        "statutes": "RCW Title 13.34",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Fact-Finding": "75 days",
            "Disposition": "14 days after fact-finding",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "RCW 13.34.030 - Definitions",
            "RCW 13.34.050 - Taking child into custody",
            "RCW 13.34.180 - TPR"
        ],
        "discovery": "RCW 13.34.096",
        "key_cases": ["In re Dependency of K.R. (2015)", "In re Welfare of Key (2009)"],
        "constitution": "Washington Constitution Art. I, §3 - Due process"
    },
    "MA": {
        "agency": "Department of Children and Families (DCF)",
        "statutes": "M.G.L. Chapter 119",
        "timeframes": {
            "72-Hour Hearing": "Next court day after emergency",
            "Trial on Merits": "90 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "M.G.L. c.119 §21 - Definitions",
            "M.G.L. c.119 §24 - Emergency custody",
            "M.G.L. c.210 §3 - TPR"
        ],
        "discovery": "Mass. R. Civ. P. 26-37",
        "key_cases": ["Adoption of Hugo (2002)", "Care & Protection of Robert (2006)"],
        "constitution": "Massachusetts Constitution Art. 12 - Due process"
    },
    "IN": {
        "agency": "Indiana Department of Child Services (DCS)",
        "statutes": "Indiana Code Title 31",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Initial Hearing": "10 days",
            "Fact-Finding": "60 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "IC 31-34-1 - CHINS definitions",
            "IC 31-34-4 - Emergency custody",
            "IC 31-35-2 - TPR"
        ],
        "discovery": "Indiana Trial Rule 26",
        "key_cases": ["In re K.T.K. (2009)", "Matter of A.I. (2015)"],
        "constitution": "Indiana Constitution Art. 1, §12 - Due process"
    },
    "TN": {
        "agency": "Department of Children's Services (DCS)",
        "statutes": "Tennessee Code Title 37",
        "timeframes": {
            "Preliminary Hearing": "3 days",
            "Adjudicatory Hearing": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "T.C.A. §37-1-102 - Definitions",
            "T.C.A. §37-1-114 - Taking into custody",
            "T.C.A. §36-1-113 - TPR grounds"
        ],
        "discovery": "Tenn. R. Juv. P. 25",
        "key_cases": ["In re Adoption of A.M.H. (2008)", "State v. B.J.W. (2012)"],
        "constitution": "Tennessee Constitution Art. I, §8 - Due process"
    },
    "MO": {
        "agency": "Missouri Children's Division",
        "statutes": "Missouri Revised Statutes Chapter 211",
        "timeframes": {
            "Protective Custody Hearing": "3 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "R.S.Mo. §211.031 - Jurisdiction",
            "R.S.Mo. §211.032 - Protective custody",
            "R.S.Mo. §211.447 - TPR"
        ],
        "discovery": "Missouri Supreme Court Rule 124",
        "key_cases": ["In Interest of K.A.W. (2010)", "In re D.L.W. (2007)"],
        "constitution": "Missouri Constitution Art. I, §10 - Due process"
    },
    "MD": {
        "agency": "Department of Human Services - Social Services",
        "statutes": "Courts & Judicial Proceedings Article, Title 3",
        "timeframes": {
            "Shelter Care Hearing": "Next business day",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Md. Code, Cts. & Jud. Proc. §3-801 - Definitions",
            "Md. Code, Cts. & Jud. Proc. §3-815 - Emergency custody",
            "Md. Code, Fam. Law §5-323 - TPR"
        ],
        "discovery": "Maryland Rule 11-105",
        "key_cases": ["In re Adoption/Guardianship No. 3598 (2003)", "In re Priscilla B. (2006)"],
        "constitution": "Maryland Constitution Declaration of Rights Art. 24 - Due process"
    },
    "WI": {
        "agency": "Wisconsin Department of Children and Families",
        "statutes": "Wisconsin Statutes Chapter 48",
        "timeframes": {
            "Temporary Physical Custody Hearing": "48 hours",
            "Plea Hearing": "30 days",
            "Fact-Finding": "30 days after plea",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Wis. Stat. §48.02 - Definitions",
            "Wis. Stat. §48.19 - Taking into custody",
            "Wis. Stat. §48.415 - TPR grounds"
        ],
        "discovery": "Wis. Stat. §48.293",
        "key_cases": ["In re Termination of B.E. (2007)", "Sheboygan County v. Julie A.B. (2002)"],
        "constitution": "Wisconsin Constitution Art. I, §1 - Due process"
    },
    "MN": {
        "agency": "Minnesota Department of Human Services",
        "statutes": "Minnesota Statutes Chapter 260C",
        "timeframes": {
            "Emergency Hearing": "72 hours",
            "Admit/Deny Hearing": "20 days",
            "Trial": "60 days from petition",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Minn. Stat. §260C.007 - Definitions",
            "Minn. Stat. §260C.175 - Emergency custody",
            "Minn. Stat. §260C.301 - TPR"
        ],
        "discovery": "Minn. R. Juv. Prot. P. 9",
        "key_cases": ["In re Welfare of J.J.B. (2006)", "In re Child of P.T. (2009)"],
        "constitution": "Minnesota Constitution Art. I, §7 - Due process"
    },
    "SC": {
        "agency": "South Carolina Department of Social Services",
        "statutes": "South Carolina Code Title 63",
        "timeframes": {
            "Probable Cause Hearing": "72 hours",
            "Merits Hearing": "35 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "S.C. Code §63-7-20 - Definitions",
            "S.C. Code §63-7-620 - Emergency removal",
            "S.C. Code §63-7-2570 - TPR"
        ],
        "discovery": "S.C. Code §63-7-1990",
        "key_cases": ["S.C. DSS v. Wilson (2005)", "In re Angela P. (2008)"],
        "constitution": "South Carolina Constitution Art. I, §3 - Due process"
    },
    "AL": {
        "agency": "Alabama Department of Human Resources",
        "statutes": "Alabama Code Title 12, Chapter 15",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "45 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Ala. Code §12-15-102 - Definitions",
            "Ala. Code §12-15-304 - Emergency custody",
            "Ala. Code §12-15-319 - TPR"
        ],
        "discovery": "Ala. R. Juv. P. 13",
        "key_cases": ["Ex parte Beasley (2003)", "J.M. v. D.G.M. (2010)"],
        "constitution": "Alabama Constitution Art. I, §6 - Due process"
    },
    "LA": {
        "agency": "Louisiana Department of Children and Family Services",
        "statutes": "Louisiana Children's Code",
        "timeframes": {
            "Continued Custody Hearing": "3 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "La. Ch.C. Art. 603 - Definitions",
            "La. Ch.C. Art. 619 - Emergency custody",
            "La. Ch.C. Art. 1015 - TPR grounds"
        ],
        "discovery": "La. Ch.C. Art. 653",
        "key_cases": ["State in Interest of J.A. (2006)", "In re C.M.M. (2009)"],
        "constitution": "Louisiana Constitution Art. I, §2 - Due process"
    },
    "KY": {
        "agency": "Kentucky Cabinet for Health and Family Services",
        "statutes": "Kentucky Revised Statutes Chapter 620",
        "timeframes": {
            "Temporary Removal Hearing": "72 hours",
            "Adjudication": "45 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "KRS 620.020 - Definitions",
            "KRS 620.060 - Emergency custody",
            "KRS 625.090 - TPR grounds"
        ],
        "discovery": "KRS 620.060",
        "key_cases": ["Cabinet v. B.L. (2008)", "In re J.R.G. (2005)"],
        "constitution": "Kentucky Constitution §2 - Due process"
    },
    "OR": {
        "agency": "Oregon Department of Human Services",
        "statutes": "Oregon Revised Statutes Chapter 419B",
        "timeframes": {
            "Shelter Hearing": "24 hours",
            "Jurisdiction Hearing": "60 days",
            "Disposition": "14 days after jurisdiction",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "ORS 419B.005 - Definitions",
            "ORS 419B.150 - Protective custody",
            "ORS 419B.504 - TPR grounds"
        ],
        "discovery": "ORS 419B.195",
        "key_cases": ["State ex rel. DHS v. W.A. (2006)", "In re Z.C. (2010)"],
        "constitution": "Oregon Constitution Art. I, §10 - Due process"
    },
    "OK": {
        "agency": "Oklahoma Department of Human Services",
        "statutes": "Oklahoma Statutes Title 10A",
        "timeframes": {
            "Show Cause Hearing": "5 days",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "10A O.S. §1-1-105 - Definitions",
            "10A O.S. §1-4-201 - Emergency custody",
            "10A O.S. §1-4-904 - TPR grounds"
        ],
        "discovery": "10A O.S. §1-4-503",
        "key_cases": ["In re T.T.S. (2007)", "Matter of C.G. (2012)"],
        "constitution": "Oklahoma Constitution Art. 2, §7 - Due process"
    },
    "CT": {
        "agency": "Connecticut Department of Children and Families",
        "statutes": "Connecticut General Statutes Chapter 815t",
        "timeframes": {
            "Preliminary Hearing": "10 days",
            "Adjudicatory Hearing": "60 days",
            "Disposition": "90 days from filing",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "C.G.S. §46b-120 - Definitions",
            "C.G.S. §17a-101g - Emergency custody",
            "C.G.S. §45a-717 - TPR"
        ],
        "discovery": "Conn. Practice Book §33a-6",
        "key_cases": ["In re Joseph W. (2007)", "In re Roshawn R. (2009)"],
        "constitution": "Connecticut Constitution Art. I, §9 - Due process"
    },
    "IA": {
        "agency": "Iowa Department of Human Services",
        "statutes": "Iowa Code Chapter 232",
        "timeframes": {
            "Removal Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Iowa Code §232.2 - Definitions",
            "Iowa Code §232.78 - Emergency custody",
            "Iowa Code §232.116 - TPR grounds"
        ],
        "discovery": "Iowa R. Juv. P. 8.3",
        "key_cases": ["In re H.S. (2008)", "In re J.L.W. (2006)"],
        "constitution": "Iowa Constitution Art. I, §9 - Due process"
    },
    "MS": {
        "agency": "Mississippi Department of Child Protection Services",
        "statutes": "Mississippi Code Title 43, Chapter 21",
        "timeframes": {
            "Shelter Hearing": "48 hours",
            "Adjudicatory Hearing": "90 days",
            "Disposition": "14 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Miss. Code §43-21-105 - Definitions",
            "Miss. Code §43-21-303 - Emergency custody",
            "Miss. Code §93-15-103 - TPR grounds"
        ],
        "discovery": "Miss. R. Civ. P. 26",
        "key_cases": ["In Interest of J.P.H. (2005)", "L.G. v. Miss. DHS (2010)"],
        "constitution": "Mississippi Constitution Art. 3, §14 - Due process"
    },
    "AR": {
        "agency": "Arkansas Division of Children and Family Services",
        "statutes": "Arkansas Code Title 9, Chapter 27",
        "timeframes": {
            "Probable Cause Hearing": "72 hours",
            "Adjudication": "60 days",
            "Review Hearing": "Every 6 months",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Ark. Code §9-27-303 - Definitions",
            "Ark. Code §9-27-313 - Emergency custody",
            "Ark. Code §9-27-341 - TPR grounds"
        ],
        "discovery": "Ark. Code §9-27-325",
        "key_cases": ["Trout v. Ark. DHS (2008)", "Dinkins v. Ark. DHS (2006)"],
        "constitution": "Arkansas Constitution Art. 2, §8 - Due process"
    },
    "UT": {
        "agency": "Utah Division of Child and Family Services",
        "statutes": "Utah Code Title 80",
        "timeframes": {
            "Shelter Hearing": "72 hours",
            "Pretrial/Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Utah Code §80-1-102 - Definitions",
            "Utah Code §80-3-301 - Emergency custody",
            "Utah Code §80-4-301 - TPR grounds"
        ],
        "discovery": "Utah R. Juv. P. 45",
        "key_cases": ["In re B.R. (2007)", "State in Interest of K.F. (2009)"],
        "constitution": "Utah Constitution Art. I, §7 - Due process"
    },
    "NV": {
        "agency": "Nevada Division of Child and Family Services",
        "statutes": "Nevada Revised Statutes Chapter 432B",
        "timeframes": {
            "Protective Custody Hearing": "72 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "NRS 432B.010 - Definitions",
            "NRS 432B.390 - Emergency custody",
            "NRS 128.105 - TPR grounds"
        ],
        "discovery": "NRS 432B.280",
        "key_cases": ["In re N.J. (2008)", "In re Parental Rights as to A.G. (2010)"],
        "constitution": "Nevada Constitution Art. 1, §8 - Due process"
    },
    "KS": {
        "agency": "Kansas Department for Children and Families",
        "statutes": "Kansas Statutes Chapter 38",
        "timeframes": {
            "Temporary Custody Hearing": "72 hours",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "K.S.A. 38-2202 - Definitions",
            "K.S.A. 38-2232 - Emergency custody",
            "K.S.A. 38-2269 - TPR grounds"
        ],
        "discovery": "K.S.A. 38-2244",
        "key_cases": ["In re K.R. (2008)", "In re S.D. (2011)"],
        "constitution": "Kansas Constitution Bill of Rights §18 - Due process"
    },
    "NM": {
        "agency": "New Mexico Children, Youth and Families Department",
        "statutes": "NMSA 1978, Chapter 32A",
        "timeframes": {
            "Custody Hearing": "10 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "NMSA §32A-4-2 - Definitions",
            "NMSA §32A-4-6 - Emergency custody",
            "NMSA §32A-4-28 - TPR grounds"
        ],
        "discovery": "NMRA, Rule 10-122",
        "key_cases": ["In re Pamela A.G. (2006)", "State ex rel. CYFD v. Patricia H. (2009)"],
        "constitution": "New Mexico Constitution Art. II, §18 - Due process"
    },
    "NE": {
        "agency": "Nebraska Department of Health and Human Services",
        "statutes": "Nebraska Revised Statutes Chapter 43",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Neb. Rev. Stat. §43-245 - Definitions",
            "Neb. Rev. Stat. §43-248 - Emergency custody",
            "Neb. Rev. Stat. §43-292 - TPR grounds"
        ],
        "discovery": "Neb. Rev. Stat. §43-273.02",
        "key_cases": ["In re Interest of Samantha C. (2008)", "In re Interest of Mainor T. (2005)"],
        "constitution": "Nebraska Constitution Art. I, §3 - Due process"
    },
    "WV": {
        "agency": "West Virginia Department of Health and Human Resources",
        "statutes": "West Virginia Code Chapter 49",
        "timeframes": {
            "Preliminary Hearing": "10 days",
            "Adjudicatory Hearing": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "W. Va. Code §49-1-201 - Definitions",
            "W. Va. Code §49-4-304 - Emergency custody",
            "W. Va. Code §49-4-604 - TPR grounds"
        ],
        "discovery": "W. Va. Code §49-4-602",
        "key_cases": ["In re Jonathan P. (2007)", "State v. Michael M. (2010)"],
        "constitution": "West Virginia Constitution Art. III, §10 - Due process"
    },
    "ID": {
        "agency": "Idaho Department of Health and Welfare",
        "statutes": "Idaho Code Title 16, Chapter 16",
        "timeframes": {
            "Shelter Care Hearing": "48 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "14 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Idaho Code §16-1602 - Definitions",
            "Idaho Code §16-1608 - Emergency custody",
            "Idaho Code §16-2005 - TPR grounds"
        ],
        "discovery": "I.R.C.P. 26",
        "key_cases": ["In re Doe (2008)", "Idaho DHS v. Doe (2011)"],
        "constitution": "Idaho Constitution Art. I, §13 - Due process"
    },
    "HI": {
        "agency": "Hawaii Department of Human Services",
        "statutes": "Hawaii Revised Statutes Chapter 587A",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "HRS §587A-4 - Definitions",
            "HRS §587A-8 - Emergency custody",
            "HRS §571-61 - TPR grounds"
        ],
        "discovery": "HRS §587A-16",
        "key_cases": ["In re Doe (2007)", "DHS v. Roe Family (2010)"],
        "constitution": "Hawaii Constitution Art. I, §5 - Due process"
    },
    "NH": {
        "agency": "New Hampshire Division for Children, Youth and Families",
        "statutes": "RSA Chapter 169-C",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 12 months"
        },
        "key_statutes": [
            "RSA 169-C:3 - Definitions",
            "RSA 169-C:6 - Emergency custody",
            "RSA 170-C:5 - TPR grounds"
        ],
        "discovery": "N.H. Super. Ct. R. 21",
        "key_cases": ["In re Baby Boy Doe (2005)", "In re Brendan C.-H. (2009)"],
        "constitution": "New Hampshire Constitution Part I, Art. 15 - Due process"
    },
    "ME": {
        "agency": "Maine Department of Health and Human Services",
        "statutes": "Maine Revised Statutes Title 22, Chapter 1071",
        "timeframes": {
            "Preliminary Hearing": "7 days",
            "Summary Preliminary Hearing": "24 hours (emergency)",
            "Jeopardy Hearing": "120 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "22 M.R.S. §4002 - Definitions",
            "22 M.R.S. §4034 - Emergency custody",
            "22 M.R.S. §4055 - TPR grounds"
        ],
        "discovery": "22 M.R.S. §4008",
        "key_cases": ["In re Thomas H. (2006)", "In re Michael C. (2010)"],
        "constitution": "Maine Constitution Art. I, §6-A - Due process"
    },
    "RI": {
        "agency": "Rhode Island Department of Children, Youth and Families",
        "statutes": "Rhode Island General Laws Title 40",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "R.I. Gen. Laws §40-11-2 - Definitions",
            "R.I. Gen. Laws §40-11-5 - Emergency custody",
            "R.I. Gen. Laws §15-7-7 - TPR grounds"
        ],
        "discovery": "R.I. Gen. Laws §40-11-12",
        "key_cases": ["In re Destiny B. (2007)", "In re M.B. (2011)"],
        "constitution": "Rhode Island Constitution Art. I, §2 - Due process"
    },
    "MT": {
        "agency": "Montana Department of Public Health and Human Services",
        "statutes": "Montana Code Title 41",
        "timeframes": {
            "Show Cause Hearing": "20 days",
            "Adjudication": "90 days",
            "Disposition": "20 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "MCA §41-3-102 - Definitions",
            "MCA §41-3-301 - Emergency custody",
            "MCA §41-3-609 - TPR grounds"
        ],
        "discovery": "MCA §41-3-205",
        "key_cases": ["In re A.N. (2008)", "In re D.B. (2006)"],
        "constitution": "Montana Constitution Art. II, §17 - Due process"
    },
    "DE": {
        "agency": "Delaware Division of Family Services",
        "statutes": "Delaware Code Title 13, Chapter 9",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "13 Del. C. §901 - Definitions",
            "13 Del. C. §903 - Emergency custody",
            "13 Del. C. §1103 - TPR grounds"
        ],
        "discovery": "Del. Fam. Ct. R. Civ. P. 26",
        "key_cases": ["In re T.W. (2007)", "DSCYF v. Doe (2010)"],
        "constitution": "Delaware Constitution Art. I, §7 - Due process"
    },
    "SD": {
        "agency": "South Dakota Department of Social Services",
        "statutes": "South Dakota Codified Laws Title 26",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "SDCL 26-8A-2 - Definitions",
            "SDCL 26-7A-12 - Emergency custody",
            "SDCL 26-8A-26 - TPR grounds"
        ],
        "discovery": "SDCL 15-6-26",
        "key_cases": ["In re A.S. (2008)", "People v. J.H. (2011)"],
        "constitution": "South Dakota Constitution Art. VI, §2 - Due process"
    },
    "ND": {
        "agency": "North Dakota Department of Human Services",
        "statutes": "North Dakota Century Code Chapter 27-20",
        "timeframes": {
            "Shelter Care Hearing": "96 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "N.D.C.C. §27-20.2-01 - Definitions",
            "N.D.C.C. §27-20.2-06 - Emergency custody",
            "N.D.C.C. §27-20.3-20 - TPR grounds"
        ],
        "discovery": "N.D.R.Ct. 8.3",
        "key_cases": ["In Interest of J.Z. (2007)", "In Interest of K.L. (2010)"],
        "constitution": "North Dakota Constitution Art. I, §12 - Due process"
    },
    "AK": {
        "agency": "Alaska Office of Children's Services",
        "statutes": "Alaska Statutes Title 47, Chapter 17",
        "timeframes": {
            "Probable Cause Hearing": "48 hours",
            "Adjudication": "120 days",
            "Disposition": "60 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "AS 47.17.290 - Definitions",
            "AS 47.10.142 - Emergency custody",
            "AS 25.23.180 - TPR grounds"
        ],
        "discovery": "Alaska R. Civ. P. 26",
        "key_cases": ["In re J.L.F. (2008)", "In re S.A. (2006)"],
        "constitution": "Alaska Constitution Art. I, §7 - Due process"
    },
    "VT": {
        "agency": "Vermont Department for Children and Families",
        "statutes": "Vermont Statutes Title 33, Chapter 53",
        "timeframes": {
            "Temporary Care Hearing": "72 hours",
            "Merits Hearing": "60 days",
            "Disposition": "35 days after merits",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "33 V.S.A. §5102 - Definitions",
            "33 V.S.A. §5302 - Emergency custody",
            "15A V.S.A. §3-504 - TPR grounds"
        ],
        "discovery": "V.R.F.P. 4.1(i)",
        "key_cases": ["In re G.S. (2008)", "In re A.F. (2011)"],
        "constitution": "Vermont Constitution Ch. I, Art. 10 - Due process"
    },
    "WY": {
        "agency": "Wyoming Department of Family Services",
        "statutes": "Wyoming Statutes Title 14",
        "timeframes": {
            "Shelter Care Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Wyo. Stat. §14-3-402 - Definitions",
            "Wyo. Stat. §14-3-405 - Emergency custody",
            "Wyo. Stat. §14-2-309 - TPR grounds"
        ],
        "discovery": "W.R.C.P. 26",
        "key_cases": ["In re DJG (2007)", "In re K.M.J. (2010)"],
        "constitution": "Wyoming Constitution Art. 1, §6 - Due process"
    }
}

# Federal law that applies to ALL states
FEDERAL_CPS_LAW = {
    "statutes": [
        "42 U.S.C. §671-679b - Title IV-E Foster Care",
        "42 U.S.C. §5101-5119 - Child Abuse Prevention and Treatment Act (CAPTA)",
        "42 U.S.C. §670-679c - Adoption and Safe Families Act (ASFA)",
        "25 U.S.C. §1901-1963 - Indian Child Welfare Act (ICWA)",
        "42 U.S.C. §1983 - Civil Rights (for suing CPS)"
    ],
    "constitutional_rights": [
        "4th Amendment - Protection against unreasonable searches/seizures",
        "5th Amendment - Due process, self-incrimination protection",
        "6th Amendment - Right to counsel in criminal matters",
        "14th Amendment - Due process, equal protection"
    ],
    "supreme_court_cases": [
        "Troxel v. Granville (2000) - Parental rights fundamental",
        "Santosky v. Kramer (1982) - Clear and convincing standard for TPR",
        "Stanley v. Illinois (1972) - Unwed fathers' rights",
        "Lassiter v. DSS (1981) - Right to counsel in TPR"
    ],
    "asfa_requirements": {
        "15_22_month_rule": "State must file TPR if child in care 15 of last 22 months",
        "reasonable_efforts": "Agency must make reasonable efforts to reunify",
        "exceptions": "Aggravated circumstances, abandonment, prior TPR"
    }
}

@router.get("/api/law-library/states")
async def get_all_states():
    """Get list of all states"""
    states = [{"code": code, "name": name} for code, name in STATES_INFO.items()]
    return {"states": sorted(states, key=lambda x: x["name"])}

@router.get("/api/law-library/{state_code}")
async def get_state_law_info(state_code: str, current_user: dict = Depends(require_tier("professional", feature_key="law_library"))):
    """Get comprehensive CPS law information for a state - INSTANT LOADING from cache/pre-built database"""
    state_code = state_code.upper()

    # Check cache first
    cache_key = f"law_library_{state_code}"
    cached = _cache.get(cache_key)
    if cached:
        return cached

    state_name = STATES_INFO.get(state_code)
    if not state_name:
        raise HTTPException(status_code=404, detail="State not found")
    
    state_data = STATE_CPS_DATABASE.get(state_code)
    
    if state_data:
        formatted_info = format_state_law_info(state_code, state_name, state_data)
        result = {"state_code": state_code, "state_name": state_name, "law_info": formatted_info, "federal_law": FEDERAL_CPS_LAW, "source": "pre_built_database"}
    else:
        generic_info = get_generic_state_info(state_code, state_name)
        result = {"state_code": state_code, "state_name": state_name, "law_info": generic_info, "federal_law": FEDERAL_CPS_LAW, "source": "generic_template"}

    _cache.set(cache_key, result, ttl=7200)
    return result

def format_state_law_info(state_code: str, state_name: str, data: dict) -> str:
    """Format pre-built state data into readable format"""
    timeframes = data.get("timeframes", {})
    timeframes_text = "\n".join([f"   • {k}: {v}" for k, v in timeframes.items()])
    
    statutes_text = "\n".join([f"   • {s}" for s in data.get("key_statutes", [])])
    cases_text = "\n".join([f"   • {c}" for c in data.get("key_cases", [])])
    
    return f"""
═══════════════════════════════════════════════════════════════════
           {state_name.upper()} ({state_code}) CPS LAW GUIDE
═══════════════════════════════════════════════════════════════════

📋 CPS AGENCY
   {data.get('agency', 'State Child Welfare Agency')}

📚 GOVERNING STATUTES
   {data.get('statutes', 'State Family Code')}

⏱️ KEY TIMEFRAMES
{timeframes_text}

📜 KEY STATUTORY PROVISIONS
{statutes_text}

📖 DISCOVERY RIGHTS
   {data.get('discovery', 'Consult state rules of procedure')}

⚖️ IMPORTANT STATE CASE LAW
{cases_text}

🏛️ STATE CONSTITUTIONAL PROTECTION
   {data.get('constitution', f'{state_name} Constitution - Due Process Clause')}

═══════════════════════════════════════════════════════════════════
                    FEDERAL LAW THAT APPLIES
═══════════════════════════════════════════════════════════════════

📋 FEDERAL STATUTES
   • 42 U.S.C. §671-679b - Title IV-E Foster Care
   • 42 U.S.C. §5101-5119 - CAPTA (Child Abuse Prevention & Treatment Act)
   • 42 U.S.C. §670-679c - ASFA (Adoption & Safe Families Act)
   • 25 U.S.C. §1901-1963 - ICWA (Indian Child Welfare Act)
   • 42 U.S.C. §1983 - Civil Rights (for suing CPS workers)

🏛️ CONSTITUTIONAL RIGHTS
   • 4th Amendment - Protection against warrantless searches
   • 5th Amendment - Due process, self-incrimination protection
   • 14th Amendment - Due process, equal protection
   
⚖️ KEY SUPREME COURT PRECEDENTS
   • Troxel v. Granville (2000) - Parental rights are FUNDAMENTAL
   • Santosky v. Kramer (1982) - Clear & convincing evidence for TPR
   • Stanley v. Illinois (1972) - Due process before termination
   • Lassiter v. DSS (1981) - Right to counsel considerations

📌 ASFA 15/22 MONTH RULE
   State must file TPR petition if child in foster care 15 of last 22 months
   (with exceptions for aggravated circumstances)

═══════════════════════════════════════════════════════════════════
"""

def get_generic_state_info(state_code: str, state_name: str) -> str:
    """Generate generic info for states not in the pre-built database"""
    return f"""
═══════════════════════════════════════════════════════════════════
           {state_name.upper()} ({state_code}) CPS LAW GUIDE
═══════════════════════════════════════════════════════════════════

📋 CPS AGENCY
   {state_name} Department of Children and Family Services
   (Contact your state legislature website for exact agency name)

📚 GOVERNING STATUTES
   {state_name} Family Code / Children's Code
   (Search your state's legislative database for specific citations)

⏱️ TYPICAL CPS TIMEFRAMES (VERIFY WITH YOUR STATE LAW)
   • Emergency/Shelter Hearing: Usually 24-72 hours
   • Adjudication/Jurisdiction Hearing: 30-90 days
   • Disposition Hearing: 15-30 days after adjudication
   • Review Hearings: Every 6 months
   • Permanency Hearing: Within 12 months of removal
   
📜 IMPORTANT: VERIFY ALL TIMEFRAMES WITH YOUR STATE CODE
   Timeframes vary significantly by state. Missing a deadline
   can have serious consequences for your case.

📖 DISCOVERY RIGHTS
   Contact the court clerk or your attorney for procedures
   to obtain your CPS case file in {state_name}.

═══════════════════════════════════════════════════════════════════
                    FEDERAL LAW THAT APPLIES
═══════════════════════════════════════════════════════════════════

📋 FEDERAL STATUTES (APPLY TO ALL STATES)
   • 42 U.S.C. §671-679b - Title IV-E Foster Care
   • 42 U.S.C. §5101-5119 - CAPTA (Child Abuse Prevention & Treatment Act)
   • 42 U.S.C. §670-679c - ASFA (Adoption & Safe Families Act)
   • 25 U.S.C. §1901-1963 - ICWA (Indian Child Welfare Act)
   • 42 U.S.C. §1983 - Civil Rights (for suing CPS workers)

🏛️ CONSTITUTIONAL RIGHTS (APPLY EVERYWHERE)
   • 4th Amendment - Protection against warrantless searches
   • 5th Amendment - Due process, self-incrimination protection
   • 14th Amendment - Due process, equal protection
   
⚖️ KEY SUPREME COURT PRECEDENTS
   • Troxel v. Granville (2000) - Parental rights are FUNDAMENTAL
   • Santosky v. Kramer (1982) - Clear & convincing evidence for TPR
   • Stanley v. Illinois (1972) - Due process before termination
   • Lassiter v. DSS (1981) - Right to counsel considerations

📌 ASFA 15/22 MONTH RULE
   State must file TPR petition if child in foster care 15 of last 22 months
   (with exceptions for aggravated circumstances)

═══════════════════════════════════════════════════════════════════
         For state-specific citations, consult:
         • Your state's legislative website
         • A family law attorney in {state_name}
         • Your local law library
═══════════════════════════════════════════════════════════════════
"""


# ============== COMMUNITY FORUM ==============


