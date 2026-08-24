export default function FooterLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block text-right text-sm text-white/70 transition-colors hover:text-[#B8944E]"
    >
      {label}
    </button>
  );
}
