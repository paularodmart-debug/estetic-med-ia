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