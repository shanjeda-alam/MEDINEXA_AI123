export function GlassCard({ as: Component = 'section', className = '', children, ...props }) {
  return (
    <Component className={`glass-card ${className}`} {...props}>
      {children}
    </Component>
  );
}
