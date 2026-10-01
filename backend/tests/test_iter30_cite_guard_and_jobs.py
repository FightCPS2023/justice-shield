"""Iteration 30: Cite-Guard + AI jobs system + export gate + lawsuit architect + porch mode."""
import os
import time
import json
import uuid
import pytest
import requests

def _load_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        env_path = "/app/frontend/.env"
        if os.path.exists(env_path):
            with open(env_path) as fh:
                for line in fh:
                    if line.startswith("REACT_APP_BACKEND_URL="):
                        url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    assert url, "REACT_APP_BACKEND_URL not set"
    return url.rstrip("/")

BASE_URL = _load_backend_url()
EMAIL = "cpsvhuntingjustice@gmail.com"
PASSWORD = "cpssuxass"
CASE_ID = "d219e704-b704-4019-b9eb-128977b4aaa0"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
    return s


# ---------------- CITATIONS: /api/citations/log ----------------

def test_citations_log_mixed_statuses(session):
    text = (
        "In Troxel v. Granville, 530 U.S. 57 (2000) parental rights are fundamental. "
        "See also Kovacic v. Cuyahoga County Department of Children and Family Services, 606 F.3d 301 (6th Cir. 2010). "
        "Compare Bogus v. Nowhere, 123 F.3d 456 (5th Cir. 1999). "
        "Cf. Fictional v. Madeup. "
        "Claims arise under 42 U.S.C. § 1983 with jurisdiction under 28 U.S.C. § 1331. "
        "Tex. Fam. Code § 262.201 requires an adversarial hearing. "
        "See also Fed. R. Civ. P. 65(b)."
    )
    r = session.post(f"{BASE_URL}/api/citations/log", json={"text": text, "check_courtlistener": True}, timeout=60)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    print("STATUSES:", [(e["raw"][:60], e["status"]) for e in data["entries"]])
    assert data["total"] >= 6
    counts = data["counts"]
    # At least Troxel + the 4 statute/rules → VERIFIED (>=4)
    assert counts.get("VERIFIED", 0) >= 4, f"expected at least 4 VERIFIED, got {counts}"

    by_raw = {e["raw"]: e for e in data["entries"]}

    def find(sub):
        for raw, e in by_raw.items():
            if sub.lower() in raw.lower():
                return e
        return None

    troxel = find("Troxel")
    assert troxel and troxel["status"] == "VERIFIED"

    for stat in ["1983", "1331", "262.201", "65(b)"]:
        e = find(stat)
        assert e and e["status"] == "VERIFIED", f"{stat} not VERIFIED: {e}"

    fictional = find("Fictional")
    assert fictional and fictional["status"].startswith(("UNVERIFIED", "STRIKE"))

    # Bogus — CourtListener may return mismatch (STRIKE) or miss (STRIKE) or unavailable (UNVERIFIED)
    bogus = find("Bogus")
    assert bogus, "Bogus v. Nowhere not extracted"
    assert bogus["status"] in ("STRIKE", "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED"), f"Bogus status: {bogus['status']}"

    # Kovacic — real case, CourtListener should return hit → EXISTS or VERIFIED
    kovacic = find("Kovacic")
    assert kovacic, "Kovacic not extracted"
    assert kovacic["status"] in ("VERIFIED", "EXISTS — HOLDING UNVERIFIED", "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED"), f"Kovacic: {kovacic['status']}"

    # Sanitization: STRIKE cites replaced in sanitized_text
    strikes = [e for e in data["entries"] if e["status"] == "STRIKE"]
    for s in strikes:
        assert s["raw"] not in data["sanitized_text"], f"STRIKE still in sanitized_text: {s['raw']}"
        assert "[STRIKE — citation removed" in data["sanitized_text"]

    # verified_only_text replaces all non-VERIFIED
    for e in data["entries"]:
        if e["status"] != "VERIFIED":
            assert e["raw"] not in data["verified_only_text"], f"non-VERIFIED leaked: {e['raw']}"

    # headline + release_grade are consistent
    if data["unverified_ratio"] > 0.30:
        assert data["release_grade"] is False
        assert data["headline"] and "release-grade" in data["headline"]
    else:
        assert data["release_grade"] is True
        assert data["headline"] is None


def test_citations_library(session):
    r = session.get(f"{BASE_URL}/api/citations/library", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] > 120, f"library only has {data['total']} authorities"
    assert isinstance(data["authorities"], list)
    assert all("citation" in a for a in data["authorities"][:5])


# ---------------- JOBS SYSTEM ----------------

def _wait_for_job(session, job_id, max_wait=240, poll_every=5):
    deadline = time.time() + max_wait
    while time.time() < deadline:
        t0 = time.time()
        r = session.get(f"{BASE_URL}/api/ai/jobs/{job_id}", timeout=15)
        elapsed_poll = time.time() - t0
        assert r.status_code == 200, f"poll failed: {r.status_code} {r.text[:200]}"
        assert elapsed_poll < 5, f"poll took {elapsed_poll}s — event loop blocked"
        data = r.json()
        if data.get("status") in ("complete", "error"):
            return data
        time.sleep(poll_every)
    pytest.fail(f"job {job_id} did not complete within {max_wait}s")


def test_jobs_unknown_target_404(session):
    r = session.post(f"{BASE_URL}/api/ai/jobs/unknown-target", json={}, timeout=15)
    assert r.status_code == 404


def test_jobs_random_uuid_404(session):
    r = session.get(f"{BASE_URL}/api/ai/jobs/{uuid.uuid4()}", timeout=15)
    assert r.status_code == 404


def test_job_smart_research(session):
    r = session.post(f"{BASE_URL}/api/ai/jobs/smart-research",
                     json={"query": "warrantless entry into home by caseworker", "state": "TX", "research_type": "statutes"},
                     timeout=15)
    assert r.status_code == 200
    job_id = r.json()["job_id"]
    assert r.json()["status"] == "running"

    data = _wait_for_job(session, job_id, max_wait=240)
    if data["status"] == "error":
        pytest.skip(f"LLM error (budget/upstream): {data.get('error', '')[:200]}")
    assert data["status"] == "complete"
    result = data.get("result") or {}
    # ai_routes returns dict with 'results' field or similar
    rr = result.get("results") or result.get("content") or ""
    if isinstance(rr, dict):
        rr = json.dumps(rr)
    assert "offense" in rr.lower() or "release-grade" in rr.lower(), f"missing MISSION opener: {rr[:300]}"
    assert "citation_log" in result
    cl = result["citation_log"]
    assert "counts" in cl


def test_job_smart_document(session):
    r = session.post(f"{BASE_URL}/api/ai/jobs/smart-document",
                     json={"prompt": "Draft a short motion to dismiss for lack of particularized facts", "state": "AL", "case_id": CASE_ID},
                     timeout=15)
    assert r.status_code == 200
    job_id = r.json()["job_id"]
    data = _wait_for_job(session, job_id, max_wait=240)
    if data["status"] == "error":
        pytest.skip(f"LLM error: {data.get('error', '')[:200]}")
    assert data["status"] == "complete"
    result = data["result"]
    assert result.get("document") or result.get("content"), "no document in result"
    assert "citation_log" in result


def test_job_section_1983(session):
    r = session.post(f"{BASE_URL}/api/ai/jobs/section-1983",
                     json={"case_id": CASE_ID, "defendants": [{"name": "Jane Caseworker"}],
                           "constitutional_violations": ["fourth_amendment"], "relief_sought": ["damages"]},
                     timeout=15)
    assert r.status_code == 200, r.text[:300]
    job_id = r.json()["job_id"]
    data = _wait_for_job(session, job_id, max_wait=240)
    if data["status"] == "error":
        pytest.skip(f"LLM/tier error: {data.get('error', '')[:200]}")
    assert data["status"] == "complete"
    result = data["result"]
    assert result.get("complaint") or result.get("complaint_text") or result.get("document")
    assert "citation_log" in result


# ---------------- LAWSUIT ARCHITECT ----------------

def test_lawsuit_architect_generate(session):
    payload = {
        "plaintiff": {"name": "John Parent", "address": "123 Main St", "city": "Austin", "state": "TX", "zip": "78701"},
        "defendant": {"name": "Jane Caseworker", "title": "Investigator", "employer": "DFPS"},
        "agency": {"name": "DFPS", "state": "TX"},
        "incident": {"date": "2024-01-15", "location": "123 Main St, Austin, TX"},
        "violations": [{
            "matched_phrase": "warrantless entry",
            "amendments": ["Fourth"],
            "legal_citations": ["Troxel v. Granville, 530 U.S. 57 (2000)",
                                "Fake v. Nobody, 999 F.3d 1 (1st Cir. 2099)"],
            "description": "Entered home without warrant or exigent circumstances."
        }],
        "output_format": "markdown"
    }
    r = session.post(f"{BASE_URL}/api/lawsuit-architect/generate", json=payload, timeout=90)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    doc = data["generated_document"]
    for section in ["AUTHORITIES CITED", "VERIFICATION", "CERTIFICATE OF SERVICE", "EXHIBIT LIST", "LAYER B"]:
        assert section in doc, f"missing section {section}"
    cl = data["citation_log"]
    assert "counts" in cl
    # Fake case should be STRIKE or UNVERIFIED
    fake_entry = next((e for e in cl["entries"] if "Fake" in e["raw"] or "Nobody" in e["raw"]), None)
    assert fake_entry, "Fake citation not extracted"
    assert fake_entry["status"] in ("STRIKE", "UNVERIFIED — DO NOT FILE UNTIL CONFIRMED")


# ---------------- PORCH MODE ----------------

def test_porch_mode_analyze(session):
    r = session.post(f"{BASE_URL}/api/porch-mode/analyze",
                     json={"transcription": "Open the door now or we take the kids, we do not need a warrant"},
                     timeout=30)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    assert "citation_log" in data
    # Must have detections
    detections = data.get("detections") or data.get("violations") or data.get("flags") or []
    assert detections, f"no detections returned: {data}"


# ---------------- EXPORT GATE ----------------

def test_export_pdf_gate_blocks_unverified(session):
    bad_text = ("See Troxel v. Granville, 530 U.S. 57 (2000) and Fake v. Nobody, 999 F.3d 1 (1st Cir. 2099) "
                "and Nonexistent v. Fiction, 111 F.3d 222 (9th Cir. 1999).")
    r = session.post(
        f"{BASE_URL}/api/export/case/{CASE_ID}/documents/pdf",
        json={"template_text": bad_text, "verified_only": False, "include_analysis": False},
        timeout=60,
    )
    # Allow 404 (no documents for case) or 422 (release-grade gate). We want to assert gate works when 422:
    if r.status_code == 404:
        pytest.skip("Case has no documents to export; gate indirectly tested through verified-only test.")
    assert r.status_code == 422, f"gate did not fire: {r.status_code} {r.text[:300]}"
    assert "release-grade" in r.text.lower()


def test_export_pdf_verified_only_passes(session):
    bad_text = ("See Troxel v. Granville, 530 U.S. 57 (2000) and Fake v. Nobody, 999 F.3d 1 (1st Cir. 2099).")
    r = session.post(
        f"{BASE_URL}/api/export/case/{CASE_ID}/documents/pdf",
        json={"template_text": bad_text, "verified_only": True, "include_analysis": False},
        timeout=60,
    )
    if r.status_code == 404:
        pytest.skip("Case has no documents")
    assert r.status_code == 200, r.text[:300]
    assert r.headers.get("content-type", "").startswith("application/pdf")


def test_export_pdf_only_verified_passes_without_flag(session):
    good_text = "See Troxel v. Granville, 530 U.S. 57 (2000) and 42 U.S.C. § 1983."
    r = session.post(
        f"{BASE_URL}/api/export/case/{CASE_ID}/documents/pdf",
        json={"template_text": good_text, "verified_only": False, "include_analysis": False},
        timeout=60,
    )
    if r.status_code == 404:
        pytest.skip("Case has no documents")
    assert r.status_code == 200, r.text[:300]


def test_export_docx_verified_only(session):
    bad_text = "See Troxel v. Granville, 530 U.S. 57 (2000) and Fake v. Nobody, 999 F.3d 1 (1st Cir. 2099)."
    r = session.post(
        f"{BASE_URL}/api/export/case/{CASE_ID}/documents/docx",
        json={"template_text": bad_text, "verified_only": True, "include_analysis": False},
        timeout=60,
    )
    if r.status_code == 404:
        pytest.skip("Case has no documents")
    assert r.status_code == 200


def test_export_preparation_kit_verified_only(session):
    bad_text = "Troxel v. Granville, 530 U.S. 57 (2000); Fake v. Nobody, 999 F.3d 1 (1st Cir. 2099)."
    r = session.post(
        f"{BASE_URL}/api/export/case/{CASE_ID}/preparation-kit/pdf",
        json={"template_text": bad_text, "verified_only": True},
        timeout=60,
    )
    assert r.status_code == 200, r.text[:300]


# ---------------- REGRESSION ----------------

def test_regression_violations(session):
    r = session.get(f"{BASE_URL}/api/violations/{CASE_ID}", timeout=15)
    assert r.status_code == 200


def test_regression_calendar(session):
    r = session.get(f"{BASE_URL}/api/calendar/upcoming/30", timeout=15)
    assert r.status_code == 200


def test_regression_notepad(session):
    r = session.get(f"{BASE_URL}/api/notepad", timeout=15)
    assert r.status_code == 200


def test_regression_supreme_court(session):
    r = session.get(f"{BASE_URL}/api/legal/supreme-court-cases", timeout=15)
    assert r.status_code == 200
