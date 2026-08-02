#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import {
  completionDocs,
  CompletionDocItem,
} from "./src/monaco/completion-docs.generated";
import typedocData from "./docs/typedoc.json";

// Define category descriptions (we still need these for metadata)
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  String: "String manipulation and formatting functions",
  Math: "Mathematical operations and calculations",
  Array: "Array operations and transformations",
  Object: "Object manipulation and inspection",
  DateTime: "Date and time operations",
  Encoding: "Data encoding and formatting utilities",
  Conversion: "Convert between different data types",
  Utility: "General utility functions",
};

interface CategoryInfo {
  name: string;
  description: string;
}

interface CategorizedDocs {
  [key: string]: {
    category: CategoryInfo;
    items: CompletionDocItem[];
  };
}

function getGroupFromTypedoc(functionName: string): string | null {
  // Search through the TypeDoc JSON to find the @group tag for this function
  const child = typedocData.children?.find(
    (child: any) => child.name === functionName,
  );
  if (!child) return null;

  const signature = child.signatures?.[0];
  if (!signature) return null;

  const groupTag = (signature as any).comment?.blockTags?.find(
    (tag: any) => tag.tag === "@group",
  );
  if (!groupTag) return null;

  return groupTag.content?.[0]?.text || null;
}

function categorizeItems(items: CompletionDocItem[]): CategorizedDocs {
  const categorized: CategorizedDocs = {};
  const categories = new Set<string>();

  // First pass: collect all categories from @group tags
  items.forEach((item) => {
    const group = getGroupFromTypedoc(item.name);
    if (group) {
      categories.add(group);
    }
  });

  // Initialize categories
  categories.forEach((categoryName) => {
    const key = categoryName.toLowerCase().replace(/\s+/g, "");
    categorized[key] = {
      category: {
        name: categoryName,
        description:
          CATEGORY_DESCRIPTIONS[categoryName] ||
          `${categoryName} functions and utilities`,
      },
      items: [],
    };
  });

  // Add a default utility category for uncategorized items
  if (!categorized.utility) {
    categorized.utility = {
      category: {
        name: "Utility",
        description: "General utility functions",
      },
      items: [],
    };
  }

  // Categorize items
  items.forEach((item) => {
    const group = getGroupFromTypedoc(item.name);
    if (group) {
      const key = group.toLowerCase().replace(/\s+/g, "");
      if (categorized[key]) {
        categorized[key].items.push(item);
      } else {
        // Fallback to utility if category doesn't exist
        categorized.utility.items.push(item);
      }
    } else {
      // No @group tag found, add to utility
      categorized.utility.items.push(item);
    }
  });

  return categorized;
}

function generateFunctionMDX(item: CompletionDocItem): string {
  const {
    name,
    label,
    description,
    examples,
    parameters,
    returns,
    type,
    aliases,
  } = item;

  // Create aliases section if they exist
  const aliasesSection =
    aliases && aliases.length > 0
      ? `\n## Aliases\n\n${aliases.map((alias) => `\`${alias}\``).join(", ")}\n`
      : "";

  // Create parameters section
  const parametersSection =
    parameters.length > 0
      ? `\n## Parameters\n\n${parameters
          .map(
            (param) =>
              `- **${param.name}** (${param.type}${
                param.optional ? "?" : ""
              }): ${param.description}`,
          )
          .join("\n")}\n`
      : "";

  // Create examples section
  const examplesSection =
    examples.length > 0
      ? `\n## Examples\n\n${examples
          .map((example) => `\`\`\`javascript\n${example}\n\`\`\``)
          .join("\n\n")}\n`
      : "";

  // Create returns section
  const returnsSection = returns.description
    ? `\n## Returns\n\n**Type:** \`${returns.type}\`\n\n${returns.description}\n`
    : "";

  return `---
title: ${label}
description: ${description}
---

# ${label}

${description}

**Type:** ${type}
${aliasesSection}${parametersSection}${returnsSection}${examplesSection}`;
}

function generateCategoryIndexMDX(
  categoryKey: string,
  category: CategoryInfo,
  items: CompletionDocItem[],
): string {
  const functionItems = items.filter((item) => item.type === "function");
  const transformItems = items.filter((item) => item.type === "transform");

  const functionsSection =
    functionItems.length > 0
      ? `\n## Functions\n\n${functionItems
          .map(
            (item) =>
              `- [\`${item.label}\`](./${categoryKey}/${item.label}): ${item.description}`,
          )
          .join("\n")}\n`
      : "";

  const transformsSection =
    transformItems.length > 0
      ? `\n## Transforms\n\n${transformItems
          .map(
            (item) =>
              `- [\`${item.label}\`](./${categoryKey}/${item.label}): ${item.description}`,
          )
          .join("\n")}\n`
      : "";

  return `---
title: ${category.name}
description: ${category.description}
---

# ${category.name}

${category.description}
${functionsSection}${transformsSection}`;
}

function generateMainIndexMDX(categorized: CategorizedDocs): string {
  const categorySections = Object.entries(categorized)
    .filter(([_, data]) => data.items.length > 0)
    .map(([key, data]) => {
      const functionCount = data.items.filter(
        (item) => item.type === "function",
      ).length;
      const transformCount = data.items.filter(
        (item) => item.type === "transform",
      ).length;
      const countText = `(${functionCount} functions, ${transformCount} transforms)`;

      return `- [**${data.category.name}**](./${key}): ${data.category.description} ${countText}`;
    })
    .join("\n");

  return `---
title: Function Reference
description: Complete reference for all JEXL Extended functions and transforms
---

# Function Reference

JEXL Extended provides over 80 built-in functions and transforms organized into the following categories:

${categorySections}

## Usage

Functions are called directly:
\`\`\`javascript
abs(-5) // Returns: 5
max([1, 2, 3]) // Returns: 3
\`\`\`

Transforms are used with the pipe operator:
\`\`\`javascript
"hello world" | uppercase // Returns: "HELLO WORLD"
[1, 2, 3] | map("value * 2") // Returns: [2, 4, 6]
\`\`\`

Many functions can also be used as transforms when they have a single parameter.
`;
}

async function generateMDXDocs(): Promise<void> {
  const outputDir = "./docs/reference";

  console.log("🏗️  Generating MDX documentation...");

  // Clean MDX files but preserve typedoc.json and any HTML files
  if (fs.existsSync(outputDir)) {
    const entries = fs.readdirSync(outputDir, { withFileTypes: true });

    // Remove MDX files and directories, but preserve other files
    entries.forEach((entry) => {
      const fullPath = path.join(outputDir, entry.name);

      if (entry.isDirectory()) {
        // Remove directories (they likely contain MDX files)
        try {
          fs.rmSync(fullPath, { recursive: true });
        } catch (err) {
          console.warn(`Warning: Could not remove directory ${fullPath}:`, err);
        }
      } else if (entry.name.endsWith(".mdx")) {
        // Remove MDX files
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.warn(`Warning: Could not remove file ${fullPath}:`, err);
        }
      }
      // Preserve typedoc.json, HTML files, and other assets
    });
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Categorize items
  const categorized = categorizeItems(completionDocs);

  // Generate main index
  const mainIndex = generateMainIndexMDX(categorized);
  fs.writeFileSync(path.join(outputDir, "index.mdx"), mainIndex);
  console.log("✅ Generated main index");

  let totalGenerated = 0;

  // Generate category pages and individual function pages
  for (const [categoryKey, data] of Object.entries(categorized)) {
    if (data.items.length === 0) continue;

    // Create category directory
    const categoryDir = path.join(outputDir, categoryKey);
    fs.mkdirSync(categoryDir, { recursive: true });

    // Generate category index
    const categoryIndex = generateCategoryIndexMDX(
      categoryKey,
      data.category,
      data.items,
    );
    fs.writeFileSync(path.join(categoryDir, "index.mdx"), categoryIndex);

    // Generate individual function pages
    for (const item of data.items) {
      const functionMDX = generateFunctionMDX(item);
      fs.writeFileSync(
        path.join(categoryDir, `${item.label}.mdx`),
        functionMDX,
      );
      totalGenerated++;
    }

    console.log(
      `✅ Generated ${data.category.name} category (${data.items.length} items)`,
    );
  }

  console.log(
    `\n🎉 Successfully generated ${totalGenerated} MDX pages in ${outputDir}/`,
  );
  console.log(
    `📁 Categories created: ${
      Object.keys(categorized).filter(
        (key) => categorized[key].items.length > 0,
      ).length
    }`,
  );
}

// Run the generator (only when executed directly, not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateMDXDocs().catch(console.error);
}

export { generateMDXDocs };
