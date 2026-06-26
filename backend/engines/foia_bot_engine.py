"""
Justice Shield — FOIA-Bot Engine
Generates formal public-records requests for caseworker bond and
oath-of-office documents, routed to the correct state agency.
"""

from __future__ import annotations

import datetime
import textwrap
from typing import Optional


STATE_RECORDS_LAWS: dict[str, str] = {
    "Alabama": "Alabama Open Records Act (Ala. Code § 36-12-40)",
    "Alaska": "Alaska Public Records Act (AS 40.25.110–40.25.220)",
    "Arizona": "Arizona Public Records Law (A.R.S. § 39-121)",
    "Arkansas": "Arkansas Freedom of Information Act (A.C.A. § 25-19-101 et seq.)",
    "California": "California Public Records Act (Cal. Gov. Code § 7920 et seq.)",
    "Colorado": "Colorado Open Records Act (C.R.S. § 24-72-201 et seq.)",
    "Connecticut": "Connecticut Freedom of Information Act (Conn. Gen. Stat. § 1-200 et seq.)",
    "Delaware": "Delaware Freedom of Information Act (29 Del. C. § 10001 et seq.)",
    "Florida": "Florida Public Records Law (Fla. Stat. § 119.01 et seq.)",
    "Georgia": "Georgia Open Records Act (O.C.G.A. § 50-18-70 et seq.)",
    "Hawaii": "Hawaii Uniform Information Practices Act (HRS § 92F-1 et seq.)",
    "Idaho": "Idaho Public Records Law (Idaho Code § 74-101 et seq.)",
    "Illinois": "Illinois Freedom of Information Act (5 ILCS 140/1 et seq.)",
    "Indiana": "Indiana Access to Public Records Act (Ind. Code § 5-14-3-1 et seq.)",
    "Iowa": "Iowa Open Records Law (Iowa Code § 22.1 et seq.)",
    "Kansas": "Kansas Open Records Act (K.S.A. § 45-215 et seq.)",
    "Kentucky": "Kentucky Open Records Act (KRS § 61.870 et seq.)",
    "Louisiana": "Louisiana Public Records Act (La. R.S. § 44:1 et seq.)",
    "Maine": "Maine Freedom of Access Act (1 M.R.S. § 401 et seq.)",
    "Maryland": "Maryland Public Information Act (Md. Code, Gen. Prov. § 4-101 et seq.)",
    "Massachusetts": "Massachusetts Public Records Law (M.G.L. c. 66 § 10 et seq.)",
    "Michigan": "Michigan Freedom of Information Act (MCL § 15.231 et seq.)",
    "Minnesota": "Minnesota Government Data Practices Act (Minn. Stat. § 13.01 et seq.)",
    "Mississippi": "Mississippi Public Records Act (Miss. Code Ann. § 25-61-1 et seq.)",
    "Missouri": "Missouri Sunshine Law (Mo. Rev. Stat. § 610.010 et seq.)",
    "Montana": "Montana Right to Know (Mont. Code Ann. § 2-6-1001 et seq.)",
    "Nebraska": "Nebraska Public Records Statutes (Neb. Rev. Stat. § 84-712 et seq.)",
    "Nevada": "Nevada Public Records Act (NRS § 239.001 et seq.)",
    "New Hampshire": "New Hampshire Right-to-Know Law (RSA § 91-A)",
    "New Jersey": "New Jersey Open Public Records Act (N.J.S.A. § 47:1A-1 et seq.)",
    "New Mexico": "New Mexico Inspection of Public Records Act (NMSA § 14-2-1 et seq.)",
    "New York": "New York Freedom of Information Law (Public Officers Law § 84 et seq.)",
    "North Carolina": "North Carolina Public Records Law (N.C.G.S. § 132-1 et seq.)",
    "North Dakota": "North Dakota Open Records Law (N.D.C.C. § 44-04-18 et seq.)",
    "Ohio": "Ohio Public Records Act (Ohio Rev. Code § 149.43 et seq.)",
    "Oklahoma": "Oklahoma Open Records Act (51 O.S. § 24A.1 et seq.)",
    "Oregon": "Oregon Public Records Law (ORS § 192.311 et seq.)",
    "Pennsylvania": "Pennsylvania Right-to-Know Law (65 P.S. § 67.101 et seq.)",
    "Rhode Island": "Rhode Island Access to Public Records Act (R.I. Gen. Laws § 38-2-1 et seq.)",
    "South Carolina": "South Carolina Freedom of Information Act (S.C. Code § 30-4-10 et seq.)",
    "South Dakota": "South Dakota Open Records Law (SDCL § 1-27-1 et seq.)",
    "Tennessee": "Tennessee Public Records Act (Tenn. Code Ann. § 10-7-503 et seq.)",
    "Texas": "Texas Public Information Act (Tex. Gov't Code § 552.001 et seq.)",
    "Utah": "Utah Government Records Access and Management Act (Utah Code § 63G-2-101 et seq.)",
    "Vermont": "Vermont Public Records Act (1 V.S.A. § 315 et seq.)",
    "Virginia": "Virginia Freedom of Information Act (Va. Code § 2.2-3700 et seq.)",
    "Washington": "Washington Public Records Act (RCW § 42.56.001 et seq.)",
    "West Virginia": "West Virginia Freedom of Information Act (W.Va. Code § 29B-1-1 et seq.)",
    "Wisconsin": "Wisconsin Open Records Law (Wis. Stat. § 19.31 et seq.)",
    "Wyoming": "Wyoming Public Records Act (Wyo. Stat. § 16-4-201 et seq.)",
    "Federal": "Freedom of Information Act (5 U.S.C. § 552)",
}

TARGET_DIRECTORY: dict[str, dict[str, str]] = {
    "Alabama": {"agency": "Alabama State Personnel Department / County Commission", "address": "64 N. Union St., Montgomery, AL 36130", "email": "records@personnel.alabama.gov"},
    "Alaska": {"agency": "Alaska Dept. of Administration — State Records", "address": "PO Box 110200, Juneau, AK 99811-0200", "email": "doa.records@alaska.gov"},
    "Arizona": {"agency": "Arizona Secretary of State — Public Records Unit", "address": "1700 W. Washington St., 7th Fl., Phoenix, AZ 85007", "email": "publicrecords@azsos.gov"},
    "Arkansas": {"agency": "Arkansas Secretary of State — Business / FOIA Division", "address": "500 Woodlane St., Suite 256, Little Rock, AR 72201", "email": "sos.info@sos.arkansas.gov"},
    "California": {"agency": "County Risk Management / Agency HR (per county)", "address": "Varies — contact county Clerk-Recorder or agency HR", "email": "Varies — check agency website for CPRA contact"},
    "Colorado": {"agency": "Colorado Dept. of Personnel & Administration", "address": "1525 Sherman St., Denver, CO 80203", "email": "dpa_records@state.co.us"},
    "Connecticut": {"agency": "Connecticut Freedom of Information Commission", "address": "165 Capitol Ave., Hartford, CT 06106", "email": "foi.commission@ct.gov"},
    "Delaware": {"agency": "Delaware Dept. of State — FOIA Coordinator", "address": "401 Federal St., Suite 3, Dover, DE 19901", "email": "foia.requests@state.de.us"},
    "Florida": {"agency": "Florida Dept. of Management Services — HR Records", "address": "4050 Esplanade Way, Tallahassee, FL 32399", "email": "publicrecords@dms.fl.gov"},
    "Georgia": {"agency": "Georgia Secretary of State / Agency HR", "address": "214 State Capitol, Atlanta, GA 30334", "email": "sosdept@sos.ga.gov"},
    "Hawaii": {"agency": "Hawaii Office of Information Practices", "address": "No. 1 Capitol District, 250 S. Hotel St., Rm. 107, Honolulu, HI 96813", "email": "oip@hawaii.gov"},
    "Idaho": {"agency": "Idaho Secretary of State", "address": "700 W. Jefferson St., Boise, ID 83702", "email": "sosinfo@sos.idaho.gov"},
    "Illinois": {"agency": "Illinois Public Access Counselor (PAC)", "address": "500 S. Second St., Springfield, IL 62706", "email": "public.access@ilag.gov"},
    "Indiana": {"agency": "Indiana Public Access Counselor", "address": "315 W. Ohio St., Suite 104, Indianapolis, IN 46202", "email": "pac@pac.in.gov"},
    "Iowa": {"agency": "Iowa Citizens' Aide / Ombudsman", "address": "Ola Babcock Miller Bldg., 1112 E. Grand Ave., Des Moines, IA 50319", "email": "iowacitizensaide@legis.iowa.gov"},
    "Kansas": {"agency": "Kansas Attorney General — Open Records Division", "address": "120 S.W. 10th Ave., Topeka, KS 66612", "email": "cprotect@ag.ks.gov"},
    "Kentucky": {"agency": "Kentucky Attorney General — Open Records", "address": "700 Capitol Ave., Suite 118, Frankfort, KY 40601", "email": "open.records@ag.ky.gov"},
    "Louisiana": {"agency": "Louisiana Attorney General — Public Records Division", "address": "1885 N. Third St., Baton Rouge, LA 70802", "email": "publicrecords@ag.louisiana.gov"},
    "Maine": {"agency": "Maine Attorney General — FOAA Unit", "address": "6 State House Station, Augusta, ME 04333", "email": "foaa@maine.gov"},
    "Maryland": {"agency": "Maryland State Archives — Public Records", "address": "350 Rowe Blvd., Annapolis, MD 21401", "email": "msa.records@maryland.gov"},
    "Massachusetts": {"agency": "Massachusetts Secretary of State — Public Records Division", "address": "One Ashburton Pl., Rm. 1719, Boston, MA 02108", "email": "publicrecords@sec.state.ma.us"},
    "Michigan": {"agency": "Michigan Dept. of Technology, Management & Budget — FOIA", "address": "PO Box 30026, Lansing, MI 48909", "email": "dtmb-foia@michigan.gov"},
    "Minnesota": {"agency": "Minnesota Dept. of Administration — Data Practices", "address": "50 Sherburne Ave., St. Paul, MN 55155", "email": "datapractices.admin@state.mn.us"},
    "Mississippi": {"agency": "Mississippi Secretary of State / Agency HR", "address": "125 S. Congress St., Jackson, MS 39201", "email": "secretary@sos.ms.gov"},
    "Missouri": {"agency": "Missouri Secretary of State / Agency Custodian", "address": "600 W. Main St., Jefferson City, MO 65101", "email": "sosrecords@sos.mo.gov"},
    "Montana": {"agency": "Montana Secretary of State", "address": "PO Box 202801, Helena, MT 59620-2801", "email": "sos@mt.gov"},
    "Nebraska": {"agency": "Nebraska Secretary of State / Agency HR", "address": "1445 K St., Suite 2300, Lincoln, NE 68509", "email": "sos.records@nebraska.gov"},
    "Nevada": {"agency": "Nevada Secretary of State — Public Records", "address": "202 N. Carson St., Carson City, NV 89701", "email": "publicrecords@sos.nv.gov"},
    "New Hampshire": {"agency": "New Hampshire Attorney General — Right-to-Know Unit", "address": "33 Capitol St., Concord, NH 03301", "email": "nhag.rtk@doj.nh.gov"},
    "New Jersey": {"agency": "New Jersey Government Records Council", "address": "101 S. Broad St., CN-819, Trenton, NJ 08625", "email": "grc@dca.nj.gov"},
    "New Mexico": {"agency": "New Mexico Dept. of State Records & Archives", "address": "1205 Camino Carlos Rey, Santa Fe, NM 87507", "email": "ipra@srca.nm.gov"},
    "New York": {"agency": "New York Committee on Open Government", "address": "One Commerce Plaza, 99 Washington Ave., Albany, NY 12231", "email": "infopolicy.council@dos.ny.gov"},
    "North Carolina": {"agency": "North Carolina Dept. of Natural & Cultural Resources", "address": "4614 Mail Service Center, Raleigh, NC 27699-4614", "email": "archives@ncdcr.gov"},
    "North Dakota": {"agency": "North Dakota Office of the Attorney General", "address": "600 E. Blvd. Ave., Dept. 125, Bismarck, ND 58505", "email": "ndag@nd.gov"},
    "Ohio": {"agency": "Ohio Attorney General — Public Records Unit", "address": "30 E. Broad St., 14th Fl., Columbus, OH 43215", "email": "PublicRecords@OhioAttorneyGeneral.gov"},
    "Oklahoma": {"agency": "Oklahoma Secretary of State / Agency Custodian", "address": "2300 N. Lincoln Blvd., Rm. 101, Oklahoma City, OK 73105", "email": "sos@sos.ok.gov"},
    "Oregon": {"agency": "Oregon Secretary of State — Archives Division", "address": "800 Summer St. NE, Salem, OR 97301", "email": "reference.archives@oregon.gov"},
    "Pennsylvania": {"agency": "Pennsylvania Office of Open Records", "address": "333 Market St., 16th Fl., Harrisburg, PA 17101", "email": "openrecords@pa.gov"},
    "Rhode Island": {"agency": "Rhode Island Dept. of Administration — APRA", "address": "One Capitol Hill, Providence, RI 02908", "email": "publicrecords@doa.ri.gov"},
    "South Carolina": {"agency": "South Carolina Attorney General / Agency Custodian", "address": "PO Box 11549, Columbia, SC 29211", "email": "publicrecords@scag.gov"},
    "South Dakota": {"agency": "South Dakota Secretary of State", "address": "500 E. Capitol Ave., Pierre, SD 57501", "email": "sdsos@state.sd.us"},
    "Tennessee": {"agency": "Tennessee Comptroller — Open Records Counsel", "address": "505 Deaderick St., Nashville, TN 37243", "email": "openrecords@cot.tn.gov"},
    "Texas": {"agency": "Texas Office of the Attorney General — Open Records Division", "address": "PO Box 12548, Austin, TX 78711-2548", "email": "public.records@oag.texas.gov"},
    "Utah": {"agency": "Utah State Archives — GRAMA Division", "address": "346 S. Rio Grande St., Salt Lake City, UT 84101", "email": "research@utah.gov"},
    "Vermont": {"agency": "Vermont Secretary of State / Agency Custodian", "address": "128 State St., Montpelier, VT 05633", "email": "sos.publicrecords@vermont.gov"},
    "Virginia": {"agency": "Virginia Freedom of Information Advisory Council", "address": "910 Capitol St., General Assembly Bldg., Suite B-10, Richmond, VA 23219", "email": "foiacouncil@dls.virginia.gov"},
    "Washington": {"agency": "Washington Attorney General — Open Government Unit", "address": "1125 Washington St. SE, Olympia, WA 98504", "email": "opengovernment@atg.wa.gov"},
    "West Virginia": {"agency": "West Virginia Secretary of State", "address": "1900 Kanawha Blvd. E., Bldg. 1, Suite 157K, Charleston, WV 25305", "email": "wvsos@wvsos.com"},
    "Wisconsin": {"agency": "Wisconsin Dept. of Administration — Open Records Unit", "address": "PO Box 7864, Madison, WI 53707-7864", "email": "OpenRecords@doa.wi.gov"},
    "Wyoming": {"agency": "Wyoming Secretary of State", "address": "200 W. 24th St., Cheyenne, WY 82002", "email": "staterecords@wyo.gov"},
    "Federal": {"agency": "Relevant Federal Agency FOIA Officer", "address": "See agency FOIA portal at foia.gov", "email": "See agency-specific FOIA contact at foia.gov"},
}


def _resolve_state(state: str) -> str:
    if state in STATE_RECORDS_LAWS:
        return state
    lower = state.strip().lower()
    for key in STATE_RECORDS_LAWS:
        if key.lower() == lower:
            return key
    raise ValueError(f"State '{state}' not found. Available: {sorted(STATE_RECORDS_LAWS.keys())}")


def get_available_states() -> list[str]:
    return sorted(STATE_RECORDS_LAWS.keys())


def generate_bond_request(
    state: str,
    caseworker_name: str,
    agency_name: str,
    requester_name: str = "Requesting Party",
) -> str:
    state_key = _resolve_state(state)
    statute = STATE_RECORDS_LAWS[state_key]
    target = TARGET_DIRECTORY[state_key]
    today = datetime.date.today().strftime("%B %d, %Y")

    body = textwrap.dedent(f"""    # Public Records Request — Surety Bond & Oath of Office
    **Date:** {today}
    **From:** {requester_name}
    **To:** Custodian of Records, {target['agency']}
    **Re:** {caseworker_name} — {agency_name}

    ---

    ## Statutory Authority

    This request is submitted pursuant to the **{statute}**.  Public employees
    are required to file surety bonds and oaths of office with the appropriate
    custodial authority; these documents constitute public records subject to
    disclosure under the statute cited above.

    ---

    ## Records Requested

    Pursuant to the above-referenced statute, I hereby request copies of the
    following records relating to **{caseworker_name}**, currently or formerly
    employed as a caseworker / social worker with **{agency_name}**:

    1. **Individual Surety Bond** — any individual fidelity or surety bond
       required by statute, agency policy, or professional licensure for the
       above-named employee, including:
       - Bond number
       - Name and contact information of the issuing surety company
       - Coverage amount and effective dates
       - Any claims filed against the bond

    2. **Blanket / Position Bond** — if no individual bond exists, any blanket
       bond, schedule bond, or position bond covering the employee's job
       classification, together with the policy number and issuing carrier.

    3. **Oath of Office** — the executed, notarized (if applicable) Oath of
       Office filed by {caseworker_name} upon assuming their position with
       {agency_name}.

    4. **Designation of Bond Custodian** — the name and office of the official
       designated as custodian of the above bonds on behalf of {agency_name}.

    ---

    ## Response Instructions

    Please respond within the time period prescribed by **{statute}**.
    If any portion of these records is withheld, please cite the specific
    statutory exemption, the factual basis for the exemption, and identify the
    portions being withheld.

    Preferred response format: electronic copies (PDF) via email, or paper
    copies mailed to the address below.

    ---

    **Requester:**
    {requester_name}
    [Your Address]
    [City, State ZIP]
    [Phone]
    [Email]

    *Signature:* ___________________________ *Date:* _______________

    ---
    > *This document is a public-records request template.  It does not
    > constitute legal advice.  Consult a licensed attorney before submitting.*
    """)
    return body


def generate_foia_package(
    user_name: str,
    state: str,
    caseworker_name: str,
    agency_name: str,
) -> dict:
    state_key = _resolve_state(state)
    target = TARGET_DIRECTORY[state_key]
    statute = STATE_RECORDS_LAWS[state_key]
    today = datetime.date.today().strftime("%B %d, %Y")

    bond_section = generate_bond_request(
        state=state,
        caseworker_name=caseworker_name,
        agency_name=agency_name,
        requester_name=user_name,
    )

    cover = textwrap.dedent(f"""    # Justice Shield — FOIA Package
    **Prepared for:** {user_name}
    **Date:** {today}
    **State:** {state_key}
    **Governing Statute:** {statute}

    ---

    ## Submission Instructions

    | Method | Details |
    |--------|---------|
    | **Mail** | {target['agency']} · {target['address']} |
    | **Email** | {target['email']} |

    **Tips for submission:**
    - Send via Certified Mail, Return Receipt Requested
    - If emailing, request a read-receipt or delivery confirmation
    - Note the response deadline required by the statute and calendar it
    - If the agency fails to respond in time, you may seek relief through
      the state Attorney General or a court of competent jurisdiction

    ---

    """)

    full_doc = cover + bond_section

    return {
        "state": state_key,
        "statute": statute,
        "target_agency": target["agency"],
        "target_address": target["address"],
        "target_email": target["email"],
        "caseworker_name": caseworker_name,
        "agency_name": agency_name,
        "requester_name": user_name,
        "date": today,
        "document_markdown": full_doc,
    }
