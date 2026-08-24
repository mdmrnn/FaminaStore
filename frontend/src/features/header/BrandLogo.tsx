import logo from "../../assets/logo/logo-B8944E.svg";

export default function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => console.log("کلیک روی لوگوی فامینااسکرف")}
      aria-label="فامینااسکرف"
      className={`group flex items-center gap-2 ${footer ? "text-[#B8944E]" : "text-[#173C35]"}`}
    >
      <span className="relative flex h-20 w-20 items-center justify-center">
        <img
          src={logo}
          alt="famina scarf logo"
          className="size-20 absolute  text-[#B8944E] transition-transform duration-300 group-hover:scale-110"
        />
      </span>
    </button>
  );
}
