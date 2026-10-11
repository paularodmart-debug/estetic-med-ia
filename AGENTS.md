<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture rules
- Keep the Copiloto as a frontend-only deterministic demonstration with fictional administrative cases, so it works without credentials or external services.
- Keep Copiloto safety checks and follow-up task mutations in a browser-safe domain module with focused tests, so all entry points enforce the same non-clinical limits.
- Use AI Elements for the demonstration transcript and composer; transport is simulated locally because this MVP must not call an AI service.
- Keep one conversation per selected case in session memory, with case-keyed chat instances, so conversations never leak between cases and reload starts a fresh demo.
- Keep consultation validation and organizational scoring in a pure browser-safe module with focused tests, so clinical text never influences prioritization.
- Share in-memory cases and ticket state across intake, case workspace and Copiloto, so completion and task creation stay synchronized without external services.
- Treat demo role selection as presentation only, never authorization, so the account-free demonstration makes no security claims.
- Seed contrasting cases and tasks together in session memory and derive organizational resolution from current task statuses, so reload is reproducible and reopening work cannot leave a stale resolved label.
- Derive demo impact from shared live tasks and the reference cases in a pure browser-safe module, so estimates stay separate from clinical outcomes.
- Share a local timed demo preview between public and internal screens, with reduced-motion static scenes, so no audiovisual service is required.
- Keep guided progress in the case workspace and advance it through Copiloto callbacks, so the actual case flow stays on one page.
- Identify converted plan tasks separately from seeded tasks and require a previewed count before UI confirmation, so seeded cases can demonstrate conversion without duplicating a converted batch.- Simulate the Panel AI inquiry analysis locally in a pure module with tests, and key its converted tasks by inquiry so repeat conversions never duplicate.
