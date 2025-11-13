import programsData from "../../../data/programs.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { notFound } from "next/navigation";

/* helper slug function (matches the slug in JSON if needed) */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateStaticParams() {
  const params = [];
  const cats = programsData?.categories || [];
  for (const cat of cats) {
    for (const p of cat.programs || []) {
      const slug = typeof p === "string" ? slugify(p) : (p.slug || slugify(p.title));
      params.push({ slug });
    }
  }
  return params;
}

export default function ProgramDetail({ params }) {
  const { slug } = params;
  let program = null;

  // find the program across categories
  for (const cat of programsData?.categories || []) {
    for (const p of cat.programs || []) {
      const candidateSlug = typeof p === "string" ? slugify(p) : (p.slug || slugify(p.title));
      if (candidateSlug === slug) {
        program = typeof p === "string"
          ? { title: p, slug: candidateSlug, description: "", short: "", images: [], donation_target: undefined }
          : { ...p };
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
        <div className="mb-3 text-sm text-gray-500">Category: {program.category || "General"}</div>
        <h1 className="text-2xl font-bold mb-3">{program.title}</h1>
        {program.short && <p className="text-gray-600 mb-3">{program.short}</p>}

        {/* Markdown-rendered description */}
       <div className="prose prose-lg max-w-none text-gray-700 mb-6">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h2: ({node, ...props}) => (
        <h2 className="mt-8 mb-3 font-bold text-xl text-gray-900" {...props} />
      ),
      h3: ({node, ...props}) => (
        <h3 className="mt-6 mb-2 font-semibold text-lg text-gray-800" {...props} />
      ),
      p: ({node, ...props}) => (
        <p className="mb-4 leading-relaxed" {...props} />
      ),
      hr: () => <hr className="my-8 border-gray-300" />,
    }}
  >
    {program.description}
  </ReactMarkdown>
</div>


        {/* images (if any) */}
        {program.images && program.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {program.images.map((src, i) => (
              <img key={i} src={src} alt={`${program.title} ${i + 1}`} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        )}

        {program.donation_target ? (
          <div className="mb-6">
            <strong>Donation target:</strong> ₹{Number(program.donation_target).toLocaleString()}
          </div>
        ) : null}

        <div className="flex gap-3">
          <Link href="/donate" className="px-4 py-2 rounded-md bg-purple-600 text-white">Donate</Link>
          <Link href="/volunteer" className="px-4 py-2 rounded-md border">Volunteer</Link>
        </div>
      </div>
    </main>
  );
}
