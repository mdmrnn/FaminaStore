export default function IconButton({
  label,
  onClick,
  children,
  badge,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
    >
      {children}

      {badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B8944E] px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
