import { Box } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import { formatEuro } from "@/modules/contracts/calendar";
import type { CategoryProviderFlow } from "@/modules/contracts/dashboard";
import { findCategory, type Category } from "@/modules/categories/model";

interface NodeData {
  id: string;
  label: string;
  color: string;
}
type Node = SankeyNode<NodeData, object>;
type Link = SankeyLink<NodeData, object>;

// Dessiné dans un repère fixe que le SVG étire à la largeur de la carte :
// pas de mesure en JS, le rendu reste côté serveur.
const WIDTH = 900;
const LABEL_SPACE = 190;
const ROW = 30;

const euro = (n: number) => formatEuro(Math.round(n));

/** Coût mensuel → catégories → fournisseurs. */
export default function SankeyChart({
  flows,
  categories,
}: {
  flows: CategoryProviderFlow[];
  categories: Category[];
}) {
  const catColor = (slug: string) => findCategory(categories, slug).color;
  const total = flows.reduce((s, f) => s + f.monthlyCost, 0);
  const catTotals = new Map<string, number>();
  for (const f of flows) catTotals.set(f.category, (catTotals.get(f.category) ?? 0) + f.monthlyCost);
  const providers = [...new Set(flows.map((f) => f.provider))];

  const nodes: NodeData[] = [
    { id: "total", label: "Coût mensuel", color: "var(--mui-palette-primary-dark)" },
    ...[...catTotals.keys()].map((slug) => ({
      id: `c:${slug}`,
      label: findCategory(categories, slug).label,
      color: catColor(slug),
    })),
    ...providers.map((p) => ({ id: `p:${p}`, label: p, color: "var(--mui-palette-text-secondary)" })),
  ];
  const links = [
    ...[...catTotals.entries()].map(([slug, value]) => ({ source: "total", target: `c:${slug}`, value, color: catColor(slug) })),
    ...flows.map((f) => ({ source: `c:${f.category}`, target: `p:${f.provider}`, value: f.monthlyCost, color: catColor(f.category) })),
  ];

  const height = Math.max(260, Math.max(providers.length, catTotals.size) * ROW);
  const graph = sankey<NodeData, object>()
    .nodeId((n) => n.id)
    .nodeWidth(12)
    .nodePadding(14)
    .extent([[0, 8], [WIDTH - LABEL_SPACE, height - 8]])({
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l })),
  });
  const path = sankeyLinkHorizontal();
  const name = (n: Node | string | number) => (n as Node).label;

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`Répartition du coût mensuel de ${euro(total)} par catégorie puis par fournisseur. Détail dans la liste qui suit.`}
        sx={{ display: "block", width: "100%", minWidth: 640, height: "auto" }}
      >
        <g fill="none">
          {(graph.links as (Link & { color: string })[]).map((l, i) => (
            <path
              key={i}
              d={path(l) ?? undefined}
              stroke={l.color}
              strokeOpacity={0.45}
              strokeWidth={Math.max(1, l.width ?? 1)}
            >
              <title>{`${name(l.source)} → ${name(l.target)} : ${euro(l.value)} / mois`}</title>
            </path>
          ))}
        </g>
        {(graph.nodes as Node[]).map((n) => {
          const x0 = n.x0 ?? 0, x1 = n.x1 ?? 0, y0 = n.y0 ?? 0, y1 = n.y1 ?? 0;
          return (
            <g key={n.id}>
              <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} rx={2} fill={n.color}>
                <title>{`${n.label} : ${euro(n.value ?? 0)} / mois`}</title>
              </rect>
              <text
                x={x1 + 8}
                y={(y0 + y1) / 2}
                dominantBaseline="middle"
                fontSize={13}
                fill="var(--mui-palette-text-primary)"
                // Halou de la couleur de la carte : le libellé reste lisible sur les flux.
                stroke="var(--mui-palette-background-paper)"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {n.label}{" "}
                <tspan fill="var(--mui-palette-text-secondary)">{euro(n.value ?? 0)}</tspan>
              </text>
            </g>
          );
        })}
      </Box>
      <Box component="ul" sx={visuallyHidden}>
        {[...catTotals.entries()].map(([slug, value]) => (
          <li key={slug}>
            {findCategory(categories, slug).label} : {euro(value)} par mois, dont{" "}
            {flows
              .filter((f) => f.category === slug)
              .map((f) => `${f.provider} ${euro(f.monthlyCost)}`)
              .join(", ")}
          </li>
        ))}
      </Box>
    </Box>
  );
}
