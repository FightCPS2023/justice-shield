"""Run LlmChat.send_message in a worker thread so blocking LLM HTTP calls never freeze the event loop."""
import asyncio
from emergentintegrations.llm.chat import LlmChat

_original_send = LlmChat.send_message


def _run_in_new_loop(self, args, kwargs):
    return asyncio.run(_original_send(self, *args, **kwargs))


async def _threaded_send_message(self, *args, **kwargs):
    return await asyncio.to_thread(_run_in_new_loop, self, args, kwargs)


if not getattr(LlmChat, "_punisher_threaded", False):
    LlmChat.send_message = _threaded_send_message
    LlmChat._punisher_threaded = True
