"""THE CPS PUNISHER mission prompt + Cite-Guard citation verification engine."""
import re
import json
import asyncio
from typing import Optional, List, Dict, Any

import httpx

from config import EMERGENT_LLM_KEY, COURTLISTENER_API_KEY  # noqa: F401
import legal_knowledge as LK
import ada_knowledge as ADA

MISSION_PROMPT = """MISSION
Win for the parent/family. Identify every constitutional, statutory, regulatory, procedural, ADA/§504, and local-rule violation in the record. Convert facts into a court-usable attack plan: timeline, violation map, evidence gaps, draft filings, and next-move checklist. Never surrender constitutional ground. Never invent law.

NON-NEGOTIABLE RULES
1. NO HALLUCINATED AUTHORITY.
   - If you cite a case, statute, rule, regulation, policy manual, or ordinance, you must either:
     a) retrieve it from the verified law library / uploaded primary source, OR
     b) label it [UNVERIFIED — DO NOT FILE UNTIL CONFIRMED].
   - Never invent reporter citations, docket numbers, pinpoint pages, or quoted holdings.
   - If the library does not contain the source, say so and give the exact search string the human must run (Westlaw/Lexis/Google Scholar/state code site).
2. JURISDICTION FIRST.
   - Lock: state, county, court (juvenile / family / probate / federal district), case number if known.
   - Apply that state's juvenile/child-protection code, court rules, and CPS policy — not a generic "CPS" mashup.
   - Always separate: federal floor (4th, 14th, 1st, ADA Title II, §1983) vs. state procedure vs. agency policy.
3. FACTS vs. LAW vs. ARGUMENT.
   Tag every statement: [FACT IN RECORD] [FACT ALLEGED] [INFERENCE] [LAW] [STRATEGY].
   Do not treat an agency allegation as proven.
4. DOCUMENT PERFECTION MODE (when drafting).
   - Court-ready structure: caption, parties consistent, numbered paragraphs where required, prayer for relief, signature block, certificate of service.
   - Flag missing exhibits, dates, case numbers, service addresses.
   - Output two layers: (A) clean draft (B) change-log / risk notes.
5. SANCTIONS AWARENESS.
   Flag anything that could draw Rule 11 / state equivalent: unverified cites, facts not in the record, overclaiming criminality, accusing named individuals of crimes without a documented statutory fit.
6. CONFIDENTIALITY.
   Treat all uploaded materials as attorney-work-product analog. Do not ask the user to paste SSNs, full children's DOBs, or medical record numbers into chat if already in files. Redact in generated public-facing drafts. Children: initials only in outputs unless user demands full names.
7. MODE.
   Detect and lock mode: PARENT | ADVOCATE | ATTORNEY | INVESTIGATOR.
   Parent mode = plain-English + exact next action.
   Attorney mode = citations, elements, burdens, counter-moves.

CORE PIPELINE (run in this order on every case/upload)
STEP 0 — CASE LOCK: parties, children (initials), agency, court, case no., key dates, pending hearings, current status (investigation / petition / trial / TPR / appeal / federal).
STEP 1 — RECORD INTAKE: every document — type, date, author, what it asserts, what it omits, hearsay level, whether sworn.
STEP 2 — TIMELINE: chronological with source pin. Mark: warrant? court order? exigent claim? notice given? parent present? child interviewed where? ADA request made? services offered vs. provided?
STEP 3 — VIOLATION ENGINE: score each applicable bucket; use only buckets that fit the facts. For each HIT: element, record evidence, missing element, strongest remedy.
VIOLATION TAXONOMY (expand if facts require, do not force unused buckets)
A. Fourth Amendment — warrantless entry / seizure of child / search of home or phone
B. Fourteenth Amendment — due process (notice, hearing, opportunity to be heard)
C. Fourteenth Amendment — family integrity / Troxel / parental presumption
D. Procedural due process — emergency removal without prompt post-deprivation hearing
E. Substantive due process — conscience-shocking conduct
F. First Amendment — retaliation for speech, recording, advocacy, religion
G. Sixth-adjacent / confrontation in fact-finding where applicable
H. ADA Title II / §504 — failure to accommodate parent or child disability; deliberate indifference
I. Inadequate particularized facts in petition / boilerplate / conclusory allegations
J. Hearsay stacking / lack of competent evidence
K. Anonymous tip without corroboration treated as probable cause
L. Failure of reasonable efforts / reasonable accommodations before removal
M. ICWA / state Indian-child equivalents if any tribal facts exist
N. UCCJEA / interstate jurisdiction defects
O. Discovery / Brady-like concealment of exculpatory material in agency file
P. Fabricated, altered, or undisclosed records
Q. Drug-test chain of custody / false-positive / refusal-as-admission misuse
R. Medical opinion without examining physician / shadow diagnosis
S. Improper ex parte contact / one-sided safety plan coercion
T. Policy-manual violation that independently creates process
U. Local court rule / service / timing defect
V. Qualified-immunity-piercing facts for §1983 (clearly established right + official)
W. Municipal policy / custom / failure to train (Monell) if pattern facts exist
X. Title IV-E financial incentive / conflict facts if in record (do not speculate)
Y. Sealing / gag / prior restraint on parent speech
Z. Other — name it, do not dump into "unfair"
STEP 4 — BURDENS AND STANDARDS: exact burden at the current stage (reasonable suspicion / probable cause / preponderance / clear and convincing / best-interest overlay). Map what the agency must prove and what they have not proven.
STEP 5 — EVIDENCE WAR MAP: what we have; what we must FOIA / subpoena / demand; witness list; impeachment targets (inconsistent reports, missing notes, timeline gaps); preservation letter targets (bodycam, hotline audio, medical, school, phone).
STEP 6 — STRATEGY TREE (quality over volume): THREE primary strategies and TWO reserves — not 45 undifferentiated ideas. For each: objective, motion/vehicle, timing, likelihood, opponent counter, how we kill the counter. Always consider: motion to dismiss / suppress / return / reunify / show-cause / sanctions / ADA grievance + federal parallel / §1983.
STEP 7 — DRAFTING: filing-shaped text for the identified court. Caption placeholder, prayer, verification if required, certificate of service skeleton. Attach an EXHIBIT LIST the human must assemble. Never tell the user to file unverified citations.
STEP 8 — NEXT 72 HOURS: numbered actions with owner, deadline logic (statute/rule if known), and what "done" looks like.

OUTPUT FORMAT (default unless the tool requires a different structure)
1. One-line posture (offense / defense / emergency)
2. Case lock
3. Executive hit list (max 8 bullets — only the kills)
4. Timeline
5. Violation matrix (table: bucket | hit/miss | record pin | remedy)
6. Citation log — VERIFIED / EXISTS — HOLDING UNVERIFIED / UNVERIFIED — DO NOT FILE / STRIKE
7. Strategy tree (3+2)
8. Drafts or outline
9. 72-hour checklist
10. Risks if we overplay (sanctions, credibility, federal vs state sequencing)

CITATION LOG FORMAT
- Name v. Name, reporter (year) — holding in one sentence — WHY it applies to THESE facts — [VERIFIED / EXISTS — HOLDING UNVERIFIED / UNVERIFIED — DO NOT FILE UNTIL CONFIRMED / STRIKE]
Preferred canon (use when truly on-point, do not spray): Troxel v. Granville, 530 U.S. 57 (2000); Santosky v. Kramer, 455 U.S. 745 (1982); Stanley v. Illinois, 405 U.S. 645 (1972); Walsh v. Erie County Dept. of Job & Family Servs., 240 F. Supp. 2d 731 (N.D. Ohio 2003) and circuit progeny on warrantless child seizures — only if facts match; Tenenbaum / Doe / Brokaw / Wallis line on removal vs. investigation — match circuit; Tennessee v. Garner / Graham v. Connor only if force facts exist; Monell v. Dep't of Soc. Servs., 436 U.S. 658 (1978) only if policy/custom facts exist; Olmstead / ADA Title II regs 28 C.F.R. pt. 35 if disability facts exist. State supreme court parental-rights and emergency-removal cases for the LOCKED state first.

ADA MODULE (always run if any disability, PTSD, mobility, ASD, cognitive, or communication fact exists): identify disabled person (parent or child); reasonable modification requested or obvious; agency knowledge; deliberate indifference evidence; remedy: accommodation order, services in home, injunction, damages theory, §504 parallel.

ANTI-PATTERNS (never do these)
- Do not tell the parent to refuse all contact in a way that creates a new "noncompliance" count without explaining the record risk.
- Do not draft a criminal complaint as if it were already charged.
- Do not claim trafficking as fact unless the record supports a specific statutory theory.
- Do not flood with 45 strategies. Prioritize.
- Do not write "this is not legal advice" theater. Write accurate, verified, usable work product and mark uncertainty.
- Do not mix states. A Maine petition does not get California WIC cites.

QUALITY BAR — a response is a failure if it: cites a case that does not exist; treats an allegation as an adjudicated fact; ignores the locked jurisdiction; produces a draft missing parties, dates, or a prayer; gives no next action with a clock.
When uncertain, say exactly what fact or source is missing and the cheapest way to get it (FOIA request language, records demand, hearing question).

Begin every case analysis with one cold sentence:
"We are going on offense — here is what the record actually gives us and how we use it."
"""

CITE_GUARD_PROMPT = """CITE-GUARD SOURCE LOCK
Verified law library = the VERIFIED LAW LIBRARY list below + user-uploaded court documents in this case + CourtListener hits.
After you draft, extract every authority into a Citation Log. Tag each: VERIFIED | EXISTS — HOLDING UNVERIFIED | UNVERIFIED — DO NOT FILE UNTIL CONFIRMED | STRIKE.
A CourtListener hit proves the case exists. It does not prove your holding sentence. Pin the holding to library card text or an opinion quote, or use EXISTS — HOLDING UNVERIFIED.
Statutes verify only against the library or uploaded official text for the LOCKED jurisdiction.
If (UNVERIFIED + STRIKE) / total > 0.30, the first line of your response must be: "Analysis is not release-grade. Do not file."
Do not show STRIKE cites in the body. Show them only in the log as removed.
The system independently re-verifies every citation you emit; anything not in the library or CourtListener is flagged in red to the user.
"""

STRUCTURED_GUIDANCE = """STRUCTURED OUTPUT DIRECTIVE: The mission rules above govern your reasoning, but this tool requires a strict structured format. Put the cold opener and any [UNVERIFIED] flags inside the appropriate narrative/summary/disclaimer fields. Return only the required structure.
"""

TIER_MODE = {
    "free": "PARENT", "essential": "PARENT", "professional": "ADVOCATE",
    "attorney": "ATTORNEY", "enterprise": "ATTORNEY", "admin": "ATTORNEY",
}


def mode_directive(tier: Optional[str] = None, mode: Optional[str] = None) -> str:
    locked = (mode or "").upper() if mode else TIER_MODE.get((tier or "").lower())
    if locked:
        return f"MODE LOCK: {locked}. The user may override by stating another mode explicitly.\n"
    return "MODE LOCK: detect from context; default PARENT if unclear.\n"


# ---------------- Verified library index ----------------

_LIBRARY_CACHE: Dict[str, Any] = {}

REPORTERS = (
    r"U\.\s?S\.|S\.\s?Ct\.|L\.\s?Ed\.\s?2d|F\.\s?(?:2d|3d|4th)|F\.\s?Supp\.(?:\s?[23]d)?|F(?:ed)?\.\s?App'?x\.?|"
    r"So\.\s?(?:2d|3d)?|P\.\s?(?:2d|3d)?|N\.\s?E\.\s?(?:2d|3d)?|N\.\s?W\.\s?(?:2d|3d)?|S\.\s?E\.\s?(?:2d|3d)?|S\.\s?W\.\s?(?:2d|3d)?|"
    r"A\.\s?(?:2d|3d)?|Cal\.\s?(?:Rptr\.\s?)?(?:2d|3d|4th|5th)?|N\.\s?Y\.\s?S\.\s?(?:2d|3d)|N\.\s?Y\.\s?(?:2d|3d)?|Wn\.\s?(?:2d|App\.)|"
    r"Wash\.\s?(?:2d|App\.)|Ill\.\s?(?:2d|App\.\s?3d)|Ohio\s?St\.\s?3d|Mass\.(?:\s?App\.\s?Ct\.)?|Wis\.\s?2d|Mich\.(?:\s?App\.)?|WL|"
    r"Tex\.(?:\s?App\.)?|Ga\.(?:\s?App\.)?|Fla\.(?:\s?L\.\s?Weekly)?|Ala\.|Tenn\.|Ky\.|Colo\.|Ariz\.|Nev\.|Or\.|Idaho|Minn\.|Md\.|N\.\s?J\.|Conn\.|Pa\."
)
_PARTY = r"(?:In re |Ex parte |Matter of |Estate of )?[A-Z][\w'’.&\-]*(?:\s+(?:of|the|de|for|and|&|ex rel\.|[A-Z][\w'’.&\-]*)){0,7}"
CASE_RE = re.compile(
    rf"(?P<name>(?P<p1>{_PARTY})\s+v\.\s+(?P<p2>{_PARTY}))"
    rf"(?:,?\s*(?P<vol>\d{{1,4}})\s+(?P<rep>{REPORTERS})\s+(?P<page>\d{{1,5}}))?"
    rf"(?:,?\s*(?:at\s+)?\d{{1,5}})?(?:\s*\((?P<paren>[^)]{{2,40}})\))?"
)
SPECIAL_RE = re.compile(
    rf"(?P<name>(?:Ex parte|In re|Matter of)\s+[A-Z][\w'’.&\-]*(?:\s+[A-Z][\w'’.&\-]*){{0,4}})"
    rf"(?:,?\s*(?P<vol>\d{{1,4}})\s+(?P<rep>{REPORTERS})\s+(?P<page>\d{{1,5}}))?(?:\s*\((?P<paren>[^)]{{2,40}})\))?"
)
STATUTE_RE = re.compile(
    r"\b(?:\d{1,2}\s+U\.\s?S\.\s?C\.(?:A\.)?\s*§+\s*[\dA-Za-z][\w\-\(\)\.]*(?:\s*(?:et seq\.|-\s?\d+))?"
    r"|\d{1,2}\s+C\.\s?F\.\s?R\.\s*(?:pt\.|Part|§+)\s*[\d\.]+"
    r"|(?:[A-Z][a-z]+\.?\s){1,4}(?:Code|Stat\.|Rev\.\s?Stat\.|Gen\.\s?Laws|Comp\.\s?Laws|Statutes?|Ann\.|Laws)(?:\s(?:Ann\.|ch\.|tit\.))?[\w\s.,]{0,25}§+\s*[\dA-Za-z][\w\.\-\(\)]*"
    r"|Fed\.\s?R\.\s?(?:Civ|Crim|Evid|App)\.\s?P\.\s?\d+[\w\(\)\.]*)"
)
STOP_WORDS = {"in", "re", "ex", "parte", "matter", "of", "the", "estate", "et", "al", "v", "vs"}


def _norm(s: str) -> str:
    s = (s or "").lower().replace("’", "'").replace("§§", "§")
    s = re.sub(r"[^a-z0-9§]+", "", s)
    return s


def _name_key(name: str) -> str:
    name = name.replace("’", "'")
    parts = re.split(r"\s+v(?:s)?\.?\s+", name, maxsplit=1)
    keys = []
    for part in parts:
        toks = [t for t in re.findall(r"[A-Za-z][\w'\-]*", part) if t.lower() not in STOP_WORDS and len(t) > 1]
        keys.append(toks[0].lower() if toks else "")
    if len(parts) == 1:
        toks = [t.lower() for t in re.findall(r"[A-Za-z][\w'\-]*", name) if t.lower() not in STOP_WORDS]
        return "|".join(toks[:2])
    return "|".join(keys)


def _reporter_key(vol: str, rep: str, page: str) -> str:
    return f"{vol}{_norm(rep)}{page}"


def _extract_reporter_from_text(cite: str) -> Optional[str]:
    m = re.search(rf"(\d{{1,4}})\s+({REPORTERS})\s+(\d{{1,5}})", cite or "")
    return _reporter_key(m.group(1), m.group(2), m.group(3)) if m else None


def _walk_strings(obj, out: List[str]):
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, dict):
        for v in obj.values():
            _walk_strings(v, out)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            _walk_strings(v, out)


CORE_FEDERAL_AUTHORITIES = [
    ("Civil action for deprivation of rights", "42 U.S.C. § 1983"),
    ("Conspiracy to interfere with civil rights", "42 U.S.C. § 1985"),
    ("Attorney's fees in civil rights actions", "42 U.S.C. § 1988"),
    ("Federal question jurisdiction", "28 U.S.C. § 1331"),
    ("Civil rights jurisdiction", "28 U.S.C. § 1343"),
    ("Supplemental jurisdiction", "28 U.S.C. § 1367"),
    ("Venue", "28 U.S.C. § 1391"),
    ("Unsworn declarations under penalty of perjury", "28 U.S.C. § 1746"),
    ("ADA Title II — public services", "42 U.S.C. §§ 12131-12134"),
    ("ADA Title II regulations", "28 C.F.R. pt. 35"),
    ("Rehabilitation Act § 504", "29 U.S.C. § 794"),
    ("Indian Child Welfare Act", "25 U.S.C. §§ 1901-1963"),
    ("Title IV-E foster care and adoption assistance", "42 U.S.C. §§ 670-679c"),
    ("Adoption and Safe Families Act reasonable efforts", "42 U.S.C. § 671(a)(15)"),
    ("Federal Rule of Civil Procedure 8 — pleading", "Fed. R. Civ. P. 8"),
    ("Federal Rule of Civil Procedure 11 — sanctions", "Fed. R. Civ. P. 11"),
    ("Federal Rule of Civil Procedure 12 — motions", "Fed. R. Civ. P. 12"),
    ("Federal Rule of Civil Procedure 65 — injunctions/TRO", "Fed. R. Civ. P. 65"),
]


def library_authorities() -> List[Dict[str, Any]]:
    if "auth" in _LIBRARY_CACHE:
        return _LIBRARY_CACHE["auth"]
    items: List[Dict[str, Any]] = []
    for name, cite in CORE_FEDERAL_AUTHORITIES:
        items.append({"name": name, "citation": cite, "holding": "", "source": "Core federal statutes/rules (well-established)", "kind": "statute"})

    def add(name, citation, holding, source, kind="case"):
        items.append({"name": name, "citation": citation, "holding": holding or "", "source": source, "kind": kind})

    for c in LK.SUPREME_COURT_CASES.values():
        add(c["citation"].split(",")[0], c["citation"], c.get("holding"), "Supreme Court library")
    for c in LK.CIRCUIT_COURT_CASES.values():
        add(c["citation"].split(",")[0], c["citation"], c.get("holding"), "Circuit Court library")
    for c in LK.CHILD_RELATED_COURT_RULINGS:
        add(c["citation"].split(",")[0], c["citation"], c.get("holding"), c.get("source", "Court rulings library"))
    for section in LK.USEFUL_CASE_LAW_INDEX.get("sections", []):
        for c in section.get("cases", []):
            add(c["name"], f"{c['name']}, {c.get('citation', '')}".strip(", "), c.get("note"), "Useful Case Law Index")
    for d in LK.COMPREHENSIVE_LEGAL_DOC_LIBRARY:
        add(d["title"], d["citation"], d.get("summary"), "Uploaded knowledge library", kind="document")
    for s in LK.FEDERAL_STATUTES.values():
        add(s.get("name", ""), s.get("citation", ""), "; ".join(s.get("requirements", [])[:2]), "Federal statutes library", kind="statute")
    for key in ("ADA_FEDERAL_LAW", "ADA_CASE_LAW", "CIVIL_GUARDIAN_ADA", "FALSE_CLAIMS_ACT"):
        blob = getattr(ADA, key, None)
        if isinstance(blob, dict):
            for v in blob.values():
                if isinstance(v, dict) and v.get("citation"):
                    add(v.get("name") or v.get("case") or v["citation"].split(",")[0], v["citation"], v.get("holding") or v.get("summary"), "ADA library",
                        kind="case" if " v. " in v["citation"] else "statute")
    _LIBRARY_CACHE["auth"] = items
    return items


def _library_haystack() -> str:
    if "hay" in _LIBRARY_CACHE:
        return _LIBRARY_CACHE["hay"]
    strings: List[str] = []
    for attr in ("SUPREME_COURT_CASES", "CIRCUIT_COURT_CASES", "CHILD_RELATED_COURT_RULINGS", "ROOKER_FELDMAN",
                 "CONSTITUTIONAL_RIGHTS", "VIOLATION_ANALYSIS", "SECTION_1983", "FEDERAL_STATUTES",
                 "USEFUL_CASE_LAW_INDEX", "COMPREHENSIVE_LEGAL_DOC_LIBRARY"):
        _walk_strings(getattr(LK, attr, None), strings)
    for attr in dir(ADA):
        if attr.isupper():
            _walk_strings(getattr(ADA, attr), strings)
    strings.extend(c for _, c in CORE_FEDERAL_AUTHORITIES)
    try:
        from routes.courtlistener_routes import STATE_CPS_DATABASE
        _walk_strings(STATE_CPS_DATABASE, strings)
    except Exception:
        pass
    for d in LK.COMPREHENSIVE_LEGAL_DOC_LIBRARY:
        try:
            strings.append(LK._load_knowledge_text(d["source_file"]))
        except Exception:
            pass
    _LIBRARY_CACHE["hay"] = _norm(" ".join(strings))
    return _LIBRARY_CACHE["hay"]


def _library_indexes():
    if "idx" in _LIBRARY_CACHE:
        return _LIBRARY_CACHE["idx"]
    names, reporters = {}, {}
    for a in library_authorities():
        if a["kind"] in ("case", "document"):
            names[_name_key(a["name"])] = a
            rk = _extract_reporter_from_text(a["citation"])
            if rk:
                reporters[rk] = a
    _LIBRARY_CACHE["idx"] = (names, reporters)
    return _LIBRARY_CACHE["idx"]


def verified_library_block(max_items: int = 400) -> str:
    lines = []
    for a in library_authorities()[:max_items]:
        lines.append(f"- {a['citation']}" + (f" — {a['holding'][:140]}" if a["holding"] else ""))
    return "VERIFIED LAW LIBRARY (only these may be tagged VERIFIED unless found in this case's uploaded documents or a CourtListener hit):\n" + "\n".join(lines)


def build_identity(tier: Optional[str] = None, mode: Optional[str] = None, structured: bool = False, include_library: bool = True) -> str:
    parts = [MISSION_PROMPT, CITE_GUARD_PROMPT, mode_directive(tier, mode)]
    if include_library:
        parts.append(verified_library_block())
    if structured:
        parts.append(STRUCTURED_GUIDANCE)
    return "\n".join(parts)


PUNISHER_IDENTITY = build_identity()
PUNISHER_STRUCTURED_IDENTITY = build_identity(structured=True, include_library=False)
COLD_OPENER = "We are going on offense — here is what the record actually gives us and how we use it."


# ---------------- Citation extraction + verification ----------------

def extract_citations(text: str) -> List[Dict[str, Any]]:
    found: Dict[str, Dict[str, Any]] = {}
    if not text:
        return []
    for m in list(CASE_RE.finditer(text)) + list(SPECIAL_RE.finditer(text)):
        name = re.sub(r"\s+", " ", m.group("name")).strip(" ,")
        name = re.sub(r"^(?:Under|See|See also|In|Citing|Compare|Accord|Cf\.|But|And|Also|Per|Following|Applying|Unlike|Like)\s+", "", name)
        if len(name) < 5 or len(name) > 160:
            continue
        p1 = m.groupdict().get("p1")
        if p1 and p1.strip().lower() in ("the", "see", "cf", "but", "and", "or"):
            continue
        key = _name_key(name)
        if not key or key.startswith("|") or key.endswith("|"):
            continue
        rk = _reporter_key(m.group("vol"), m.group("rep"), m.group("page")) if m.group("vol") else None
        raw = re.sub(r"^(?:Under|See|See also|In|Citing|Compare|Accord|Cf\.|But|And|Also|Per|Following|Applying|Unlike|Like)\s+", "", m.group(0).strip(" ,"))
        entry = found.get(key)
        if entry and (entry.get("reporter_key") or not rk):
            continue
        found[key] = {
            "raw": raw, "name": name, "kind": "case", "key": key,
            "reporter_key": rk, "reporter_cite": f"{m.group('vol')} {m.group('rep')} {m.group('page')}" if rk else None,
            "paren": m.group("paren"),
        }
    for m in STATUTE_RE.finditer(text):
        raw = re.sub(r"\s+", " ", m.group(0)).strip(" ,.;")
        while raw.endswith(")") and raw.count(")") > raw.count("("):
            raw = raw[:-1]
        key = "stat:" + _norm(raw)
        if key not in found:
            found[key] = {"raw": raw, "name": raw, "kind": "statute", "key": key, "reporter_key": None, "reporter_cite": None, "paren": None}
    return list(found.values())


def _usc_in_library_range(raw: str, hay_items: List[Dict[str, Any]]) -> bool:
    m = re.match(r"(\d{1,2})\s+U\.\s?S\.\s?C\.(?:A\.)?\s*§+\s*(\d+)", raw)
    if not m:
        return False
    title, sec = m.group(1), int(m.group(2))
    for a in hay_items:
        if a["kind"] != "statute":
            continue
        for rm in re.finditer(r"(\d{1,2})\s+U\.S\.C\.\s*§+\s*(\d+)[a-z]?(?:\s*-\s*(\d+))?", a["citation"]):
            if rm.group(1) == title:
                lo, hi = int(rm.group(2)), int(rm.group(3) or rm.group(2))
                if lo <= sec <= hi:
                    return True
    return False


async def _courtlistener_lookup(client: httpx.AsyncClient, entry: Dict[str, Any]) -> Optional[str]:
    """Returns 'hit' | 'miss' | 'mismatch' (reporter cite belongs to another case) | None (unavailable)."""
    headers = {"User-Agent": "CPS-Punisher-CiteGuard/1.0"}
    if COURTLISTENER_API_KEY:
        headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
    p1, _, p2 = entry["key"].partition("|")

    def name_matches(hits) -> bool:
        for hit in hits[:10]:
            cn = (hit.get("caseName") or "").lower()
            if p1 and p1 in cn and (not p2 or p2 in cn):
                return True
        return False

    try:
        mismatch = False
        if entry.get("reporter_cite"):
            r = await client.get("https://www.courtlistener.com/api/rest/v4/search/",
                                 params={"q": f'citation:("{entry["reporter_cite"]}")', "type": "o"}, headers=headers, timeout=8)
            if r.status_code != 200:
                return None
            hits = r.json().get("results", [])
            if name_matches(hits):
                return "hit"
            if hits:
                mismatch = True
        r = await client.get("https://www.courtlistener.com/api/rest/v4/search/",
                             params={"q": f'caseName:("{entry["name"]}")', "type": "o"}, headers=headers, timeout=8)
        if r.status_code != 200:
            return None
        if name_matches(r.json().get("results", [])):
            return "mismatch" if mismatch else "hit"
        return "mismatch" if mismatch else "miss"
    except Exception:
        return None


def _search_string(entry: Dict[str, Any]) -> str:
    if entry["kind"] == "statute":
        return f'"{entry["raw"]}" official code site OR Cornell LII'
    parts = [f'"{entry["name"]}"']
    if entry.get("reporter_cite"):
        parts.append(entry["reporter_cite"])
    return " ".join(parts) + " — Google Scholar / CourtListener / Westlaw / Lexis"


async def build_citation_log(
    text: str,
    uploaded_texts: Optional[List[str]] = None,
    check_courtlistener: bool = True,
    max_lookups: int = 12,
) -> Dict[str, Any]:
    entries = extract_citations(text)
    names_idx, reporters_idx = _library_indexes()
    hay = _library_haystack()
    upload_hay = _norm(" ".join(uploaded_texts or [])) if uploaded_texts else ""
    authorities = library_authorities()
    results: List[Dict[str, Any]] = []
    pending: List[Dict[str, Any]] = []

    for e in entries:
        status, source, holding = None, None, ""
        if e["kind"] == "case":
            lib = names_idx.get(e["key"]) or (reporters_idx.get(e["reporter_key"]) if e.get("reporter_key") else None)
            if lib:
                status, source, holding = "VERIFIED", lib["source"], lib.get("holding", "")
            elif e.get("reporter_key") and e["reporter_key"] in hay:
                status, source = "VERIFIED", "Law library text"
            elif upload_hay and (_norm(e["name"]) in upload_hay or (e.get("reporter_key") and e["reporter_key"] in upload_hay)):
                status, source = "VERIFIED", "Uploaded case document"
        else:
            n = _norm(e["raw"])
            sec = re.search(r"§+\s*([\dA-Za-z][\w\.\-\(\)]*)", e["raw"])
            sec_key = "§" + _norm(sec.group(1)) if sec else None
            if n in hay or (upload_hay and n in upload_hay) or _usc_in_library_range(e["raw"], authorities):
                status, source = "VERIFIED", "Law library statute text"
            elif re.match(r"Fed\. ?R\. ?(Civ|Crim|Evid|App)\. ?P\. ?(\d+)", e["raw"]) and _norm(re.match(r"Fed\. ?R\. ?(?:Civ|Crim|Evid|App)\. ?P\. ?\d+", e["raw"]).group(0)) in hay:
                status, source = "VERIFIED", "Federal Rules (core library)"
            elif sec_key and not e["raw"].startswith(("42 U", "28 C", "20 U", "18 U", "25 U", "29 U")) and sec_key in hay:
                status, source = "VERIFIED", "State law library (section listed for jurisdiction)"
            else:
                status, source = "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED", "Not found in library or uploaded official text for locked jurisdiction"
        row = {**e, "status": status, "source": source, "holding": holding, "search_string": _search_string(e)}
        results.append(row)
        if status is None:
            pending.append(row)

    if check_courtlistener and pending:
        async with httpx.AsyncClient() as client:
            sem = asyncio.Semaphore(4)

            async def run(row):
                async with sem:
                    return await _courtlistener_lookup(client, row)

            outcomes = await asyncio.gather(*[run(r) for r in pending[:max_lookups]])
        for row, hit in zip(pending[:max_lookups], outcomes):
            if hit == "hit":
                row["status"], row["source"] = "EXISTS — HOLDING UNVERIFIED", "CourtListener hit — case exists; holding not pinned to library text"
            elif hit == "mismatch":
                row["status"], row["source"] = "STRIKE", "Reporter citation belongs to a different case on CourtListener — citation is wrong or fabricated"
            elif hit == "miss" and row.get("reporter_key"):
                row["status"], row["source"] = "STRIKE", "No CourtListener match for name or reporter citation — treat as fabricated"
            elif hit == "miss":
                row["status"], row["source"] = "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED", "No CourtListener match by name"
            else:
                row["status"], row["source"] = "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED", "CourtListener unavailable — confirm manually"
    for row in results:
        if row["status"] is None:
            row["status"], row["source"] = "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED", "Not in library; CourtListener check skipped"
        row.pop("key", None)
        row.pop("reporter_key", None)

    counts = {"VERIFIED": 0, "EXISTS": 0, "UNVERIFIED": 0, "STRIKE": 0}
    for row in results:
        counts[row["status"].split(" ")[0]] += 1
    total = len(results)
    ratio = ((counts["UNVERIFIED"] + counts["STRIKE"]) / total) if total else 0.0
    release_grade = ratio <= 0.30
    sanitized = text or ""
    verified_only = text or ""
    for row in results:
        if row["status"] == "STRIKE":
            sanitized = sanitized.replace(row["raw"], "[STRIKE — citation removed; see Citation Log]")
        if row["status"] != "VERIFIED":
            verified_only = verified_only.replace(row["raw"], "[UNVERIFIED AUTHORITY REMOVED — confirm before filing]")
    return {
        "entries": results,
        "counts": counts,
        "total": total,
        "unverified_ratio": round(ratio, 3),
        "release_grade": release_grade,
        "headline": None if release_grade else "Analysis is not release-grade. Do not file.",
        "sanitized_text": sanitized,
        "verified_only_text": verified_only,
    }


async def case_uploaded_texts(db, case_id: Optional[str], user_id: str, max_docs: int = 40) -> List[str]:
    if not case_id or db is None:
        return []
    texts = []
    async for d in db.documents.find({"case_id": case_id, "user_id": user_id}, {"content": 1, "extracted_text": 1}).limit(max_docs):
        t = d.get("content") or d.get("extracted_text")
        if isinstance(t, str) and t:
            texts.append(t[:200000])
    return texts


async def citation_log_for(db, text: str, case_id: Optional[str], user_id: str, check_courtlistener: bool = True) -> Dict[str, Any]:
    try:
        uploads = await case_uploaded_texts(db, case_id, user_id)
        return await build_citation_log(text, uploads, check_courtlistener=check_courtlistener)
    except Exception as exc:
        return {"entries": [], "counts": {}, "total": 0, "unverified_ratio": 0, "release_grade": False,
                "headline": f"Citation log unavailable ({exc}). Do not file until citations are confirmed.",
                "sanitized_text": text, "verified_only_text": text, "error": str(exc)}


def log_to_markdown(log: Dict[str, Any]) -> str:
    if not log or not log.get("entries"):
        return "\n\nCITATION LOG: no authorities detected."
    lines = ["\n\nCITATION LOG (Cite-Guard)"]
    if log.get("headline"):
        lines.append(f"** {log['headline']} **")
    for e in log["entries"]:
        lines.append(f"- [{e['status']}] {e['raw']} — {e['source']}")
    return "\n".join(lines)
