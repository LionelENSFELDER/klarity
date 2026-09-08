import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";

import Home from "@mui/icons-material/Home";
import Apartment from "@mui/icons-material/Apartment";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import LocalGasStation from "@mui/icons-material/LocalGasStation";
import LocalHospital from "@mui/icons-material/LocalHospital";
import HealthAndSafety from "@mui/icons-material/HealthAndSafety";
import Bolt from "@mui/icons-material/Bolt";
import Wifi from "@mui/icons-material/Wifi";
import PhoneAndroid from "@mui/icons-material/PhoneAndroid";
import Router from "@mui/icons-material/Router";
import Cloud from "@mui/icons-material/Cloud";
import CreditCard from "@mui/icons-material/CreditCard";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Payments from "@mui/icons-material/Payments";
import Movie from "@mui/icons-material/Movie";
import MusicNote from "@mui/icons-material/MusicNote";
import SportsEsports from "@mui/icons-material/SportsEsports";
import Newspaper from "@mui/icons-material/Newspaper";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import Pets from "@mui/icons-material/Pets";
import School from "@mui/icons-material/School";
import Restaurant from "@mui/icons-material/Restaurant";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import Security from "@mui/icons-material/Security";
import Devices from "@mui/icons-material/Devices";
import Train from "@mui/icons-material/Train";
import Flight from "@mui/icons-material/Flight";
import Handyman from "@mui/icons-material/Handyman";
import LocalLaundryService from "@mui/icons-material/LocalLaundryService";
import HelpOutline from "@mui/icons-material/HelpOutline";

export interface GenericIconEntry {
  name: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
}

// Liste curée d'icônes génériques pour les contrats, importées
// individuellement par leur chemin exact plutôt que via le barrel
// `@mui/icons-material` (~21 500 fichiers). Un `import *` sur ce
// package force la résolution de la quasi-totalité de ces fichiers à
// chaque compilation, ce qui ralentissait fortement `npm run dev`
// (ce composant est utilisé depuis le header, donc sur chaque page).
export const GENERIC_ICONS: GenericIconEntry[] = [
  { name: "Home", label: "Maison", Icon: Home },
  { name: "Apartment", label: "Appartement", Icon: Apartment },
  { name: "DirectionsCar", label: "Voiture", Icon: DirectionsCar },
  { name: "LocalGasStation", label: "Carburant", Icon: LocalGasStation },
  { name: "LocalHospital", label: "Santé", Icon: LocalHospital },
  { name: "HealthAndSafety", label: "Mutuelle", Icon: HealthAndSafety },
  { name: "Bolt", label: "Énergie", Icon: Bolt },
  { name: "Wifi", label: "Internet", Icon: Wifi },
  { name: "PhoneAndroid", label: "Mobile", Icon: PhoneAndroid },
  { name: "Router", label: "Box internet", Icon: Router },
  { name: "Cloud", label: "Cloud", Icon: Cloud },
  { name: "CreditCard", label: "Carte bancaire", Icon: CreditCard },
  { name: "AccountBalance", label: "Banque", Icon: AccountBalance },
  { name: "Payments", label: "Crédit", Icon: Payments },
  { name: "Movie", label: "Streaming vidéo", Icon: Movie },
  { name: "MusicNote", label: "Streaming musique", Icon: MusicNote },
  { name: "SportsEsports", label: "Jeux vidéo", Icon: SportsEsports },
  { name: "Newspaper", label: "Presse", Icon: Newspaper },
  { name: "FitnessCenter", label: "Sport", Icon: FitnessCenter },
  { name: "Pets", label: "Animaux", Icon: Pets },
  { name: "School", label: "Éducation", Icon: School },
  { name: "Restaurant", label: "Restauration", Icon: Restaurant },
  { name: "ShoppingCart", label: "Achats", Icon: ShoppingCart },
  { name: "Security", label: "Sécurité", Icon: Security },
  { name: "Devices", label: "Électronique", Icon: Devices },
  { name: "Train", label: "Transport", Icon: Train },
  { name: "Flight", label: "Voyage", Icon: Flight },
  { name: "Handyman", label: "Bricolage", Icon: Handyman },
  { name: "LocalLaundryService", label: "Pressing", Icon: LocalLaundryService },
];

const ICON_BY_NAME = new Map<string, ComponentType<SvgIconProps>>(
  GENERIC_ICONS.map((entry) => [entry.name, entry.Icon]),
);

export function getGenericIcon(name: string): ComponentType<SvgIconProps> {
  return ICON_BY_NAME.get(name) ?? HelpOutline;
}
