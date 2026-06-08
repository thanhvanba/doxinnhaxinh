import {
  Sofa,
  Frame,
  Lamp,
  BedDouble,
  Utensils,
  Package,
  Activity,
  Shirt,
  Tag,
  type LucideIcon,
} from "lucide-react";

/** Map key icon (lưu trong DB) → component lucide. */
const ICONS: Record<string, LucideIcon> = {
  sofa: Sofa,
  frame: Frame,
  lamp: Lamp,
  bed: BedDouble,
  utensils: Utensils,
  package: Package,
  activity: Activity,
  shirt: Shirt,
};

export function categoryIcon(key?: string | null): LucideIcon {
  return (key && ICONS[key]) || Tag;
}
