"""Run LlmChat.send_message in a worker thread so blocking LLM HTTP calls never freeze the event loop."""
import asyncio
import contextvars
from emergentintegrations.llm.chat import LlmChat

_original_send = LlmChat.send_message

AI_MODE: contextvars.ContextVar = contextvars.ContextVar("ai_mode", default="AUTO")
VALID_MODES = {"PARENT", "ADVOCATE", "ATTORNEY", "INVESTIGATOR"}
MODE_TEXT = {
    "PARENT": "MODE LOCK: PARENT (user-selected). THIS OVERRIDES THE DEFAULT 10-PART OUTPUT FORMAT. Write for a scared parent with no legal training: plain English, no legal jargon without a one-line definition, no [FACT]/[LAW] tags, under 350 words unless drafting a document. Use exactly these headings: 'What this means', 'Do this now' (numbered, with a clock), 'Say this / don't say this', 'Ask me' (the 2-3 facts you still need). Cite at most 2-3 authorities, each in one plain sentence, tagged per Cite-Guard. Still open with the cold sentence.",
    "ADVOCATE": "MODE LOCK: ADVOCATE (user-selected). Rights-focused, record-building guidance: what to say, what to refuse, what to write down, how to document agency conduct. Use the default output format but keep each section tight; translate every citation into plain English.",
    "ATTORNEY": "MODE LOCK: ATTORNEY (user-selected). Full citations, elements, burdens of proof, standards of review, procedural vehicles, opponent counter-moves and how to defeat them. Court-ready structure.",
    "INVESTIGATOR": "MODE LOCK: INVESTIGATOR (user-selected). Records-first: FOIA/subpoena targets, chain-of-custody gaps, timeline reconstruction, witness list, impeachment points, preservation letters. Flag every missing document.",
}


def _apply_mode(chat):
    mode = AI_MODE.get()
    if mode not in VALID_MODES:
        return
    msgs = getattr(chat, "messages", None)
    if not msgs or msgs[0].get("role") != "system":
        return
    content = msgs[0].get("content") or ""
    if "MODE LOCK:" in content and "(user-selected)" in content:
        return
    msgs[0]["content"] = content + "\n\n" + MODE_TEXT[mode]


def _run_in_new_loop(self, args, kwargs):
    return asyncio.run(_original_send(self, *args, **kwargs))


async def _threaded_send_message(self, *args, **kwargs):
    _apply_mode(self)
    return await asyncio.to_thread(_run_in_new_loop, self, args, kwargs)


if not getattr(LlmChat, "_punisher_threaded", False):
    LlmChat.send_message = _threaded_send_message
    LlmChat._punisher_threaded = True
