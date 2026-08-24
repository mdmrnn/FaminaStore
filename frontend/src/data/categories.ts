import { Gem, PanelsTopLeft, Sparkles } from "lucide-react";

interface Category {
  name: string;
  icon: typeof Sparkles;
}

export const categories: Category[] = [
  { name: "روسری", icon: Sparkles },
  { name: "شال", icon: PanelsTopLeft },
  { name: "اکسسوری", icon: Gem },
  { name: "جدیدها", icon: Sparkles },
];
