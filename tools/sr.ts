import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description:
    "Call a Serena MCP server tool via mcporter. Lazily registers Serena and starts the keep-alive daemon on first use. All Serena tools (file I/O, code intelligence, editing, search, shell, memory, project management) are accessed through this single wrapper.",
  args: {
    tool: tool.schema
      .string()
      .describe(
        "Serena tool name to call (e.g. activate_project, find_symbol, read_file, replace_content, search_for_pattern)"
      ),
    args: tool.schema
      .string()
      .describe(
        "Space-separated key=value arguments for the tool (e.g. 'project=/path/to/project' or 'relative_path=src/index.ts include_body=true')"
      )
      .default(""),
  },
  async execute(args) {
    const home = process.env.HOME || process.env.USERPROFILE || ""
    const mcporterDir = path.join(home, ".mcporter")
    const mcporterCfg = path.join(mcporterDir, "mcporter.json")
    const daemonDir = path.join(mcporterDir, "daemon")

    // --- 1. Ensure Serena is registered in mcporter.json ---
    let needsRegister = true
    try {
      const content = fs.readFileSync(mcporterCfg, "utf8")
      if (content.includes('"serena"')) needsRegister = false
    } catch {}

    if (needsRegister) {
      fs.mkdirSync(mcporterDir, { recursive: true })
      let cfg: Record<string, any> = { mcpServers: {}, imports: [] }
      try {
        cfg = JSON.parse(fs.readFileSync(mcporterCfg, "utf8"))
      } catch {}
      cfg.mcpServers = cfg.mcpServers || {}
      cfg.mcpServers.serena = {
        command:
          "uvx --from git+https://github.com/oraios/serena serena start-mcp-server",
        lifecycle: "keep-alive",
      }
      cfg.imports = cfg.imports || []
      fs.writeFileSync(mcporterCfg, JSON.stringify(cfg, null, 2) + "\n")
    }

    // --- 2. Start the keep-alive daemon if not already running ---
    let hasDaemon = false
    try {
      const entries = fs.readdirSync(daemonDir)
      hasDaemon = entries.some((e: string) => e.endsWith(".sock"))
    } catch {}

    if (!hasDaemon) {
      try {
        await Bun.$`bunx mcporter daemon start`.quiet()
      } catch {}
    }

    // --- 3. Forward the call ---
    const cmd = args.args
      ? `bunx mcporter call serena.${args.tool} ${args.args}`
      : `bunx mcporter call serena.${args.tool}`

    try {
      const result = await Bun.$`sh -c ${cmd}`.text()
      return result.trim()
    } catch (e: any) {
      const stderr = e.stderr?.toString?.() || ""
      const stdout = e.stdout?.toString?.() || ""
      return `Error calling serena.${args.tool}: ${stdout} ${stderr}`.trim()
    }
  },
})
