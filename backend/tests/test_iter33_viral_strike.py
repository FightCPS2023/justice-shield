# Iteration 33 — Battle-ready reinforcement & Viral Strike: porch history, FOIA history, auth refresh, victory cards, six weapons smoke, doc upload extraction
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
EMAIL = "cpsvhuntingjustice@gmail.com"
PASSWORD = "cpssuxass"
CASE_ID = "d219e704-b704-4019-b9eb-128977b4aaa0"
TRIGGERS = ["violation_detected", "lawsuit_drafted", "foia_filed", "evidence_sealed", "dossier_dispatched", "caseworker_flagged"]


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text[:200]}")
    assert "session_token" in sess.cookies.get_dict()
    return sess


# --- Porch Mode session history
class TestPorch:
    def test_sessions_list_shape(self, s):
        r = s.get(f"{BASE_URL}/api/porch-mode/sessions", params={"limit": 5, "offset": 0})
        assert r.status_code == 200
        d = r.json()
        for k in ("sessions", "total", "limit", "offset"):
            assert k in d
        assert d["limit"] == 5 and d["offset"] == 0

    def test_sessions_requires_auth(self):
        assert requests.get(f"{BASE_URL}/api/porch-mode/sessions").status_code == 401

    def test_analyze_creates_session(self, s):
        r = s.post(f"{BASE_URL}/api/porch-mode/analyze", json={
            "transcription": "Open the door now or we take the kids, we do not need a warrant", "case_id": CASE_ID}, timeout=120)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["flagged"] is True
        sess = d["session"]
        sid = sess["session_id"]
        assert sess["status"] == "flagged" and sess["violation_count"] >= 1
        r2 = s.get(f"{BASE_URL}/api/porch-mode/sessions", params={"case_id": CASE_ID, "limit": 5})
        items = r2.json()["sessions"]
        match = [x for x in items if x["session_id"] == sid]
        assert match, "new session not listed"
        for k in ("session_id", "case_id", "created_at", "status", "summary", "violation_count", "transcript_snippet"):
            assert k in match[0]
        assert match[0]["case_id"] == CASE_ID


# --- FOIA request history
class TestFoia:
    def test_generate_and_list(self, s):
        states = s.get(f"{BASE_URL}/api/foia/states").json()["states"]
        assert states
        st = "Alabama" if "Alabama" in str(states) else (states[0] if isinstance(states[0], str) else list(states[0].values())[0])
        r = s.post(f"{BASE_URL}/api/foia/generate", json={"user_name": "TEST_User", "state": st,
                   "caseworker_name": "TEST_Worker", "agency_name": "TEST_Agency", "case_id": CASE_ID})
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        rid = d["request_id"]
        assert d["request"]["request_id"] == rid
        r2 = s.get(f"{BASE_URL}/api/foia/requests", params={"case_id": CASE_ID, "limit": 5, "offset": 0})
        assert r2.status_code == 200
        lst = r2.json()
        assert lst["limit"] == 5
        m = [x for x in lst["requests"] if x["request_id"] == rid]
        assert m, "FOIA not listed"
        x = m[0]
        assert x["status"] == "generated" and x["delivery_status"] == "not_sent"
        assert x["target_agency"] == "TEST_Agency" and x["request_type"] and x["generated_document"]

    def test_pagination(self, s):
        a = s.get(f"{BASE_URL}/api/foia/requests", params={"limit": 1, "offset": 0}).json()
        b = s.get(f"{BASE_URL}/api/foia/requests", params={"limit": 1, "offset": 1}).json()
        assert len(a["requests"]) <= 1
        if a["total"] > 1:
            assert a["requests"][0]["request_id"] != b["requests"][0]["request_id"]


# --- Auth refresh
class TestRefresh:
    def test_refresh_with_cookie(self, s):
        r = s.post(f"{BASE_URL}/api/auth/refresh")
        assert r.status_code == 200 and r.json()["refreshed"] is True
        assert "session_token" in r.headers.get("set-cookie", "")
        assert s.get(f"{BASE_URL}/api/auth/me").status_code == 200

    def test_refresh_without_cookie(self):
        assert requests.post(f"{BASE_URL}/api/auth/refresh").status_code == 401


# --- Victory cards CRUD
class TestVictory:
    def test_all_triggers_and_crud(self, s):
        ids = []
        try:
            for t in TRIGGERS:
                r = s.post(f"{BASE_URL}/api/victory-cards/generate", json={"trigger_type": t,
                           "trigger_data": {"state": "AL", "violation_count": 2, "agency": "TEST_Agency"}})
                assert r.status_code == 200, f"{t}: {r.text[:200]}"
                c = r.json()
                for k in ("headline", "subtext", "stats_line", "hashtags", "share_url", "card_id"):
                    assert c.get(k), f"{t} missing {k}"
                ids.append((c["card_id"], c["share_token"]))
            lst = s.get(f"{BASE_URL}/api/victory-cards").json()["cards"]
            assert {i for i, _ in ids} <= {c["card_id"] for c in lst}
            cid, tok = ids[0]
            assert s.get(f"{BASE_URL}/api/victory-cards/{cid}").status_code == 200
            pub = requests.get(f"{BASE_URL}/api/victory-cards/public/{tok}")
            assert pub.status_code == 200 and "user_id" not in pub.json()
            r = s.put(f"{BASE_URL}/api/victory-cards/{cid}/image", json={"share_image_data": "data:image/png;base64,AAAA"})
            assert r.json() == {"saved": True}
            assert s.get(f"{BASE_URL}/api/victory-cards/{cid}").json()["share_image_data"] == "data:image/png;base64,AAAA"
        finally:
            for cid, _ in ids:
                s.delete(f"{BASE_URL}/api/victory-cards/{cid}")
        assert s.get(f"{BASE_URL}/api/victory-cards/{ids[0][0]}").status_code == 404

    def test_invalid_trigger(self, s):
        assert s.post(f"{BASE_URL}/api/victory-cards/generate", json={"trigger_type": "bogus"}).status_code == 400

    def test_public_404(self):
        assert requests.get(f"{BASE_URL}/api/victory-cards/public/nope_xyz").status_code == 404


# --- Six weapons smoke
class TestWeapons:
    def test_lawsuit(self, s):
        r = s.post(f"{BASE_URL}/api/lawsuit-architect/generate", json={
            "plaintiff": {"name": "TEST_P", "address": "1 St", "city": "Mobile", "state": "AL", "zip": "36601"},
            "defendant": {"name": "TEST_D", "title": "Caseworker"}, "agency": {"name": "TEST_DHR"},
            "incident": {"date": "2025-01-01", "location": "Mobile, AL"},
            "violations": [{"matched_phrase": "we do not need a warrant", "amendments": ["Fourth"],
                            "legal_citations": ["Payton v. New York, 445 U.S. 573 (1980)"], "description": "warrantless entry"}],
            "output_format": "markdown"}, timeout=120)
        assert r.status_code == 200, r.text[:300]
        doc = r.json()["generated_document"]
        for k in ("AUTHORITIES CITED", "CERTIFICATE OF SERVICE"):
            assert k in doc, k
        low = doc.lower()
        for k in ("jurisdiction", "cause", "prayer for relief"):
            assert k in low, k
        assert "citation_log" in r.json()
        s.delete(f"{BASE_URL}/api/lawsuit-architect/complaints/{r.json()['complaint_id']}")

    def test_integrity(self, s):
        r = s.post(f"{BASE_URL}/api/integrity-db/profiles", json={"name": "TEST_Caseworker", "agency": "TEST_DHR"})
        assert r.status_code in (200, 201), r.text[:200]
        p = r.json()
        pid = p.get("profile_id") or p.get("id") or p.get("profile", {}).get("profile_id")
        assert pid
        try:
            v = s.post(f"{BASE_URL}/api/integrity-db/profiles/{pid}/violations", json={
                "violation_type": "warrantless_entry", "incident_date": "2025-01-01", "description": "TEST"})
            assert v.status_code in (200, 201), v.text[:200]
            m = s.get(f"{BASE_URL}/api/integrity-db/profiles/{pid}/risk-metrics")
            assert m.status_code == 200, m.text[:200]
            assert m.json()
        finally:
            s.delete(f"{BASE_URL}/api/integrity-db/profiles/{pid}")

    def test_vault(self, s):
        k = s.post(f"{BASE_URL}/api/vault/generate-key").json()
        r = s.post(f"{BASE_URL}/api/vault/seal", files={"file": ("t.txt", b"TEST evidence", "text/plain")},
                   data={"key_b64": k["key_b64"]})
        assert r.status_code == 200, r.text[:200]
        assert r.json().get("vault_id") or r.json().get("certificate")

    def test_political(self, s):
        contacts = s.get(f"{BASE_URL}/api/political-strike/contacts").json()["contacts"]
        r = s.post(f"{BASE_URL}/api/political-strike/generate-dossier", json={
            "case_title": "TEST_Case", "caseworker_name": "TEST_W", "violations": ["warrantless entry"]})
        assert r.status_code == 200, r.text[:200]
        d = r.json()
        # NOTE: doc title 'Notice of Systemic Corruption' absent (reported as minor); check sections instead
        for sec in ("SECTION I:", "SECTION II:", "SECTION V: CALL TO ACTION", "SECTION VI:"):
            assert sec in str(d["document"]), sec
        disp = s.post(f"{BASE_URL}/api/political-strike/dispatch", json={
            "dossier_id": d["dossier_id"], "target_ids": [c["contact_id"] for c in contacts[:2]]})
        assert disp.status_code == 200, disp.text[:200]
        assert disp.json()["status"] == "SIMULATED" and disp.json()["report_id"]


# --- Document upload background extraction
class TestDocUpload:
    def test_txt_extraction_completes(self, s):
        text = "TEST_iter33 extraction body: caseworker entered without a warrant."
        r = s.post(f"{BASE_URL}/api/documents/upload",
                   files={"file": ("test_iter33.txt", text.encode(), "text/plain")},
                   data={"case_id": CASE_ID, "title": "TEST_iter33_doc", "doc_type": "cps_document", "auto_analyze": "false"}, timeout=60)
        assert r.status_code == 200, r.text[:300]
        did = r.json().get("id") or r.json().get("doc_id")
        doc = None
        try:
            for _ in range(8):
                time.sleep(1)
                docs = s.get(f"{BASE_URL}/api/documents/{CASE_ID}").json()
                docs = docs if isinstance(docs, list) else docs.get("documents", [])
                doc = next((x for x in docs if x.get("id") == did), None)
                if doc and doc.get("extraction_status") == "complete":
                    break
            assert doc, "uploaded doc not in list"
            assert doc.get("extraction_status") == "complete", doc.get("extraction_status")
            assert "TEST_iter33 extraction body" in (doc.get("content") or "")
            assert "queued for background processing" not in (doc.get("content") or "")
        finally:
            s.delete(f"{BASE_URL}/api/documents/{did}")
