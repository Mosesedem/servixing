"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Shield,
  Package,
  Wrench,
  CreditCard,
  AlertCircle,
  Lightbulb,
  FileQuestion,
} from "lucide-react";

// Types for search items
type QuestionItem = {
  category: string;
  icon: any;
  q: string;
  a: string;
};

// Render highlighted text using Fuse match indices (no dangerouslySetInnerHTML)
const renderHighlighted = (
  text: string,
  matches: ReadonlyArray<FuseResultMatch> | undefined,
  key: "q" | "a" | "category"
): ReactNode => {
  if (!matches || !text) return text;
  const match = matches.find((m) => m.key === key);
  if (!match || !match.indices?.length) return text;

  const parts: Array<string | ReactNode> = [];
  let lastIndex = 0;
  match.indices.forEach(([start, end]: [number, number], i: number) => {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <mark
        key={`${key}-hl-${i}-${start}-${end}`}
        className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
      >
        {text.slice(start, end + 1)}
      </mark>
    );
    lastIndex = end + 1;
  });
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
};

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem("help_recent_searches");
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, []);

  const saveRecentSearch = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setRecentSearches((prev) => {
      const next = [
        value,
        ...prev.filter((x) => x.toLowerCase() !== value.toLowerCase()),
      ].slice(0, 7);
      try {
        localStorage.setItem("help_recent_searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const faqs = [
    {
      category: "General",
      icon: HelpCircle,
      questions: [
        {
          q: "How long does a typical repair take?",
          a: "Most repairs are completed within 24-48 hours. Screen replacements and battery replacements can often be done same-day. Complex repairs like motherboard issues may take 3-5 business days.",
        },
        {
          q: "Do you offer a warranty on repairs?",
          a: "Yes! All our repairs come with a 90-day warranty covering both parts and labor. If you experience any issues within this period, we'll fix it at no additional charge.",
        },
        {
          q: "Can I track my repair status?",
          a: "Absolutely! Once you create an account and submit a work order, you can track your repair status in real-time through your dashboard. You'll also receive email notifications for status updates.",
        },
      ],
    },
    {
      category: "Pricing & Payment",
      icon: CreditCard,
      questions: [
        {
          q: "How much does a repair cost?",
          a: "Repair costs vary by device and issue. We offer free diagnostics to provide you with an accurate quote. Check our Services page for estimated pricing ranges.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards through our secure Paystack payment gateway. Payment is required before we begin the repair work.",
        },
        {
          q: "Can I get a refund?",
          a: "Refunds are handled on a case-by-case basis. If we're unable to repair your device, you'll receive a full refund minus any diagnostic fees. Contact our support team for specific refund requests.",
        },
      ],
    },
    {
      category: "Parts & Quality",
      icon: Package,
      questions: [
        {
          q: "Do you use genuine parts?",
          a: "We use a mix of OEM (Original Equipment Manufacturer) parts and high-quality aftermarket parts. You can choose your preference, and we'll always inform you which type we're using.",
        },
        {
          q: "Can I buy parts without repair service?",
          a: "Yes! Browse our parts catalog to find and purchase parts directly. We source parts from trusted suppliers and eBay verified sellers.",
        },
        {
          q: "What if the part doesn't fix my device?",
          a: "Our technicians perform thorough diagnostics before ordering parts. If a part doesn't resolve the issue, we'll investigate further and provide you with options at no additional diagnostic charge.",
        },
      ],
    },
    {
      category: "Service Process",
      icon: Wrench,
      questions: [
        {
          q: "How do I book a repair?",
          a: "Create a free account, register your device, and submit a work order describing the issue. You can then drop off your device at our location or request a pickup service.",
        },
        {
          q: "Do I need to back up my data?",
          a: "Yes, we strongly recommend backing up your data before any repair. While we take precautions, we cannot guarantee data preservation during hardware repairs.",
        },
        {
          q: "What happens if my device can't be repaired?",
          a: "If we determine your device cannot be economically repaired, we'll inform you immediately. You won't be charged for repairs we couldn't complete, only the diagnostic fee if applicable.",
        },
      ],
    },
  ];

  const quickLinks = [
    {
      icon: Book,
      title: "Getting Started Guide",
      desc: "Learn how to use Servixing",
      href: "#getting-started",
    },
    {
      icon: Shield,
      title: "Warranty Information",
      desc: "Understand our warranty policy",
      href: "#warranty",
    },
    {
      icon: Package,
      title: "Parts Catalog",
      desc: "Browse available parts",
      href: "/parts",
    },
    {
      icon: Lightbulb,
      title: "Knowledge Base",
      desc: "Learn and bootstrap your own DIY",
      href: "/knowledge-base",
    },
    {
      icon: MessageSquare,
      title: "Contact Support",
      desc: "Get help from our team",
      href: "/support/create-ticket",
    },
    {
      icon: FileQuestion,
      title: "FAQs",
      desc: "Frequently asked questions and answers.",
      href: "/support/create-ticket",
    },
  ];

  // Build flat list for Fuse and prepare grouped results
  const allQuestions: QuestionItem[] = useMemo(() => {
    const list: QuestionItem[] = [];
    faqs.forEach((cat) => {
      cat.questions.forEach((q) => {
        list.push({ category: cat.category, icon: cat.icon, q: q.q, a: q.a });
      });
    });
    return list;
  }, [faqs]);

  const fuse = useMemo(() => {
    return new Fuse<QuestionItem>(allQuestions, {
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
      keys: [
        { name: "q", weight: 0.6 },
        { name: "a", weight: 0.3 },
        { name: "category", weight: 0.1 },
      ],
    });
  }, [allQuestions]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.trim();
    const results = fuse.search(query);

    const byCategory = new Map<
      string,
      {
        category: string;
        icon: any;
        questions: Array<{
          q: string;
          a: string;
          matches?: ReadonlyArray<FuseResultMatch>;
        }>;
      }
    >();

    results
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .forEach((res) => {
        const item = res.item;
        if (!byCategory.has(item.category)) {
          byCategory.set(item.category, {
            category: item.category,
            icon: item.icon,
            questions: [],
          });
        }
        const bucket = byCategory.get(item.category)!;
        bucket.questions.push({ q: item.q, a: item.a, matches: res.matches });
      });

    return Array.from(byCategory.values());
  }, [fuse, searchQuery, faqs]);

  const hasSearchResults = searchQuery.trim() && filteredFaqs.length > 0;
  const hasNoResults = searchQuery.trim() && filteredFaqs.length === 0;

  // Keep search bar in view when searching (don't jump away to results)
  useEffect(() => {
    if (!searchQuery.trim() || !searchRef.current) return;
    const el = searchRef.current;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const padding = 16; // small top/bottom threshold
    const isFullyInView = rect.top >= padding && rect.bottom <= vh - padding;
    if (!isFullyInView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-orange-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            How Can We Help You?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Search our knowledge base or browse common questions below
          </p>

          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Try 'warranty', 'repair cost', or 'track order'..."
              className="pl-12 h-14 text-base bg-background"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onKeyDown={(e) => {
                const suggestions = searchQuery.trim()
                  ? recentSearches.filter((r) =>
                      r.toLowerCase().includes(searchQuery.trim().toLowerCase())
                    )
                  : recentSearches;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (!suggestions.length) return;
                  setHighlightedIndex((i) => (i + 1) % suggestions.length);
                  setShowSuggestions(true);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (!suggestions.length) return;
                  setHighlightedIndex(
                    (i) => (i - 1 + suggestions.length) % suggestions.length
                  );
                  setShowSuggestions(true);
                } else if (e.key === "Enter") {
                  const pick = suggestions[highlightedIndex];
                  const value = pick ?? searchQuery.trim();
                  if (value) {
                    setSearchQuery(value);
                    saveRecentSearch(value);
                    setShowSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions &&
              (recentSearches.length > 0 || searchQuery.trim()) && (
                <div
                  role="listbox"
                  aria-label="Recent searches"
                  className="absolute z-20 mt-2 w-full rounded-md border bg-background shadow-md overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b">
                    <span>Recent searches</span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        className="hover:underline"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setRecentSearches([]);
                          try {
                            localStorage.removeItem("help_recent_searches");
                          } catch {}
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {(() => {
                    const items = searchQuery.trim()
                      ? recentSearches.filter((r) =>
                          r
                            .toLowerCase()
                            .includes(searchQuery.trim().toLowerCase())
                        )
                      : recentSearches;
                    return items.length ? (
                      items.map((item, idx) => (
                        <div
                          key={item + idx}
                          role="option"
                          aria-selected={idx === highlightedIndex}
                          className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer ${
                            idx === highlightedIndex
                              ? "bg-orange-50 dark:bg-orange-950/30"
                              : ""
                          }`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchQuery(item);
                            saveRecentSearch(item);
                            setShowSuggestions(false);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          <span className="truncate">{item}</span>
                          <button
                            aria-label={`Remove ${item} from recent searches`}
                            className="ml-3 text-xs text-muted-foreground hover:underline"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecentSearches((prev) => {
                                const next = prev.filter((p) => p !== item);
                                try {
                                  localStorage.setItem(
                                    "help_recent_searches",
                                    JSON.stringify(next)
                                  );
                                } catch {}
                                return next;
                              });
                            }}
                          >
                            remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No recent searches
                      </div>
                    );
                  })()}
                </div>
              )}
          </div>

          {hasSearchResults && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium">
                Found{" "}
                {filteredFaqs.reduce(
                  (acc, cat) => acc + cat.questions.length,
                  0
                )}{" "}
                result(s) for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Search Results or Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        {!searchQuery.trim() && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href}>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-800">
                  <link.icon className="h-8 w-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-1">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Search Results Section */}
      {searchQuery.trim() && (
        <section
          ref={resultsRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Search Results</h2>
            <p className="text-muted-foreground">
              Results are ranked by relevance to your query
            </p>
          </div>

          {hasNoResults ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any articles matching "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredFaqs.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <category.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold">{category.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.questions.map(
                      (
                        item: {
                          q: string;
                          a: string;
                          matches?: ReadonlyArray<FuseResultMatch>;
                        },
                        i: number
                      ) => (
                        <Card
                          key={i}
                          className="p-0 overflow-hidden border-l-4 border-l-orange-500"
                        >
                          <details className="group open:bg-orange-50/30 dark:open:bg-orange-950/20">
                            <summary className="list-none cursor-pointer select-none p-6 flex items-start gap-2">
                              <HelpCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                              <span className="font-semibold text-lg">
                                {renderHighlighted(item.q, item.matches, "q")}
                              </span>
                              <span className="ml-auto transition-transform group-open:rotate-180">
                                ▾
                              </span>
                            </summary>
                            <div className="px-6 pb-6 -mt-2">
                              <p className="text-muted-foreground leading-relaxed pl-7">
                                {renderHighlighted(item.a, item.matches, "a")}
                              </p>
                            </div>
                          </details>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* FAQs - Only show when no search */}
      {!searchQuery.trim() && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {faqs.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <category.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.category}</h3>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, i) => (
                    <Card key={i} className="p-0 overflow-hidden">
                      <details className="group">
                        <summary className="list-none cursor-pointer select-none p-6 flex items-start gap-2">
                          <HelpCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                          <span className="font-semibold text-lg">
                            {item.q}
                          </span>
                          <span className="ml-auto transition-transform group-open:rotate-180">
                            ▾
                          </span>
                        </summary>
                        <div className="px-6 pb-6 -mt-2">
                          <p className="text-muted-foreground leading-relaxed pl-7">
                            {item.a}
                          </p>
                        </div>
                      </details>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Getting Started */}
      <section
        id="getting-started"
        className="bg-gray-50 dark:bg-gray-900/50 py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Getting Started with Servixing
            </h2>
            <p className="text-lg text-muted-foreground">
              Follow these simple steps to get your device repaired
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Create Your Account",
                desc: "Sign up for free to access our repair management platform. You can also browse parts without an account.",
                action: "Create Account",
                href: "/auth/signup",
              },
              {
                step: 2,
                title: "Register Your Device",
                desc: "Add your device details including brand, model, and serial number for accurate service.",
                action: "View Dashboard",
                href: "/dashboard",
              },
              {
                step: 3,
                title: "Submit Work Order",
                desc: "Describe the issue you're experiencing and we'll provide a free diagnostic and quote.",
                action: "Create Work Order",
                href: "/dashboard/work-orders/create",
              },
              {
                step: 4,
                title: "Track & Pay",
                desc: "Monitor your repair status in real-time and pay securely when work is approved.",
                action: "Browse Services",
                href: "/services",
              },
            ].map((step) => (
              <Card key={step.step} className="p-6">
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.desc}</p>
                    <Link href={step.href}>
                      <Button variant="outline" size="sm">
                        {step.action}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Info */}
      <section
        id="warranty"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-orange-600" />
          <h2 className="text-3xl font-bold mb-4">90-Day Warranty</h2>
          <p className="text-lg text-muted-foreground">
            All repairs are backed by our comprehensive warranty
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What's Covered</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    All replacement parts installed by our technicians
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Labor costs for the original repair work</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Defects in parts or workmanship within 90 days</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">What's Not Covered</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Physical damage after repair completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Water damage or liquid exposure post-repair</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Repairs performed by third parties</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Still Need Help?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Our support team is here to assist you with any questions or
            concerns.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-6">
              <Phone className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm opacity-90">Mon-Fri, 9am-6pm</p>
              <p className="font-semibold mt-2">+1 (555) 123-4567</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <Mail className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm opacity-90">24/7 response time</p>
              <p className="font-semibold mt-2">support@servixing.com</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <Clock className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm opacity-90">Mon-Fri, 9am-6pm</p>
              <p className="font-semibold mt-2">Start Chat Below</p>
            </div>
          </div>

          <Link href="/support/create-ticket">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 h-12 px-8 text-base font-semibold"
            >
              Create Support Ticket
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
