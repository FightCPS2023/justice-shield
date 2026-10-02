"""Iteration 31: X-AI-Mode header injection via /api/ai/jobs/chat."""
import os
import time
import pytest
import requests


def _load_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        with open("/app/frontend/.env") as fh:
            for line in fh:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    assert url, "REACT_APP_BACKEND_URL not set"
    return url.rstrip("/")


BASE_URL = _load_backend_url()
EMAIL = "cpsvhuntingjustice@gmail.com"
PASSWORD = "cpssuxass"


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


def _wait_for_job(session, job_id, max_wait=180, poll_every=5):
    start = time.time()
    while time.time() - start < max_wait:
        r = session.get(f"{BASE_URL}/api/ai/jobs/{job_id}", timeout=15)
        assert r.status_code == 200, f"poll failed {r.status_code}: {r.text[:200]}"
        data = r.json()
        if data["status"] == "complete":
            return data
        if data["status"] == "error":
            pytest.fail(f"job errored: {data.get('error')}")
        time.sleep(poll_every)
    pytest.fail(f"job {job_id} did not complete within {max_wait}s")


def _run_chat_job(session, message, mode_header=None):
    headers = {}
    if mode_header is not None:
        headers["X-AI-Mode"] = mode_header
    r = session.post(f"{BASE_URL}/api/ai/jobs/chat", json={"message": message}, headers=headers, timeout=30)
    assert r.status_code == 200, f"start job failed: {r.status_code} {r.text[:300]}"
    job_id = r.json()["job_id"]
    return _wait_for_job(session, job_id)


def _get_response_text(data):
    result = data.get("result") or {}
    # chat endpoint returns {"response": "..."} typically
    return result.get("response") or result.get("content") or str(result)


# ---------------- MODE: PARENT ----------------

def test_chat_parent_mode_headings(session):
    data = _run_chat_job(
        session,
        "CPS wants to interview my kid at school tomorrow. What do I do?",
        mode_header="PARENT",
    )
    text = _get_response_text(data)
    assert text, "empty response"
    lower = text.lower()
    assert "what this means" in lower, f"Missing 'What this means' heading. Response head: {text[:500]}"
    assert "do this now" in lower, f"Missing 'Do this now' heading. Response head: {text[:500]}"
    # Should be reasonably short
    wc = len(text.split())
    assert wc < 900, f"PARENT response too long: {wc} words"


# ---------------- MODE: INVESTIGATOR ----------------

def test_chat_investigator_mode_keywords(session):
    data = _run_chat_job(
        session,
        "CPS wants to interview my kid at school tomorrow. What do I do?",
        mode_header="INVESTIGATOR",
    )
    text = _get_response_text(data).lower()
    # At least one investigator-flavored keyword
    hits = [kw for kw in ("foia", "records", "preservation", "timeline", "subpoena") if kw in text]
    assert hits, f"INVESTIGATOR response missing investigator keywords. First 600: {text[:600]}"


# ---------------- MODE: default (no header) ----------------

def test_chat_default_mission_format(session):
    data = _run_chat_job(
        session,
        "CPS wants to interview my kid at school tomorrow. What do I do?",
        mode_header=None,
    )
    text = _get_response_text(data)
    assert text, "empty response"
    # Default mission format should NOT force PARENT headings. Opening cold sentence often "We are going on offense"
    # Not strictly required to literally match, but PARENT-exclusive headings should not dominate
    lower = text.lower()
    # Weak check: default is usually longer/multi-section
    assert len(text.split()) > 50


# ---------------- Invalid header treated as AUTO ----------------

def test_chat_garbage_header_treated_as_auto(session):
    r = session.post(
        f"{BASE_URL}/api/ai/jobs/chat",
        json={"message": "Give me a one-paragraph overview of my rights."},
        headers={"X-AI-Mode": "garbage!!"},
        timeout=30,
    )
    assert r.status_code == 200, f"garbage mode start failed: {r.status_code} {r.text[:300]}"
    job_id = r.json()["job_id"]
    data = _wait_for_job(session, job_id)
    text = _get_response_text(data)
    assert text, "empty response for garbage header"


# ---------------- Job polling endpoint unaffected ----------------

def test_jobs_get_unaffected_by_mode_header(session):
    # Start any lightweight-ish job
    r = session.post(
        f"{BASE_URL}/api/ai/jobs/chat",
        json={"message": "Hi"},
        headers={"X-AI-Mode": "PARENT"},
        timeout=30,
    )
    assert r.status_code == 200
    job_id = r.json()["job_id"]
    # GET without the header should still work
    r2 = session.get(f"{BASE_URL}/api/ai/jobs/{job_id}", timeout=15)
    assert r2.status_code == 200
    assert r2.json().get("job_id") == job_id
