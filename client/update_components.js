// Script to systematically update all detail components to match KingDetail styling
// This will fix the CSS patterns for consistency across all components

const fs = require("fs");
const path = require("path");

const componentsDir = "src/components/details";

// Components that need updating based on the grep search results
const componentsToUpdate = [
  "ClothingDetail.jsx",
  "FoodDetail.jsx",
  "LiteratureDetail.jsx",
  "FestivalDetail.jsx",
];

// Old patterns to find and replace
const patterns = [
  // Pattern 1: Change rounded buttons to square KingDetail style
  {
    from: /borderRadius:\s*['"]20px['"]/,
    to: "border: '1px solid #000'",
  },
  // Pattern 2: Change button styling
  {
    from: /bgcolor:\s*['"]#000['"],\s*color:\s*['"]#fff['"],\s*borderRadius:\s*['"]20px['"]/,
    to: "color: '#000', textTransform: 'uppercase', fontSize: '0.7rem', border: '1px solid #000'",
  },
  // Pattern 3: Update comment section header
  {
    from: /Comments \(\{comments\.length\}\)/,
    to: "Comments ({comments.length})",
  },
];

function updateComponent(filename) {
  const filePath = path.join(componentsDir, filename);

  console.log(`Updating ${filename}...`);

  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Apply each pattern
    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern.from);
      if (matches) {
        console.log(`  Found pattern ${index + 1} in ${filename}`);
        content = content.replace(pattern.from, pattern.to);
      }
    });

    // Write back
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Updated ${filename}`);
  } catch (error) {
    console.error(`  ✗ Error updating ${filename}:`, error.message);
  }
}

// Main execution
console.log("Starting component updates...\n");

componentsToUpdate.forEach(updateComponent);

console.log("\n✓ Component updates completed!");
