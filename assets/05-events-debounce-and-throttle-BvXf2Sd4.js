const e=`---\r
title: Events, Debounce and Throttle\r
description: How DOM events propagate through capture and bubble phases, event delegation for dynamic lists, and building debounce and throttle from scratch\r
difficulty: Core\r
tags: [javascript, dom-events, debounce, throttle]\r
---\r
\r
DOM events and their rate-limiting cousins, debounce and throttle, are the bread-and-butter performance topic of front-end interviews. A backend engineer already understands rate limiting conceptually — this section maps that intuition onto the browser's event model and the two implementations you are expected to be able to write from memory.\r
\r
## Event propagation: capture, target, bubble\r
\r
A DOM event does not just fire at the element it happened on — it travels through the tree in three phases.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    W["window"] --> D["document"]\r
    D --> Body["body (capture phase, top-down)"]\r
    Body --> Div["div.container"]\r
    Div --> Btn["button (target phase)"]\r
    Btn --> Div2["div.container (bubble phase, bottom-up)"]\r
    Div2 --> Body2["body"]\r
    Body2 --> D2["document"]\r
\`\`\`\r
\r
| Phase | Direction | Triggered by default? |\r
|---|---|---|\r
| Capture | Root down to the target | Only if listener registered with \`{ capture: true }\` |\r
| Target | At the element the event actually occurred on | Always |\r
| Bubble | Target back up to the root | Yes, for most events (a few, like \`focus\`/\`blur\`, don't bubble) |\r
\r
\`\`\`javascript\r
el.addEventListener("click", handler, { capture: true }); // fires during capture\r
el.addEventListener("click", handler);                     // fires during bubble (default)\r
\`\`\`\r
\r
> [!KEY]\r
> Almost all real code listens on the bubble phase (the default). Capture is mainly for intercepting an event **before** a child gets a chance to handle or stop it — a common use is a top-level "close all open menus" handler.\r
\r
## stopPropagation vs preventDefault vs stopImmediatePropagation\r
\r
These three are frequently confused, and interviewers like to ask for all three in one breath.\r
\r
| Method | Stops the event from | Stops the default browser action? | Stops sibling listeners on the same element? |\r
|---|---|---|---|\r
| \`preventDefault()\` | Nothing — propagation continues | Yes (e.g., form submit, link navigation, checkbox toggle) | No |\r
| \`stopPropagation()\` | Continuing to bubble/capture past the current element | No | No |\r
| \`stopImmediatePropagation()\` | Continuing to propagate, **and** any other listeners on the same element | No | Yes |\r
\r
\`\`\`javascript\r
link.addEventListener("click", (e) => {\r
  e.preventDefault();  // stop navigation, event still bubbles\r
  console.log("intercepted");\r
});\r
\`\`\`\r
\r
> [!WARNING]\r
> \`stopPropagation()\` does not stop the default action, and \`preventDefault()\` does not stop propagation — they are independent axes. Confusing them is the classic mistake that leaves a form submitting when the candidate only meant to stop it from bubbling.\r
\r
## Event delegation\r
\r
Instead of attaching a listener to every item in a list, attach **one** listener to a stable ancestor and inspect \`event.target\` to work out which child fired it. This relies on bubbling.\r
\r
\`\`\`javascript\r
// One listener handles clicks on any current or future <li>, no per-item binding\r
list.addEventListener("click", (e) => {\r
  const item = e.target.closest("li");\r
  if (!item) return;\r
  console.log("clicked:", item.dataset.id);\r
});\r
\`\`\`\r
\r
This matters most for **dynamic lists**: items added later automatically work with no re-binding, memory usage stays flat regardless of list size (one listener instead of thousands), and removing items never leaves orphaned listeners behind.\r
\r
> [!TIP]\r
> "I'd delegate to the list container and use \`closest()\` to find the item, rather than binding a listener per row" is the answer that signals you've actually built a virtualised or infinitely-scrolling list before.\r
\r
## Passive listeners and custom events\r
\r
\`{ passive: true }\` tells the browser the listener will **never** call \`preventDefault()\`, letting it start scrolling immediately instead of waiting to see if you cancel it — a meaningful scroll-jank fix for \`touchstart\`/\`wheel\` listeners.\r
\r
\`\`\`javascript\r
window.addEventListener("scroll", onScroll, { passive: true });\r
\`\`\`\r
\r
Custom events let components communicate without direct references, dispatched and bubbled like native ones:\r
\r
\`\`\`javascript\r
el.dispatchEvent(new CustomEvent("item-selected", { detail: { id: 42 }, bubbles: true }));\r
document.addEventListener("item-selected", (e) => console.log(e.detail.id));\r
\`\`\`\r
\r
## Debounce vs throttle\r
\r
Both limit how often a function runs in response to a high-frequency event, but they solve different problems.\r
\r
| | Debounce | Throttle |\r
|---|---|---|\r
| Guarantees | Runs once, **after** input goes quiet for \`wait\` ms | Runs at most once per \`wait\` ms, **during** continuous input |\r
| Mental model | "Wait until they stop typing" | "Sample at a fixed rate" |\r
| Rapid repeated calls | Each call resets the timer — only the last one (eventually) fires | First (or last, depending on edge) call in each window fires; the rest are dropped |\r
| Typical use | Search-as-you-type, autosave, form validation | Scroll position tracking, resize handlers, mouse-move drag |\r
\r
\`\`\`mermaid\r
flowchart LR\r
    E1["Event fires repeatedly<br/>e.g. keystrokes"] --> D{"Debounce or throttle?"}\r
    D -->|"debounce"| D1["Timer resets on every call"]\r
    D1 --> D2["Fires once, after calls stop"]\r
    D -->|"throttle"| T1["Timer runs on a fixed interval"]\r
    T1 --> T2["Fires at most once per interval"]\r
\`\`\`\r
\r
### Leading vs trailing edge\r
\r
Both patterns can fire at the **start** of the burst (leading), the **end** (trailing), or both.\r
\r
| Edge | Debounce behaviour | Throttle behaviour |\r
|---|---|---|\r
| Trailing (default) | Fires once, \`wait\` ms after the last call | Fires at the end of each window if a call happened during it |\r
| Leading | Fires immediately on the first call, then ignores the rest until quiet | Fires immediately on the first call of each window |\r
\r
## Implementing debounce from scratch\r
\r
\`\`\`typescript\r
function debounce<T extends (...args: unknown[]) => void>(\r
  fn: T,\r
  wait: number,\r
  { leading = false }: { leading?: boolean } = {}\r
): (...args: Parameters<T>) => void {\r
  let timer: ReturnType<typeof setTimeout> | null = null;\r
\r
  return (...args: Parameters<T>) => {\r
    const callNow = leading && timer === null;\r
    if (timer) clearTimeout(timer); // reset the clock on every call\r
\r
    timer = setTimeout(() => {\r
      timer = null;\r
      if (!leading) fn(...args); // trailing: fire after the gap\r
    }, wait);\r
\r
    if (callNow) fn(...args); // leading: fire immediately, once\r
  };\r
}\r
\`\`\`\r
\r
## Implementing throttle from scratch\r
\r
\`\`\`typescript\r
function throttle<T extends (...args: unknown[]) => void>(\r
  fn: T,\r
  wait: number\r
): (...args: Parameters<T>) => void {\r
  let lastRun = 0;\r
  let timer: ReturnType<typeof setTimeout> | null = null;\r
\r
  return (...args: Parameters<T>) => {\r
    const now = Date.now();\r
    const remaining = wait - (now - lastRun);\r
\r
    if (remaining <= 0) {\r
      // window has elapsed — run immediately (leading edge)\r
      lastRun = now;\r
      fn(...args);\r
    } else if (!timer) {\r
      // schedule one trailing call so the last event in the window isn't dropped\r
      timer = setTimeout(() => {\r
        lastRun = Date.now();\r
        timer = null;\r
        fn(...args);\r
      }, remaining);\r
    }\r
  };\r
}\r
\`\`\`\r
\r
> [!DANGER]\r
> A throttle with **only** a leading edge silently drops the final event in a burst — if a user stops scrolling mid-window, the last position update never fires. Combining leading + trailing (as above) is what real libraries like Lodash do by default, and is worth mentioning even if you implement the simpler leading-only version first.\r
\r
## requestAnimationFrame throttling\r
\r
For anything visual (scroll-linked animation, drag), throttling to the display's refresh rate rather than a fixed millisecond value avoids doing more work than the screen can actually show:\r
\r
\`\`\`javascript\r
let ticking = false;\r
window.addEventListener("scroll", () => {\r
  if (ticking) return;\r
  ticking = true;\r
  requestAnimationFrame(() => {\r
    updateParallax(window.scrollY);\r
    ticking = false;\r
  });\r
});\r
\`\`\`\r
\r
## Real use cases\r
\r
| Scenario | Technique | Why |\r
|---|---|---|\r
| Search-as-you-type | Debounce, ~300ms trailing | Avoid a network call per keystroke; wait until the user pauses |\r
| Scroll position tracking | Throttle or rAF | Needs regular updates, not just the final value |\r
| Window resize (recalculate layout) | Debounce, ~150–250ms trailing | Layout recalculation is expensive; only needed once resizing stops |\r
| Autosave a document | Debounce, ~1–2s trailing | Don't hit the server on every keystroke, but do eventually persist |\r
| Button double-click / form double-submit | Throttle (or disable after first click) | First click should count immediately; extras must be ignored |\r
\r
## Memory leaks from unremoved listeners\r
\r
An event listener holds a reference to its callback, and that callback's closure keeps everything it captured alive — if the element is removed from the DOM but the listener (and whatever it references) is never cleaned up, the whole chain can outlive its usefulness.\r
\r
\`\`\`javascript\r
function attach() {\r
  const bigData = new Array(1_000_000).fill("x");\r
  const handler = () => console.log(bigData.length); // closure keeps bigData alive\r
  window.addEventListener("resize", handler);\r
  return () => window.removeEventListener("resize", handler); // must be called to release it\r
}\r
\`\`\`\r
\r
In frameworks, this is exactly why \`useEffect\` cleanup functions and Angular's \`ngOnDestroy\` exist — they are the designated place to call \`removeEventListener\` so a component that unmounts doesn't leave a dangling listener attached to \`window\` or \`document\`.\r
\r
## Cheat sheet\r
\r
- Events travel capture (down) → target → bubble (up); most listeners use the default bubble phase.\r
- \`preventDefault\` stops the default action; \`stopPropagation\` stops further travel; \`stopImmediatePropagation\` does both plus blocks sibling listeners on the same element.\r
- Delegate listeners to a stable ancestor for dynamic lists — one listener, \`event.target.closest(...)\` to identify the child.\r
- \`{ passive: true }\` on scroll/touch listeners avoids blocking the browser's compositor thread.\r
- Debounce = wait for quiet, then fire once. Throttle = fire at most once per fixed window.\r
- Leading edge = fire immediately, then suppress. Trailing edge = fire after the gap/window ends.\r
- A throttle with no trailing edge drops the final event of a burst — usually a bug, not a feature.\r
- Always pair \`addEventListener\` with \`removeEventListener\` in cleanup to avoid leaks.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Binding a listener per list item instead of delegating | Attach one listener to the container, use \`event.target.closest()\` |\r
| Confusing \`stopPropagation\` with \`preventDefault\` | They are independent — stopping one does not stop the other |\r
| Using debounce for a progress/scroll indicator | Use throttle or rAF — you need updates during the action, not just after |\r
| Leading-only throttle silently dropping the last event | Add a trailing-edge call after the window elapses |\r
| Forgetting to \`removeEventListener\` on unmount/cleanup | Return/register a cleanup function that removes the exact same reference |\r
| Attaching a non-passive listener on \`touchstart\`/\`wheel\` | Mark it \`{ passive: true }\` unless you truly need \`preventDefault()\` |\r
\r
## Summary\r
\r
Events propagate through capture, target and bubble phases, and understanding that lets you delegate a single listener to a container instead of binding one per element — essential for dynamic and virtualised lists. \`preventDefault\`, \`stopPropagation\`, and \`stopImmediatePropagation\` are three independent controls, not one, and mixing them up is a common live-coding slip. Debounce and throttle both rate-limit a high-frequency event but for different goals — debounce waits for silence, throttle guarantees a steady sampling rate — and being able to implement both from scratch, including the leading/trailing edge behaviour, is one of the most common practical JavaScript exercises asked in interviews.\r
\r
## Top Interview Questions\r
\r
### Q1. Explain the three phases of DOM event propagation.\r
\r
An event starts at \`window\`, travels **down** through ancestors to the target element — the capture phase — then fires **at** the target itself, then travels back **up** through the same ancestors to \`window\` — the bubble phase. By default, \`addEventListener\` registers a bubble-phase listener; passing \`{ capture: true }\` registers it for the capture phase instead. Most application code listens on bubble because it composes naturally with event delegation, but capture is useful when you need to intercept an event before a descendant's own handler can act on or stop it, such as a global "dismiss all open dropdowns" listener on \`document\`.\r
\r
### Q2. What is the difference between \`stopPropagation()\`, \`preventDefault()\`, and \`stopImmediatePropagation()\`?\r
\r
\`preventDefault()\` cancels the browser's default action for that event (link navigation, form submission, checkbox toggling) but does nothing to propagation — the event still bubbles and other listeners still see it. \`stopPropagation()\` prevents the event from continuing to travel to ancestor (or descendant, during capture) elements, but does not cancel the default action and does not stop other listeners already registered on the *same* element. \`stopImmediatePropagation()\` does everything \`stopPropagation()\` does, plus it prevents any remaining listeners on that same element from running at all, even ones registered after it in the same phase. These are three independent controls, and the common interview trap is assuming stopping one implies stopping another.\r
\r
### Q3. Why is event delegation important for a list that grows and shrinks dynamically?\r
\r
If you bind a listener to every list item individually, every newly added item needs its own listener bound at creation time, and every removed item should have its listener cleaned up or it risks leaking — both easy to get wrong and expensive at scale (thousands of listeners for a long list). Delegation attaches a single listener to a stable ancestor (the list container) and relies on bubbling: when any descendant is clicked, the event bubbles up to the container, where \`event.target.closest("li")\` (or similar) identifies which item was actually interacted with. This means new items work immediately with zero extra binding code, memory usage is flat regardless of list size, and there is nothing to clean up when items are removed.\r
\r
### Q4. What does \`{ passive: true }\` do, and why does it matter for scroll performance?\r
\r
It tells the browser that the listener will never call \`preventDefault()\`, so the browser's compositor thread doesn't need to wait for the (potentially slow) JavaScript handler to finish before it starts scrolling — normally it must wait, in case the handler cancels the scroll. On \`touchstart\`/\`touchmove\`/\`wheel\` listeners in particular, a non-passive listener can introduce visible scroll jank because every frame of scrolling is gated on JS execution. Marking a listener passive when it genuinely never prevents default is a straightforward, low-risk performance win, and many browsers now warn in devtools when a scroll-blocking listener isn't marked passive.\r
\r
### Q5. Implement \`debounce\` from scratch. What does the leading option change?\r
\r
\`\`\`typescript\r
function debounce(fn, wait, { leading = false } = {}) {\r
  let timer = null;\r
  return (...args) => {\r
    const callNow = leading && timer === null;\r
    if (timer) clearTimeout(timer);\r
    timer = setTimeout(() => {\r
      timer = null;\r
      if (!leading) fn(...args);\r
    }, wait);\r
    if (callNow) fn(...args);\r
  };\r
}\r
\`\`\`\r
\r
Every call clears any pending timer and starts a new one, so the wrapped function only actually runs once the calls stop arriving for \`wait\` milliseconds — the trailing edge, which is the default. With \`leading: true\`, the very first call in a burst fires immediately (useful for "respond instantly, then ignore repeats until quiet"), and the trailing call is suppressed so it doesn't also fire a second time at the end of the same burst.\r
\r
### Q6. Implement \`throttle\` from scratch, and explain what happens to events that arrive between windows.\r
\r
\`\`\`typescript\r
function throttle(fn, wait) {\r
  let lastRun = 0, timer = null;\r
  return (...args) => {\r
    const now = Date.now();\r
    const remaining = wait - (now - lastRun);\r
    if (remaining <= 0) {\r
      lastRun = now;\r
      fn(...args);\r
    } else if (!timer) {\r
      timer = setTimeout(() => { lastRun = Date.now(); timer = null; fn(...args); }, remaining);\r
    }\r
  };\r
}\r
\`\`\`\r
\r
Calls that land after a full \`wait\` window has elapsed since the last run fire immediately, resetting the window (leading edge). Calls that arrive mid-window are dropped, *except* the implementation schedules one pending trailing call so that the most recent set of arguments still fires once the window ends — without that trailing timer, a burst that stops mid-window would silently lose its final event, which is a common bug in naive throttle implementations.\r
\r
### Q7. When would you choose throttle over debounce for a scroll handler, and vice versa for a search box?\r
\r
A scroll handler that updates a progress bar or triggers a parallax effect needs to run periodically **while** scrolling is happening — the user should see continuous feedback, not just one update after they stop, so throttle (or \`requestAnimationFrame\`-based throttling) is correct; debounce would make the UI feel unresponsive, only updating once scrolling ends. A search-as-you-type box, by contrast, should not fire a network request on every keystroke — the goal is to wait until the user has paused typing and then fire exactly once, which is precisely debounce's contract; throttle would still send requests mid-typing, wasting calls on intermediate, incomplete queries.\r
\r
### Q8. A component adds a \`resize\` listener in its constructor/mount but the page's memory grows over time as components are created and destroyed. What's happening and how do you fix it?\r
\r
The listener was attached to a long-lived target (\`window\`) but never removed when the component was destroyed, so the listener — and the entire closure it captured, including any large data structures referenced inside the handler — stays reachable and cannot be garbage collected even though the component itself is gone from the DOM. The fix is to store a reference to the exact handler function used in \`addEventListener\` and call \`removeEventListener\` with that same reference during the component's teardown/cleanup lifecycle (\`useEffect\` cleanup in React, \`ngOnDestroy\` in Angular, \`disconnectedCallback\` for a web component). This is a very common real leak, especially when several instances of the same component are mounted and unmounted repeatedly over a session.\r
\r
### Q9. What is the difference between a synthetic event system (like React's) and native DOM events, at a conceptual level?\r
\r
Frameworks that use a synthetic event system attach a small number of listeners near the root of the document (historically one per event type) rather than one per element, and use their own internal event object that wraps the native one — this is essentially event delegation baked into the framework itself, for the same performance reasons you'd delegate manually. The synthetic event normalizes cross-browser differences and integrates with the framework's own scheduling (batching state updates triggered from within an event handler), whereas raw DOM events fire and are handled immediately, synchronously, with no batching unless you introduce it yourself.\r
\r
### Q10. How would you implement a custom event so two unrelated components can communicate without a direct reference to each other?\r
\r
Use the \`CustomEvent\` constructor to create an event carrying arbitrary data in its \`detail\` property, dispatch it from one element with \`element.dispatchEvent(new CustomEvent("name", { detail: payload, bubbles: true }))\`, and listen for it anywhere in the ancestor chain (or on \`document\` if bubbling is enabled) with a normal \`addEventListener("name", handler)\`. This decouples the emitter from the listener entirely — neither needs a reference to the other, only a shared event name and payload shape — which is useful for cross-component communication in vanilla JS or web components, though in a framework with its own state management, a shared store or context is usually preferred for anything beyond simple, one-off signals.\r
\r
### Q11. In production, a search input is issuing a network request per keystroke and overwhelming the backend. Walk through your fix, including a subtlety with out-of-order responses.\r
\r
The immediate fix is debouncing the input handler (roughly 250–400ms trailing) so a request only fires once the user pauses typing, cutting request volume dramatically for fast typists. The subtlety debouncing alone doesn't solve is response ordering: if a user types, pauses, types more, and two requests do end up in flight (e.g., due to slow network rather than fast typing), a slower response for an *earlier* query can arrive after a faster response for a *later* one and overwrite the UI with stale results. The robust fix is to track a request ID or use \`AbortController\` to cancel the previous in-flight request when a new one starts, so only the response matching the latest query is ever applied to the UI.\r
`;export{e as default};
