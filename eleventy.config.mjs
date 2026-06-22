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

  // YYYY-MM-DD for the blog list and article kicker.
  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().slice(0, 10);
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
