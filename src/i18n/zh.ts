import type { SiteContent } from './types';

export const zh: SiteContent = {
  locale: 'zh',
  htmlLang: 'zh-CN',
  dir: {
    self: '/',
    other: '/en/',
    otherLabel: 'EN',
    otherTitle: 'Switch to English',
  },
  meta: {
    title: 'Riddle — 结合所有权与逃逸分析的系统编程语言',
    description:
      'Riddle 是一门受 Rust 与 Go 启发的实验性系统编程语言。默认移动语义与编译期借用检查消除内存错误，过程间逃逸分析实现无需生命周期标注的栈优先分配，提供 C11 代码生成与免 C 编译器 MIR 解释器双后端。',
    ogAlt: 'Riddle 编程语言',
  },
  a11y: {
    skipToContent: '跳到主要内容',
    toggleTheme: '切换深浅色主题',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    copy: '复制',
    copied: '已复制',
    chapters: '章节导航',
  },
  nav: {
    // 页内导航由章节滑轨（chapters / ChapterNav）承担，顶部导航只保留站外入口。
    links: [],
    docs: '文档',
    playground: 'Playground',
    github: 'GitHub',
  },
  hero: {
    badge: 'v0.3.0 · 技术预览版',
    title: 'All are Riddle',
    titleAccent: 'All in Riddle',
    subtitle:
      'Riddle 结合默认移动语义与过程间逃逸分析：栈分配优先，仅对越过调用栈帧的数据启用非移动保守式 GC。兼顾现代语言表达力与确定性析构，提供直接生成 C11 与内置 MIR 解释器双重执行路径。',
    ctaPrimary: '在线体验 Playground',
    ctaSecondary: '阅读官方文档',
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
      { value: '0', label: '手写生命周期标注' },
      { value: '5', label: '个运行时 ABI 符号' },
      { value: '9', label: '个编译器分析阶段' },
      { value: 'C11', label: '原生输出与 MIR 解释器' },
    ],
  },
  features: {
    eyebrow: '核心特性',
    title: '语言设计与核心特性',
    subtitle: '所有权机制、逃逸分析与确定性析构协同工作，在保证内存安全的同时免去复杂的手工生命周期推导。',
    items: [
      {
        id: 'move',
        title: '移动语义',
        summary: '值默认移动，编译期排查移动后使用与借用冲突',
        headline: '默认移动语义与借用检查',
        body: '变量绑定赋值、函数传参及返回值默认转移值所有权。Move Checker 在编译阶段静态验证移动后使用（use-after-move）、可变借用与共享借用冲突，以及借用生效期间的写操作与二次移动，无需运行时引用计数开销。',
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
        caption: '基础标量、共享引用、原始指针和命名函数项默认实现 Copy；`&mut T` 与闭包不可复制。',
        bullets: [
          '用户定义的 struct 和 enum 可显式实现 `std::marker::Copy`，编译器会自动校验所有字段与载荷是否均满足 Copy 约束',
          '支持细粒度的字段级部分移动（partial moves）；`match` 模式解构按字段记录所有权状态，未移出的兄弟字段可安全继续使用',
          '`Option<T>` 与 `Result<T, E>` 的 Copy 属性根据泛型参数推导，仅在包含类型均实现 `Copy` 时自动具备复制语义',
        ],
      },
      {
        id: 'escape',
        title: '逃逸分析',
        summary: '过程间逃逸分析自动推导栈或 GC 堆分配策略',
        headline: '免生命周期标注的引用传递',
        body: 'Riddle 省去了类似 `\'a` 的生命周期参数语法。编译器通过过程间不动点逃逸分析，推导每个函数的形参外泄与返回依赖摘要；未逃逸的数据优先驻留调用栈，仅当引用生命期超越当前栈帧时，才自动提升至非移动保守式 GC 堆。存储位置透明且不影响借用规则。',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun make_ref() -> &Foo {
    let foo = Foo { x: 1, y: 2 };
    &foo // 引用逃逸出当前栈帧，foo 自动分配至 GC 堆
}`,
        table: {
          head: ['逃逸分析推导结果', 'MIR 内存分配指令'],
          rows: [
            ['未逃逸且无需稳定内存地址的局部值', '保持 SSA 寄存器形式，无内存分配指令'],
            ['未逃逸但存在取地址、可变修改或被闭包引用捕获', '生成 `Alloca` 指令，驻留当前函数栈帧'],
            ['经判定生命期跨越当前栈帧的逃逸值', '生成 `HeapAlloc` 指令，分配至保守式 GC 堆'],
            ['闭包捕获的环境变量', '依据变量逃逸情况分配至 `Alloca` 或 `HeapAlloc`'],
          ],
        },
      },
      {
        id: 'drop',
        title: '确定性析构',
        summary: '基于 RAII 规范，在所有者离开作用域时确定性执行',
        headline: 'RAII 析构与 Drop Flag 保证',
        body: '实现 `std::ops::Drop` 的类型会在其所有者作用域结束时由编译器插入析构调用。对象是否被逃逸分析提升至堆只决定其内存存储位置，绝不改变或延迟确定性析构时机；编译器生成隐式 drop flag 保证被移动的对象不会发生二次析构。',
        code: `struct FileHandle {
    raw: i32,
}

impl Drop for FileHandle {
    fun drop(&mut self) {
        // 关闭文件描述符并释放外部资源
    }
}`,
        caption: '局部变量、函数参数、模式解构绑定、迭代器迭代项、复合类型字段与闭包捕获环境均受确定性析构覆盖。',
        bullets: [
          '编译期禁止析构语义冲突：禁止同时实现 `Drop` 与 `Copy`，禁止直接显式调用 `.drop()`，禁止从显式 Drop 类型中移出部分字段',
          '`for` 循环内部的当前迭代项、迭代器对象以及 `break`/`return` 提前退出分支均拥有独立的析构作用域边界',
        ],
      },
      {
        id: 'traits',
        title: 'Trait 与泛型',
        summary: '单态化泛型、关联类型约束与常量泛型',
        headline: '单态化泛型与 Trait 约束',
        body: 'Trait 支持默认方法实现、关联类型定义、父 Trait 继承声明及传递约束。泛型代码经由 C 后端进行全单态化（monomorphization）展开，消除虚表分派损耗；常量泛型（const generics）使数组长度等常量值直接参与编译期类型约束。',
        code: `trait Summary {
    fun title(&self) -> &str;

    fun summarize(&self) -> &str {
        self.title()
    }
}

struct Buffer<T, const N: usize> {
    data: [T; N],
}`,
        caption: '当 impl 未覆盖对应方法时默认使用 Trait 预设方法体，显式覆写优先分派。',
        bullets: [
          '支持 `<T: A + B>` 类型约束与 `where` 子句；在 impl 的类型约束上严格验证 Paterson condition',
          '重载运算符通过 `#[lang = "..."]` 映射到标准 Trait 实现；内置基础标量运算直接降级为高效原生 C 算符',
          '`==` / `!=` 绑定 `PartialEq`，有序比较绑定 `PartialOrd`，支持异构类型的左右操作数 impl 实现',
        ],
      },
      {
        id: 'match',
        title: '模式匹配',
        summary: '递归模式解构、穷尽性静态验证与连续区间推导',
        headline: '递归穷尽性检查与区间匹配',
        body: '`match` 表达式对枚举变体、布尔值、单位元 `()`、整数、元组及结构体执行严密的静态递归穷尽性推导。当离散整型等匹配存在遗漏时，编译器不会只给出笼统报错，而是精确推导并指出未被覆盖的具体连续数值区间。',
        code: `fun classify(n: i32) -> i32 {
    match n {
        x if x < 0 => -1,
        0 => 0,
        _ => 1,
    }
}`,
        caption: '静态穷尽性遗漏将报告 E0039 诊断，并直接打印未被覆盖的取值区间范围。',
        bullets: [
          '支持 or-pattern（`A | B => ...`）及模式 guard 条件；带 guard 的分支在运行时条件不满足时会继续回退匹配后续分支',
          '全面支持枚举的 unit、tuple 与 struct 变体解构模式，提取的 payload 绑定可在 guard 条件与分支体内直接引用',
        ],
      },
      {
        id: 'ffi',
        title: 'C FFI 与 unsafe',
        summary: '显式放行的安全边界与标准化 C 语言互操作',
        headline: '显式安全边界的原生 C FFI',
        body: '在 `unsafe extern "C"` 块中声明的导入函数默认要求处在 unsafe 语境内，允许通过 `safe fun` 对已确认安全的接口显式放行。C 后端遵循标准平台 ABI 输出标准外部符号声明，不注入任何专有辅助封装。',
        code: `unsafe extern "C" {
    safe fun abs(x: i32) -> i32;
    fun malloc(size: usize) -> *mut u8;
}

fun main() {
    let value = abs(-42);
    let pointer = unsafe { malloc(16) };
}`,
        caption: '裸指针的直接解引用与索引访问均受 `unsafe` 语境约束保护。',
        bullets: [
          'C FFI 导入声明中的 `&str` 参数映射为 `const char*`，导出函数签名保留 `{ ptr, len }` 胖指针结构',
          '类型系统严格区分普通安全函数指针与 `unsafe fun(...) -> T` 函数类型，并支持安全的向上隐式转换',
        ],
      },
    ],
  },
  pipeline: {
    eyebrow: '编译架构',
    title: '从源码到 C11 的九阶段流水线',
    subtitle: '`riddlec` 实现了兼顾增量分析的前端流水线与直接生成可链接代码的 C11 目标后端。',
    stages: [
      { name: '词法与语法分析', desc: '基于 `IncrementalParser` 提供高效局部重解析能力' },
      { name: 'AST 包装构建', desc: '构建统一语法树表示，注解属性与语法项紧密绑定' },
      { name: 'HIR 降级转换', desc: '执行高层语法校验，包含 E0040 / E0050 / E0051 / E0052 等关键诊断' },
      { name: '作用域图与名字解析', desc: '基于片段的增量作用域图构建，支持模块级细粒度局部失效' },
      { name: '静态类型检查', desc: '基于 `IncrementalTypeChecker` 的类型推导与泛型约束求解' },
      { name: '过程间逃逸分析', desc: '计算调用图不动点摘要，确定值分配在栈上或提升至 GC 堆' },
      { name: 'Move Checker', desc: '静态验证移动后使用、借用冲突以及活动借用期的重赋值' },
      { name: 'MIR 降级转换', desc: '转换为严格的 SSA 中间表示，包含 Phi 节点、基本块与分配指令' },
      { name: 'C11 代码生成', desc: '生成遵循标准规范、调用 `rgc` 极简运行时 ABI 的 C 代码' },
    ],
    footnote:
      '运行 `clue check` 时，编译器在完成类型检查与 move / borrow 验证后立即退出；只有在需要编译或执行时才继续降级为 MIR。同一份 MIR 既用于 C11 后端代码生成，也直接作为内置解释器的执行输入（`riddle run` / `riddle repl`）。',
  },
  runtime: {
    eyebrow: '运行时规范',
    title: '极简 C 运行时 ABI（5 个符号）',
    subtitle: '任何运行时 Provider 仅需实现以下 5 个符号即可完成栈探测、内存分配与垃圾回收管理。',
    code: `void rgc_init(void *stack_bottom);
void *rgc_alloc(size_t size);
void *rgc_realloc(void *ptr, size_t size);
void rgc_free(void *ptr);
void rgc_collect(void);`,
    caption: '`crates/gc` 提供了默认的非移动保守式 Mark-Sweep GC 实现；也支持在 `Clue.toml` 的 `[runtime].source` 中配置自定义的 Provider。',
    points: [
      {
        title: '零第三方依赖',
        desc: '`clue build` 直接利用系统标准 C 编译器链接生成的 C 代码与轻量运行时源码，不引入 Boehm GC 等复杂第三方库。',
      },
      {
        title: '非移动保守式收集',
        desc: '仅逃逸分析判定生命期越过当前栈帧的数据才进入 GC 堆；其余数据均高效驻留调用栈，垃圾回收器不会在内存中移动活跃对象。',
      },
      {
        title: '清晰的分配与释放契约',
        desc: '`rgc_realloc` 负责支持 `Vector` 动态扩容，`rgc_free` 支持由 Provider 显式释放内存；无 GC 需求的嵌入式 Provider 可将 `rgc_collect` 实现为 no-op。',
      },
      {
        title: 'Provider 完全可替换',
        desc: '运行时实现完全与编译器解耦，可在项目配置中自由重定向至针对嵌入式或特定硬件平台深度优化的分配器实现。',
      },
    ],
  },
  release: {
    eyebrow: '版本更新',
    title: 'v0.3.0 技术预览版概览',
    subtitle: '新增内置 MIR 解释器（`riddle run` / `riddle repl`）、or-pattern 模式匹配、全局构建缓存与静态 HTML 文档生成，同时规范化了闭包语法并修复了多处泛型边界缺陷。',
    items: [
      {
        title: '免 C 编译器的内置 MIR 解释器',
        desc: '`crates/interpreter` 直接解释执行降级后的 SSA MIR：`riddle run <file.rid>` 实现单文件秒级编译并运行，`riddle repl` 提供定义持续累积与表达式即时求值的交互环境，两者均不依赖系统 C 工具链，且与 C 后端执行语义完全对齐。',
      },
      {
        title: '语法规范化与语义对齐',
        desc: '`match` 表达式正式支持 `A | B => …` or-pattern 组合分支；彻底废弃并移除了旧的 `fun(x) { ... }` 匿名写法，统一规范为 `[x -> x + 1]` 语法；整型解析统一返回 `Result`，位运算符优先级与 Rust / C 社区标准严格对齐，`HashMap` 引入符合习惯的 entry API。',
      },
      {
        title: '构建工具链能力补齐',
        desc: '`clue doc` 支持直接从 HIR 及源码文档注释生成完整的静态 HTML API 文档；库编译产物根据特征指纹缓存进 `$CLUE_HOME` 全局目录供后续构建复用，兄弟依赖项依据 `-j` 参数并行并发构建；`riddlec --emit mir` 支持直接输出程序 MIR 结构。',
      },
      {
        title: '检查器精度与边界完善',
        desc: '引用来源追踪支持穿透复合类型的嵌套字段与索引路径逐级验证，`T: Copy` 约束深度参与泛型类型的 Copy 判定，Trait 约束关联类型完成结构化归一化推导，泛型容器内解构匹配 `Iterator` 元素的场景得以稳定编译执行。',
      },
    ],
  },
  toolchain: {
    eyebrow: '工具套件',
    title: '一个管理器，四个核心组件',
    subtitle:
      '由版本与目标管理器 `ridup`，配合 `clue`、`riddlec`、`riddle` 与 `riddle-lsp` 构成全套开发环境。预编译二进制可从 GitHub Releases 获取，亦支持通过 Cargo 源码编译。',
    manager: {
      name: 'ridup',
      tagline: '工具链与目标管理器',
      desc: '负责安装、更新与切换 Riddle 工具链版本，独立维护 `stable`、`nightly` 与 `canary` 三套互不干扰的发布通道。它仅管理 Riddle 本身与 Target 组件，系统 C 编译器仍由 clue 统一探测。',
      usage: 'ridup toolchain install stable | nightly | canary',
      points: [
        '`stable` 与 `nightly` 通道直接拉取 GitHub Releases 预编译包，完整校验 SHA-256 校验和后完成安全安装',
        '`canary` 通道自动获取 main 分支最新提交并在本机执行 `cargo build --workspace --release`，仅需 Rust 与 Cargo 环境',
        '支持 `ridup toolchain link dev <path>` 将本地源码构建输出目录直接软链接为一条本地自定义工具链',
        '支持通过 `riddle-toolchain.toml` 配置文件、`RIDUP_TOOLCHAIN` 环境变量或 `clue +dev build` 命令灵活切换当前工具链',
        '通过将 ridup 创建别名或硬链接为 `clue`、`riddlec`、`riddle`、`riddle-lsp`，可实现透明的全局工具链代理调用',
        '工具链下载拉取及 Canary 本地编译过程均完整遵守 `HTTPS_PROXY` 等标准网络代理环境变量配置',
      ],
      link: { label: '访问 ridup 源码仓库', href: 'https://github.com/riddle-lang/ridup' },
    },
    items: [
      {
        name: 'riddlec',
        tagline: '核心编译器驱动',
        desc: '负责词法语法分析、HIR/MIR 降级、类型与借用检查以及 C11 代码生成，前端与后端整合于单一高效二进制。',
        usage: 'riddlec [--verbose] [--backend c] [--target <triple>] [--emit mir] [--output <file>] <file>...',
        points: [
          '`--backend c` 编译输出调用极简 `rgc` 运行时 ABI 的标准 C11 代码',
          '`--emit mir` 导出输出整套程序的 SSA MIR 中间表示，便于底层调试分析',
          '`--target <triple>` 指定目标构建三元组，亦受 `RIDDLE_TARGET` 环境变量或 `Clue.toml` 覆盖',
          '自动将内置核心标准库 `std/lib.rid` 注入并参与编译流程',
          '在未指定 `--backend c` 时仅执行前端静态检查，跳过 MIR 降级以提升检查性能',
        ],
      },
      {
        name: 'riddle',
        tagline: '统一日常工具入口',
        desc: '集成常用的开发者日常工具：源码格式化、MIR 单文件解释运行以及交互式 REPL 探索会话。',
        usage: 'riddle fmt <file>... | riddle run <file.rid> | riddle repl',
        points: [
          '`riddle fmt` 统一格式化源码或标准输入，支持 `--check`、`--emit`、`--tab-size` 及 `--hard-tabs`',
          '`riddle run <file.rid> [-- args] [--seed N]` 基于内置 MIR 解释器直接运行单个源文件，无需系统 C 编译器',
          '`riddle repl` 提供定义累积与表达式即时求值的交互式环境，支持 `:help`、`:reset`、`:mir`、`:quit` 会话命令',
          '底层与 `riddle-lsp` 语言服务器完全复用同一个格式化引擎实现',
        ],
      },
      {
        name: 'clue',
        tagline: '构建系统与包管理器',
        desc: '管理 Riddle 项目的创建、检查、编译、运行、测试以及静态 HTML API 文档生成。支持生成本机可执行文件、`.rlib` / `.rmeta` 元数据以及静态/动态库。',
        usage: 'clue init | new | check | build | run | doc [--target <triple>]',
        points: [
          '优先遵从显式配置的 `CC` 编译器，否则自动探测兼容 C11 的 GCC、Clang 或 MSVC 工具链',
          '`--target` 参数、`RIDDLE_TARGET` 变量与 `Clue.toml` 中的 `[build].target` 依次覆盖宿主默认目标',
          '`ridup target add <triple>` 安装目标平台运行时组件；链接阶段需配合目标系统工具链与库',
          '支持 path、git 与 sparse registry 依赖源，解析结果固化于 `Clue.lock` v3 锁定文件中',
          '`clue doc` 从 HIR 与源码文档注释生成美观的离线静态 HTML API 文档',
          '库构建产物依据源码指纹存入 `$CLUE_HOME` 全局缓存，同级兄弟依赖项支持 `-j` 多线程并行编译',
          '`clue build` 保留 `.clue/build/<name>.c` 中间 C 源码文件，便于审查生成结果',
          '可在 `Clue.toml` 的 `[runtime].source` 中指向自定义的运行时实现源码',
        ],
      },
      {
        name: 'riddle-lsp',
        tagline: '语言服务器',
        desc: '基于 `tower-lsp` 实现的 LSP 协议服务，实时为编辑器推送语法解析、HIR 降级、类型系统及借用分析错误。',
        points: [
          '提供工作区级别的代码补全，优先结合当前所有已打开文档的未保存修改缓冲区',
          '提供细致的语义高亮标记，准确区分自由函数、关联方法、struct、enum、trait 及局部绑定',
          '错误诊断携带错误码直达链接，并在编辑器内以 `note:` / `help:` 形式提供针对性的修复建议',
        ],
      },
    ],
  },
  editors: {
    eyebrow: '编辑器集成',
    title: '编辑器与 IDE 支持',
    subtitle: 'Riddle 仓库的 `editors/` 目录内置了针对主流编辑器的开箱即用适配方案与插件支持。',
    list: ['Helix', 'VS Code', 'Zed', 'IntelliJ IDEA 2026.1+'],
    haveTitle: '已完整支持的能力',
    have: [
      '`.rid` 源码文件语法高亮与文件类型识别',
      'Clue 项目、未保存缓冲区以及未打开模块的增量诊断',
      '语法解析、静态类型、move 检查及借用冲突实时诊断',
      '函数、方法、struct、enum、trait、形参及可变绑定的语义高亮',
      '跨模块返回类型与局部变量的 Inlay Hint 提示',
      '包含结构体字段、实例方法、枚举变体及关联函数的跨文件智能补全',
      '针对可变闭包绑定的 Code Action 快速修复',
      '增量文档同步与 Semantic Token Delta 高效局部刷新',
      '悬浮提示（Hover）、跳转定义与实现、全局查找引用、符号重命名与格式化',
      '工作区索引与缺失依赖的自动导入（Auto-import）',
    ],
    missTitle: '后续演进方向',
    miss: ['更复杂的语义重构（如提取函数、内联变量等大型重构操作）'],
  },
  quickstart: {
    eyebrow: '快速开始',
    title: '快速上手指南',
    subtitle: '推荐使用 `ridup` 一键管理多版本工具链，也可直接下载 Releases 压缩包解压使用。',
    steps: [
      {
        title: '安装工具链',
        desc: '通过 Cargo 安装 ridup 并设置默认工具链版本；`ridup show` 可随时查看当前选中的工具链与判定依据。',
        lang: 'bash',
        code: `cargo install --git https://github.com/riddle-lang/ridup
ridup toolchain install stable
ridup default stable`,
      },
      {
        title: '创建并运行项目',
        desc: '使用 `clue` 脚手架新建项目，并在完成编译与链接后自动运行生成的可执行程序。',
        lang: 'bash',
        code: `clue new hello
cd hello
clue check
clue build
clue run`,
      },
    ],
    footnote:
      '`clue build` 构建时会保留中间 C 代码至 `.clue/build/hello.c`。若配置了 `CC` 环境变量则强制使用指定编译器；否则系统会自动探测 `clang`、`gcc`、`cc` 以及 Windows 下的 `clang-cl` / `cl`。对于单文件快速运行，可直接执行 `riddle run hello.rid` 由内置 MIR 解释器直接运行，无需本机配置任何 C 工具链。',
  },
  status: {
    eyebrow: '能力与边界',
    title: '实现状态与边界',
    subtitle: 'Riddle v0.3.0 仍处于技术预览阶段（Technical Preview），语法与运行时 ABI 仍可能出现破坏性演进。以下为客观诚实的能力实现边界。',
    worksTitle: '目前已经完全支持',
    works: [
      '静态强类型推导、Move Checker、借用检查与过程间逃逸分析',
      '泛型参数、常量泛型（const generics）、Trait 约束与关联类型',
      '闭包捕获与 `Fn` / `FnMut` / `FnOnce` 调用能力静态检查',
      '基于递归穷尽性检查的 `match` 模式匹配与区间推导',
      '由 `IntoIterator` / `Iterator` 驱动的标准 `for` 循环',
      '`unsafe` 语境语义与原生 C FFI 接口互操作',
      '定长数组、动态切片、`String` 与 `Vector` 核心标准容器',
      '`std::ops::Drop` 确定性析构、运算符重载与可靠的 C11 目标代码生成',
      '元组类型、元组模式解构以及支持携带元组载荷的枚举变体',
      '过程宏机制与标准 derive 宏（包含 Default、Hash、Ord 等）',
      '支持位置参数、命名参数与 debug 占位符的标准格式化输出',
      '精简的括号 Lambda 表达式 `[v -> v * 2]`（已移除旧匿名函数语法）',
      '链式迭代器适配器、集合增删操作与 `vec!` 构造宏',
      '标准库的文件系统、时间处理、高质量随机数与基础解析模块',
      '`riddle fmt` 源码格式化工具（与 LSP 共享同一实现）',
      '免 C 编译器的内置 SSA MIR 解释器：`riddle run` 与 `riddle repl`',
      'or-pattern 模式组合（`A | B => ...`）、集合迭代与 `TreeMap` / `HashMap` 视图',
      '`clue doc` 生成静态 HTML 离线文档与多线程依赖并行构建',
      '支持 7 个主流目标三元组（target triples）的交叉构建运行时',
      '包含内置标准库、C11 代码生成、完整项目包工具与语言服务器',
    ],
    limitsTitle: '现阶段明确存在的技术限制',
    limits: [
      '格式化已支持位置、命名及 `:?` 调试标记；自定义宽度、对齐与填充说明符尚未实现',
      '浮点数取模暂未实现，`Rem` / `RemAssign` 目前仅为整型提供实现',
      '泛型完全依赖静态单态化，尚未覆盖 Rust 级别完整的高级泛型生命周期特化',
      '语言无显式命名生命周期语法；半开半闭区间范围、模式内范围匹配与带标签循环尚未提供',
      '现阶段定位为单线程语言架构：多线程并发、原子操作、`async` / `await` 与网络套接字库暂未包含',
      '词法保留了 `i128` / `u128` / `f16` / `f128` 标识符，但编译器语义层尚未提供支持',
      '`clue build` 构建本机可执行二进制依赖系统 C 工具链；`riddle run` / `repl` 基于内置解释器运行则无需 C 环境',
      '暂未支持裸函数指针类型；接受可调用对象需声明为 `impl Fn(...) -> T` 或 `dyn Fn(...)` 特性对象',
    ],
    note: '请注意：v0.3.0 不做任何语法或 ABI 的向后兼容性承诺。适合用于技术验证、工具脚本与语言实验，暂不推荐直接用于生产核心系统。',
  },
  roadmap: {
    eyebrow: '演进规划',
    title: '路线规划与优先级',
    subtitle:
      '规划反映了项目真实的优先级排序：正确性与内存模型优先，语言基础语法其次，标准库与外围生态有序推进。',
    phases: [
      {
        tag: '01 · 近期',
        title: '语言核心语义收敛',
        desc: '以语义正确性为最高优先级，打磨基础语法表达力与类型系统健壮度。',
        items: [
          '带标签的 `break` / `continue` 跳转控制流',
          '半开半闭区间语法与更完备的 slice / range 模式匹配',
          '格式化语法补齐：宽度、对齐方式与填充说明符',
        ],
      },
      {
        tag: '02 · 中期',
        title: '标准库与工程链增强',
        desc: '扩展系统级能力支持，使 Riddle 可以舒适编写更加复杂的系统软件。',
        items: [
          '标准库缓冲 I/O（`BufReader` / `BufWriter`）与增强文本解析能力',
          '更多基础数据结构与更丰富的算法适配器',
          'Clue 依赖求解性能提升与增量缓存优化',
        ],
      },
      {
        tag: '03 · 远期',
        title: '并发模型与跨平台生态',
        desc: '在单线程模型与核心语义充分稳定后，审慎推进高级语言特性。',
        items: [
          '轻量级并发支持与结构化 async / await 异步模型',
          '除 C 之外的直出原生后端（如 LLVM 或 WASM）预研',
          '语法规范与运行时 ABI 的长期稳定性承诺',
        ],
      },
    ],
    note: '有想要优先推动的特性需求？欢迎在 GitHub Issues 提出讨论与建议。',
  },
  author: {
    eyebrow: '开源维护',
    title: '设计理念与维护者',
    name: 'zi2ven',
    role: 'Riddle 语言设计者与核心维护者',
    motto: 'Riddle is Best',
    bio: [
      'Riddle 是一项全栈自主探索的编程语言工程项目——涵盖编译器前端、增量解析、HIR/MIR 变换、类型检查、借用与逃逸分析、C11 代码生成后端、SSA MIR 解释器，以及配套的包管理工具 clue、工具链管理器 ridup、语言服务器 riddle-lsp 与官方文档系统。',
      '项目坚持实事求是的开源态度：把已经实现的坚实功能与尚未攻克的设计边界清晰透明地公示于众。欢迎所有对所有权模型与系统编程感兴趣的开发者参与交流、提交建议与贡献代码。',
    ],
    link: { label: '访问 zi2ven 的 GitHub 主页', href: 'https://github.com/zi2ven' },
  },
  cta: {
    title: '即刻体验 Riddle',
    subtitle: '无需在本地安装任何编译环境，直接在浏览器中编写、编译与运行代码。',
    primary: '启动在线 Playground',
    secondary: '阅读 The Riddle Book',
  },
  footer: {
    tagline: '结合所有权与过程间逃逸分析的现代系统编程语言。',
    groups: [
      {
        title: '文档与学习',
        links: [
          { label: 'The Riddle Book 官方指南', href: 'https://riddle-lang.github.io/docs/' },
          { label: '在线 Playground', href: 'https://riddle-lang.github.io/playground/' },
          { label: '编译器错误码手册', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
        ],
      },
      {
        title: '开源工程',
        links: [
          { label: 'GitHub 源码主仓库', href: 'https://github.com/riddle-lang/riddle' },
          { label: 'ridup 工具链管理器', href: 'https://github.com/riddle-lang/ridup' },
          { label: '版本发布记录', href: 'https://github.com/riddle-lang/riddle/releases' },
          { label: '提交 Issue 与反馈', href: 'https://github.com/riddle-lang/riddle/issues' },
        ],
      },
    ],
    license: 'Apache License 2.0 开源协议',
    community: '技术交流群',
    communityValue: 'QQ 677741637',
    copyright: 'The Riddle Project',
  },
  chapters: [
    { id: 'language', label: '语言特性', blurb: '所有权与移动语义、逃逸分析、类型系统与多语言设计对比' },
    { id: 'toolchain', label: '上手与工具', blurb: '快速上手指南、标准开发工作流、工具套件矩阵与主流编辑器适配' },
    { id: 'execution', label: '编译架构', blurb: '内置 MIR 解释器、九阶段编译流水线、C ABI 规范与跨平台构建目标' },
    { id: 'status', label: '状态与边界', blurb: 'v0.3.0 发布亮点、当前实现与限制清单、基准测试与核心技术解答' },
    { id: 'project', label: '文档与规划', blurb: 'The Riddle Book 结构导览、版本历史轨迹、演进规划与维护理念' },
  ],
  diagnostics: {
    eyebrow: '编译器诊断',
    title: '精准可操作的诊断信息',
    subtitle: '每条编译诊断均包含唯一定位错误码、主次标签跨行指针高亮，以及上下文 `note:` 与修复建议 `help:`。',
    cases: [
      {
        code: 'E0300',
        title: '借用冲突：精确指出冲突借用位置与性质',
        output: 'error[E0300]: cannot borrow `point` as mutable because it is also borrowed as immutable\n --> src/main.rid:8:19\n   |\n 7 |     let shared = &point;\n   |                  ------ first borrow occurs here\n 8 |     let mutable = &mut point;\n   |                   ^^^^^^^^^^\n   |\n   = note: a mutable borrow cannot overlap an existing shared borrow',
      },
      {
        code: 'E0100',
        title: '移动后使用：定位最初转移处与违规引用现场',
        output: 'error[E0100]: use of moved value: `token`\n --> src/main.rid:6:10\n   |\n 5 |     take(token);\n   |          ----- value moved here\n 6 |     take(token);\n   |          ^^^^^\n   |\n   = note: borrow with `&` if the original value must remain usable',
      },
      {
        code: 'E0013',
        title: '方法不存在：输出接收者类型并提示检查 impl',
        output: 'error[E0013]: unknown method `or_insert` on type Entry<&str, i32>\n --> src/main.rid:7:9\n   |\n 7 |         entry.or_insert(0);\n   |         ^^^^^^^^^^^^^^^^^^\n   |\n   = note: check the impl block and receiver type',
      },
    ],
    footnote: '官方错误码手册收录了全部 `E` 开头代码的详细解释与修复范例；`riddlec`、`riddle run` 与 LSP 共享相同的诊断基础设施。',
    link: { label: '查阅完整错误码手册', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
  },
  interpreter: {
    eyebrow: '内置解释器',
    title: 'MIR 即时执行器与 REPL',
    subtitle: '`crates/interpreter` 直接解释执行降级后的 SSA 中间表示，语义与 C11 后端逐项对齐，无需在本机安装任何 C 编译器即可运行代码与探索语法。',
    views: [
      { label: 'Riddle 源码', lang: 'riddle', code: 'fun add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfun main() -> i32 {\n    add(2, 3)\n}' },
      { label: 'SSA MIR 中间表示', lang: 'text', code: 'module main {\n  fn add(%0: I32, %1: I32) -> I32 {\n    block_?(0):\n      v2 = Add v0, v1 : I32\n      return v2\n  }\n  fn main() -> I32 {\n    block_?(0):\n      v0 = iconst(I32) 2 : I32\n      v1 = iconst(I32) 3 : I32\n      v2 = call Local("add")(v0, v1) : I32\n      return v2\n  }\n}' },
      { label: '执行产物与退出码', lang: 'bash', code: '$ riddle run tiny.rid\n$ echo $?\n5' },
    ],
    viewsCaption: '同一份 MIR 既输入给 C11 后端生成原生代码，也直接输入给{{mir}}解释器解释执行：`add(2, 3)` 计算得到的返回值直接对应为系统进程退出码。',
    run: {
      title: '单文件即时运行',
      desc: '编译到 MIR 后直接解释执行，退出码与编译产物一致；`--` 后续参数传递给用户程序，`--seed` 支持固定伪随机数生成种子。',
      code: 'riddle run hello.rid\nriddle run hello.rid -- --verbose\nriddle run hello.rid --seed 7',
    },
    repl: {
      title: '交互式 REPL 会话',
      desc: '环境支持类型与函数的定义累积，表达式求值结果直接打印并自动绑定至临时变量 `__`；支持 `:mir` 导出当前会话的 MIR，`:reset` 清空状态。',
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
      caption: '上述为真实的交互式会话记录：无需安装 C 编译器即可探索语法，panic 报错回溯信息精准映射至原始代码位置。',
    },
    points: [
      { title: '与 C 后端执行语义严格对齐', desc: '整型截断回绕、除零与 `MIN / -1` 异常 trap、按位宽掩码移位、浮点转整型饱和截断以及数组下标边界检查均与 C11 生成代码行为完全一致。' },
      { title: '内置标准库原生 Shim 支持', desc: '`std::fs` 文件系统、系统时间、随机数、进程与标准输入输出均内置了原生执行支持；未提供实现的自定义 `extern "C"` 调用时将给出明确报错。' },
      { title: '与主编译器共享同一套分析管线', desc: 'REPL 中的 `let` 绑定与即时表达式语句自动注入主函数进行增量编译执行，顶层类型与函数定义持续累积注入会话上下文。' },
    ],
  },
  compare: {
    eyebrow: '对比分析',
    title: '语言设计取舍与对比',
    subtitle: '客观对比 Riddle 与 Rust、Go、Kotlin 在语法形态与核心语义实现上的异同。',
    head: ['', 'Riddle', 'Rust', 'Go', 'Kotlin'],
    rows: [
      ['函数声明', '`fun add(x: i32) -> i32`', '`fn add(x: i32) -> i32`', '`func add(x int) int`', '`fun add(x: Int): Int`'],
      ['不可变变量', '`let value = 1;`', '`let value = 1;`', '`value := 1`', '`val value = 1`'],
      ['可变变量', '`let mut value = 1;`', '`let mut value = 1;`', '直接重新赋值', '`var value = 1`'],
      ['内存管理模型', '移动语义 + 静态借用检查，仅跨栈帧逃逸对象进入{{conservative-gc}}', '移动语义 + 静态借用检查，需显式标注生命周期', '全生命周期 GC 管理，无值移动语义', '基于 JVM / 原生引用的全程 GC 管理'],
      ['生命周期语法', '无需手动标注，过程间逃逸分析自动推导', "需要手写显式生命周期参数 `'a`", '不涉及', '不涉及'],
      ['可恢复错误处理', '`Option<T>` / `Result<T, E>` 与 `?` 运算符', '`Option<T>` / `Result<T, E>` 与 `?` 运算符', '多返回值显式检查 `error`', '空安全语法糖与异常抛出（Exceptions）'],
      ['行为抽象机制', '`trait` + `impl` 静态单态化', '`trait` + `impl` 单态化与 Trait 对象', '隐式结构化接口（Structural Interfaces）', '面向对象接口定义与类继承体系'],
      ['工程构建工具', '`clue` + `Clue.toml`', 'Cargo + `Cargo.toml`', '`go` CLI + `go.mod`', 'Gradle / Maven'],
      ['编译目标后端', '标准 C11 代码生成 + 内置 MIR 解释器', 'LLVM IR / 原生机器码', 'Go 编译器自研原生后端', 'JVM Bytecode / LLVM / JavaScript'],
    ],
    blocks: [
      { title: '所有权机制相同，堆栈分配策略不同', body: 'Riddle 与 Rust 同样对非 `Copy` 类型采用值移动语义，并严格区分不可变借用 `&T` 与独占借用 `&mut T`。不同在于 Riddle 省去了显式生命周期参数标注，利用过程间{{escape}}自动识别引用是否越过当前栈帧，仅将逃逸值提升至{{conservative-gc}}。GC 仅接管对象存放位置，所有权与借用检查规则依然严格生效。' },
      { title: '现代语法集大成，精炼核心正交特性', body: '语法设计深度汲取现代语言成果：支持尾表达式、`struct`、`enum`、`trait`、`impl`、`match`、`if let`、`let else` 以及 `[x -> x + 1]` 闭包。函数类型明确收敛为 `impl Fn(...) -> T` 或 `dyn Fn(...)`，消除了琐碎重叠的语法糖分支。' },
      { title: 'Clue 专注于构建与包管理的纯粹性', body: '`Clue.toml` 采纳了与 Cargo 类似的清晰清单风格，支持 path、git 与 sparse registry 依赖，并由 `Clue.lock` 固化构建版本；同时针对 C11 目标生成深度适配，提供中间 C 源码输出审查与全局构建缓存复用。' },
    ],
    footnote: '深入的技术架构对比与详细的语法转换指南请参考官方迁移文档。',
    link: { label: '阅读从 Rust / Kotlin 迁移到 Riddle 指南', href: 'https://riddle-lang.github.io/docs/riddle-vs-rust-kotlin.html' },
  },
  workflow: {
    eyebrow: '项目工作流',
    title: 'Clue 工程工作流',
    subtitle: '`clue` 统一负责项目脚手架、依赖求解、多目标编译、全局构建缓存与 API 文档生成。',
    steps: [
      { name: '创建新项目', desc: '自动生成 `Clue.toml` 清单、`src/main.rid` 入口与基础 `.gitignore`。', code: 'clue new hello' },
      { name: '快速静态检查', desc: '执行语法分析、类型推导、逃逸分析与借用检查，不生成后端 C 代码。', code: 'clue check' },
      { name: '编译原生程序', desc: '生成标准 C11 并调用系统编译器链接为本机可执行程序，保留 `.clue/build/hello.c`。', code: 'clue build' },
      { name: '构建并运行', desc: '完成增量构建后立即启动运行生成的目标可执行二进制。', code: 'clue run' },
      { name: '生成离线文档', desc: '直接从 HIR 与源码文档注释生成美观的静态 HTML API 文档网站。', code: 'clue doc' },
    ],
    points: [
      '库项目构建产物依据源码特征指纹缓存于 `$CLUE_HOME` 全局目录，供多个项目高效共享复用',
      '同一个包内声明的多个兄弟依赖项依据 `-j` 配置自动启动多线程并发构建',
      'path、git 与 sparse registry 三类依赖统一求解并写入 `Clue.lock`，支持 `--locked` 与 `--offline` 构建约束',
      '支持通过 `--target` 命令行参数、`RIDDLE_TARGET` 环境变量与清单 `[build].target` 精确指定目标平台',
    ],
  },
  targets: {
    eyebrow: '跨平台目标',
    title: '官方支持的构建目标',
    subtitle: '首个发布版官方提供对主流桌面与服务器三元组（{{triple}}）的预编译运行时支持，`ridup target add` 可一键配置。',
    triples: [
      { name: 'x86_64-unknown-linux-gnu', note: '主流 64 位 Linux 桌面与服务器平台' },
      { name: 'aarch64-unknown-linux-gnu', note: '64 位 ARM Linux 服务器与 Apple Silicon Linux' },
      { name: 'i686-unknown-linux-gnu', note: '32 位 x86 Linux 架构' },
      { name: 'x86_64-pc-windows-msvc', note: '主流 64 位 Windows 平台（MSVC 工具链）' },
      { name: 'i686-pc-windows-msvc', note: '32 位 Windows 平台（MSVC 工具链）' },
      { name: 'aarch64-pc-windows-msvc', note: 'Windows on Arm 架构平台' },
      { name: 'aarch64-apple-darwin', note: 'Apple Silicon macOS 平台' },
    ],
    points: [
      '目标运行时组件与 C 编译工具链分立：交叉编译产物的实际链接仍需目标平台的 sysroot、Windows SDK / MSVC 库或 Apple SDK 支持',
      '`clue run` 仅用于执行当前宿主架构的可执行程序；交叉编译生成的目标二进制需复制至对应目标系统上运行',
      '指定未受支持的目标 triple 会被编译器显式拒绝，绝不发生静默回退至宿主平台导致难以察觉的链接错误',
    ],
    footnote: '`ridup target add <triple>` 会在本地安装该架构的预置 `runtime.c` 与 `target.toml`；若检测到缺失目标平台 SDK 依赖，ridup 会给出清晰的安装指引。',
  },
  history: {
    eyebrow: '版本发布',
    title: '版本演进历史',
    subtitle: '每个发布版本均对应主仓库中的 Git Tag 与经过完整验证的 GitHub Releases 产物。',
    releases: [
      { version: 'v0.3.0', date: '2026-09-19', summary: '内置 SSA MIR 解释器（`riddle run` / `riddle repl`）、or-pattern 模式匹配、集合迭代视图 API、`clue doc` HTML 文档生成、全局构建缓存与多线程并行构建；规范化闭包语法' },
      { version: 'v0.2.3', date: '2026-09-05', summary: '引入 `vec!` 宏、range 区间表达式、链式迭代器适配器、文件/时间/随机数标准库模块，以及 LSP 的九项一键快速修复能力' },
      { version: 'v0.2.2', date: '2026-08-25', summary: '推出 `riddle fmt` 格式化 CLI、动态 trait 对象支持、关联类型约束、文档注释语法与控制流模式解构' },
      { version: 'v0.2.1', date: '2026-08-11', summary: '实现 LSP 全局符号导航、重命名、工作区索引与自动导入；支持 derive / attribute / function 三种过程宏导出' },
      { version: 'v0.2.0', date: '2026-07-28', summary: '支持 7 个目标 triple 交叉构建体系；提供具备项目上下文感知的 LSP 实时诊断、补全与语义 Token 染色' },
      { version: 'v0.1.1', date: '2026-07-20', summary: '首批技术预览用户的反馈修复版本，提升借用检查与 HIR 降级稳定性' },
      { version: 'v0.1.0', date: '2026-07-15', summary: '首个对外公开发布的技术预览版本，确立移动语义、逃逸分析与 C11 后端架构' },
    ],
    footnote: '每个版本的详尽变更记录、破坏性修改说明与补丁列表请查阅仓库 CHANGELOG.md。',
    link: { label: '查看 GitHub Releases 全部发行包', href: 'https://github.com/riddle-lang/riddle/releases' },
  },
  benchmarks: {
    eyebrow: '性能度量',
    title: '性能基准与验证',
    subtitle: '基于 Criterion 针对 MIR 解释器热路径构建持续基准，坚持以回归防范与结果校验为核心准则。',
    workloads: [
      { name: 'loops', desc: '执行 60,000 次算术循环迭代运算，结果与确定的校验和常量 `1_799_970_000` 自动比对验证正确性。' },
      { name: 'fib', desc: '深层递归计算 `fib(24)`，高强度压测调用栈帧分配与 MIR 基本块派发效率，基准值固定校验为 `46_368`。' },
      { name: 'vector', desc: '高频反复执行 `Vector` 动态数组元素的扩容追加与移除操作，压测标准容器内存交互路径。' },
    ],
    command: 'cargo bench',
    points: [
      '每次性能迭代均在独立隔离的全新解释器实例中执行 `main`，严格避免跨迭代出现内存或状态泄露干扰',
      '所有测试负载均包含严格的确定性校验和：一旦中间表示语义或计算结果受损将直接报错终止，绝不掩盖隐蔽 bug',
      '针对解释器执行热路径持续优化：例如彻底消除了执行基本块时对指令列表的不必要克隆复制开销',
    ],
    footnote: '由于硬件与环境差异较大，CI 阶段不将基准绝对耗时作为硬性拦截门禁；发布前的性能防退化依赖于受控环境下的本地 `cargo bench` 对比。',
  },
  faq: {
    eyebrow: '常见疑问',
    title: '常见技术答疑',
    subtitle: '针对语言定位、后端选择、生命周期机制与工程就绪度的核心问题作出客观解答。',
    items: [
      { q: 'Riddle 现在适合用于生产环境吗？', a: '目前尚不推荐用于生产核心业务。Riddle 仍处于技术预览阶段（Technical Preview），语言语法和运行时 ABI 仍可能会发生不兼容调整。当前阶段非常适合用于技术验证、开发辅助脚本、学习系统编程机制以及参与开源反馈。' },
      { q: '为什么选择编译到 C11 而不是 LLVM？', a: '主要原因是 C 后端实现起来相对简单、轻量且透明，能够以最低的工程复杂度快速打通端到端的语言语义验证，并借助现有 C 编译器完成跨平台编译与链接。在后续的演进中，我们计划引入直接面向 LLVM 的编译后端，以获得更极致的代码优化能力与更直接的机器码生成支持。同时，当前内置的 `riddle run` 与 `riddle repl` 可直接解释执行 MIR，日常调试与探索已无需依赖任何外部编译器。' },
      { q: '为什么 Riddle 不需要写生命周期标注？', a: '编译器内置了过程间不动点逃逸分析算法，自动推导引用的生命期边界。只有当引用生命期确定超出当前调用栈帧时，对应数据才会被提升至保守式非移动 GC 堆。逃逸分析与 GC 仅负责决定数据的存放物理位置，移动语义和编译期借用检查依然发挥完整防护作用。' },
      { q: 'Riddle 与 Rust 的核心关系是什么？', a: 'Riddle 深度汲取了 Rust 的所有权体系、借用安全模型与代数数据类型语法，但消除了手写生命周期参数 `\'a` 的心智负担；同时去掉了复杂的引用计数智能指针（如 `Rc` / `Arc`），`dyn Trait` 在 Riddle 中直接作为拥有的值参与传递。' },
      { q: 'Riddle 与 Go 的核心区别是什么？', a: 'Riddle 借鉴了 Go 语言在工具链工程化、开箱即用与上手平滑方面的优势；但在内存模型上有着本质不同：Go 全程依赖运行时全量垃圾回收，而 Riddle 默认移动、编译期借用排查并在作用域退出时确定性析构，GC 仅作为局部逃逸对象的兜底容器。' },
      { q: '我应该在什么时候使用解释器，什么时候使用 C 后端？', a: '单文件测试、脚本编写、快速语法探索或未安装 C 编译器的机器上，推荐直接使用 `riddle run` 与 `riddle repl`；当需要构建发布独立可执行程序、编译静态/动态库或进行跨平台交叉编译时，使用 `clue build`。两套执行模式的计算语义保持严格一致。' },
      { q: '当前标准库的覆盖范围如何？', a: '内置标准库已覆盖 `Option`、`Result`、`String`、`Vector`、哈希映射表与红黑树视图（`HashMap` / `TreeMap`）、链式迭代器适配器、格式化输出、文件系统 I/O、高精度时间、随机数及基础文本解析模块。第三方包生态通过 `clue` 与 sparse registry 正在逐步建设中。' },
      { q: '如何向 Riddle 项目做出贡献？', a: '欢迎在 GitHub Issues 提出功能建议或报告复现 bug。编写标准库模块、补充完善 The Riddle Book 文档、扩充编译器错误码手册以及适配更多文本编辑器都是极具价值的贡献切入点。' },
    ],
  },
  docs: {
    eyebrow: '文档导览',
    title: 'The Riddle Book 官方指南',
    subtitle: '与编译器同仓库同步演进的系统化指南，涵盖从入门到进阶的八大核心知识板块。',
    groups: [
      { title: '入门与上手', items: [
        { label: '快速开始', desc: '编写第一段 Riddle 程序', href: 'https://riddle-lang.github.io/docs/start.html' },
        { label: '安装工具链', desc: 'ridup 管理与发行包获取', href: 'https://riddle-lang.github.io/docs/install.html' },
        { label: '工程管理', desc: 'Clue 标准项目结构配置', href: 'https://riddle-lang.github.io/docs/clue-create.html' },
      ] },
      { title: '语言核心基础', items: [
        { label: '变量与可变性', desc: 'let 与 let mut 绑定语义', href: 'https://riddle-lang.github.io/docs/variables-and-mutability.html' },
        { label: '基础数据类型', desc: '标量类型、元组与定长数组', href: 'https://riddle-lang.github.io/docs/type-system.html' },
        { label: '流程控制', desc: 'if 条件、match 与循环结构', href: 'https://riddle-lang.github.io/docs/control-flow.html' },
      ] },
      { title: '所有权与内存安全', items: [
        { label: '所有权模型', desc: '栈堆分配与 RAII 析构', href: 'https://riddle-lang.github.io/docs/ownership-and-memory.html' },
        { label: '移动语义深入', desc: '默认移动与部分字段移动', href: 'https://riddle-lang.github.io/docs/move-semantics.html' },
        { label: '引用与逃逸分析', desc: '借用规则与逃逸不动点推导', href: 'https://riddle-lang.github.io/docs/references-and-escape.html' },
      ] },
      { title: '类型系统抽象', items: [
        { label: '结构体', desc: '数据布局、方法与关联函数', href: 'https://riddle-lang.github.io/docs/structs.html' },
        { label: '枚举与模式匹配', desc: '代数类型与穷尽性推导', href: 'https://riddle-lang.github.io/docs/enums-and-patterns.html' },
        { label: '错误处理哲学', desc: 'Option、Result 与 ? 运算符', href: 'https://riddle-lang.github.io/docs/error-handling.html' },
      ] },
      { title: '泛型与模块工程', items: [
        { label: '泛型系统', desc: '类型参数与常量泛型', href: 'https://riddle-lang.github.io/docs/generics.html' },
        { label: 'Trait 约束体系', desc: '行为抽象与对象安全规范', href: 'https://riddle-lang.github.io/docs/traits.html' },
        { label: '模块与可见性', desc: 'use 路径、私有边界与包组织', href: 'https://riddle-lang.github.io/docs/modules.html' },
      ] },
      { title: '集合与函数式编程', items: [
        { label: '标准容器', desc: 'Vector 动态数组与键值映射', href: 'https://riddle-lang.github.io/docs/collections.html' },
        { label: '闭包与迭代器', desc: 'Fn 能力检查与链式适配器', href: 'https://riddle-lang.github.io/docs/functional.html' },
        { label: '系统标准库', desc: '字符串处理、文件 I/O 与时间', href: 'https://riddle-lang.github.io/docs/standard-library.html' },
      ] },
      { title: '工程与开发工具', items: [
        { label: 'Clue 构建系统', desc: '依赖管理、工作区与多目标输出', href: 'https://riddle-lang.github.io/docs/clue.html' },
        { label: '过程宏开发', desc: '基于 AST 与 TokenStream 的宏扩展', href: 'https://riddle-lang.github.io/docs/proc-macros.html' },
        { label: '编辑器支持', desc: '主流编辑器的 LSP 配置方案', href: 'https://riddle-lang.github.io/docs/editor-support.html' },
      ] },
      { title: '参考手册与附录', items: [
        { label: '工具链状态清单', desc: '编译器完整能力支持明细', href: 'https://riddle-lang.github.io/docs/compiler-status.html' },
        { label: '形式化文法', desc: 'EBNF 语法形式化规范', href: 'https://riddle-lang.github.io/docs/grammar.html' },
        { label: '错误码完整速查', desc: '全量编译诊断错误码手册', href: 'https://riddle-lang.github.io/docs/errorcode.html' },
      ] },
    ],
    footnote: '运行 `clue doc` 命令亦可为你的自有项目一键生成同等质感的静态离线 API 文档。',
  },
  glossary: {
    escape: { term: '逃逸分析', def: '过程间不动点分析：判断引用生命期是否会跨越当前调用栈帧，从而决定局部值留在栈上还是自动提升至 GC 堆。' },
    'conservative-gc': { term: '保守式非移动 GC', def: '默认轻量运行时采用保守式 Mark-Sweep 算法且绝不在内存中移动对象；仅经逃逸分析判定生命期跨越栈帧的数据才分配至堆。' },
    mir: { term: 'MIR', def: '中层 SSA 形式中间表示，位于高层 HIR 类型检查与底层后端代码生成之间；C11 后端代码生成与内置解释器共享同一套 MIR。' },
    triple: { term: '目标三元组', def: '形如 x86_64-unknown-linux-gnu 的目标架构与平台标识，决定生成代码的目标 ABI 及对应的预编译运行时。' },
  },
};
