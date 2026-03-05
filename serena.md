serena

  /**
   * Reads the given file or a chunk of it. Generally, symbolic operations
   * like find_symbol or find_referencing_symbols should be preferred if you know which symbols you are
   * looking for. Returns the full text of the file at the given relative path.
   *
   * @param relative_path The relative path to the file to read.
   * @param start_line? The 0-based index of the first line to be retrieved.
   * @param end_line? The 0-based index of the last line to be retrieved (inclusive). If None, read until
   *                  the end of the file.
   * @param max_answer_chars? If the file (chunk) is longer than this number of characters,
   *                          no content will be returned. Don't adjust unless there is really no other
   *                          way to get the content
   *                          required for the task.
   */
  function read_file(relative_path: string, start_line?: number, end_line?: unknown, max_answer_chars?: number): applyOutput;

  /**
   * Write a new file or overwrite an existing file. Returns a message indicating success or failure.
   *
   * @param relative_path The relative path to the file to create.
   * @param content The (appropriately encoded) content to write to the file.
   */
  function create_text_file(relative_path: string, content: string): applyOutput;

  /**
   * Lists files and directories in the given directory (optionally with recursion). Returns a JSON
   * object with the names of directories and files within the given directory.
   *
   * @param relative_path The relative path to the directory to list; pass "." to scan the project root.
   * @param recursive Whether to scan subdirectories recursively.
   * @param skip_ignored_files? Whether to skip files and directories that are ignored.
   * @param max_answer_chars? If the output is longer than this number of characters,
   *                          no content will be returned. -1 means the default value from the config
   *                          will be used.
   *                          Don't adjust unless there is really no other way to get the content
   *                          required for the task.
   */
  function list_dir(relative_path: string, recursive: boolean, skip_ignored_files?: boolean, max_answer_chars?: number): applyOutput;

  /**
   * Finds non-gitignored files matching the given file mask within the given relative path. Returns a
   * JSON object with the list of matching files.
   *
   * @param file_mask The filename or file mask (using the wildcards * or ?) to search for.
   * @param relative_path The relative path to the directory to search in; pass "." to scan the project
   *                      root.
   */
  function find_file(file_mask: string, relative_path: string): applyOutput;

  /**
   * Replaces one or more occurrences of a given pattern in a file with new content.
   * This is the preferred way to replace content in a file whenever the symbol-level
   * tools are not appropriate.
   * VERY IMPORTANT: The "regex" mode allows very large sections of code to be replaced without fully
   * quoting them!
   * Use a regex of the form "beginning.*?end-of-text-to-be-replaced" to be faster and more economical!
   * ALWAYS try to use wildcards to avoid specifying the exact content to be replaced,
   * especially if it spans several lines. Note that you cannot make mistakes, because if the regex
   * should match
   * multiple occurrences while you disabled `allow_multiple_occurrences`, an error will be returned, and
   * you can retry
   * with a revised regex.
   * Therefore, using regex mode with suitable wildcards is usually the best choice!.
   *
   * @param relative_path The relative path to the file.
   * @param needle The string or regex pattern to search for.
   *               If `mode` is "literal", this string will be matched exactly.
   *               If `mode` is "regex", this string will be treated as a regular expression (syntax of
   *               Python's `re` module,
   *               with flags DOTALL and MULTILINE enabled).
   * @param repl The replacement string (verbatim).
   *             If mode is "regex", the string can contain backreferences to matched groups in the
   *             needle regex,
   *             specified using the syntax $!1, $!2, etc. for groups 1, 2, etc.
   * @param mode Either "literal" or "regex", specifying how the `needle` parameter is to be interpreted.
   * @param allow_multiple_occurrences? Whether to allow matching and replacing multiple occurrences.
   *                                    If false and multiple occurrences are found, an error will be
   *                                    returned.
   */
  function replace_content(relative_path: string, needle: string, repl: string, mode: "literal" | "regex", allow_multiple_occurrences?: boolean): applyOutput;

  /**
   * Offers a flexible search for arbitrary patterns in the codebase, including the
   * possibility to search in non-code files.
   * Generally, symbolic operations like find_symbol or find_referencing_symbols
   * should be preferred if you know which symbols you are looking for.
   * Pattern Matching Logic:
   * For each match, the returned result will contain the full lines where the
   * substring pattern is found, as well as optionally some lines before and after it. The pattern will
   * be compiled with
   * DOTALL, meaning that the dot will match all characters including newlines.
   * This also means that it never makes sense to have .* at the beginning or end of the pattern,
   * but it may make sense to have it in the middle for complex patterns.
   * If a pattern matches multiple lines, all those lines will be part of the match.
   * Be careful to not use greedy quantifiers unnecessarily, it is usually better to use non-greedy
   * quantifiers like .*? to avoid
   * matching too much content.
   * File Selection Logic:
   * The files in which the search is performed can be restricted very flexibly.
   * Using `restrict_search_to_code_files` is useful if you are only interested in code symbols (i.e.,
   * those
   * symbols that can be manipulated with symbolic tools like find_symbol).
   * You can also restrict the search to a specific file or directory,
   * and provide glob patterns to include or exclude certain files on top of that.
   * The globs are matched against relative file paths from the project root (not to the `relative_path`
   * parameter that
   * is used to further restrict the search).
   * Smartly combining the various restrictions allows you to perform very targeted searches. Returns A
   * mapping of file paths to lists of matched consecutive lines.
   *
   * @param substring_pattern Regular expression for a substring pattern to search for.
   * @param context_lines_before? Number of lines of context to include before each match.
   * @param context_lines_after? Number of lines of context to include after each match.
   * @param paths_include_glob? Optional glob pattern specifying files to include in the search.
   *                            Matches against relative file paths from the project root (e.g., "*.py",
   *                            "src/**/*.ts").
   *                            Supports standard glob patterns (*, ?, [seq], **, etc.) and brace
   *                            expansion {a,b,c}.
   *                            Only matches files, not directories. If left empty, all non-ignored files
   *                            will be included.
   * @param paths_exclude_glob? Optional glob pattern specifying files to exclude from the search.
   *                            Matches against relative file paths from the project root (e.g.,
   *                            "*test*", "**/*_generated.py").
   *                            Supports standard glob patterns (*, ?, [seq], **, etc.) and brace
   *                            expansion {a,b,c}.
   *                            Takes precedence over paths_include_glob. Only matches files, not
   *                            directories. If left empty, no files are excluded.
   * @param relative_path? Only subpaths of this path (relative to the repo root) will be analyzed. If a
   *                       path to a single
   *                       file is passed, only that will be searched. The path must exist, otherwise a
   *                       `FileNotFoundError` is raised.
   * @param restrict_search_to_code_files? Whether to restrict the search to only those files where
   *                                       analyzed code symbols can be found. Otherwise, will search all
   *                                       non-ignored files.
   *                                       Set this to True if your search is only meant to discover code
   *                                       that can be manipulated with symbolic tools.
   *                                       For example, for finding classes or methods from a name
   *                                       pattern.
   *                                       Setting to False is a better choice if you also want to search
   *                                       in non-code files, like in html or yaml files,
   *                                       which is why it is the default.
   * @param max_answer_chars? If the output is longer than this number of characters,
   *                          no content will be returned.
   *                          -1 means the default value from the config will be used.
   *                          Don't adjust unless there is really no other way to get the content
   *                          required for the task. Instead, if the output is too long, you should
   *                          make a stricter query.
   */
  function search_for_pattern(substring_pattern: string, context_lines_before?: number, context_lines_after?: number, paths_include_glob?: string, paths_exclude_glob?: string): applyOutput;
  // optional (3): relative_path, restrict_search_to_code_files, max_answer_chars

  /**
   * Use this tool to get a high-level understanding of the code symbols in a file.
   * This should be the first tool to call when you want to understand a new file, unless you already
   * know
   * what you are looking for. Returns a JSON object containing symbols grouped by kind in a compact
   * format.
   *
   * @param relative_path The relative path to the file to get the overview of.
   * @param depth? Depth up to which descendants of top-level symbols shall be retrieved
   *               (e.g. 1 retrieves immediate children). Default 0.
   * @param max_answer_chars? If the overview is longer than this number of characters,
   *                          no content will be returned. -1 means the default value from the config
   *                          will be used.
   *                          Don't adjust unless there is really no other way to get the content
   *                          required for the task.
   */
  function get_symbols_overview(relative_path: string, depth?: number, max_answer_chars?: number): applyOutput;

  /**
   * Retrieves information on all symbols/code entities (classes, methods, etc.) based on the given name
   * path pattern.
   * The returned symbol information can be used for edits or further queries.
   * Specify `depth > 0` to also retrieve children/descendants (e.g., methods of a class).
   * A name path is a path in the symbol tree *within a source file*.
   * For example, the method `my_method` defined in class `MyClass` would have the name path
   * `MyClass/my_method`.
   * If a symbol is overloaded (e.g., in Java), a 0-based index is appended (e.g. "MyClass/my_method[0]")
   * to
   * uniquely identify it.
   * To search for a symbol, you provide a name path pattern that is used to match against name paths.
   * It can be
   * * a simple name (e.g. "method"), which will match any symbol with that name
   * * a relative path like "class/method", which will match any symbol with that name path suffix
   * * an absolute name path "/class/method" (absolute name path), which requires an exact match of the
   * full name path within the source file.
   * Append an index `[i]` to match a specific overload only, e.g. "MyClass/my_method[1]". Returns a list
   * of symbols (with locations) matching the name.
   *
   * @param name_path_pattern The name path matching pattern (see above).
   * @param depth? Depth up to which descendants shall be retrieved (e.g. use 1 to also retrieve
   *               immediate children;
   *               for the case where the symbol is a class, this will return its methods). Default 0.
   * @param relative_path? Optional. Restrict search to this file or directory. If None, searches entire
   *                       codebase.
   *                       If a directory is passed, the search will be restricted to the files in that
   *                       directory.
   *                       If a file is passed, the search will be restricted to that file.
   *                       If you have some knowledge about the codebase, you should use this parameter,
   *                       as it will significantly
   *                       speed up the search as well as reduce the number of results.
   * @param include_body? Whether to include the symbol's source code. Use judiciously.
   * @param include_info? Whether to include additional info (hover-like, typically including docstring
   *                      and signature),
   *                      about the symbol (ignored if include_body is True). Info is never included for
   *                      child symbols.
   *                      Note: Depending on the language, this can be slow (e.g., C/C++).
   * @param include_kinds? List of LSP symbol kind integers to include.
   *                       If not provided, all kinds are included.
   * @param exclude_kinds? Optional. List of LSP symbol kind integers to exclude. Takes precedence over
   *                       `include_kinds`.
   *                       If not provided, no kinds are excluded.
   * @param substring_matching? If True, use substring matching for the last element of the pattern, such
   *                            that
   *                            "Foo/get" would match "Foo/getValue" and "Foo/getData".
   * @param max_answer_chars? Max characters for the JSON result. If exceeded, no content is returned.
   *                          -1 means the default value from the config will be used.
   */
  function find_symbol(name_path_pattern: string, depth?: number, relative_path?: string, include_body?: boolean, include_info?: boolean): applyOutput;
  // optional (4): include_kinds, exclude_kinds, substring_matching, max_answer_chars

  /**
   * Finds references to the symbol at the given `name_path`. The result will contain metadata about the
   * referencing symbols
   * as well as a short code snippet around the reference. Returns a list of JSON objects with the
   * symbols referencing the requested symbol.
   *
   * @param name_path For finding the symbol to find references for, same logic as in the `find_symbol`
   *                  tool.
   * @param relative_path The relative path to the file containing the symbol for which to find
   *                      references.
   *                      Note that here you can't pass a directory but must pass a file.
   * @param include_kinds? Same as in the `find_symbol` tool.
   * @param exclude_kinds? Same as in the `find_symbol` tool.
   * @param max_answer_chars? Same as in the `find_symbol` tool.
   */
  function find_referencing_symbols(name_path: string, relative_path: string, include_kinds?: string[], exclude_kinds?: string[], max_answer_chars?: number): applyOutput;

  /**
   * Replaces the body of the symbol with the given `name_path`.
   * The tool shall be used to replace symbol bodies that have been previously retrieved
   * (e.g. via `find_symbol`).
   * IMPORTANT: Do not use this tool if you do not know what exactly constitutes the body of the symbol.
   *
   * @param name_path For finding the symbol to replace, same logic as in the `find_symbol` tool.
   * @param relative_path The relative path to the file containing the symbol.
   * @param body The new symbol body. The symbol body is the definition of a symbol
   *             in the programming language, including e.g. the signature line for functions.
   *             IMPORTANT: The body does NOT include any preceding docstrings/comments or imports, in
   *             particular.
   */
  function replace_symbol_body(name_path: string, relative_path: string, body: string): applyOutput;

  /**
   * Inserts the given body/content after the end of the definition of the given symbol (via the symbol's
   * location).
   * A typical use case is to insert a new class, function, method, field or variable assignment.
   *
   * @param name_path Name path of the symbol after which to insert content (definitions in the
   *                  `find_symbol` tool apply).
   * @param relative_path The relative path to the file containing the symbol.
   * @param body The body/content to be inserted. The inserted code shall begin with the next line after
   *             the symbol.
   */
  function insert_after_symbol(name_path: string, relative_path: string, body: string): applyOutput;

  /**
   * Inserts the given content before the beginning of the definition of the given symbol (via the
   * symbol's location).
   * A typical use case is to insert a new class, function, method, field or variable assignment; or
   * a new import statement before the first symbol in the file.
   *
   * @param name_path Name path of the symbol before which to insert content (definitions in the
   *                  `find_symbol` tool apply).
   * @param relative_path The relative path to the file containing the symbol.
   * @param body The body/content to be inserted before the line in which the referenced symbol is
   *             defined.
   */
  function insert_before_symbol(name_path: string, relative_path: string, body: string): applyOutput;

  /**
   * Renames the symbol with the given `name_path` to `new_name` throughout the entire codebase.
   * Note: for languages with method overloading, like Java, name_path may have to include a method's
   * signature to uniquely identify a method. Returns result summary indicating success or failure.
   *
   * @param name_path Name path of the symbol to rename (definitions in the `find_symbol` tool apply).
   * @param relative_path The relative path to the file containing the symbol to rename.
   * @param new_name The new name for the symbol.
   */
  function rename_symbol(name_path: string, relative_path: string, new_name: string): applyOutput;

  /**
   * Write information (utf-8-encoded) about this project that can be useful for future tasks to a memory
   * in md format.
   * The memory name should be meaningful and can include "/" to organize into topics (e.g.,
   * "auth/login/logic").
   * If explicitly instructed, use the "global/" prefix for writing a memory that is shared across
   * projects
   * (e.g., "global/java/style_guide").
   *
   * @param max_chars? The maximum number of characters to write. By default, determined by the config,
   *                   change only if instructed to do so.
   */
  function write_memory(memory_name: string, content: string, max_chars?: number): applyOutput;

  /**
   * Reads the contents of a memory. Should only be used if the information
   * is likely to be relevant to the current task, inferring relevance from the memory name.
   */
  function read_memory(memory_name: string): applyOutput;

  /**
   * List available memories, optionally filtered by topic.
   */
  function list_memories(topic?: string): applyOutput;

  /**
   * Delete a memory, only call if instructed explicitly or permission was granted by the user.
   */
  function delete_memory(memory_name: string): applyOutput;

  /**
   * Rename or move a memory, use "/" in the name to organize into topics.
   * The "global" topic should only be used if explicitly instructed.
   */
  function rename_memory(old_name: string, new_name: string): applyOutput;

  /**
   * Replaces content matching a regular expression in a memory.
   *
   * @param memory_name The name of the memory.
   * @param needle The string or regex pattern to search for.
   *               If `mode` is "literal", this string will be matched exactly.
   *               If `mode` is "regex", this string will be treated as a regular expression (syntax of
   *               Python's `re` module,
   *               with flags DOTALL and MULTILINE enabled).
   * @param repl The replacement string (verbatim).
   * @param mode Either "literal" or "regex", specifying how the `needle` parameter is to be interpreted.
   * @param allow_multiple_occurrences? Whether to allow matching and replacing multiple occurrences.
   *                                    If false and multiple occurrences are found, an error will be
   *                                    returned.
   */
  function edit_memory(memory_name: string, needle: string, repl: string, mode: "literal" | "regex", allow_multiple_occurrences?: boolean): applyOutput;

  /**
   * Execute a shell command and return its output. If there is a memory about suggested commands, read
   * that first.
   * Never execute unsafe shell commands!
   * IMPORTANT: Do not use this tool to start
   * * long-running processes (e.g. servers) that are not intended to terminate quickly,
   * * processes that require user interaction. Returns a JSON object containing the command's stdout and
   * optionally stderr output.
   *
   * @param command The shell command to execute.
   * @param cwd? The working directory to execute the command in. If None, the project root will be used.
   * @param capture_stderr? Whether to capture and return stderr output.
   * @param max_answer_chars? If the output is longer than this number of characters,
   *                          no content will be returned. -1 means using the default value, don't adjust
   *                          unless there is no other way to get the content
   *                          required for the task.
   */
  function execute_shell_command(command: string, cwd?: unknown, capture_stderr?: boolean, max_answer_chars?: number): applyOutput;

  /**
   * Activates the project with the given name or path.
   *
   * @param project The name of a registered project to activate or a path to a project directory.
   */
  function activate_project(project: string): applyOutput;

  /**
   * Activates the desired modes, like ["editing", "interactive"] or ["planning", "one-shot"].
   *
   * @param modes The names of the modes to activate.
   */
  function switch_modes(modes: string[]): applyOutput;

  /**
   * Print the current configuration of the agent, including the active and available projects, tools,
   * contexts, and modes.
   */
  function get_current_config(): applyOutput;

  /**
   * Checks whether project onboarding was already performed.
   * You should always call this tool before beginning to actually work on the project/after activating a
   * project.
   */
  function check_onboarding_performed(): applyOutput;

  /**
   * Call this tool if onboarding was not performed yet.
   * You will call this tool at most once per conversation. Returns instructions on how to create the
   * onboarding information.
   */
  function onboarding(): applyOutput;

  /**
   * Instructions for preparing for a new conversation. This tool should only be called on explicit user
   * request.
   */
  function prepare_for_new_conversation(): applyOutput;

  /**
   * Provides the 'Serena Instructions Manual', which contains essential information on how to use the
   * Serena toolbox.
   * IMPORTANT: If you have not yet read the manual, call this tool immediately after you are given your
   * task by the user,
   * as it will critically inform you!.
   */
  function initial_instructions(): applyOutput;

  Examples:
    mcporter call serena.read_file(relative_path: "/path/to/file.md", start_li, ...)

  Optional parameters hidden; run with --all-parameters to view all fields.

  27 tools · 1284ms · STDIO uvx --from git+https://github.com/oraios/serena serena start-mcp-server

[mcporter] stderr from uvx
INFO  2026-03-05 02:19:37,384 [MainThread] serena.cli:start_mcp_server:268 - Initializing Serena MCP server
INFO  2026-03-05 02:19:37,385 [MainThread] serena.cli:start_mcp_server:269 - Storing logs in /home/martin/.serena/logs/2026-03-05/mcp_20260305-021937_36243.txt
INFO  2026-03-05 02:19:37,386 [MainThread] serena.config.serena_config:from_config_file:659 - Loading Serena configuration from /home/martin/.serena/serena_config.yml
INFO  2026-03-05 02:19:37,394 [MainThread] serena.agent:__init__:310 - Will record tool usage statistics with token count estimator: CHAR_COUNT.
INFO  2026-03-05 02:19:37,397 [MainThread] serena.agent:__init__:314 - Starting Serena server (version=0.1.4, process id=36243, parent process id=36213; language backend=LSP)
INFO  2026-03-05 02:19:37,397 [MainThread] serena.agent:__init__:318 - Configuration file: /home/martin/.serena/serena_config.yml
INFO  2026-03-05 02:19:37,397 [MainThread] serena.agent:__init__:319 - Available projects: 
INFO  2026-03-05 02:19:37,397 [MainThread] serena.agent:__init__:320 - Loaded tools (41): read_file, create_text_file, list_dir, find_file, replace_content, delete_lines, replace_lines, insert_at_line, search_for_pattern, restart_language_server, get_symbols_overview, find_symbol, find_referencing_symbols, replace_symbol_body, insert_after_symbol, insert_before_symbol, rename_symbol, write_memory, read_memory, list_memories, delete_memory, rename_memory, edit_memory, execute_shell_command, open_dashboard, activate_project, remove_project, switch_modes, get_current_config, check_onboarding_performed, onboarding, think_about_collected_information, think_about_task_adherence, think_about_whether_you_are_done, summarize_changes, prepare_for_new_conversation, initial_instructions, jet_brains_find_symbol, jet_brains_find_referencing_symbols, jet_brains_get_symbols_overview, jet_brains_type_hierarchy
INFO  2026-03-05 02:19:37,397 [MainThread] serena.agent:__init__:332 - Using language backend from global configuration: LSP
INFO  2026-03-05 02:19:37,409 [MainThread] serena.agent:get_mode_names:214 - Active modes: ['editing', 'interactive']
INFO  2026-03-05 02:19:37,410 [MainThread] serena.agent:apply:154 - SerenaAgentContext[name='desktop-app'] included 1 tools: switch_modes
INFO  2026-03-05 02:19:37,410 [MainThread] serena.agent:_create_base_toolset:448 - Number of exposed tools: 27
INFO  2026-03-05 02:19:37,415 [MainThread] serena.agent:__init__:359 - Number of exposed tools: 27
INFO  2026-03-05 02:19:37,416 [MainThread] serena.agent:_update_active_tools:660 - Active tools (27): activate_project, check_onboarding_performed, create_text_file, delete_memory, edit_memory, execute_shell_command, find_file, find_referencing_symbols, find_symbol, get_current_config, get_symbols_overview, initial_instructions, insert_after_symbol, insert_before_symbol, list_dir, list_memories, onboarding, prepare_for_new_conversation, read_file, read_memory, rename_memory, rename_symbol, replace_content, replace_symbol_body, search_for_pattern, switch_modes, write_memory
INFO  2026-03-05 02:19:37,421 [MainThread] serena.dashboard:run_in_thread:669 - Starting dashboard (listen_address=127.0.0.1, port=24282)
INFO  2026-03-05 02:19:37,422 [MainThread] serena.agent:__init__:377 - Serena web dashboard started at http://127.0.0.1:24282/dashboard/index.html
INFO  2026-03-05 02:19:37,423 [MainThread] serena.agent:create_system_prompt:616 - Generating system prompt with available_tools=(see active tools), available_markers={'ReplaceSymbolBodyTool', 'ToolMarkerDoesNotRequireActiveProject', 'GetSymbolsOverviewTool', 'ToolMarkerCanEdit', 'InsertBeforeSymbolTool', 'CreateTextFileTool', 'RenameMemoryTool', 'EditMemoryTool', 'RenameSymbolTool', 'ActivateProjectTool', 'InitialInstructionsTool', 'InsertAfterSymbolTool', 'ToolMarkerSymbolicRead', 'DeleteMemoryTool', 'FindSymbolTool', 'WriteMemoryTool', 'ReplaceContentTool', 'ToolMarkerOptional', 'ToolMarkerSymbolicEdit', 'FindReferencingSymbolsTool', 'ExecuteShellCommandTool', 'SwitchModesTool'}
INFO  2026-03-05 02:19:37,425 [MainThread] serena.agent:create_system_prompt:629 - System prompt:
You are a professional coding agent. 
You have access to semantic coding tools upon which you rely heavily for all your work.
You operate in a resource-efficient and intelligent manner, always keeping in mind to not read or generate
content that is not needed for the task at hand.

Some tasks may require you to understand the architecture of large parts of the codebase, while for others,
it may be enough to read a small set of symbols or a single file.
You avoid reading entire files unless it is absolutely necessary, instead relying on intelligent step-by-step 
acquisition of information. Once you have read a full file, it does not make
sense to analyse it with the symbolic read tools; you already have the information.

You can achieve intelligent reading of code by using the symbolic tools for getting an overview of symbols and
the relations between them, and then only reading the bodies of symbols that are necessary to complete the task at hand. 
You can use the standard tools like list_dir, find_file and search_for_pattern if you need to.
Where appropriate, you pass the `relative_path` parameter to restrict the search to a specific file or directory.

If you are unsure about a symbol's name or location (to the extent that substring_matching for the symbol name is not enough), you can use the `search_for_pattern` tool, which allows fast
and flexible search for patterns in the codebase. In this way, you can first find candidates for symbols or files,
and then proceed with the symbolic tools.



Symbols are identified by their `name_path` and `relative_path` (see the description of the `find_symbol` tool).
You can get information about the symbols in a file by using the `get_symbols_overview` tool or use the `find_symbol` to search. 
You only read the bodies of symbols when you need to (e.g. if you want to fully understand or edit it).
For example, if you are working with Python code and already know that you need to read the body of the constructor of the class Foo, you can directly
use `find_symbol` with name path pattern `Foo/__init__` and `include_body=True`. If you don't know yet which methods in `Foo` you need to read or edit,
you can use `find_symbol` with name path pattern `Foo`, `include_body=False` and `depth=1` to get all (top-level) methods of `Foo` before proceeding
to read the desired methods with `include_body=True`.
You can understand relationships between symbols by using the `find_referencing_symbols` tool.


You generally have access to memories and it may be useful for you to read them.
You infer whether memories are relevant based on their names.


The context and modes of operation are described below. These determine how to interact with your user
and which kinds of interactions are expected of you.

Context description:
You are running in a desktop application context.
Serena's tools give you access to the code base as well as some access to the file system (if enabled). 
You interact with the user through a chat interface that is separated from the code base. 
As a consequence, if you are in interactive mode, your communication with the user should
involve high-level thinking and planning as well as some summarization of any code edits that you make.
To view the code edits you make, the user will have switch to a separate application.
To illustrate complex relationships, consider creating diagrams in addition to your text-based communication
(depending on the options for text, html, mermaid diagrams, etc. that you are provided with in your initial instructions).

Modes descriptions:

You are operating in editing mode. You can edit files with the provided tools.
You adhere to the project's code style and patterns.

Use symbolic editing tools whenever possible for precise code modifications.
If no explicit editing task has yet been provided, wait for the user to provide one. Do not be overly eager.

When writing new code, think about where it belongs best. Don't generate new files if you don't plan on actually
properly integrating them into the codebase.

You have two main approaches for editing code: (a) editing at the symbol level and (b) file-based editing.
The symbol-based approach is appropriate if you need to adjust an entire symbol, e.g. a method, a class, a function, etc.
It is not appropriate if you need to adjust just a few lines of code within a larger symbol.

**Symbolic editing**
Use symbolic retrieval tools to identify the symbols you need to edit.
If you need to replace the definition of a symbol, use the `replace_symbol_body` tool.
If you want to add some new code at the end of the file, use the `insert_after_symbol` tool with the last top-level symbol in the file. 
Similarly, you can use `insert_before_symbol` with the first top-level symbol in the file to insert code at the beginning of a file.
You can understand relationships between symbols by using the `find_referencing_symbols` tool. If not explicitly requested otherwise by the user,
you make sure that when you edit a symbol, the change is either backward-compatible or you find and update all references as needed.
The `find_referencing_symbols` tool will give you code snippets around the references as well as symbolic information.
You can assume that all symbol editing tools are reliable, so you never need to verify the results if the tools return without error.


**File-based editing**
The `replace_content` tool allows you to perform regex-based replacements within files (as well as simple string replacements).
This is your primary tool for editing code whenever replacing or deleting a whole symbol would be a more expensive operation,
e.g. if you need to adjust just a few lines of code within a method.
You are extremely good at regex, so you never need to check whether the replacement produced the correct result.
In particular, you know how to use wildcards effectively in order to avoid specifying the full original text to be replaced!


You are operating in interactive mode. You should engage with the user throughout the task, asking for clarification
whenever anything is unclear, insufficiently specified, or ambiguous.

Break down complex tasks into smaller steps and explain your thinking at each stage. When you're uncertain about
a decision, present options to the user and ask for guidance rather than making assumptions.

Focus on providing informative results for intermediate steps, such that the user can follow along with your progress and
provide feedback as needed.


You have hereby read the 'Serena Instructions Manual' and do not need to read it again.
INFO  2026-03-05 02:19:37,427 [MainThread] serena.cli:start_mcp_server:300 - Starting MCP server …
INFO  2026-03-05 02:19:37,462 [MainThread] serena.mcp:_set_mcp_tools:261 - Starting MCP server with 27 tools: ['read_file', 'create_text_file', 'list_dir', 'find_file', 'replace_content', 'search_for_pattern', 'get_symbols_overview', 'find_symbol', 'find_referencing_symbols', 'replace_symbol_body', 'insert_after_symbol', 'insert_before_symbol', 'rename_symbol', 'write_memory', 'read_memory', 'list_memories', 'delete_memory', 'rename_memory', 'edit_memory', 'execute_shell_command', 'activate_project', 'switch_modes', 'get_current_config', 'check_onboarding_performed', 'onboarding', 'prepare_for_new_conversation', 'initial_instructions']
INFO  2026-03-05 02:19:37,462 [MainThread] serena.mcp:server_lifespan:343 - MCP server lifetime setup complete
INFO  2026-03-05 02:19:37,468 [MainThread] mcp.server.lowlevel.server:_handle_request:709 - Processing request of type ListToolsRequest
