import React from "react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

type DemoItem = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  energy?: number;
  status?: "planned" | "active" | "complete";
};

// Lightweight demo aligned to five lands concept instead of project phases
const demoItems: DemoItem[] = [
  { id: "kurinji", title: "Kurinji", category: "Kurinji", description: "Cool mountainous eco-region.", energy: 70, status: "active" },
  { id: "mullai", title: "Mullai", category: "Mullai", description: "Pastoral / forest zone.", energy: 55, status: "planned" },
  { id: "marutham", title: "Marutham", category: "Marutham", description: "Fertile river valley.", energy: 65, status: "active" },
  { id: "neithal", title: "Neithal", category: "Neithal", description: "Coastal belt.", energy: 75, status: "complete" },
  { id: "palai", title: "Palai", category: "Palai", description: "Arid tract symbolizing hardship.", energy: 45, status: "planned" },
];

export function RadialOrbitalTimelineDemo() {
  return (
    <div className="p-6">
      <RadialOrbitalTimeline
        items={demoItems}
        centerLabel="Tamil Five Lands"
      />
    </div>
  );
}

export default RadialOrbitalTimelineDemo;
