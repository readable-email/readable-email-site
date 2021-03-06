<a href="https://www.w3.org/Bugs/Public/show_bug.cgi?id=26033">https://www.w3.org/Bugs/Public/show_bug.cgi?id=26033</a>

Hayato Ito <<a href="mailto:hayato@chromium.org?Subject=Re%3A%20%5BBug%2026033%5D%20Make%20distribution%20algorithm%20forward%20compatible%20with%20%20%3Cshadow%3E%20as%20function%20call.&In-Reply-To=%3Cbug-26033-2927-Meh8ut6dWT%40http.www.w3.org%2FBugs%2FPublic%2F%3E&References=%3Cbug-26033-2927-Meh8ut6dWT%40http.www.w3.org%2FBugs%2FPublic%2F%3E">hayato@chromium.org</a>> changed:

           What    |Removed                     |Added
----------------------------------------------------------------------------
             Status|NEW                         |RESOLVED
         Resolution|---                         |FIXED

--- Comment #10 from Hayato Ito <<a href="mailto:hayato@chromium.org?Subject=Re%3A%20%5BBug%2026033%5D%20Make%20distribution%20algorithm%20forward%20compatible%20with%20%20%3Cshadow%3E%20as%20function%20call.&In-Reply-To=%3Cbug-26033-2927-Meh8ut6dWT%40http.www.w3.org%2FBugs%2FPublic%2F%3E&References=%3Cbug-26033-2927-Meh8ut6dWT%40http.www.w3.org%2FBugs%2FPublic%2F%3E">hayato@chromium.org</a>> ---
Thank you. Let me close this bug. Go with plan A.

(In reply to William Chen from comment #9)
> Let's go with plan A and bring back shadow as a function call. The spec
> shouldn't have been reverted in the first place for chromium implementation
> difficulty of a feature that was eventually going to be implemented.
> 
> The only reason my proposal exists is because it's probably easier to update
> the chromium implementation to match my proposal. Right now, I would like to
> see either plan A or plan B go into effect and have implementations match as
> soon as possible because they are both better than what we have right now
> with regards to moving forward. It's important this this gets fixed soon so
> that developers have less time to depend on semantics that are going to
> break.

-- 
You are receiving this mail because:
You are on the CC list for the bug.
