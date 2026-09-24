import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export function MapView({
  className,
  initialCenter = { lat: 41.3189694444, lng: 19.827975 },
  initialZoom = 15,
}: MapViewProps) {
  const span = 0.02 / Math.pow(2, Math.max(0, initialZoom - 14));
  const west = (initialCenter.lng - span).toFixed(6);
  const south = (initialCenter.lat - span).toFixed(6);
  const east = (initialCenter.lng + span).toFixed(6);
  const north = (initialCenter.lat + span).toFixed(6);
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${initialCenter.lat}%2C${initialCenter.lng}`;

  return (
    <iframe
      title="Vendndodhja e Shkollës Asim Vokshi"
      src={embedUrl}
      className={cn("w-full h-[500px] border-0", className)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
