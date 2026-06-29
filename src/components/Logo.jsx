export default function Logo({ size = 24, onClick }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Left bubble (teal) */}
      <circle cx="32" cy="50" r="20" fill="none" stroke="#0891b2" strokeWidth="6"/>
      {/* Right bubble (blue) */}
      <circle cx="68" cy="50" r="20" fill="none" stroke="#0052CC" strokeWidth="6"/>
      
      {/* Waveform inside bubbles */}
      <path 
        d="M 28 50 L 32 45 L 36 55 L 40 48" 
        stroke="#0891b2" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M 64 50 L 68 45 L 72 55 L 76 48" 
        stroke="#0052CC" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
  )
}
