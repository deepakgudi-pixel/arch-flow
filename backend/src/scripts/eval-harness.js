import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import pool from '../db/pool.js';
import { canonicalConnectionRules } from '../lib/connectionRules.js';
import { generateDiagramFromPrompt } from '../lib/diagramGenerator.js';
import {
  generatePromptMatrix,
  mergePromptSets,
  mineAIFailurePrompts,
  minePromptHistory,
  summarizePromptRuns
} from '../lib/evalHarness.js';

const DEFAULTS = {
  runs: 3,
  maxPrompts: 24,
  historyLimit: 8,
  failureLimit: 4,
  generateOnly: false,
  matrixPath: path.resolve(process.cwd(), 'evals/matrix.json'),
  outputPath: path.resolve(process.cwd(), 'evals/latest-report.json'),
  promptSetPath: path.resolve(process.cwd(), 'evals/generated-prompts.json'),
  markdownOutputPath: path.resolve(process.cwd(), 'evals/latest-report.md')
};

function parseArgs(argv) {
  const options = { ...DEFAULTS };
  let markdownOutputExplicit = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === '--generate-only') {
      options.generateOnly = true;
      continue;
    }

    if (arg === '--no-history') {
      options.historyLimit = 0;
      continue;
    }

    if (arg === '--no-failures') {
      options.failureLimit = 0;
      continue;
    }

    if (arg === '--runs' && nextValue) {
      options.runs = Number(nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--runs=')) {
      options.runs = Number(arg.split('=')[1]);
      continue;
    }

    if (arg === '--max-prompts' && nextValue) {
      options.maxPrompts = Number(nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--max-prompts=')) {
      options.maxPrompts = Number(arg.split('=')[1]);
      continue;
    }

    if (arg === '--history-limit' && nextValue) {
      options.historyLimit = Number(nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--history-limit=')) {
      options.historyLimit = Number(arg.split('=')[1]);
      continue;
    }

    if (arg === '--failure-limit' && nextValue) {
      options.failureLimit = Number(nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--failure-limit=')) {
      options.failureLimit = Number(arg.split('=')[1]);
      continue;
    }

    if (arg === '--matrix' && nextValue) {
      options.matrixPath = path.resolve(process.cwd(), nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--matrix=')) {
      options.matrixPath = path.resolve(process.cwd(), arg.split('=')[1]);
      continue;
    }

    if (arg === '--output' && nextValue) {
      options.outputPath = path.resolve(process.cwd(), nextValue);
      index += 1;
      continue;
    }

    if (arg.startsWith('--output=')) {
      options.outputPath = path.resolve(process.cwd(), arg.split('=')[1]);
      continue;
    }

    if (arg === '--markdown-output' && nextValue) {
      options.markdownOutputPath = path.resolve(process.cwd(), nextValue);
      markdownOutputExplicit = true;
      index += 1;
      continue;
    }

    if (arg.startsWith('--markdown-output=')) {
      options.markdownOutputPath = path.resolve(process.cwd(), arg.split('=')[1]);
      markdownOutputExplicit = true;
    }
  }

  options.runs = Math.max(1, Number(options.runs) || DEFAULTS.runs);
  options.maxPrompts = Math.max(1, Number(options.maxPrompts) || DEFAULTS.maxPrompts);
  options.historyLimit = Math.max(0, Number(options.historyLimit) || 0);
  options.failureLimit = Math.max(0, Number(options.failureLimit) || 0);
  if (!markdownOutputExplicit) {
    options.markdownOutputPath = options.outputPath.endsWith('.json')
      ? options.outputPath.replace(/\.json$/i, '.md')
      : `${options.outputPath}.md`;
  }

  return options;
}

async function loadMatrixConfig(matrixPath) {
  const raw = await readFile(matrixPath, 'utf8');
  return JSON.parse(raw);
}

async function ensureOutputDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function createGenerateOnlyReport(promptSpecs, options) {
  return {
    mode: 'generate-only',
    generatedAt: new Date().toISOString(),
    promptCount: promptSpecs.length,
    runsPerPrompt: options.runs,
    historyLimit: options.historyLimit,
    failureLimit: options.failureLimit,
    prompts: promptSpecs
  };
}

function createSummary(promptReports, options) {
  const successfulPrompts = promptReports.filter(report => report.successCount > 0);
  const averageScore = successfulPrompts.length === 0
    ? 0
    : Math.round(
        successfulPrompts.reduce((sum, report) => sum + report.averageScore, 0) / successfulPrompts.length
      );
  const averageStability = successfulPrompts.length === 0
    ? 0
    : Number(
        (
          successfulPrompts.reduce((sum, report) => sum + report.stability, 0) / successfulPrompts.length
        ).toFixed(3)
      );

  return {
    generatedAt: new Date().toISOString(),
    promptCount: promptReports.length,
    runsPerPrompt: options.runs,
    historyLimit: options.historyLimit,
    failureLimit: options.failureLimit,
    averageScore,
    averageStability,
    promptsPassing80: promptReports.filter(report => report.averageScore >= 80).length
  };
}

function truncate(value, maxLength = 96) {
  if (!value) {
    return '';
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}

function escapeMarkdownTable(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatPromptMetadata(promptSpec) {
  const parts = [];

  if (promptSpec.metadata?.family) parts.push(promptSpec.metadata.family);
  if (promptSpec.metadata?.clientType) parts.push(promptSpec.metadata.clientType);
  if (promptSpec.metadata?.scaleLevel) parts.push(promptSpec.metadata.scaleLevel);
  if (promptSpec.metadata?.constraint) parts.push(promptSpec.metadata.constraint);

  return parts.join(' / ') || promptSpec.source || 'prompt';
}

function renderGenerateOnlyMarkdown(promptSpecs, options) {
  const lines = [
    '# Eval Prompt Pack',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- Prompt count: ${promptSpecs.length}`,
    `- Runs per prompt: ${options.runs}`,
    `- History limit: ${options.historyLimit}`,
    `- Failure prompt limit: ${options.failureLimit}`,
    '',
    '## Prompts',
    '',
    '| ID | Prompt | Expectations |',
    '| --- | --- | --- |'
  ];

  promptSpecs.forEach(promptSpec => {
    const expectations = [
      ...(promptSpec.requiredCategories || []),
      promptSpec.requireAuth ? 'auth-check' : null,
      promptSpec.requireQueue ? 'queue-check' : null,
      promptSpec.requireDevops ? 'devops-check' : null
    ].filter(Boolean).join(', ');

    lines.push(
      `| ${escapeMarkdownTable(promptSpec.id)} | ${escapeMarkdownTable(truncate(promptSpec.prompt, 110))} | ${escapeMarkdownTable(expectations || formatPromptMetadata(promptSpec))} |`
    );
  });

  return `${lines.join('\n')}\n`;
}

function renderEvalMarkdown(report) {
  const summary = report.summary;
  const lines = [
    '# Eval Scoreboard',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    `- Prompt count: ${summary.promptCount}`,
    `- Runs per prompt: ${summary.runsPerPrompt}`,
    `- History limit: ${summary.historyLimit}`,
    `- Failure prompt limit: ${summary.failureLimit}`,
    `- Average score: ${summary.averageScore}`,
    `- Average stability: ${summary.averageStability}`,
    `- Prompts passing 80+: ${summary.promptsPassing80}`,
    '',
    '## Overview',
    '',
    '| Prompt | Score | Stability | Success | Top failures |',
    '| --- | --- | --- | --- | --- |'
  ];

  report.prompts.forEach(promptReport => {
    const topFailures = promptReport.topFailures.length > 0
      ? promptReport.topFailures
          .slice(0, 2)
          .map(failure => `${failure.key} (${failure.count})`)
          .join(', ')
      : 'none';

    lines.push(
      `| ${escapeMarkdownTable(truncate(promptReport.prompt, 72))} | ${promptReport.averageScore} | ${promptReport.stability} | ${promptReport.successCount}/${promptReport.runCount} | ${escapeMarkdownTable(topFailures)} |`
    );
  });

  const promptsNeedingAttention = report.prompts.filter(promptReport =>
    promptReport.averageScore < 80 ||
    promptReport.failureCount > 0 ||
    promptReport.stability < 0.65
  );

  if (promptsNeedingAttention.length > 0) {
    lines.push('', '## Needs Attention', '');

    promptsNeedingAttention.forEach(promptReport => {
      lines.push(`### ${promptReport.id}`);
      lines.push('');
      lines.push(`- Score: ${promptReport.averageScore}`);
      lines.push(`- Stability: ${promptReport.stability}`);
      lines.push(`- Success rate: ${promptReport.successCount}/${promptReport.runCount}`);
      lines.push(`- Prompt: ${promptReport.prompt}`);

      if (promptReport.topFailures.length > 0) {
        lines.push('- Repeated issues:');
        promptReport.topFailures.forEach(failure => {
          lines.push(`  - ${failure.key}: ${failure.count}`);
        });
      }

      const erroredRuns = promptReport.runs.filter(run => run.error);
      if (erroredRuns.length > 0) {
        lines.push(`- Errored runs: ${erroredRuns.map(run => `#${run.index}`).join(', ')}`);
      }

      lines.push('');
    });
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const matrix = await loadMatrixConfig(options.matrixPath);
  const matrixPrompts = generatePromptMatrix(matrix, options.maxPrompts);

  let historyPrompts = [];
  if (options.historyLimit > 0) {
    try {
      historyPrompts = await minePromptHistory(pool, options.historyLimit);
      console.log(`Loaded ${historyPrompts.length} prompt(s) from diagram history.`);
    } catch (error) {
      console.warn(`Skipping prompt history: ${error.message}`);
    }
  }

  let failurePrompts = [];
  if (options.failureLimit > 0) {
    try {
      failurePrompts = await mineAIFailurePrompts(pool, options.failureLimit);
      console.log(`Loaded ${failurePrompts.length} prompt(s) from recent AI failures.`);
    } catch (error) {
      console.warn(`Skipping AI failure prompts: ${error.message}`);
    }
  }

  const promptSpecs = mergePromptSets(
    matrixPrompts,
    [...failurePrompts, ...historyPrompts],
    options.maxPrompts + options.historyLimit + options.failureLimit
  );

  await ensureOutputDir(options.promptSetPath);
  await writeFile(
    options.promptSetPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        promptCount: promptSpecs.length,
        prompts: promptSpecs
      },
      null,
      2
    )
  );

  if (options.generateOnly) {
    const report = createGenerateOnlyReport(promptSpecs, options);
    await ensureOutputDir(options.outputPath);
    await ensureOutputDir(options.markdownOutputPath);
    await writeFile(options.outputPath, JSON.stringify(report, null, 2));
    await writeFile(options.markdownOutputPath, renderGenerateOnlyMarkdown(promptSpecs, options));
    console.log(`Generated ${promptSpecs.length} prompt specs.`);
    console.log(`Prompt set written to ${options.promptSetPath}`);
    console.log(`Report written to ${options.outputPath}`);
    console.log(`Markdown scoreboard written to ${options.markdownOutputPath}`);
    return;
  }

  const promptReports = [];

  for (const promptSpec of promptSpecs) {
    console.log(`\nEvaluating ${promptSpec.id} (${promptSpec.source})`);
    console.log(`Prompt: ${promptSpec.prompt}`);
    const runResults = [];

    for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
      try {
        const diagram = await generateDiagramFromPrompt({
          description: promptSpec.prompt,
          template: promptSpec.template
        });

        runResults.push({
          index: runIndex + 1,
          nodes: diagram.nodes,
          edges: diagram.edges
        });
        console.log(`  run ${runIndex + 1}: ${diagram.nodes.length} nodes / ${diagram.edges.length} edges`);
      } catch (error) {
        runResults.push({
          index: runIndex + 1,
          error: error.message
        });
        console.warn(`  run ${runIndex + 1}: failed - ${error.message}`);
      }
    }

    promptReports.push(
      summarizePromptRuns(promptSpec, runResults, canonicalConnectionRules)
    );
  }

  const report = {
    summary: createSummary(promptReports, options),
    prompts: promptReports
  };

  await ensureOutputDir(options.outputPath);
  await ensureOutputDir(options.markdownOutputPath);
  await writeFile(options.outputPath, JSON.stringify(report, null, 2));
  await writeFile(options.markdownOutputPath, renderEvalMarkdown(report));

  console.log('\nEval harness complete.');
  console.log(`Average score: ${report.summary.averageScore}`);
  console.log(`Average stability: ${report.summary.averageStability}`);
  console.log(`Report written to ${options.outputPath}`);
  console.log(`Markdown scoreboard written to ${options.markdownOutputPath}`);
}

main()
  .catch(error => {
    console.error('Eval harness failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch (error) {
      // Ignore pool shutdown noise.
    }
  });
