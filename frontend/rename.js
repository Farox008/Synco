const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.css')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const frontendSrc = path.join(__dirname, 'src');
const files = walkSync(frontendSrc);

const dictionary = [
  // File paths and imports
  { regex: /work-orders/g, replacement: "job-orders" },
  { regex: /\/jobs/g, replacement: "/tools" },
  { regex: /components\/jobs/g, replacement: "components/tools" },
  
  // Plurals and specific terms first
  { regex: /Work Orders/g, replacement: "Job Orders" },
  { regex: /work orders/gi, replacement: "job orders" },
  { regex: /Work Order/g, replacement: "Job Order" },
  { regex: /work order/gi, replacement: "job order" },
  { regex: /WorkOrder/g, replacement: "JobOrder" },
  { regex: /workOrder/g, replacement: "jobOrder" },

  { regex: /Production Jobs/g, replacement: "Tools" },
  { regex: /Job Detail/g, replacement: "Tool Detail" },
  { regex: /Job Table/g, replacement: "Tool Table" },
  { regex: /Job Stats/g, replacement: "Tool Stats" },
  { regex: /Job Filter Bar/g, replacement: "Tool Filter Bar" },
  { regex: /Job FilterBar/g, replacement: "Tool FilterBar" },
  { regex: /Job Modules/g, replacement: "Tool Modules" },
  { regex: /Job Status/g, replacement: "Tool Status" },
  { regex: /Recent Jobs/g, replacement: "Recent Tools" },
  { regex: /Delayed Jobs/g, replacement: "Delayed Tools" },
  { regex: /Job Process Monitor/g, replacement: "Tool Process Monitor" },
  { regex: /Share Job/g, replacement: "Share Tool" },
  
  { regex: /activeJobs/g, replacement: "activeTools" },
  { regex: /delayedJobs/g, replacement: "delayedTools" },
  { regex: /recentJobs/g, replacement: "recentTools" },
  { regex: /JobStatusBreakdown/g, replacement: "ToolStatusBreakdown" },
  { regex: /jobStatusBreakdown/g, replacement: "toolStatusBreakdown" },
  { regex: /JobProcessMonitor/g, replacement: "ToolProcessMonitor" },
  { regex: /JobStats/g, replacement: "ToolStats" },
  { regex: /JobTable/g, replacement: "ToolTable" },
  { regex: /JobFilterBar/g, replacement: "ToolFilterBar" },
  
  // Standalone Job/Jobs replacements (we need to be careful not to match JobOrder)
  { regex: /\bJobs\b/g, replacement: "Tools" },
  { regex: /\bjobs\b/g, replacement: "tools" },
  { regex: /\bJob(?!Order| Order|Orders| Orders)\b/g, replacement: "Tool" },
  { regex: /\bjob(?!Order| order|orders| orders)\b/g, replacement: "tool" },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const { regex, replacement } of dictionary) {
    newContent = newContent.replace(regex, replacement);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
  }
}
