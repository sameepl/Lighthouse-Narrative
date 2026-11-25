import { onboarding } from '../strings';
export function Title({
  canContinue,
  onStart,
  onContinue,
  onTheme,
}: {
  canContinue: boolean;
  onStart: () => void;
  onContinue: () => void;
  onTheme: () => void;
}) {
  return (
    <main id="app" className="title-screen">
      <h1>{onboarding.title}</h1>
      <nav aria-label={onboarding.title}>
        {canContinue && <button onClick={onContinue}>{onboarding.continue}</button>}
        <button onClick={onStart}>{canContinue ? onboarding.newRun : onboarding.start}</button>
      </nav>
      {canContinue && <p>{onboarding.replace}</p>}
      <button onClick={onTheme}>{onboarding.theme}</button>
      <footer>
        <small>{onboarding.build}</small>
        <a href="https://github.com/sameepl/Lighthouse-Narrative/issues/new">{onboarding.feedback}</a>
      </footer>
    </main>
  );
}
