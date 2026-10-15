const paths = {
  sword: <><path d="m14 7 3-3 3 3-3 3"/><path d="m4 20 8-8"/><path d="m6 14 4 4"/><path d="m12 8 4 4"/><path d="m5 19-1 1"/><path d="m8 5 11 11"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-2 2"/></>,
  clipboard: <><rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5.5V4h6v1.5M9 10h6M9 14h6M9 18h3"/></>,
  medal: <><circle cx="12" cy="9" r="5"/><path d="m8.5 13-1 8 4.5-2.5 4.5 2.5-1-8M10 9l1.3 1.3L14 7.8"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/></>,
  bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7z"/>,
  crown: <><path d="m3 8 5 4 4-7 4 7 5-4-2 11H5z"/><path d="M5 22h14"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-3l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.5-2.6 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h3l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.5 2.6-1.4 1.1a7 7 0 0 1 0 1.9z"/></>,
  flag: <><path d="M5 21V4"/><path d="M5 4c5-3 8 3 14 0v10c-6 3-9-3-14 0"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.7-2L20 12M4 12l2.8 5a7 7 0 0 0 11.7-2"/></>,
  arrow: <><path d="M4 12h15M13 5l7 7-7 7"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
};
export function TCIcon({ name, size = 19, className = "", title }) {
  return (
    <span className={`tc-icon-frame ${className}`} aria-hidden="true" title={title}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name] || paths.bolt}
      </svg>
    </span>
  );
}
