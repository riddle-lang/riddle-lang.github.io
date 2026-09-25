import type { SiteContent } from './types';

export const en: SiteContent = {
  locale: 'en',
  htmlLang: 'en',
  dir: {
    self: '/en/',
    other: '/',
    otherLabel: '中文',
    otherTitle: '切换到中文',
  },
  meta: {
    title: 'Riddle — Systems programming with ownership and escape analysis',
    description:
      'Riddle is an experimental systems programming language inspired by Rust and Go. Move semantics and compile-time borrow checking eliminate memory errors, while interprocedural escape analysis enables stack-first allocation without lifetime annotations. Provides C11 code generation and a built-in MIR interpreter.',
    ogAlt: 'The Riddle programming language',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    toggleTheme: 'Toggle light and dark theme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    copy: 'Copy',
    copied: 'Copied',
    chapters: 'Section navigation',
  },
  nav: {
    // In-page navigation lives in the chapter rail (chapters / ChapterNav); the top
    // bar keeps the outbound links only.
    links: [],
    docs: 'Docs',
    playground: 'Playground',
    github: 'GitHub',
  },
  hero: {
    badge: 'v0.3.0 · Technology Preview',
    title: 'All are Riddle',
    titleAccent: 'All in Riddle',
    subtitle:
      'Riddle combines default move semantics with interprocedural escape analysis: values stay on the stack by default, and only promote to a non-moving conservative GC heap when outliving their frame. Enjoy modern expressive syntax, deterministic RAII destructors, and dual execution targets.',
    ctaPrimary: 'Try in Playground',
    ctaSecondary: 'Read Documentation',
    codeFile: 'main.rid',
    code: `struct Point {
    x: i32,
    y: i32,
}

fun distance_squared(point: Point) -> i32 {
    point.x * point.x + point.y * point.y
}

fun main() {
    let point = Point { x: 3, y: 4 };
    let value = distance_squared(point);
    print(value)
}`,
    stats: [
      { value: '0', label: 'lifetime annotations' },
      { value: '5', label: 'runtime ABI exports' },
      { value: '9', label: 'compiler pipeline stages' },
      { value: 'C11', label: 'native backend & MIR interpreter' },
    ],
  },
  features: {
    eyebrow: 'Core Features',
    title: 'Language Features',
    subtitle:
      'Ownership semantics, escape analysis, and deterministic destructors cooperate to ensure memory safety without manual lifetime burden.',
    items: [
      {
        id: 'move',
        title: 'Move Semantics',
        summary: 'Values move by default; compile-time detection of use-after-move and borrow conflicts',
        headline: 'Move Semantics & Borrow Checking',
        body: 'Variable assignment, function argument passing, and returns transfer value ownership by default. The compile-time Move Checker statically enforces no use-after-move, validates mutable vs shared borrow conflicts, and prohibits reassignments or transfers while a borrow remains active — with zero runtime reference-counting overhead.',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun main() {
    let a = Foo { x: 1, y: 1 };
    let b = a;
    print(a); // error[E0100]: use of moved value: \`a\`
    print(b);
}`,
        caption:
          'Scalars, shared references, raw pointers, and named function items implement Copy by default; `&mut T` and closures do not.',
        bullets: [
          'User-defined struct and enum types opt into copy semantics via `std::marker::Copy`; the compiler verifies that all fields and payloads are Copy-compatible',
          'Fine-grained field-level partial moves are supported; `match` destructuring tracks ownership per field, leaving untouched sibling fields fully accessible',
          '`Option<T>` and `Result<T, E>` inherit Copy conditionally, remaining Copy only when all inner payload types implement `Copy`',
        ],
      },
      {
        id: 'escape',
        title: 'Escape Analysis',
        summary: 'Interprocedural analysis automatically determines stack vs GC heap allocation',
        headline: 'References Without Lifetimes',
        body: 'Riddle dispenses with explicit lifetime parameters like `\'a`. An interprocedural fixpoint escape analysis calculates leaked arguments and return-source dependencies for each function. Non-escaping values remain on the call stack as SSA values or stack allocations; only values whose reference lifetime outlives their current frame are automatically promoted to a non-moving conservative GC heap.',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun make_ref() -> &Foo {
    let foo = Foo { x: 1, y: 2 };
    &foo // reference escapes the call frame; foo is allocated on the GC heap
}`,
        table: {
          head: ['Escape Analysis Inference', 'Emitted MIR Instruction'],
          rows: [
            ['Non-escaping local requiring no stable address', 'SSA register form, no allocation emitted'],
            ['Non-escaping local with address taken, mutation, or ref capture', '`Alloca`, allocated on the stack frame'],
            ['Escaping local whose reference outlives the call frame', '`HeapAlloc`, allocated on conservative GC heap'],
            ['Closure capture context', 'Allocated as `Alloca` or `HeapAlloc` based on capture escape status'],
          ],
        },
      },
      {
        id: 'drop',
        title: 'Deterministic Destructors',
        summary: 'RAII-based cleanup executed deterministically when the owner exits scope',
        headline: 'RAII Cleanup with Drop Flags',
        body: 'Types implementing `std::ops::Drop` have their destructors automatically invoked when the owner variable goes out of scope. Whether a value is heap-promoted by escape analysis affects only its physical storage location, never deferring its deterministic destruction timing. Compiler-synthesized drop flags guarantee moved values are never double-freed.',
        code: `struct FileHandle {
    raw: i32,
}

impl Drop for FileHandle {
    fun drop(&mut self) {
        // close file descriptor and release external resources
    }
}`,
        caption:
          'Local variables, function arguments, pattern bindings, loop iteration elements, struct fields, and closure capture contexts are all covered by deterministic destructors.',
        bullets: [
          'Compile-time safety invariants: simultaneous implementation of `Drop` and `Copy` is rejected, direct invocation of `.drop()` is forbidden, and partial moves out of explicit Drop types are prohibited',
          '`for` loops maintain distinct destruction scopes for current elements, iterator state, and early `break` / `return` exits',
        ],
      },
      {
        id: 'traits',
        title: 'Traits & Generics',
        summary: 'Monomorphized generics, associated types, and const generics',
        headline: 'Monomorphized Generics & Traits',
        body: 'Traits support default method implementations, associated type definitions, supertraits, and transitive bounds. Generic code is completely monomorphized by the C backend, eliminating virtual dispatch overhead. Const generics allow values like array lengths to participate directly in compile-time type verification.',
        code: `trait Summary {
    fun title(&self) -> &str;

    fun summarize(&self) -> &str {
        self.title()
    }
}

struct Buffer<T, const N: usize> {
    data: [T; N],
}`,
        caption: 'Trait default implementations are utilized when unoverridden; explicit impl overrides take precedence.',
        bullets: [
          'Supports `<T: A + B>` trait bounds and `where` clauses; impl bounds are strictly verified against the Paterson condition',
          'Operators map to standard traits via `#[lang = "..."]`; scalar arithmetic lowers directly into native C operators without wrapper functions',
          '`==` / `!=` map to `PartialEq`, ordered comparisons map to `PartialOrd`, with full support for heterogeneous right-hand-side impls',
        ],
      },
      {
        id: 'match',
        title: 'Pattern Matching',
        summary: 'Recursive pattern destructuring with static exhaustiveness and interval checking',
        headline: 'Recursive Pattern Matching',
        body: '`match` expressions perform recursive exhaustiveness verification across enums, booleans, `()`, integers, tuples, and structs. When matching discrete integers or ranges, the compiler pinpoints any missing coverage by emitting the exact continuous interval gap rather than a vague error.',
        code: `fun classify(n: i32) -> i32 {
    match n {
        x if x < 0 => -1,
        0 => 0,
        _ => 1,
    }
}`,
        caption: 'Missing exhaustiveness is reported via diagnostic E0039 with uncovered value intervals.',
        bullets: [
          'Supports or-patterns (`A | B => ...`) and match guards; guard failure falls through to subsequent branches without contributing to static exhaustiveness',
          'Full support for unit, tuple, and struct enum variants; payload bindings are accessible inside guard conditions and arm expressions',
        ],
      },
      {
        id: 'ffi',
        title: 'C FFI & Unsafe',
        summary: 'Explicit safety boundaries with native C interoperability',
        headline: 'Native C FFI & Unsafe Boundaries',
        body: 'Declarations inside `unsafe extern "C"` blocks are unsafe by default, allowing audited safe APIs to be explicitly exposed via `safe fun`. The C backend adheres to standard platform ABIs, generating clean external symbol declarations without injecting proprietary wrapper logic.',
        code: `unsafe extern "C" {
    safe fun abs(x: i32) -> i32;
    fun malloc(size: usize) -> *mut u8;
}

fun main() {
    let value = abs(-42);
    let pointer = unsafe { malloc(16) };
}`,
        caption: 'Raw pointer dereferences and indexing must take place inside an `unsafe` block.',
        bullets: [
          '`&str` parameters in C FFI imports map directly to `const char*`, while exported functions retain `{ ptr, len }` fat pointer layouts',
          'Differentiates standard function pointers from `unsafe fun(...) -> T` function types, supporting safe upward implicit coercion',
        ],
      },
    ],
  },
  pipeline: {
    eyebrow: 'Compiler Pipeline',
    title: 'From Source to C11',
    subtitle:
      '`riddlec` implements an incremental-aware frontend pipeline paired with a C11 backend that generates immediately linkable code.',
    stages: [
      { name: 'Lexing & Parsing', desc: 'Driven by `IncrementalParser` for efficient local re-parsing' },
      { name: 'AST Construction', desc: 'Unified syntax tree representation with attributes attached directly to items' },
      { name: 'HIR Lowering', desc: 'Performs high-level validation including E0040 / E0050 / E0051 / E0052 diagnostics' },
      { name: 'Scope Graph & Resolution', desc: 'Segment-based incremental scope graph with fine-grained invalidation' },
      { name: 'Static Type Checking', desc: 'Type inference and generic constraint solving via `IncrementalTypeChecker`' },
      { name: 'Escape Analysis', desc: 'Interprocedural fixpoint analysis determining stack vs GC heap placement' },
      { name: 'Move Checker', desc: 'Static verification of use-after-move, borrow conflicts, and reassignments during active borrows' },
      { name: 'MIR Lowering', desc: 'Lowering to strict SSA representation with Phi nodes, basic blocks, and allocation nodes' },
      { name: 'C11 Code Generation', desc: 'Emits standard C11 source linking against the minimal `rgc` runtime ABI' },
    ],
    footnote:
      '`clue check` terminates immediately after move and borrow checking; MIR lowering occurs only when compiling or running. The identical MIR is consumed by both the C11 backend and the built-in interpreter (`riddle run` / `riddle repl`).',
  },
  runtime: {
    eyebrow: 'Runtime Specification',
    title: 'Minimal C Runtime ABI',
    subtitle:
      'Any runtime provider needs only to export these five symbols to handle stack probing, memory allocation, and garbage collection.',
    code: `void rgc_init(void *stack_bottom);
void *rgc_alloc(size_t size);
void *rgc_realloc(void *ptr, size_t size);
void rgc_free(void *ptr);
void rgc_collect(void);`,
    caption:
      '`crates/gc` provides the default non-moving, conservative mark-sweep collector; custom providers can be specified in `Clue.toml` under `[runtime].source`.',
    points: [
      {
        title: 'Zero External Dependencies',
        desc: '`clue build` compiles generated C code alongside lightweight runtime source using the standard system C compiler, with no dependency on Boehm GC.',
      },
      {
        title: 'Non-Moving Conservative Collection',
        desc: 'Only values identified by escape analysis as outliving their stack frame enter the GC heap; all other data remains on the stack, and the collector never moves live objects in memory.',
      },
      {
        title: 'Clear Allocation & Deallocation Contract',
        desc: '`rgc_realloc` accommodates `Vector` growth and `rgc_free` enables manual cleanup by the provider; non-GC providers can implement `rgc_collect` as a no-op.',
      },
      {
        title: 'Fully Replaceable Provider',
        desc: 'The runtime is decoupled from compiler logic, allowing seamless redirection to specialized allocators for embedded or domain-specific environments.',
      },
    ],
  },
  release: {
    eyebrow: 'Release Highlights',
    title: 'v0.3.0 Release Highlights',
    subtitle:
      'Introduces a built-in MIR interpreter (`riddle run` / `riddle repl`), or-patterns in match expressions, global build caching, and static HTML documentation generation.',
    items: [
      {
        title: 'Built-in MIR Interpreter (No C Toolchain Required)',
        desc: '`crates/interpreter` directly executes lowered SSA MIR: `riddle run <file.rid>` compiles and runs single files in milliseconds, while `riddle repl` offers an interactive session with cumulative definitions and instant evaluation — neither requiring a local C compiler.',
      },
      {
        title: 'Syntax Standardization & Cleaner Semantics',
        desc: '`match` expressions gain `A | B => …` or-pattern support; legacy `fun(x) { ... }` anonymous syntax is completely removed in favor of `[x -> x + 1]`; integer parsing returns `Result`, bitwise operator precedence aligns with Rust and C, and `HashMap` adopts an idiomatic entry API.',
      },
      {
        title: 'Toolchain Expansion & Global Caching',
        desc: '`clue doc` generates static HTML API documentation from HIR and doc-comments; library compilation artifacts are cached under `$CLUE_HOME` for cross-project reuse; sibling dependencies build in parallel using `-j`; and `riddlec --emit mir` prints program MIR.',
      },
      {
        title: 'Checker Precision & Edge Case Handling',
        desc: 'Reference provenance tracks through nested struct fields and indexing paths; `T: Copy` bounds participate in Copy inference; and associated types normalize structurally, allowing generic containers destructuring `Iterator` items to compile smoothly.',
      },
    ],
  },
  toolchain: {
    eyebrow: 'Toolchain Suite',
    title: 'One Manager, Four Tools',
    subtitle:
      'Composed of the `ridup` version manager alongside four primary binaries: `clue`, `riddlec`, `riddle`, and `riddle-lsp`. Precompiled packages are available on GitHub Releases, or buildable from source with Cargo.',
    manager: {
      name: 'ridup',
      tagline: 'Toolchain & Target Manager',
      desc: 'Installs, updates, and switches between Riddle toolchain channels (`stable`, `nightly`, and `canary`) side by side. It manages Riddle releases and target components; system C compilers are detected independently by clue.',
      usage: 'ridup toolchain install stable | nightly | canary',
      points: [
        '`stable` and `nightly` channels pull GitHub Release archives, verifying SHA-256 checksums before updating',
        '`canary` fetches latest main commits and compiles locally via `cargo build --workspace --release`, requiring only Rust and Cargo',
        'Use `ridup toolchain link dev <path>` to link a local build directory as a registered custom toolchain',
        'Switch toolchains via `riddle-toolchain.toml`, the `RIDUP_TOOLCHAIN` environment variable, or `clue +dev build`',
        'Symlinking or copying ridup as `clue`, `riddlec`, `riddle`, or `riddle-lsp` enables transparent command proxying',
        'Downloads and canary builds respect standard proxy variables including `HTTPS_PROXY`',
      ],
      link: { label: 'View ridup on GitHub', href: 'https://github.com/riddle-lang/ridup' },
    },
    items: [
      {
        name: 'riddlec',
        tagline: 'Compiler Driver',
        desc: 'Handles parsing, HIR/MIR lowering, type and borrow checking, and C11 code generation in a single binary.',
        usage: 'riddlec [--verbose] [--backend c] [--target <triple>] [--emit mir] [--output <file>] <file>...',
        points: [
          '`--backend c` outputs standard C11 code calling the minimal `rgc` runtime ABI',
          '`--emit mir` prints the full SSA MIR representation of the program for inspection',
          '`--target <triple>` selects target platforms, overridable by `RIDDLE_TARGET` or `Clue.toml`',
          'Automatically bundles the core standard library from `std/lib.rid`',
          'Omitting `--backend c` runs frontend type and borrow checks without MIR lowering for fast feedback',
        ],
      },
      {
        name: 'riddle',
        tagline: 'Developer CLI',
        desc: 'Common developer workflows: code formatting, single-file MIR execution, and interactive REPL exploration.',
        usage: 'riddle fmt <file>... | riddle run <file.rid> | riddle repl',
        points: [
          '`riddle fmt` formats source files or stdin, supporting `--check`, `--emit`, `--tab-size`, and `--hard-tabs`',
          '`riddle run <file.rid> [-- args] [--seed N]` executes a file directly via the built-in MIR interpreter without a C compiler',
          '`riddle repl` provides an interactive environment with persistent definitions and instant expression evaluation',
          'Shares the identical formatting engine used by `riddle-lsp`',
        ],
      },
      {
        name: 'clue',
        tagline: 'Build System & Package Manager',
        desc: 'Manages Riddle projects: creation, checking, compilation, testing, and static HTML API doc generation. Produces native executables, `.rlib` / `.rmeta` metadata, and static or dynamic libraries.',
        usage: 'clue init | new | check | build | run | doc [--target <triple>]',
        points: [
          'Respects explicit `CC` environments, otherwise detects compatible GCC, Clang, or MSVC C11 toolchains',
          '`--target`, `RIDDLE_TARGET`, and `Clue.toml` `[build].target` override the host platform in sequence',
          '`ridup target add <triple>` installs target runtimes; linking requires target sysroot and SDK libraries',
          'Resolves path, git, and sparse registry dependencies into a deterministic `Clue.lock` v3 lockfile',
          '`clue doc` generates self-contained offline HTML API documentation directly from source and HIR',
          'Library build artifacts are cached globally under `$CLUE_HOME`; sibling dependencies build in parallel with `-j`',
          '`clue build` preserves `.clue/build/<name>.c` for reviewing generated C code',
          '`Clue.toml` supports redirecting `[runtime].source` to custom allocator implementations',
        ],
      },
      {
        name: 'riddle-lsp',
        tagline: 'Language Server',
        desc: 'Built on `tower-lsp`, delivering real-time diagnostics, completion, semantic highlighting, and code actions to modern editors.',
        points: [
          'Workspace-wide completion prioritizing unsaved buffers across open files',
          'Rich semantic token classification distinguishing free functions, methods, structs, enums, traits, and bindings',
          'Direct error code documentation links, with inline actionable `help:` and `note:` suggestions',
        ],
      },
    ],
  },
  editors: {
    eyebrow: 'Editor Integration',
    title: 'Editor & IDE Support',
    subtitle:
      'The `editors/` directory in the repository provides battle-tested configurations and extensions.',
    list: ['Helix', 'VS Code', 'Zed', 'IntelliJ IDEA 2026.1+'],
    haveTitle: 'Supported Features',
    have: [
      '`.rid` file recognition and syntax highlighting',
      'Incremental diagnostics for Clue projects, unsaved buffers, and closed modules',
      'Real-time syntax, type, move checking, and borrow conflict reporting',
      'Semantic highlighting for functions, methods, structs, enums, traits, parameters, and mutable bindings',
      'Inlay hints for cross-module return types and inferred local variables',
      'Cross-file completion for fields, instance methods, enum variants, and associated items',
      'Code actions for mutable closure bindings',
      'Incremental document synchronization and semantic token delta updates',
      'Hover inspection, go-to-definition, find-references, symbol renaming, and document formatting',
      'Workspace indexing with auto-import suggestions',
    ],
    missTitle: 'Under Active Development',
    miss: ['Complex semantic refactorings (extract function, inline variable, etc.)'],
  },
  quickstart: {
    eyebrow: 'Quick Start',
    title: 'Quick Start Guide',
    subtitle:
      'Manage toolchain versions effortlessly with `ridup`, or extract standalone binaries from GitHub Releases.',
    steps: [
      {
        title: 'Install Toolchain',
        desc: 'Install ridup via Cargo and configure your active channel; `ridup show` displays the active toolchain and its resolution source.',
        lang: 'bash',
        code: `cargo install --git https://github.com/riddle-lang/ridup
ridup toolchain install stable
ridup default stable`,
      },
      {
        title: 'Create and Run a Project',
        desc: 'Scaffold a new project with `clue`, compile, and execute the resulting native binary.',
        lang: 'bash',
        code: `clue new hello
cd hello
clue check
clue build
clue run`,
      },
    ],
    footnote:
      '`clue build` preserves the generated C code in `.clue/build/hello.c`. When `CC` is set, Clue strictly uses that compiler; otherwise it auto-detects `clang`, `gcc`, `cc`, or Windows `clang-cl` / `cl`. For instant single-file testing without a C compiler, run `riddle run hello.rid` to execute directly via the built-in MIR interpreter.',
  },
  status: {
    eyebrow: 'Status & Boundaries',
    title: 'Status & Boundaries',
    subtitle:
      'Riddle v0.3.0 is a Technology Preview: language grammar and runtime ABIs are subject to evolution. Below is an honest accounting of supported features and current limitations.',
    worksTitle: 'Currently Fully Supported',
    works: [
      'Static type inference, Move Checker, borrow checker, and interprocedural escape analysis',
      'Generics, const generics, trait bounds, and associated types',
      'Closure captures and static `Fn` / `FnMut` / `FnOnce` capability checking',
      'Pattern matching with recursive exhaustiveness checking and discrete interval deduction',
      'Standard `for` loops driven by `IntoIterator` / `Iterator` traits',
      '`unsafe` semantics and native C FFI interoperability',
      'Fixed-size arrays, slices, `String`, and `Vector` core standard collections',
      '`std::ops::Drop` deterministic destructors, operator overloading, and C11 backend code generation',
      'Tuple types, tuple pattern destructuring, and enum variants with tuple payloads',
      'Procedural macro infrastructure and standard derive macros (Default, Hash, Ord, etc.)',
      'Formatted output supporting positional, named, and debug `{:?}` format specifiers',
      'Bracket lambda expressions `[v -> v * 2]` (legacy anonymous function syntax removed)',
      'Iterator combinators, collection element mutations, and the `vec!` macro',
      'Standard library modules: filesystem I/O, system time, high-quality RNG, and parsing primitives',
      '`riddle fmt` code formatting CLI (shared engine with LSP)',
      'Built-in SSA MIR interpreter: `riddle run` and `riddle repl` (no C compiler required)',
      'Or-pattern matching (`A | B => ...`), collection iteration views, and `TreeMap` / `HashMap` entries',
      '`clue doc` offline HTML documentation generation and multi-threaded dependency building',
      'Precompiled runtimes supporting cross-compilation across 7 primary target triples',
      'Complete standard library, C11 code generator, project management tool, and LSP language server',
    ],
    limitsTitle: 'Current Technical Limitations',
    limits: [
      'Formatting currently supports positional, named, and `:?` debug markers; width, alignment, and fill specifiers are not yet implemented',
      'Floating-point modulo is not implemented; `Rem` and `RemAssign` are currently restricted to integers',
      'Generics rely entirely on static monomorphization; complex lifetime specialization is out of scope',
      'No explicit named lifetime syntax; half-open ranges, range patterns, and labeled loops are not yet implemented',
      'Currently single-threaded by design: multithreading, atomics, `async` / `await`, and network socket APIs are not yet included',
      'The lexer accepts `i128` / `u128` / `f16` / `f128` tokens, but the semantic type system does not yet support them',
      '`clue build` requires a local C compiler to produce native executables; `riddle run` / `repl` run via the MIR interpreter and do not',
      'Raw function pointer types are not yet supported; callable arguments must be declared as `impl Fn(...) -> T` or `dyn Fn(...)` trait objects',
    ],
    note: 'Please note: v0.3.0 makes no backward compatibility promises regarding syntax or ABI. It is designed for technical evaluation, tooling scripts, and language exploration.',
  },
  roadmap: {
    eyebrow: 'Roadmap',
    title: 'Project Roadmap',
    subtitle:
      'Priorities follow a strict engineering hierarchy: semantic correctness and memory safety first, fundamental syntax second, standard library and ecosystem following in step.',
    phases: [
      {
        tag: '01 · Near-term',
        title: 'Core Language',
        desc: 'Focusing on semantic correctness, foundational syntax stability, and type checker robustness.',
        items: [
          'Labeled `break` and `continue` jump control flow',
          'Half-open range syntax and complete slice/range pattern matching',
          'Format string completion: width, alignment, and fill specifiers',
        ],
      },
      {
        tag: '02 · Mid-term',
        title: 'Standard Library & Tools',
        desc: 'Broadening systems-level primitives to facilitate building larger software projects comfortably.',
        items: [
          'Buffered I/O (`BufReader` / `BufWriter`) and enhanced string parsing modules',
          'Additional standard collections and higher-order iterator combinators',
          'Clue dependency resolution performance and incremental caching improvements',
        ],
      },
      {
        tag: '03 · Long-term',
        title: 'Concurrency & Multi-Target',
        desc: 'Carefully introducing advanced runtime capabilities once single-threaded semantics are fully solidified.',
        items: [
          'Lightweight concurrency and structured async / await asynchronous model',
          'Direct native compilation backends (LLVM or WASM) alongside C11',
          'Long-term language grammar and runtime ABI stabilization commitments',
        ],
      },
    ],
    note: 'Have a feature you want prioritized? Start a discussion or open an issue on GitHub Issues.',
  },
  author: {
    eyebrow: 'Maintenance',
    title: 'Design & Maintainer',
    name: 'zi2ven',
    role: 'Language Designer & Core Maintainer',
    motto: 'Riddle is Best',
    bio: [
      'Riddle is an independently designed full-stack programming language project — spanning the compiler frontend, incremental parser, HIR/MIR transformations, type system, borrow and escape analysis, C11 backend, SSA MIR interpreter, clue package manager, ridup toolchain manager, riddle-lsp language server, and documentation suite.',
      'The project embraces honest and transparent engineering: clearly publicizing implemented milestones alongside current boundaries. Inquiries, feedback, and contributions from anyone passionate about ownership models and systems programming are warmly welcomed.',
    ],
    link: { label: 'Visit zi2ven on GitHub', href: 'https://github.com/zi2ven' },
  },
  cta: {
    title: 'Experience Riddle First-Hand',
    subtitle: 'Write, compile, and run Riddle directly in your browser without installing anything locally.',
    primary: 'Open Online Playground',
    secondary: 'Read The Riddle Book',
  },
  footer: {
    tagline: 'Modern systems programming with ownership and interprocedural escape analysis.',
    groups: [
      {
        title: 'Learn',
        links: [
          { label: 'The Riddle Book', href: 'https://riddle-lang.github.io/docs/' },
          { label: 'Online Playground', href: 'https://riddle-lang.github.io/playground/' },
          { label: 'Compiler Error Code Index', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'GitHub Repository', href: 'https://github.com/riddle-lang/riddle' },
          { label: 'ridup Toolchain Manager', href: 'https://github.com/riddle-lang/ridup' },
          { label: 'Releases & Binaries', href: 'https://github.com/riddle-lang/riddle/releases' },
          { label: 'Issue Tracker', href: 'https://github.com/riddle-lang/riddle/issues' },
        ],
      },
    ],
    license: 'Apache License 2.0',
    community: 'Community',
    communityValue: 'QQ 677741637',
    copyright: 'The Riddle Project',
  },
  chapters: [
    { id: 'language', label: 'Language', blurb: 'Ownership, move semantics, escape analysis, and multi-language comparisons' },
    { id: 'toolchain', label: 'Get Started & Toolchain', blurb: 'Quickstart, standard workflow, complete toolchain suite, and editor support' },
    { id: 'execution', label: 'Execution & Architecture', blurb: 'Built-in MIR interpreter, 9-stage compiler pipeline, C runtime ABI, and cross-compilation' },
    { id: 'status', label: 'Status & Limits', blurb: 'v0.3.0 highlights, capabilities and boundaries, benchmarks, and FAQ' },
    { id: 'project', label: 'Docs & Project', blurb: 'The Riddle Book overview, release milestones, roadmap, and project maintenance' },
  ],
  diagnostics: {
    eyebrow: 'Compiler Diagnostics',
    title: 'Precise Compiler Diagnostics',
    subtitle:
      'Every diagnostic includes a unique error code, multi-label span highlights, context notes, and actionable suggestions.',
    cases: [
      {
        code: 'E0300',
        title: 'Borrow conflict: overlapping borrow locations and kinds',
        output:
          'error[E0300]: cannot borrow `point` as mutable because it is also borrowed as immutable\n --> src/main.rid:8:19\n   |\n 7 |     let shared = &point;\n   |                  ------ first borrow occurs here\n 8 |     let mutable = &mut point;\n   |                   ^^^^^^^^^^\n   |\n   = note: a mutable borrow cannot overlap an existing shared borrow',
      },
      {
        code: 'E0100',
        title: 'Use after move: ownership transfer and illegal reference',
        output:
          'error[E0100]: use of moved value: `token`\n --> src/main.rid:6:10\n   |\n 5 |     take(token);\n   |          ----- value moved here\n 6 |     take(token);\n   |          ^^^^^\n   |\n   = note: borrow with `&` if the original value must remain usable',
      },
      {
        code: 'E0013',
        title: 'Unknown method: inferred receiver type and impl check',
        output:
          'error[E0013]: unknown method `or_insert` on type Entry<&str, i32>\n --> src/main.rid:7:9\n   |\n 7 |         entry.or_insert(0);\n   |         ^^^^^^^^^^^^^^^^^^\n   |\n   = note: check the impl block and receiver type',
      },
    ],
    footnote:
      'The official error code index documents every `E`-prefixed code with detailed explanations and fixes; `riddlec`, `riddle run`, and LSP share the identical diagnostic engine.',
    link: { label: 'Explore the Error Code Index', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
  },
  interpreter: {
    eyebrow: 'Built-in Interpreter',
    title: 'MIR Execution & REPL',
    subtitle:
      '`crates/interpreter` directly executes lowered SSA MIR with semantics aligned with the C11 backend, requiring no local C compiler to run programs or experiment with syntax.',
    views: [
      { label: 'Riddle Source', lang: 'riddle', code: 'fun add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfun main() -> i32 {\n    add(2, 3)\n}' },
      { label: 'SSA MIR Representation', lang: 'text', code: 'module main {\n  fn add(%0: I32, %1: I32) -> I32 {\n    block_?(0):\n      v2 = Add v0, v1 : I32\n      return v2\n  }\n  fn main() -> I32 {\n    block_?(0):\n      v0 = iconst(I32) 2 : I32\n      v1 = iconst(I32) 3 : I32\n      v2 = call Local("add")(v0, v1) : I32\n      return v2\n  }\n}' },
      { label: 'Execution & Exit Code', lang: 'bash', code: '$ riddle run tiny.rid\n$ echo $?\n5' },
    ],
    viewsCaption:
      'The identical MIR is both lowered to C11 and directly executed by the {{mir}} interpreter: `add(2, 3)` maps directly to the process exit code.',
    run: {
      title: 'Single-File Execution',
      desc: 'Lowers to MIR and executes immediately; arguments after `--` are forwarded to the program, and `--seed` sets the RNG seed.',
      code: 'riddle run hello.rid\nriddle run hello.rid -- --verbose\nriddle run hello.rid --seed 7',
    },
    repl: {
      title: 'Interactive REPL Session',
      desc: 'Accumulates top-level definitions, prints expression values while binding them to `__`, with `:mir` to inspect MIR and `:reset` to clear state.',
      lines: [
        'Riddle REPL — type :help for commands, :quit to exit',
        '> let x = 5',
        '> x * 2',
        '10',
        '> :help',
        'commands: :help  :reset  :mir  :quit | expressions print their value and bind `__` | definitions (fun/struct/…) join the session',
        '> let mut total = 0',
        '> for i in 0..3 { total += i }',
        '> total',
        '3',
      ],
      caption:
        'An authentic REPL session: explore language syntax with zero C toolchain setup; panics map precisely back to source locations.',
    },
    points: [
      { title: 'Strictly Aligned with C Backend Semantics', desc: 'Integer wrapping, division-by-zero and `MIN / -1` traps, masked bit shifts, saturating float-to-int casts, and bounds checking behave identically to C11 binaries.' },
      { title: 'Native Shims for Standard Library', desc: 'Filesystem I/O, system time, RNG, process controls, and standard I/O are backed by native shims; unshimmed custom `extern "C"` functions fail explicitly when called.' },
      { title: 'Shares the Same Compiler Pipeline', desc: 'REPL `let` bindings and expressions are wrapped into an internal `main` function for incremental evaluation, preserving accumulated top-level definitions.' },
    ],
  },
  compare: {
    eyebrow: 'Comparative Analysis',
    title: 'Language Design Trade-offs',
    subtitle: 'An objective comparison of Riddle alongside Rust, Go, and Kotlin across syntax and core semantics.',
    head: ['', 'Riddle', 'Rust', 'Go', 'Kotlin'],
    rows: [
      ['Function Declaration', '`fun add(x: i32) -> i32`', '`fn add(x: i32) -> i32`', '`func add(x int) int`', '`fun add(x: Int): Int`'],
      ['Immutable Binding', '`let value = 1;`', '`let value = 1;`', '`value := 1`', '`val value = 1`'],
      ['Mutable Binding', '`let mut value = 1;`', '`let mut value = 1;`', 'direct reassignment', '`var value = 1`'],
      ['Memory Model', 'Move semantics + static borrow checking; only frame-escaping values enter {{conservative-gc}}', 'Move semantics + borrow checking; explicit lifetime parameters required', 'Full-lifecycle GC management; no value move semantics', 'JVM / native GC management across all values'],
      ['Lifetime Annotations', 'Not required; inferred via interprocedural escape analysis', "Explicit lifetime parameters required (`'a`)", 'Not applicable', 'Not applicable'],
      ['Recoverable Errors', '`Option<T>` / `Result<T, E>` and `?` operator', '`Option<T>` / `Result<T, E>` and `?` operator', 'Multiple return values with explicit `error` checks', 'Null-safety operators and exception handling'],
      ['Behavioral Abstraction', '`trait` + `impl` static monomorphization', '`trait` + `impl` monomorphization and trait objects', 'Implicit structural interfaces', 'Object-oriented interfaces and class inheritance'],
      ['Build & Package Tooling', '`clue` + `Clue.toml`', 'Cargo + `Cargo.toml`', '`go` CLI + `go.mod`', 'Gradle / Maven'],
      ['Compilation Backends', 'Standard C11 emission + built-in MIR interpreter', 'LLVM IR / native machine code', 'Go compiler proprietary native backend', 'JVM Bytecode / LLVM / JavaScript'],
    ],
    blocks: [
      { title: 'Same Ownership Discipline, Distinct Storage Placement', body: 'Riddle and Rust share move-by-default semantics for non-`Copy` types and strictly differentiate immutable `&T` from exclusive `&mut T` borrows. Riddle removes explicit lifetime annotations by employing interprocedural {{escape}} to detect whether references escape their caller frame, promoting only escaping values to the {{conservative-gc}}. The GC manages physical storage, while move and borrow rules remain uncompromisingly enforced.' },
      { title: 'Modern Pragmatic Syntax with Orthogonal Primitives', body: 'The syntax draws extensively from modern languages: trailing expressions, `struct`, `enum`, `trait`, `impl`, `match`, `if let`, `let else`, and bracket closures `[x -> x + 1]`. Callable abstractions are cleanly unified around `impl Fn(...) -> T` or `dyn Fn(...)`.' },
      { title: 'Clue: Purpose-Built Build & Package Management', body: '`Clue.toml` adopts an intuitive manifest format supporting path, git, and sparse registry dependencies locked deterministically in `Clue.lock`. It provides first-class support for inspecting intermediate C sources and leveraging global build caches.' },
    ],
    footnote: 'For in-depth architectural comparisons and migration syntax cheat sheets, see the documentation.',
    link: { label: 'Migrating from Rust or Kotlin to Riddle', href: 'https://riddle-lang.github.io/docs/riddle-vs-rust-kotlin.html' },
  },
  workflow: {
    eyebrow: 'Project Workflow',
    title: 'Clue Project Workflow',
    subtitle: '`clue` manages scaffolding, dependency resolution, multi-target compilation, global caching, and API documentation.',
    steps: [
      { name: 'Scaffold Project', desc: 'Generates `Clue.toml`, `src/main.rid` entrypoint, and a default `.gitignore`.', code: 'clue new hello' },
      { name: 'Static Check', desc: 'Performs parsing, type inference, escape analysis, and borrow checking without generating C.', code: 'clue check' },
      { name: 'Build Binary', desc: 'Emits C11 and links an optimized native binary, preserving `.clue/build/hello.c`.', code: 'clue build' },
      { name: 'Build & Run', desc: 'Executes the compiled native executable immediately after building.', code: 'clue run' },
      { name: 'Generate Docs', desc: 'Extracts HIR and doc-comments into an offline static HTML documentation site.', code: 'clue doc' },
    ],
    points: [
      'Library build artifacts are cached globally under `$CLUE_HOME` based on content hashes for cross-project reuse',
      'Sibling dependencies within the same package build concurrently using multi-threaded `-j` execution',
      'Path, git, and sparse registry dependencies resolve into a deterministic `Clue.lock`, constrained by `--locked` and `--offline` flags',
      '`--target`, `RIDDLE_TARGET`, and `Clue.toml` `[build].target` override the host platform in strict order',
    ],
  },
  targets: {
    eyebrow: 'Cross Compilation',
    title: 'Supported Targets',
    subtitle: 'The initial release provides precompiled runtime support across 7 desktop and server architectures ({{triple}}), managed via `ridup target add`.',
    triples: [
      { name: 'x86_64-unknown-linux-gnu', note: 'Primary 64-bit Linux desktop and server platform' },
      { name: 'aarch64-unknown-linux-gnu', note: '64-bit ARM Linux servers and Apple Silicon Linux' },
      { name: 'i686-unknown-linux-gnu', note: '32-bit x86 Linux architecture' },
      { name: 'x86_64-pc-windows-msvc', note: 'Primary 64-bit Windows platform (MSVC toolchain)' },
      { name: 'i686-pc-windows-msvc', note: '32-bit Windows platform (MSVC toolchain)' },
      { name: 'aarch64-pc-windows-msvc', note: 'Windows on Arm platform' },
      { name: 'aarch64-apple-darwin', note: 'Apple Silicon macOS platform' },
    ],
    points: [
      'Target runtimes and C toolchains are distinct: final linking requires target sysroot, Windows SDK/MSVC libraries, or Apple SDKs',
      '`clue run` executes binaries only for the host platform; cross-compiled binaries must be deployed to the destination system',
      'Unsupported triples are rejected explicitly by the compiler, avoiding silent fallback to host targets',
    ],
    footnote: '`ridup target add <triple>` installs `runtime.c` and `target.toml` locally; missing target SDKs produce clear installation guidance.',
  },
  history: {
    eyebrow: 'Release History',
    title: 'Version History',
    subtitle: 'Every release maps to a Git tag in the repository and validated GitHub Releases assets.',
    releases: [
      { version: 'v0.3.0', date: '2026-09-19', summary: 'Built-in SSA MIR interpreter (`riddle run` / `riddle repl`), or-pattern matching, collection iteration views, `clue doc` HTML docs, global build caching, and parallel dependency compilation' },
      { version: 'v0.2.3', date: '2026-09-05', summary: '`vec!` macro, range expressions, iterator combinators, standard filesystem/time/RNG modules, and nine automated LSP quick fixes' },
      { version: 'v0.2.2', date: '2026-08-25', summary: '`riddle fmt` code formatter, dynamic trait objects, associated types, doc-comments, and pattern control-flow destructuring' },
      { version: 'v0.2.1', date: '2026-08-11', summary: 'LSP workspace indexing, symbol renaming, auto-imports; derive / attribute / function procedural macro exports' },
      { version: 'v0.2.0', date: '2026-07-28', summary: 'Cross-compilation across 7 target triples; project-aware LSP diagnostics, completion, and semantic tokens' },
      { version: 'v0.1.1', date: '2026-07-20', summary: 'Early feedback fixes improving borrow checker stability and HIR lowering' },
      { version: 'v0.1.0', date: '2026-07-15', summary: 'Initial technical preview establishing move semantics, escape analysis, and C11 backend architecture' },
    ],
    footnote: 'For detailed release notes, breaking change details, and changelog diffs, see CHANGELOG.md.',
    link: { label: 'View all releases on GitHub', href: 'https://github.com/riddle-lang/riddle/releases' },
  },
  benchmarks: {
    eyebrow: 'Benchmarking',
    title: 'Performance & Benchmarks',
    subtitle: 'Criterion benchmarks protect interpreter hot paths; tests emphasize deterministic correctness over arbitrary hardware scores.',
    workloads: [
      { name: 'loops', desc: 'Executes 60,000 arithmetic loop iterations, verifying results against constant checksum `1_799_970_000`.' },
      { name: 'fib', desc: 'Deep recursive `fib(24)` exercising call frame allocations and MIR basic block dispatch, asserting against `46_368`.' },
      { name: 'vector', desc: 'Frequent pushes and pops on `Vector` collections, benchmarking container memory interaction paths.' },
    ],
    command: 'cargo bench',
    points: [
      'Each benchmark iteration runs `main` in an isolated fresh interpreter session to prevent state leakage',
      'Workloads assert against strict checksums: algorithmic bugs or corrupted intermediate states immediately trigger hard failures',
      'Hot execution paths are continuously optimized, including eliminating redundant instruction vector cloning during basic block dispatch',
    ],
    footnote: 'Due to machine variability, CI does not gate on raw benchmark times; performance regression guards rely on local `cargo bench` comparison.',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    subtitle: 'Direct answers regarding production readiness, backend choices, memory architecture, and ecosystem goals.',
    items: [
      { q: 'Is Riddle production-ready today?', a: 'Not yet. Riddle is currently in Technical Preview. Syntax and runtime ABIs remain subject to breaking changes. It is ideal for prototyping, writing developer tools, exploring language mechanics, and providing feedback.' },
      { q: 'Why compile to C11 instead of directly to LLVM?', a: 'The primary reason is that a C backend is straightforward, lightweight, and simple to implement, allowing us to validate end-to-end language semantics quickly with minimal engineering overhead while leveraging existing C compilers for cross-platform builds. Later in development, we plan to transition to compiling directly to LLVM for stronger optimization pipelines and native code generation. In the meantime, the built-in `riddle run` and `riddle repl` interpret MIR directly without needing any external compiler.' },
      { q: 'Why does Riddle not need lifetime annotations?', a: 'An interprocedural fixpoint escape analysis infers reference lifetimes automatically. Values are promoted to the non-moving conservative GC heap only when their reference lifetime exceeds their stack frame. The GC handles physical placement, while move semantics and borrow checking remain strictly enforced.' },
      { q: 'How does Riddle relate to Rust?', a: 'Riddle adopts Rust-style ownership, borrow checking, and algebraic data types, but eliminates manual lifetime parameters like `\'a`. It also removes reference-counting pointer types like `Rc` and `Arc`; `dyn Trait` in Riddle is an owned value.' },
      { q: 'How does Riddle compare to Go?', a: 'Riddle shares Go\'s philosophy of streamlined toolchains and accessible syntax, but differs fundamentally in its memory architecture: Go depends on an always-on full GC, whereas Riddle uses default move semantics, compile-time borrow checking, and deterministic RAII destruction, reserving GC exclusively for escaping values.' },
      { q: 'When should I use the interpreter vs the C backend?', a: 'Use `riddle run` and `riddle repl` for quick single-file scripting, syntax exploration, or running on machines without a C compiler. Use `clue build` when creating standalone binaries, building libraries, or cross-compiling. Both modes share identical execution semantics.' },
      { q: 'What is the current standard library coverage?', a: 'The built-in standard library provides `Option`, `Result`, `String`, `Vector`, hash maps and balanced tree views (`HashMap` / `TreeMap`), iterator combinators, formatted I/O, filesystem access, high-resolution time, RNG, and basic string parsing. Package ecosystem tooling is powered by `clue` and sparse registries.' },
      { q: 'How can I contribute to Riddle?', a: 'You can report bugs or propose ideas on GitHub Issues. Writing standard library modules, contributing to The Riddle Book, improving compiler error explanations, and testing editor integrations are high-impact ways to get involved.' },
    ],
  },
  docs: {
    eyebrow: 'Documentation',
    title: 'The Riddle Book',
    subtitle: 'Maintained directly alongside the compiler across eight comprehensive topic areas.',
    groups: [
      { title: 'Getting Started', items: [
        { label: 'Quick Start', desc: 'Your first Riddle program', href: 'https://riddle-lang.github.io/docs/start.html' },
        { label: 'Installation', desc: 'ridup and release archives', href: 'https://riddle-lang.github.io/docs/install.html' },
        { label: 'Project Setup', desc: 'Clue project structure', href: 'https://riddle-lang.github.io/docs/clue-create.html' },
      ] },
      { title: 'Language Basics', items: [
        { label: 'Variables & Mutability', desc: 'let and let mut bindings', href: 'https://riddle-lang.github.io/docs/variables-and-mutability.html' },
        { label: 'Data Types', desc: 'Scalars, tuples, and arrays', href: 'https://riddle-lang.github.io/docs/type-system.html' },
        { label: 'Control Flow', desc: 'if, match, and loops', href: 'https://riddle-lang.github.io/docs/control-flow.html' },
      ] },
      { title: 'Ownership & Memory', items: [
        { label: 'Ownership Model', desc: 'Storage and RAII drops', href: 'https://riddle-lang.github.io/docs/ownership-and-memory.html' },
        { label: 'Move Semantics', desc: 'Default moves and partial moves', href: 'https://riddle-lang.github.io/docs/move-semantics.html' },
        { label: 'References & Escape', desc: 'Borrowing and escape analysis', href: 'https://riddle-lang.github.io/docs/references-and-escape.html' },
      ] },
      { title: 'Abstraction & Errors', items: [
        { label: 'Structs', desc: 'Data layouts and methods', href: 'https://riddle-lang.github.io/docs/structs.html' },
        { label: 'Enums & Patterns', desc: 'Algebraic types and match exhaustiveness', href: 'https://riddle-lang.github.io/docs/enums-and-patterns.html' },
        { label: 'Error Handling', desc: 'Option, Result, and ? operator', href: 'https://riddle-lang.github.io/docs/error-handling.html' },
      ] },
      { title: 'Generics & Modules', items: [
        { label: 'Generics', desc: 'Type parameters and const generics', href: 'https://riddle-lang.github.io/docs/generics.html' },
        { label: 'Traits', desc: 'Behavioral bounds and object safety', href: 'https://riddle-lang.github.io/docs/traits.html' },
        { label: 'Modules & Packages', desc: 'use paths, visibility, and packages', href: 'https://riddle-lang.github.io/docs/modules.html' },
      ] },
      { title: 'Collections & Functional', items: [
        { label: 'Collections', desc: 'Vector and map collections', href: 'https://riddle-lang.github.io/docs/collections.html' },
        { label: 'Closures & Iterators', desc: 'Fn capabilities and combinators', href: 'https://riddle-lang.github.io/docs/functional.html' },
        { label: 'Standard Library', desc: 'Strings, filesystem, and time', href: 'https://riddle-lang.github.io/docs/standard-library.html' },
      ] },
      { title: 'Engineering & Tools', items: [
        { label: 'Clue Builder', desc: 'Dependencies, workspaces, and targets', href: 'https://riddle-lang.github.io/docs/clue.html' },
        { label: 'Procedural Macros', desc: 'AST and TokenStream extensions', href: 'https://riddle-lang.github.io/docs/proc-macros.html' },
        { label: 'Editor Support', desc: 'LSP setups across modern editors', href: 'https://riddle-lang.github.io/docs/editor-support.html' },
      ] },
      { title: 'Reference & Appendices', items: [
        { label: 'Compiler Status', desc: 'Feature support checklist', href: 'https://riddle-lang.github.io/docs/compiler-status.html' },
        { label: 'Formal Grammar', desc: 'EBNF grammar specification', href: 'https://riddle-lang.github.io/docs/grammar.html' },
        { label: 'Error Code Index', desc: 'Index of all E-prefixed diagnostics', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
      ] },
    ],
    footnote: 'Running `clue doc` generates the identical offline HTML documentation for your own projects.',
  },
  glossary: {
    escape: { term: 'Escape Analysis', def: 'Interprocedural fixpoint analysis determining whether a reference outlives its frame, dictating stack allocation vs promotion to the GC heap.' },
    'conservative-gc': { term: 'Conservative Non-Moving GC', def: 'Default lightweight runtime using mark-sweep without moving objects in memory; only escaping values are allocated here.' },
    mir: { term: 'MIR', def: 'Mid-level SSA intermediate representation situated between HIR type checking and backend code generation; shared by the C11 backend and built-in interpreter.' },
    triple: { term: 'Target Triple', def: 'Platform identifier like x86_64-unknown-linux-gnu defining target architecture, ABI, and precompiled runtime components.' },
  },
};
