"""Iteration 29: regression sweep for 12 restored routers + lint-fix imports.
Uses cookie session auth via login. AI 402 responses are acceptable; 404/500 are bugs.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://justice-shield-6.preview.emergentagent.com").rstrip("/")
EMAIL = "cpsvhuntingjustice@gmail.com"
PASSWORD = "cpssuxass"
CASE_ID = "d219e704-b704-4019-b9eb-128977b4aaa0"
FAKE_CASE_ID = "00000000-0000-0000-0000-000000000000"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    if token:
        sess.headers.update({"Authorization": f"Bearer {token}"})
    return sess


def _ok(r, allow=(200, 201)):
    assert r.status_code in allow, f"{r.request.method} {r.request.url} -> {r.status_code} {r.text[:200]}"


# ---------- Core ----------
def test_health(s):
    r = s.get(f"{BASE_URL}/api/health", timeout=10)
    _ok(r)

def test_auth_me(s):
    r = s.get(f"{BASE_URL}/api/auth/me", timeout=10)
    _ok(r)
    assert r.json().get("email") == EMAIL

def test_cases_list(s):
    r = s.get(f"{BASE_URL}/api/cases", timeout=10)
    _ok(r)
    body = r.json()
    assert isinstance(body, (list, dict))

def test_documents_by_case(s):
    r = s.get(f"{BASE_URL}/api/documents/{CASE_ID}", timeout=15)
    _ok(r)


# ---------- Case data CRUD (case_data_routes) ----------
def test_violations_types(s):
    r = s.get(f"{BASE_URL}/api/violations/types", timeout=10)
    _ok(r)

def test_case_data_crud_flow(s):
    # Violation
    v = s.post(f"{BASE_URL}/api/violations", json={
        "case_id": CASE_ID, "violation_type": "Fourth Amendment",
        "description": "TEST regression", "severity": "high", "date_occurred": "2024-01-01"
    }, timeout=15)
    _ok(v, allow=(200, 201))
    vid = v.json().get("id")
    lst = s.get(f"{BASE_URL}/api/violations/{CASE_ID}", timeout=10)
    _ok(lst)
    if vid:
        d = s.delete(f"{BASE_URL}/api/violations/{vid}", timeout=10)
        assert d.status_code in (200, 204)

    # Timeline
    t = s.post(f"{BASE_URL}/api/timeline", json={
        "case_id": CASE_ID, "date": "2024-01-02", "event_type": "hearing",
        "title": "TEST evt", "description": "TEST"
    }, timeout=15)
    _ok(t)
    _ok(s.get(f"{BASE_URL}/api/timeline/{CASE_ID}", timeout=10))

    # Evidence
    e = s.post(f"{BASE_URL}/api/evidence", json={
        "case_id": CASE_ID, "evidence_type": "document", "title": "TEST evidence", "description": "TEST"
    }, timeout=15)
    _ok(e)
    _ok(s.get(f"{BASE_URL}/api/evidence/{CASE_ID}", timeout=10))

    # Communications
    c = s.post(f"{BASE_URL}/api/communications", json={
        "case_id": CASE_ID, "contact_type": "email", "contact_with": "CPS worker",
        "date": "2024-01-03", "summary": "TEST"
    }, timeout=15)
    _ok(c)
    _ok(s.get(f"{BASE_URL}/api/communications/{CASE_ID}", timeout=10))

    # Services
    sv = s.post(f"{BASE_URL}/api/services", json={
        "case_id": CASE_ID, "service_type": "parenting class", "provider": "TEST", "status": "in_progress"
    }, timeout=15)
    _ok(sv)
    _ok(s.get(f"{BASE_URL}/api/services/{CASE_ID}", timeout=10))

    # Court filings
    cf = s.post(f"{BASE_URL}/api/court-filings", json={
        "case_id": CASE_ID, "filing_type": "motion", "title": "TEST motion"
    }, timeout=15)
    _ok(cf)
    _ok(s.get(f"{BASE_URL}/api/court-filings/{CASE_ID}", timeout=10))

    # Visitation
    vis = s.post(f"{BASE_URL}/api/visitation", json={
        "case_id": CASE_ID, "date": "2024-01-04", "duration": 60,
        "location": "TEST"
    }, timeout=15)
    _ok(vis)
    _ok(s.get(f"{BASE_URL}/api/visitation/{CASE_ID}", timeout=10))

    # Court hearings
    ht = s.get(f"{BASE_URL}/api/court-hearings/types", timeout=10)
    _ok(ht)
    ch = s.post(f"{BASE_URL}/api/court-hearings", json={
        "case_id": CASE_ID, "hearing_type": "review", "date": "2024-06-01",
        "location": "TEST court"
    }, timeout=15)
    _ok(ch)
    _ok(s.get(f"{BASE_URL}/api/court-hearings/{CASE_ID}", timeout=10))


def test_case_ownership_enforced(s):
    r = s.get(f"{BASE_URL}/api/violations/{FAKE_CASE_ID}", timeout=10)
    assert r.status_code in (403, 404), f"expected 403/404, got {r.status_code}"


# ---------- Calendar ----------
def test_calendar_crud(s):
    c = s.post(f"{BASE_URL}/api/calendar", json={
        "case_id": CASE_ID, "title": "TEST event", "event_type": "hearing",
        "event_date": "2024-12-01T10:00:00"
    }, timeout=15)
    _ok(c)
    eid = c.json().get("id")
    _ok(s.get(f"{BASE_URL}/api/calendar", timeout=10))
    _ok(s.get(f"{BASE_URL}/api/calendar/upcoming/7", timeout=10))
    if eid:
        d = s.delete(f"{BASE_URL}/api/calendar/{eid}", timeout=10)
        assert d.status_code in (200, 204)


# ---------- Legal library ----------
def test_legal_endpoints(s):
    for path in ["/api/legal/supreme-court-cases", "/api/legal/circuit-court-cases",
                 "/api/legal/blacks-law", "/api/legal/constitutional-rights",
                 "/api/legal/federal-statutes", "/api/legal/incident-types",
                 "/api/legal/section-1983-guide", "/api/legal/rooker-feldman",
                 "/api/evidence-checklist"]:
        _ok(s.get(f"{BASE_URL}{path}", timeout=10))

def test_evidence_checklist_case(s):
    payload = {"case_id": CASE_ID, "checked_items": ["item1", "item2"]}
    _ok(s.post(f"{BASE_URL}/api/evidence-checklist/{CASE_ID}", json=payload, timeout=15))
    r = s.get(f"{BASE_URL}/api/evidence-checklist/{CASE_ID}", timeout=10)
    _ok(r)


# ---------- Community ----------
def test_forum(s):
    _ok(s.get(f"{BASE_URL}/api/forum/posts", timeout=10))

def test_advocates(s):
    r = s.get(f"{BASE_URL}/api/advocates", timeout=10)
    _ok(r)

def test_notepad_crud(s):
    r = s.post(f"{BASE_URL}/api/notepad", json={
        "title": "TEST note", "content": "TEST content", "category": "general"
    }, timeout=15)
    _ok(r)
    nid = r.json().get("id")
    _ok(s.get(f"{BASE_URL}/api/notepad", timeout=10))
    if nid:
        u = s.put(f"{BASE_URL}/api/notepad/{nid}", json={"title": "TEST upd", "content": "x"}, timeout=15)
        assert u.status_code in (200, 204)
        d = s.delete(f"{BASE_URL}/api/notepad/{nid}", timeout=10)
        assert d.status_code in (200, 204)


# ---------- Case memory ----------
def test_case_memory_crud(s):
    r = s.post(f"{BASE_URL}/api/cases/{CASE_ID}/memory", json={
        "title": "TEST memory", "content": "TEST content body", "tags": ["test"]
    }, timeout=15)
    _ok(r)
    mid = r.json().get("id")
    _ok(s.get(f"{BASE_URL}/api/cases/{CASE_ID}/memory", timeout=10))
    if mid:
        d = s.delete(f"{BASE_URL}/api/cases/{CASE_ID}/memory/{mid}", timeout=10)
        assert d.status_code in (200, 204)


# ---------- CourtListener ----------
def test_courtlistener_endpoints(s):
    r = s.get(f"{BASE_URL}/api/law-library/states", timeout=15)
    assert r.status_code in (200, 402, 429, 502, 503), f"got {r.status_code}"
    r2 = s.get(f"{BASE_URL}/api/courtlistener/search?q=cps", timeout=25)
    assert r2.status_code in (200, 402, 429, 502, 503), f"got {r2.status_code} {r2.text[:200]}"


# ---------- Section 1983 / strategy / ADA / caselaw / podcast ----------
def test_section1983(s):
    _ok(s.get(f"{BASE_URL}/api/section-1983/templates", timeout=10))
    _ok(s.get(f"{BASE_URL}/api/section-1983/{CASE_ID}", timeout=10))

def test_ada(s):
    for p in ["/api/ada/federal-law", "/api/ada/case-law", "/api/ada/false-claims-act",
              "/api/ada/civil-guardian", "/api/ada/violations", "/api/ada/state/CA"]:
        r = s.get(f"{BASE_URL}{p}", timeout=15)
        assert r.status_code in (200, 402), f"{p} -> {r.status_code} {r.text[:200]}"

def test_ada_deep_search_no_nameerror(s):
    r = s.post(f"{BASE_URL}/api/courtlistener/deep-search",
               json={"query": "guardian ad litem", "case_id": CASE_ID}, timeout=30)
    # should NOT be 500 (NameError)
    assert r.status_code != 500, f"500 error: {r.text[:300]}"

def test_podcast(s):
    _ok(s.get(f"{BASE_URL}/api/podcast/topics", timeout=10))
    _ok(s.get(f"{BASE_URL}/api/podcast/scripts", timeout=10))

def test_strategy_saved(s):
    _ok(s.get(f"{BASE_URL}/api/strategy-builder/saved/{CASE_ID}", timeout=10))
    _ok(s.get(f"{BASE_URL}/api/argument-generator/saved/{CASE_ID}", timeout=10))


# ---------- Punisher engines regression ----------
def test_integrity_db_profile_no_objectid(s):
    r = s.post(f"{BASE_URL}/api/integrity-db/profiles", json={
        "name": "TEST Worker", "role": "cps_worker",
        "agency": "TEST", "state": "CA", "jurisdiction": "Test County"
    }, timeout=20)
    _ok(r)
    body = r.json()
    assert "_id" not in body
    _ok(s.get(f"{BASE_URL}/api/integrity-db/profiles", timeout=15))

def test_vault_seal(s):
    # Generate key first
    gk = s.post(f"{BASE_URL}/api/vault/generate-key", timeout=10)
    _ok(gk)
    key_b64 = gk.json().get("key_b64") or gk.json().get("key")
    assert key_b64, f"no key returned: {gk.text[:200]}"
    files = {"file": ("test.txt", b"TEST evidence content", "text/plain")}
    data = {"key_b64": key_b64}
    r = s.post(f"{BASE_URL}/api/vault/seal", files=files, data=data, timeout=20)
    _ok(r)
    body = r.json()
    assert "_id" not in body
    _ok(s.get(f"{BASE_URL}/api/vault/certificates", timeout=15))

def test_political_strike(s):
    _ok(s.get(f"{BASE_URL}/api/political-strike/contacts?state=CA", timeout=15))
    _ok(s.get(f"{BASE_URL}/api/political-strike/dossiers", timeout=15))
