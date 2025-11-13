import programsData from "../../../data/programs.json";
import { notFound } from "next/navigation";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateStaticParams() {
  const params = [];
  for (const cat of (programsData.categories || [])) {
    for (const p of cat.programs) {
      const slug = typeof p === "string" ? slugify(p) : (p.slug || slugify(p.title));
      params.push({ slug });
    }
  }
  return params;
}

export default function ProgramDetailPage({ params }) {
  const { slug } = params;
  let program = null;

  for (const cat of (programsData.categories || [])) {
    for (const p of cat.programs) {
      const candidateSlug = typeof p === "string" ? slugify(p) : (p.slug || slugify(p.title));
      if (candidateSlug === slug) {
        program = typeof p === "string" ? { title: p, slug: candidateSlug } : { ...p };
        program.category = cat.title;
        break;
      }
    }
    if (program) break;
  }

  if (!program) return notFound();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-3 text-sm text-gray-500">Category: {program.category}</div>
        <h1 className="text-2xl font-bold mb-3">{program.title}</h1>
        {program.short && <p className="text-gray-600 mb-3">{program.short}</p>}
        <p className="text-gray-700 mb-6">{program.description || "No description available yet."}</p>

        {program.images && program.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {program.images.map((src, i) => (
              <img key={i} src={src} alt={`${program.title} ${i + 1}`} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        )}

        {program.donation_target ? (
          <div className="mb-6">
            <strong>Donation target:</strong> ₹{program.donation_target.toLocaleString()}
          </div>
        ) : null}

        <div className="flex gap-3">
          <LinkButton href="/donate">Donate to this program</LinkButton>
          <LinkButton href="/volunteer" variant="ghost">Volunteer</LinkButton>
        </div>
      </div>
    </main>
  );
}

// small LinkButton component to avoid additional imports
function LinkButton({ href, children, variant = "primary" }) {
  const base = "px-4 py-2 rounded-md font-medium inline-block text-center";
  const style =
    variant === "ghost"
      ? `${base} border`
      : `${base} bg-purple-600 text-white hover:bg-purple-700`;
  return (
    <a href={href} className={style}>
      {children}
    </a>
  );
}
