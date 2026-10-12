// Pure-CSS particle backdrop — zero JS state, no randomization on every render,
// no requestAnimationFrame. Particles are positioned via CSS custom props only.
export function ParticleBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="search-particles" />
    </div>
  )
}
