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
    title: 'Riddle — Memory safety without the GC tax',
    description:
      'Riddle is an experimental programming language inspired by Rust and Go. Move semantics and borrow checking eliminate memory errors at compile time, while escape analysis keeps most values on the stack — no lifetime annotations, no always-on garbage collector.',
    ogAlt: 'The Riddle programming language',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    toggleTheme: 'Toggle light and dark theme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    copy: 'Copy',
    copied: 'Copied',
  },
  nav: {
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pipeline', href: '#pipeline' },
      { label: 'Runtime', href: '#runtime' },
      { label: 'Toolchain', href: '#toolchain' },
      { label: 'Get started', href: '#start' },
    ],
    docs: 'Docs',
    playground: 'Playground',
    github: 'GitHub',
  },
  hero: {
    badge: 'v0.2.0 · Technology preview',
    title: 'Memory safety,',
    titleAccent: 'without the GC tax.',
    subtitle:
      'Riddle eliminates memory errors at compile time with move semantics and borrow checking, and keeps every value that never outlives its frame on the stack via interprocedural escape analysis. Not one lifetime annotation, and no garbage collector running the whole way.',
    ctaPrimary: 'Try it in the Playground',
    ctaSecondary: 'Read the docs',
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
      { value: '5', label: 'runtime ABI functions' },
      { value: '9', label: 'compiler stages' },
      { value: 'C11', label: 'backend output' },
    ],
  },
  features: {
    eyebrow: 'Language features',
    title: 'Why Riddle',
    subtitle:
      'Ownership, escape analysis and deterministic destruction together — safety that needs neither annotations nor an always-on collector.',
    items: [
      {
        id: 'move',
        title: 'Move semantics',
        summary: 'Values move by default; use-after-move is a compile error',
        headline: 'Ownership is settled at compile time',
        body: 'Assignment, argument passing and returning all transfer ownership. The move checker catches use-after-move, conflicting borrows, and assignment or movement during a borrow — all at compile time, with no runtime checks.',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun main() {
    let a = Foo { x: 1, y: 1 };
    let b = a;
    print(a); // error: a has already been moved
    print(b);
}`,
        caption:
          'Scalars, shared references, raw pointers and named function items are copyable by default; `&mut T` and closure values are not.',
        bullets: [
          'User types opt into copy semantics by implementing `std::marker::Copy`; the compiler verifies every field and enum payload',
          'Field access alone does not move the whole struct; `match` destructuring records per-field partial moves, and untouched sibling fields stay usable',
          '`Option<T>` and `Result<T, E>` are `Copy` only when every payload type is `Copy`',
        ],
      },
      {
        id: 'escape',
        title: 'No lifetime annotations',
        summary: 'Escape analysis decides stack or heap',
        headline: 'Return a reference without writing a lifetime',
        body: 'Riddle has no lifetime syntax. An interprocedural fixpoint escape analysis computes a "leaked parameters / returned-from parameters" summary for every function, and uses it to decide whether a local stays on the stack or is promoted to the conservative non-moving GC heap. Storage location never relaxes move or borrow checking.',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun make_ref() -> &Foo {
    let foo = Foo { x: 1, y: 2 };
    &foo // escapes the frame, so foo is promoted to the GC heap
}`,
        table: {
          head: ['Analysis result', 'MIR allocation'],
          rows: [
            ['Non-escaping local that needs no stable address', 'SSA value, no allocation emitted'],
            ['Non-escaping local that is mutable or captured by reference', '`Alloca`, stack storage'],
            ['Escaping local', '`HeapAlloc`, GC heap storage'],
            ['Non-escaping / escaping closure environment', '`Alloca` / `HeapAlloc`'],
          ],
        },
      },
      {
        id: 'drop',
        title: 'Deterministic destruction',
        summary: 'Drop runs when the owner’s scope ends',
        headline: 'The GC only decides addresses — destruction stays deterministic',
        body: 'Types implementing `std::ops::Drop` run their destructor deterministically when the owning scope ends. Escaping to the GC heap changes a value’s address, not when it is destroyed; drop flags make sure a moved-out value is never destroyed twice.',
        code: `struct FileHandle {
    raw: i32,
}

impl Drop for FileHandle {
    fun drop(&mut self) {
        // release the external resource behind raw
    }
}`,
        caption:
          'Locals, parameters, pattern bindings, iteration elements, aggregate fields and closure environments are all covered.',
        bullets: [
          '`Drop + Copy`, calling the destructor directly, and moving a field out of an explicit `Drop` type are all rejected',
          'A `for` loop’s current element, its iterator and its early-exit paths each get their own drop scope',
        ],
      },
      {
        id: 'traits',
        title: 'Traits and generics',
        summary: 'Associated types, supertraits, const generics',
        headline: 'Abstraction that costs nothing at runtime',
        body: 'Traits support default methods, associated types with defaults, supertrait declarations and transitive bounds. Generics are monomorphized in the C backend, and const generics lift lengths into the type.',
        code: `trait Summary {
    fun title(&self) -> &str;

    fun summarize(&self) -> &str {
        self.title()
    }
}

struct Buffer<T, const N: usize> {
    data: [T; N],
}`,
        caption: 'An impl that does not override a method inherits the trait’s default body.',
        bullets: [
          '`<T: A + B>` and `where` clauses; `where` on an impl is checked against the Paterson condition',
          'Operators dispatch to user types through `#[lang = "..."]` traits; scalar operations lower straight to native C operators with no wrapper functions',
          '`==` / `!=` check `PartialEq`, ordering comparisons check `PartialOrd`, and heterogeneous right-hand-side impls are supported',
        ],
      },
      {
        id: 'match',
        title: 'Pattern matching',
        summary: 'Recursive exhaustiveness, gaps down to the range',
        headline: 'The compiler tells you exactly which arm is missing',
        body: '`match` performs recursive exhaustiveness checking over enums, booleans, `()`, integers, tuples and structs. A non-exhaustive integer match does not report a vague error — it reports the uncovered contiguous ranges.',
        code: `fun classify(n: i32) -> i32 {
    match n {
        x if x < 0 => -1,
        0 => 0,
        _ => 1,
    }
}`,
        caption: 'Exhaustiveness gaps are reported as E0039 together with the uncovered ranges.',
        bullets: [
          'A failed guard falls through to the following arms; guarded arms do not count toward static exhaustiveness',
          'Unit, tuple and struct enum variant patterns are supported, and payload bindings are visible in both the guard and the arm',
        ],
      },
      {
        id: 'ffi',
        title: 'C FFI and unsafe',
        summary: 'extern blocks are unsafe by default; opt in with safe fun',
        headline: 'Talking to C, with the boundary written down',
        body: 'Imports inside an `unsafe extern "C"` block are unsafe by default, and you opt individual functions back in with `safe fun`. The C backend provides no built-in helpers keyed on function names — every `extern "C"` declaration becomes an ordinary external symbol.',
        code: `unsafe extern "C" {
    safe fun abs(x: i32) -> i32;
    fun malloc(size: usize) -> *mut u8;
}

fun main() {
    let value = abs(-42);
    let pointer = unsafe { malloc(16) };
}`,
        caption: 'Dereferencing and indexing raw pointers requires an `unsafe` context.',
        bullets: [
          '`&str` maps to `const char*` in C imports; exported definitions with a body keep the `{ ptr, len }` fat pointer',
          '`unsafe fun` and `unsafe fun(...) -> T` function types, with one-way safe-to-unsafe conversion',
        ],
      },
    ],
  },
  pipeline: {
    eyebrow: 'Compilation pipeline',
    title: 'Source to C, in nine stages',
    subtitle:
      '`riddlec` already runs the complete frontend and the C backend. Every stage is covered by tests in the repository.',
    stages: [
      { name: 'Lexing and parsing', desc: '`IncrementalParser` exposes a partial re-parse API' },
      { name: 'AST wrapping', desc: 'A uniform syntax tree; attributes travel with their items' },
      { name: 'HIR lowering', desc: 'Includes the E0040 / E0050 / E0051 / E0052 diagnostics' },
      {
        name: 'Scope graph and name resolution',
        desc: 'Fragment-based incremental scope graph with partial invalidation',
      },
      { name: 'Type checking', desc: 'A reusable `IncrementalTypeChecker`' },
      {
        name: 'Escape analysis',
        desc: 'Interprocedural fixpoint deciding stack versus GC heap allocation',
      },
      {
        name: 'Move checker',
        desc: 'Use-after-move, conflicting borrows, assignment and movement during a borrow',
      },
      {
        name: 'MIR lowering',
        desc: 'SSA form with Phi nodes, basic blocks and `Alloca` / `HeapAlloc`',
      },
      { name: 'C code generation', desc: 'Emits C11 that calls the `rgc` runtime ABI' },
    ],
    footnote:
      'With no backend selected, `riddlec` stops after move and borrow checking; MIR lowering only continues when backend code is actually needed.',
  },
  runtime: {
    eyebrow: 'Runtime',
    title: 'Five functions make up the runtime ABI.',
    subtitle:
      'Every runtime provider implements these five symbols: initialize the stack, allocate, resize and free memory, and trigger collection.',
    code: `void rgc_init(void *stack_bottom);
void *rgc_alloc(size_t size);
void *rgc_realloc(void *ptr, size_t size);
void rgc_free(void *ptr);
void rgc_collect(void);`,
    caption:
      '`crates/gc` ships the default conservative, non-moving mark-sweep implementation; point `[runtime].source` in `Clue.toml` at your own provider to replace it.',
    points: [
      {
        title: 'No Boehm GC',
        desc: '`clue build` compiles the generated C and the runtime source with your system C compiler — no extra third-party runtime dependency.',
      },
      {
        title: 'Conservative and non-moving',
        desc: 'Only values that escape analysis proves outlive the current frame reach the GC heap. Everything else stays on the stack, and the collector never relocates objects.',
      },
      {
        title: 'Each allocation hook has a job',
        desc: '`rgc_realloc` grows `Vector` buffers and `rgc_free` releases provider-owned memory; a non-GC provider may ignore the stack bottom and make `rgc_collect` a no-op.',
      },
      {
        title: 'Fully replaceable',
        desc: 'The runtime provider is chosen by `clue` and accepts custom providers — embedded or specialised targets can bring their own allocator.',
      },
    ],
  },
  release: {
    eyebrow: 'What\'s new in v0.2.0',
    title: 'From the language core to a complete toolchain',
    subtitle:
      'This release moves Riddle beyond a host-only compiler toward cross-target builds and a complete editor-ready development experience.',
    items: [
      {
        title: 'Seven target platforms',
        desc: '`clue` and `riddlec` now build for a selected target triple, with runtime components for all seven supported targets.',
      },
      {
        title: 'Project-aware editing',
        desc: 'The LSP now provides project-aware diagnostics, completion, semantic tokens, inlay hints and code actions across Helix, VS Code, Zed and IntelliJ IDEA.',
      },
      {
        title: 'A broader language and standard library',
        desc: 'Generics, traits, closures, operator overloading and deterministic `Drop` now work end to end, alongside arrays, slices, strings and Vector.',
      },
      {
        title: 'A five-function runtime ABI',
        desc: 'The C backend uses a replaceable five-function ABI; the bundled conservative non-moving GC needs no external collector.',
      },
    ],
  },
  toolchain: {
    eyebrow: 'Toolchain',
    title: 'One manager, three binaries',
    subtitle:
      '`ridup` manages Riddle versions; a toolchain is `clue`, `riddlec` and `riddle-lsp`. Prebuilt archives are on GitHub Releases; installing from source needs a recent Rust stable.',
    manager: {
      name: 'ridup',
      tagline: 'Toolchain manager',
      desc: 'Selects and runs installed toolchains. The `stable`, `nightly` and `canary` channels each get their own copy and never overwrite one another. It manages Riddle versions only — the selected `clue` still finds a host C compiler.',
      usage: 'ridup toolchain install stable | nightly | canary',
      points: [
        '`stable` and `nightly` take the GitHub Release archive and verify its SHA-256 before replacing the old toolchain',
        '`canary` fetches the latest `main` commit and runs `cargo build --workspace --release` locally — Rust and Cargo are enough, Git is not needed',
        '`ridup toolchain link dev <dir>` turns a local build directory into a toolchain',
        '`riddle-toolchain.toml`, `RIDUP_TOOLCHAIN` and `clue +dev build` all change the selection',
        'Copy or hard-link ridup as `clue`, `riddlec` or `riddle-lsp` and it proxies into the selected toolchain',
        'Downloads and Canary builds honour `HTTPS_PROXY` and the other standard proxy variables',
      ],
      link: { label: 'ridup on GitHub', href: 'https://github.com/riddle-lang/ridup' },
    },
    items: [
      {
        name: 'riddlec',
        tagline: 'Compiler CLI',
        desc: 'Checks Riddle source and generates C — the frontend checks and the C backend live in one binary.',
        usage: 'riddlec [--verbose] [--backend c] [--target <triple>] [--output <file>] <file>...',
        points: [
          '`--backend c` emits C that calls the `rgc` ABI',
          '`--target <triple>` selects a target; `RIDDLE_TARGET` and `Clue.toml` can set it too',
          'Automatically appends `std/lib.rid` to your source',
          'Without a backend it only runs the frontend checks and skips MIR lowering',
        ],
      },
      {
        name: 'clue',
        tagline: 'Project builder',
        desc: 'Creates, checks, builds and runs Riddle projects. Binary projects produce a native executable; library projects emit C only.',
        usage: 'clue init | new | check | build | run [--target <triple>]',
        points: [
          'Uses `CC` strictly when set, otherwise finds a system compiler that can complete a C11 compile and link',
          '`--target`, `RIDDLE_TARGET` and `[build].target` in `Clue.toml` override the host in that order',
          '`ridup target add <triple>` installs the target runtime; linking still needs the target C toolchain',
          '`clue build` keeps `.clue/build/<name>.c` so you can inspect the output',
          '`[runtime].source` in `Clue.toml` can point at a custom runtime implementation',
        ],
      },
      {
        name: 'riddle-lsp',
        tagline: 'Language server',
        desc: 'Built on `tower-lsp`. Parse errors, HIR diagnostics, type errors and move / escape diagnostics are all pushed over LSP.',
        points: [
          'Project-wide completion that prefers unsaved content from every open file',
          'Semantic tokens that distinguish free functions, methods, structs, enums and traits',
          'Error codes link into the error index; notes and fixes are attached as `note:` / `help:`',
        ],
      },
    ],
  },
  editors: {
    eyebrow: 'Editor support',
    title: 'In the editor you already use',
    subtitle: 'The `editors` directory in the repository ships ready-to-use configuration.',
    list: ['Helix', 'VS Code', 'Zed', 'IntelliJ IDEA 2026.1+'],
    haveTitle: 'Working today',
    have: [
      '`.rid` file recognition',
      'Diagnostics across Clue projects, unsaved files and unopened modules',
      'Parse, type, move and borrow diagnostics',
      'Semantic highlighting for functions, methods, structs, enums, traits, parameters and mutable bindings',
      'Inlay hints for locals whose return type comes from another module',
      'Cross-file completion including fields, methods, enum variants and associated functions',
      'A code action for mutable closure bindings',
      'Incremental document sync and semantic token deltas',
    ],
    missTitle: 'Not implemented yet',
    miss: ['Hover', 'Go to definition', 'Find references', 'Rename', 'Formatting'],
  },
  quickstart: {
    eyebrow: 'Get started',
    title: 'Five commands to your first program',
    subtitle:
      'Install a toolchain with `ridup` and switch channels whenever you want, or download the archive for your platform from GitHub Releases and add it to `PATH`.',
    steps: [
      {
        title: 'Install the toolchain',
        desc: 'Installing a channel does not select it, so pick the default too. `ridup show` then tells you which toolchain is active and why.',
        lang: 'bash',
        code: `cargo install --git https://github.com/riddle-lang/ridup
ridup toolchain install stable
ridup default stable`,
      },
      {
        title: 'Create and run a project',
        desc: '`clue run` performs the same build as `clue build`, then runs the resulting executable.',
        lang: 'bash',
        code: `clue new hello
cd hello
clue check
clue build
clue run`,
      },
    ],
    footnote:
      '`clue build` keeps `.clue/build/hello.c`. When `CC` is set Clue uses it strictly; otherwise it searches for `cc`, `gcc`, `clang` and their versioned variants — plus `clang-cl` and `cl` on Windows. To type `clue` directly, copy or hard-link ridup as `clue`; without that proxy, run `ridup run stable clue new hello`.',
  },
  status: {
    eyebrow: 'Project status',
    title: 'This is a technology preview, and we say so',
    subtitle:
      'The v0.2.0 language and toolchain may still change incompatibly. Here is the honest boundary of what works.',
    worksTitle: 'Working today',
    works: [
      'Type checking, the move checker, borrow and escape analysis',
      'Generics, const generics, traits and associated types',
      'Closures with `Fn` / `FnMut` / `FnOnce` call-capability checking',
      '`match` with recursive exhaustiveness checking',
      '`for` driven by `IntoIterator` / `Iterator`',
      '`unsafe` semantics and C FFI',
      'Arrays, slices, strings and the Vector standard library',
      'Drop, operator overloading and deterministic C backend behavior',
      'Cross-target builds and target runtimes for seven supported triples',
      'A built-in standard library, C11 codegen, project tooling and an LSP',
    ],
    limitsTitle: 'Current limitations',
    limits: [
      '`Default`, formatting and hashing protocols are not available yet',
      'Floating-point remainder is unsupported; `Rem` / `RemAssign` are integer-only for now',
      'Generics lean on monomorphization and do not yet cover all of Rust’s generic power',
      'The C backend is the only backend; producing an executable relies on a system C compiler',
      'Escape analysis works at whole-local granularity, without field-level splitting',
      'Closures capture whole bindings, without field-level precision',
      'Function type syntax can only express `Fn` as `fun(...) -> T`',
    ],
    note: 'Syntax and ABI stability are not guaranteed. Treat Riddle as a language worth trying seriously — not one to ship to production.',
  },
  roadmap: {
    eyebrow: 'Roadmap',
    title: 'What comes next',
    subtitle:
      'This roadmap is the project’s actual priority order: correctness first, language capability second, then toolchain and ecosystem. It reorders with feedback and promises no dates.',
    phases: [
      {
        tag: '01 · Near term',
        title: 'The language core',
        desc: 'Correctness first — finish the foundations of the safety semantics.',
        items: [
          '`?` error propagation and an error-conversion protocol for `Result<T, E>`',
          'Standalone `loop`, `break` with values and labels, and or / range / slice patterns',
          'Stronger inference: `Vector::new()` element types from later use, `Default::default`-style associated-function dispatch, and explicit `FnMut` / `FnOnce` function types',
        ],
      },
      {
        tag: '02 · Mid term',
        title: 'Standard library and toolchain',
        desc: 'As the language can express more, the library and the tools have to keep pace.',
        items: [
          'A larger standard library: file and buffered IO, parsing, time, random numbers, Map / Set, hashing and full formatting',
          'Remaining LSP work: hover, go to definition, find references, rename and formatting',
          'Dependency management in `clue`: a registry, version resolution, git dependencies and a lockfile',
          'Library projects produce static / dynamic libraries, not just C source',
        ],
      },
      {
        tag: '03 · Long term',
        title: 'After the core stabilizes',
        desc: 'These are deliberately sequenced after the core semantics settle — no head start.',
        items: [
          'Concurrency and async / await',
          'Backends beyond C',
          'The stability promise for syntax and the runtime ABI',
        ],
      },
    ],
    note: 'Want to shift the priorities? Tell us on GitHub Issues which item you need most.',
  },
  author: {
    eyebrow: 'About the author',
    title: 'One person, one language',
    name: 'zi2ven',
    role: 'Author and sole maintainer of Riddle',
    motto: 'Riddle is Best',
    bio: [
      'From the first line of `riddlec` to the page you are reading — the compiler, `clue`, `riddle-lsp`, `ridup`, the standard library, the docs and the Playground — everything comes from the same pair of hands.',
      'Being a one-person project is also why it believes in writing the boundaries down: what works and what does not yet, stated plainly on this site and in the docs. If something breaks while you try it, file an issue on GitHub.',
    ],
    link: { label: 'Find zi2ven on GitHub', href: 'https://github.com/zi2ven' },
  },
  cta: {
    title: 'Write a few lines of Riddle',
    subtitle: 'Nothing to install — compile and run it right in your browser.',
    primary: 'Open the Playground',
    secondary: 'Read The Riddle Book',
  },
  footer: {
    tagline: 'An experimental programming language inspired by Rust and Go.',
    groups: [
      {
        title: 'Learn',
        links: [
          { label: 'Docs', href: 'https://riddle-lang.github.io/docs/' },
          { label: 'Playground', href: 'https://riddle-lang.github.io/playground/' },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'Repository', href: 'https://github.com/riddle-lang/riddle' },
          { label: 'ridup toolchain manager', href: 'https://github.com/riddle-lang/ridup' },
          { label: 'Releases', href: 'https://github.com/riddle-lang/riddle/releases' },
          { label: 'Issues', href: 'https://github.com/riddle-lang/riddle/issues' },
        ],
      },
    ],
    license: 'Apache License 2.0',
    community: 'Community',
    communityValue: 'QQ 677741637',
    copyright: 'The Riddle Project',
  },
};
