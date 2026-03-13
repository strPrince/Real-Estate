import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do you verify property listings?",
    answer:
      "Every listing is checked for ownership details, legal status, pricing consistency, and location accuracy before it goes live.",
  },
  {
    question: "What areas in Vadodara do you specialize in?",
    answer:
      "We cover premium and emerging neighborhoods including Alkapuri, Gotri, Manjalpur, and Sama with fresh listings weekly.",
  },
  {
    question: "Can you help with home loan and documentation?",
    answer:
      "Yes. We guide you through financing options, documentation, and the registration process to keep everything transparent.",
  },
  {
    question: "Do you offer site visits and virtual tours?",
    answer:
      "We arrange on-site visits and can share video walkthroughs so you can shortlist confidently.",
  },
  {
    question: "How quickly can I get a property recommendation?",
    answer:
      "After a short requirement call, we usually share tailored options within 24 to 48 hours.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-white border border-gray-200 shadow-[0_24px_60px_-22px_rgba(15,23,42,0.2)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(248,250,252,0.8)_0%,rgba(248,250,252,0.8)_50%,transparent_50%,transparent_100%)] opacity-70" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.2fr] gap-10 p-8 sm:p-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
                Answers to Common Questions
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Everything you need to know about buying, renting, and investing
                in Vadodara. If you need more clarity, our team is a quick call
                away.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-500">
                <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-center">
                  Verified listings
                </span>
                <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-center">
                  Local experts
                </span>
                <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-center">
                  Transparent process
                </span>
                <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-center">
                  24-48 hour replies
                </span>
              </div>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.2)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                  Need clarity?
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Share your requirement and we will recommend options matched to your budget and timeline.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="group relative rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 transition-all hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.2)] group-open:border-brand-200 group-open:bg-brand-50/40"
                >
                  <span className="pointer-events-none absolute left-0 top-6 h-10 w-1 rounded-full bg-brand-500/80 opacity-0 transition-opacity group-open:opacity-100" />
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left marker:hidden">
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.32em] text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {item.question}
                      </span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-transform duration-300 group-open:rotate-180 group-open:border-brand-200 group-open:text-brand-600">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
