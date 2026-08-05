import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // Only template-process Nunjucks and Markdown. The hand-built static pages
  // (index.html, og.html, prototype.html) are NOT templates and are left alone.
  eleventyConfig.setTemplateFormats(["njk", "md"]);

  // Pass the hand-built main site + shared assets straight through to _site.
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("gsap-public");
  eleventyConfig.addPassthroughCopy("vendor/lenis");
  eleventyConfig.addPassthroughCopy("favicon");
  // Also serve the .ico at the site root; browsers and crawlers request
  // /favicon.ico blindly when no page (and its <link> tags) is in hand.
  eleventyConfig.addPassthroughCopy({ "favicon/favicon.ico": "favicon.ico" });

  // YYYY-MM-DD for the blog list and article kicker.
  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().slice(0, 10);
  });

  // Give article section headings (h2–h4) stable slug ids at build time, so a
  // shared `…/#section` deep link resolves on first paint (before any JS). The
  // copy-link affordance itself is layered on client-side in article.njk. Hand-
  // rolled rather than pulling in markdown-it-anchor — we only need the id, and
  // the slug + collision handling is a few lines.
  eleventyConfig.amendLibrary("md", (md) => {
    const slugify = (text) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // drop punctuation (incl. inline-code backticks)
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/-+/g, "-") // collapse runs
        .replace(/^-|-$/g, ""); // trim edges

    md.core.ruler.push("heading_ids", (state) => {
      const used = new Set();
      const tokens = state.tokens;
      for (let i = 0; i < tokens.length; i++) {
        const open = tokens[i];
        if (open.type !== "heading_open") continue;
        if (!["h2", "h3", "h4"].includes(open.tag)) continue;
        const inline = tokens[i + 1];
        const slug = slugify(inline && inline.type === "inline" ? inline.content : "");
        if (!slug) continue;
        // De-dupe repeats (foo, foo-2, foo-3) against every id actually
        // emitted, not just base slugs, so a suffix can't collide with a
        // heading whose text already slugifies to it ("Foo", "Foo", "Foo 2").
        let id = slug;
        for (let n = 2; used.has(id); n++) id = `${slug}-${n}`;
        used.add(id);
        open.attrSet("id", id);
      }
    });
  });

  // Atom feed generated from the posts collection.
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "en",
      title: "Amadeus Kang — Blog",
      subtitle: "Notes on engineering and design.",
      base: "https://amadeuskang.com/",
      author: { name: "Amadeus Kang" },
    },
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    // Markdown stays pure content: don't run a template engine over it, so an
    // article that happens to contain {{ or {% is never misread as templating.
    markdownTemplateEngine: false,
  };
}
