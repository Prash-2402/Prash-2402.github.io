const BRANDS = new Set(['fa-github', 'fa-linkedin', 'fa-linkedin-in', 'fa-whatsapp'])

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i aria-hidden="true" className={`${BRANDS.has(name) ? 'fab' : 'fas'} ${name} ${className}`} />
}

export function ExtLink({ href, label, icon }: { href: string; label: string; icon?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="link-arrow">
      {icon && <Icon name={icon} className="text-xs" />}
      {label}
    </a>
  )
}
