// menuItems.js
import { Home, Settings, PlusSquare, Lock, Box, Heart } from "lucide-react";

export const menuItems = [
  { name: "Home", icon: Home },
  {
    name: "Settings",
    icon: Settings,
    items: ["Display", "Editor", "Theme", "Interface"],
  },
  {
    name: "Create",
    icon: PlusSquare,
    items: ["Article", "Document", "Report"],
  },
  {
    name: "Account",
    icon: Lock,
    items: ["Dashboard", "Logout"],
  },
  { name: "Products", icon: Box },
  { name: "Favourites", icon: Heart },
];
