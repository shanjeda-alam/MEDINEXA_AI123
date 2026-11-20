export function FirstAidChecklist({ instructions }) {
  const steps = String(instructions || '')
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

  if (!steps.length) return null;

  return (
    <section className="glass-card p-5">
      <h3 className="font-display font-bold">Cautious First-Aid Instructions</h3>
      <ol className="first-aid-list">
        {steps.map((step, index) => <li key={`${index}-${step.slice(0, 20)}`}>{step}</li>)}
      </ol>
    </section>
  );
}
