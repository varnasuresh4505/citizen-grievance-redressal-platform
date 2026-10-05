// Advisory-only local AI substitute for the academic project. Officers confirm all decisions.
const rules = [
  { terms: ["water", "pipe", "tap", "leak", "drain"], category: "Water Supply", priority: "High", summary: "Water-supply or leakage concern reported." },
  { terms: ["garbage", "waste", "dustbin", "sanitation", "sewage"], category: "Sanitation & Waste Management", priority: "Medium", summary: "Sanitation or waste-management concern reported." },
  { terms: ["road", "pothole", "footpath", "bridge"], category: "Roads & Street Infrastructure", priority: "High", summary: "Road or public-infrastructure concern reported." },
  { terms: ["street light", "streetlight", "electric", "lamp", "pole"], category: "Street Lighting & Electricity", priority: "High", summary: "Street-lighting or electricity concern reported." },
  { terms: ["mosquito", "health", "dog", "disease", "clinic"], category: "Public Health", priority: "High", summary: "Public-health concern reported." },
];

const analyzeGrievance = (text) => {
  const input = String(text || "").toLowerCase();
  const candidates = rules.map((rule) => ({ rule, hits: rule.terms.filter((term) => input.includes(term)) })).filter((item) => item.hits.length).sort((a, b) => b.hits.length - a.hits.length);
  const best = candidates[0];
  if (!best) return { category: "Other Government Services", severity: "Medium", summary: "No confident category recommendation; officer review is required.", keywords: [], confidence: 0.2, processingStatus: "completed" };
  return { category: best.rule.category, severity: best.rule.priority, summary: best.rule.summary, keywords: best.hits, confidence: Math.min(0.95, 0.62 + best.hits.length * 0.12), processingStatus: "completed" };
};

module.exports = { analyzeGrievance };
