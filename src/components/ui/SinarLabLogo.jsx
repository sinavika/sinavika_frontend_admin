import { FlaskConical, ClipboardCheck } from "lucide-react";

/**
 * SınavLab marka logosu — sınav + lab teması
 * lucide-react: FlaskConical (lab), ClipboardCheck (sınav)
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'light'|'dark'|'default'} [props.variant='default']
 * @param {boolean} [props.iconOnly=false]
 */
const SinarLabLogo = ({ size = "md", variant = "default", iconOnly = false }) => {
  const sizeMap = {
    sm: { icon: 20, text: "text-base" },
    md: { icon: 24, text: "text-lg" },
    lg: { icon: 32, text: "text-xl" },
  };
  const { icon: iconSize, text: textSize } = sizeMap[size];

  const variantStyles = {
    default: "text-slate-800",
    light: "text-white",
    dark: "text-slate-100",
  };
  const accentStyles = {
    default: "text-emerald-600",
    light: "text-emerald-400",
    dark: "text-emerald-400",
  };
  const labelColor = variantStyles[variant];
  const accentColor = accentStyles[variant];

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div className={`flex items-center gap-0.5 shrink-0 ${accentColor}`} aria-hidden>
        <FlaskConical size={iconSize} strokeWidth={2} />
        <ClipboardCheck size={iconSize * 0.7} strokeWidth={2} className="opacity-80" />
      </div>
      {!iconOnly && (
        <span className={`font-bold tracking-tight ${textSize} ${labelColor}`}>
          SınavLab
        </span>
      )}
    </div>
  );
};

export default SinarLabLogo;
