from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Any

# Simple in-memory per-user broadcaster using asyncio.Queue.
# Suitable for single-process dev. For multi-process production,
# replace with Redis/PG pubsub.

_subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)


def subscribe(user_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _subscribers[str(user_id)].append(q)
    return q


def unsubscribe(user_id: str, q: asyncio.Queue) -> None:
    lst = _subscribers.get(str(user_id))
    if not lst:
        return
    try:
        lst.remove(q)
    except ValueError:
        pass


def publish(user_id: str, event: Any) -> None:
    """Publish an event to all subscribers for `user_id`.

    This uses the running event loop to put the event into each
    subscriber queue in a thread-safe manner.
    """
    loop = asyncio.get_event_loop()
    for q in list(_subscribers.get(str(user_id), [])):
        try:
            loop.call_soon_threadsafe(q.put_nowait, event)
        except Exception:
            # Ignore -- subscriber queue may be closed/removed
            pass
