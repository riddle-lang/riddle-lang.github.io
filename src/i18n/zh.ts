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
    title: 'Riddle — 内存安全，无 GC 负担的编程语言',
    description:
      'Riddle 是一门受 Rust 和 Go 启发的实验性编程语言。移动语义与借用检查在编译期消除内存错误，逃逸分析让绝大多数值留在栈上——不写生命周期标注，也不为垃圾回收付出全程代价。',
    ogAlt: 'Riddle 编程语言',
  },
  a11y: {
    skipToContent: '跳到主要内容',
    toggleTheme: '切换深浅色主题',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    copy: '复制',
    copied: '已复制',
  },
  nav: {
    links: [
      { label: '语言特性', href: '#features' },
      { label: '编译流程', href: '#pipeline' },
      { label: '运行时', href: '#runtime' },
      { label: '工具链', href: '#toolchain' },
      { label: '开始使用', href: '#start' },
    ],
    docs: '文档',
    playground: 'Playground',
    github: 'GitHub',
  },
  hero: {
    badge: 'v0.2.0 · 技术预览',
    title: '内存安全，',
    titleAccent: '没有 GC 的负担。',
    subtitle:
      'Riddle 用移动语义和借用检查在编译期消除内存错误，用过程间逃逸分析把不越过栈帧的值留在栈上。不写一行生命周期标注，也不为垃圾回收付出全程代价。',
    ctaPrimary: '在 Playground 试一试',
    ctaSecondary: '阅读文档',
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
      { value: '0', label: '生命周期标注' },
      { value: '5', label: '个运行时 ABI 函数' },
      { value: '9', label: '个编译阶段' },
      { value: 'C11', label: '后端输出' },
    ],
  },
  features: {
    eyebrow: '语言特性',
    title: '为什么是 Riddle',
    subtitle: '所有权、逃逸分析和确定性析构组合在一起，让安全既不靠标注，也不靠全程 GC。',
    items: [
      {
        id: 'move',
        title: '移动语义',
        summary: '值默认移动，编译期拦截移动后使用',
        headline: '所有权在编译期就说清楚了',
        body: '赋值、传参和返回都会转移所有权。move checker 检查移动后使用、借用冲突，以及借用期间的赋值与移动——这些都发生在编译期，不需要任何运行时检查。',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun main() {
    let a = Foo { x: 1, y: 1 };
    let b = a;
    print(a); // error: a 已经被移动
    print(b);
}`,
        caption: '标量、共享引用、原始指针和命名函数项默认可复制；`&mut T` 与闭包值不可复制。',
        bullets: [
          '用户类型实现 `std::marker::Copy` 即可进入复制语义，编译器会验证所有字段与枚举 payload',
          '字段访问本身不移动整个结构体；`match` 解构按字段记录部分移动，未移动的兄弟字段仍可继续使用',
          '`Option<T>` 与 `Result<T, E>` 仅在 payload 全部实现 `Copy` 时才是 `Copy`',
        ],
      },
      {
        id: 'escape',
        title: '无生命周期标注',
        summary: '逃逸分析决定栈分配还是堆分配',
        headline: '不写生命周期，也能返回引用',
        body: 'Riddle 没有生命周期语法。编译器用过程间不动点的逃逸分析，计算每个函数的“外泄参数 / 返回来源参数”摘要，据此决定局部值留在栈上还是提升到保守式非移动 GC 堆。存储位置不会放宽移动与借用检查。',
        code: `struct Foo {
    x: i32,
    y: i32,
}

fun make_ref() -> &Foo {
    let foo = Foo { x: 1, y: 2 };
    &foo // 引用越过栈帧，foo 被提升到 GC 堆
}`,
        table: {
          head: ['分析结果', 'MIR 分配'],
          rows: [
            ['未逃逸且不需要稳定地址的局部', 'SSA 值，不生成分配指令'],
            ['未逃逸但可变或被闭包按引用捕获', '`Alloca`，栈上存储'],
            ['逃逸的局部', '`HeapAlloc`，GC 堆存储'],
            ['未逃逸 / 逃逸的闭包环境', '`Alloca` / `HeapAlloc`'],
          ],
        },
      },
      {
        id: 'drop',
        title: '确定性析构',
        summary: 'Drop 在所有者作用域结束时运行',
        headline: 'GC 只负责地址，析构仍然确定',
        body: '实现 `std::ops::Drop` 的类型会在所有者作用域结束时确定性地运行析构。逃逸到 GC 堆只改变值的地址，不改变析构时机；drop flag 保证移动之后不会重复析构。',
        code: `struct FileHandle {
    raw: i32,
}

impl Drop for FileHandle {
    fun drop(&mut self) {
        // 释放 raw 对应的外部资源
    }
}`,
        caption: '局部变量、参数、模式绑定、迭代元素、聚合字段和闭包环境都在析构覆盖范围内。',
        bullets: [
          '`Drop + Copy`、直接调用析构方法、从显式 `Drop` 类型移出字段都会被拒绝',
          '`for` 循环的当前元素、迭代器和提前退出路径拥有各自独立的析构作用域',
        ],
      },
      {
        id: 'traits',
        title: 'Trait 与泛型',
        summary: '关联类型、父 trait、const generics',
        headline: '抽象不必付出运行时代价',
        body: 'trait 支持默认方法、关联类型与默认关联类型、父 trait 声明与传递 bound。泛型在 C 后端单态化，const generics 让长度直接进入类型。',
        code: `trait Summary {
    fun title(&self) -> &str;

    fun summarize(&self) -> &str {
        self.title()
    }
}

struct Buffer<T, const N: usize> {
    data: [T; N],
}`,
        caption: 'impl 未覆写时使用 trait 默认方法体，显式覆写优先。',
        bullets: [
          '`<T: A + B>` 与 `where` 子句；impl 上的 `where` 会检查 Paterson condition',
          '运算符通过 `#[lang = "..."]` trait 分派到用户类型；标量运算直接降为原生 C 运算，不生成包装函数',
          '`==` / `!=` 检查 `PartialEq`，有序比较检查 `PartialOrd`，支持异构右操作数 impl',
        ],
      },
      {
        id: 'match',
        title: '模式匹配',
        summary: '递归穷尽性检查，缺口精确到区间',
        headline: '漏掉的分支，编译器会告诉你在哪',
        body: '`match` 对枚举、布尔值、`()`、整数、元组和结构体做递归穷尽性检查。非穷尽的整数匹配不是笼统报错，而是直接报告未覆盖的连续值区间。',
        code: `fun classify(n: i32) -> i32 {
    match n {
        x if x < 0 => -1,
        0 => 0,
        _ => 1,
    }
}`,
        caption: '穷尽性缺口以 E0039 报告，并列出未覆盖的取值区间。',
        bullets: [
          'guard 失败后继续检查后续 arm；带 guard 的 arm 不计入静态穷尽性',
          '支持枚举 unit / tuple / struct 变体模式，payload 绑定会进入 guard 和 arm 表达式',
        ],
      },
      {
        id: 'ffi',
        title: 'C FFI 与 unsafe',
        summary: 'extern 块默认不安全，safe fun 显式放行',
        headline: '和 C 世界打交道，边界写在代码里',
        body: '`unsafe extern "C"` 块内的导入默认不安全，可以用 `safe fun` 逐个声明确实安全的函数。C 后端不按函数名提供任何内置 helper，所有 `extern "C"` 声明都按普通外部符号生成。',
        code: `unsafe extern "C" {
    safe fun abs(x: i32) -> i32;
    fun malloc(size: usize) -> *mut u8;
}

fun main() {
    let value = abs(-42);
    let pointer = unsafe { malloc(16) };
}`,
        caption: '原始指针的解引用和索引需要处在 `unsafe` 上下文中。',
        bullets: [
          'C 导入中的 `&str` 映射为 `const char*`；带函数体的导出定义保留 `{ ptr, len }` 胖指针',
          '`unsafe fun` 与 `unsafe fun(...) -> T` 函数类型，支持单向安全函数转换',
        ],
      },
    ],
  },
  pipeline: {
    eyebrow: '编译流程',
    title: '从源码到 C，九个阶段',
    subtitle: '`riddlec` 已经能跑通完整前端和 C 后端。每个阶段都被仓库中的测试覆盖。',
    stages: [
      { name: '词法与语法分析', desc: '`IncrementalParser` 提供局部重解析 API' },
      { name: 'AST 包装', desc: '统一的语法树表示，属性随项一起进入 AST' },
      { name: 'HIR 降级', desc: '含 E0040 / E0050 / E0051 / E0052 诊断' },
      { name: '作用域图与名字解析', desc: '基于片段的增量作用域图，支持部分失效' },
      { name: '类型检查', desc: '可复用的 `IncrementalTypeChecker`' },
      { name: '逃逸分析', desc: '过程间不动点，决定栈分配还是 GC 堆分配' },
      { name: 'move checker', desc: '移动后使用、借用冲突、借用期间的赋值与移动' },
      { name: 'MIR 降级', desc: 'SSA 形式，Phi 节点、基本块、`Alloca` / `HeapAlloc`' },
      { name: 'C 后端代码生成', desc: '输出调用 `rgc` ABI 的 C11 代码' },
    ],
    footnote:
      '不指定后端时，`riddlec` 在完成 move / borrow 检查后停止，只有需要生成后端代码时才继续降级 MIR。',
  },
  runtime: {
    eyebrow: '运行时',
    title: '五个函数，组成整个运行时 ABI',
    subtitle: '每个 runtime provider 都要实现这五个符号：初始化栈、分配、调整和释放内存，以及触发回收。',
    code: `void rgc_init(void *stack_bottom);
void *rgc_alloc(size_t size);
void *rgc_realloc(void *ptr, size_t size);
void rgc_free(void *ptr);
void rgc_collect(void);`,
    caption: '`crates/gc` 提供默认的非移动、保守式 mark-sweep 实现；也可以在 `Clue.toml` 的 `[runtime].source` 指向自己的 provider。',
    points: [
      {
        title: '不依赖 Boehm GC',
        desc: '`clue build` 直接用系统 C 编译器编译生成的 C 与运行时源码，没有额外的第三方运行时依赖。',
      },
      {
        title: '保守式、非移动',
        desc: '只有逃逸分析判定会越过当前栈帧的值才进入 GC 堆；其余值留在栈上，回收器不移动对象。',
      },
      {
        title: '分配接口各司其职',
        desc: '`rgc_realloc` 为 `Vector` 扩容，`rgc_free` 释放 provider 管理的内存；没有 GC 的 provider 也可以忽略栈底并把 `rgc_collect` 实现为空操作。',
      },
      {
        title: '完全可替换',
        desc: '运行时 provider 由 `clue` 选择，也接受自定义 provider——嵌入式或特殊场景可以自带分配器。',
      },
    ],
  },
  release: {
    eyebrow: 'v0.2.0 新内容',
    title: '从语言核心到完整工具链',
    subtitle: '这一版把 Riddle 从单机编译器向可跨目标构建、可在编辑器中使用的完整开发体验推进了一步。',
    items: [
      {
        title: '七个目标平台',
        desc: '`clue` 与 `riddlec` 支持按 target triple 构建，七个受支持目标都有对应的 runtime 组件。',
      },
      {
        title: '项目级编辑体验',
        desc: 'LSP 现在提供项目级诊断、补全、语义 Token、Inlay Hint 与 Code Action，并覆盖 Helix、VS Code、Zed 和 IntelliJ IDEA。',
      },
      {
        title: '更完整的语言与标准库',
        desc: '泛型、trait、闭包、运算符重载与确定性 `Drop` 已连通，数组、切片、字符串和 Vector 也进入标准库。',
      },
      {
        title: '五函数运行时 ABI',
        desc: 'C 后端使用可替换的五函数 ABI；默认保守式非移动 GC 随工具链提供，不依赖外部 GC。',
      },
    ],
  },
  toolchain: {
    eyebrow: '工具链',
    title: '一个管理器，三个二进制',
    subtitle:
      '`ridup` 管理 Riddle 的版本，一条工具链里是 `clue`、`riddlec` 和 `riddle-lsp`。预编译版本可从 GitHub Releases 下载；从源码安装需要较新的 Rust stable。',
    manager: {
      name: 'ridup',
      tagline: '工具链管理器',
      desc: '选择并运行已安装的工具链，`stable`、`nightly` 和 `canary` 三个通道各装一份，互不覆盖。它只管 Riddle 版本，C 编译器仍由选中的 `clue` 在本机寻找。',
      usage: 'ridup toolchain install stable | nightly | canary',
      points: [
        '`stable` 和 `nightly` 取 GitHub Release 归档，校验 SHA-256 后才替换旧工具链',
        '`canary` 拉 `main` 最新提交，在本机 `cargo build --workspace --release`，只需要 Rust 和 Cargo',
        '`ridup toolchain link dev <目录>` 直接把本地构建目录当成一条工具链',
        '`riddle-toolchain.toml`、`RIDUP_TOOLCHAIN` 和 `clue +dev build` 都能改变选择',
        '把 ridup 复制或硬链接成 `clue`、`riddlec`、`riddle-lsp` 后，它会代理到选中的工具链',
        '下载与 Canary 构建都遵守 `HTTPS_PROXY` 等标准代理环境变量',
      ],
      link: { label: '在 GitHub 上看 ridup', href: 'https://github.com/riddle-lang/ridup' },
    },
    items: [
      {
        name: 'riddlec',
        tagline: '编译器 CLI',
        desc: '检查 Riddle 源码并生成 C，前端检查与 C 后端都在同一个二进制里。',
        usage: 'riddlec [--verbose] [--backend c] [--target <triple>] [--output <file>] <file>...',
        points: [
          '`--backend c` 生成调用 `rgc` ABI 的 C 代码',
          '`--target <triple>` 选择目标平台，也可通过 `RIDDLE_TARGET` 或 `Clue.toml` 设置',
          '自动把 `std/lib.rid` 拼到用户源码后面',
          '不指定后端时只做前端检查，不降级 MIR',
        ],
      },
      {
        name: 'clue',
        tagline: '项目构建器',
        desc: '创建、检查、构建和运行 Riddle 项目。二进制项目会生成本机可执行文件，库项目只输出 C。',
        usage: 'clue init | new | check | build | run [--target <triple>]',
        points: [
          '设置 `CC` 时严格使用它，否则自动寻找可完成 C11 编译链接的系统编译器',
          '`--target`、`RIDDLE_TARGET` 和 `Clue.toml` 的 `[build].target` 依次覆盖宿主平台',
          '`ridup target add <triple>` 安装目标 runtime；链接仍需要目标 C 工具链',
          '`clue build` 会保留 `.clue/build/<name>.c`，方便检查生成结果',
          '`Clue.toml` 的 `[runtime].source` 可指向自定义运行时实现',
        ],
      },
      {
        name: 'riddle-lsp',
        tagline: '语言服务器',
        desc: '基于 `tower-lsp`。解析错误、HIR 诊断、类型检查错误、move / escape 诊断全部通过 LSP 推送。',
        points: [
          '项目范围补全，优先使用所有已打开文件的未保存内容',
          '语义 Token 区分自由函数、方法、struct、enum 和 trait',
          '错误码可跳转到错误码手册，注释与修复建议以 `note:` / `help:` 附加',
        ],
      },
    ],
  },
  editors: {
    eyebrow: '编辑器支持',
    title: '在你已经在用的编辑器里',
    subtitle: '仓库的 `editors` 目录提供开箱即用的适配配置。',
    list: ['Helix', 'VS Code', 'Zed', 'IntelliJ IDEA 2026.1+'],
    haveTitle: '现在就能用',
    have: [
      '`.rid` 文件识别',
      'Clue 项目、未保存文件和未打开模块的诊断',
      '解析、类型、move / borrow 诊断',
      '函数、方法、struct、enum、trait、参数和可变绑定的语义高亮',
      '跨模块返回类型的局部变量 Inlay Hint',
      '跨文件补全，含字段、实例方法、枚举变体和关联函数',
      '可变闭包绑定 Code Action',
      '增量文档同步与 Semantic Token delta',
    ],
    missTitle: '尚未实现',
    miss: ['Hover', '跳转定义', '查找引用', '重命名', '格式化'],
  },
  quickstart: {
    eyebrow: '开始使用',
    title: '五条命令，跑起第一个程序',
    subtitle: '用 `ridup` 装工具链并在通道之间切换，也可以从 GitHub Releases 下载压缩包加入 `PATH`。',
    steps: [
      {
        title: '安装工具链',
        desc: '装完通道要再选一次默认工具链；之后 `ridup show` 会告诉你当前用的是哪条，以及为什么是它。',
        lang: 'bash',
        code: `cargo install --git https://github.com/riddle-lang/ridup
ridup toolchain install stable
ridup default stable`,
      },
      {
        title: '创建并运行项目',
        desc: '`clue run` 会先完成与 `clue build` 相同的构建，再运行生成的可执行文件。',
        lang: 'bash',
        code: `clue new hello
cd hello
clue check
clue build
clue run`,
      },
    ],
    footnote:
      '`clue build` 会保留 `.clue/build/hello.c`。设置 `CC` 时 Clue 严格使用它；否则自动寻找 `cc`、`gcc`、`clang` 及其版本化命令，Windows 还支持 `clang-cl` 和 `cl`。想直接敲 `clue`，把 ridup 复制或硬链接成 `clue` 即可；不做代理时用 `ridup run stable clue new hello`。',
  },
  status: {
    eyebrow: '项目状态',
    title: '这是技术预览，我们不藏着',
    subtitle: 'v0.2.0 的语言和工具链仍可能发生不兼容变化。下面是当前真实的能力边界。',
    worksTitle: '已经可用',
    works: [
      '类型检查、move checker、借用与逃逸分析',
      '泛型、const generics、trait 与关联类型',
      '闭包与 `Fn` / `FnMut` / `FnOnce` 调用能力检查',
      '递归穷尽性检查的 `match`',
      '`IntoIterator` / `Iterator` 驱动的 `for`',
      '`unsafe` 语义与 C FFI',
      '数组、切片、字符串与 Vector 标准库',
      'Drop、运算符重载与确定性 C backend',
      '七个目标 triple 的交叉构建与 target runtime',
      '内置标准库、C11 代码生成、项目工具与 LSP',
    ],
    limitsTitle: '当前限制',
    limits: [
      '`Default`、格式化和哈希协议尚未提供',
      '浮点余数尚未支持，`Rem` / `RemAssign` 目前只为整数实现',
      '泛型偏向单态化，尚未覆盖完整 Rust 泛型能力',
      '只有 C 后端；生成可执行文件依赖系统 C 编译器',
      '逃逸分析粒度是整个局部变量，不做字段级拆分',
      '闭包按整个绑定捕获，不做字段级精确捕获',
      '函数类型语法目前只能写表示 `Fn` 的 `fun(...) -> T`',
    ],
    note: '不保证语法和 ABI 稳定。请把 Riddle 当作可以认真试用、但还不能上生产的语言。',
  },
  roadmap: {
    eyebrow: '发展规划',
    title: '接下来要做什么',
    subtitle:
      '这份路线图就是项目当前真实的优先级排序:正确性最先,语言能力其次,工具链与生态随后。顺序会随反馈调整,不构成时间承诺。',
    phases: [
      {
        tag: '01 · 近期',
        title: '语言核心',
        desc: '正确性优先,先把安全语义的地基打完。',
        items: [
          '`Result<T, E>` 的 `?` 错误传播与错误转换协议',
          '独立 `loop`、带值和标签的 `break`,以及 or / range / slice 模式',
          '更强的类型推断:`Vector::new()` 按后续使用推断元素类型、`Default::default` 一类关联函数分派、显式 `FnMut` / `FnOnce` 函数类型',
        ],
      },
      {
        tag: '02 · 中期',
        title: '标准库与工具链',
        desc: '语言能写的东西多了,库和工具要跟上。',
        items: [
          '标准库扩充:文件与缓冲 IO、解析、时间、随机数、Map / Set、哈希与完整格式化',
          'LSP 剩余能力:Hover、跳转定义、查找引用、重命名与格式化',
          '`clue` 依赖管理:registry、版本解析、git 依赖与 lockfile',
          '库项目产出静态库 / 动态库,而不只是 C 源码',
        ],
      },
      {
        tag: '03 · 远期',
        title: '核心稳定之后',
        desc: '这些方向明确排在核心语义稳定之后,现在不抢跑。',
        items: [
          '并发与 async / await',
          'C 之外的其他后端',
          '语法与运行时 ABI 的稳定化承诺',
        ],
      },
    ],
    note: '想影响优先级?到 GitHub Issues 告诉我们你最需要哪一项。',
  },
  author: {
    eyebrow: '关于作者',
    title: '一个人,一门语言',
    name: 'zi2ven',
    role: 'Riddle 的作者与唯一维护者',
    motto: 'Riddle is Best',
    bio: [
      '从 `riddlec` 的第一行代码到你正在看的这个页面——编译器、`clue`、`riddle-lsp`、`ridup`、标准库、文档和 Playground——都出自同一双手。',
      '也因为是一个人写的,这个项目更相信把边界写清楚:哪些已经能用、哪些还不行,官网和文档都照实标注。试用中发现问题,欢迎直接到 GitHub 提 issue。',
    ],
    link: { label: '在 GitHub 上找到 zi2ven', href: 'https://github.com/zi2ven' },
  },
  cta: {
    title: '写几行 Riddle 试试',
    subtitle: '不用安装任何东西，在浏览器里就能编译运行。',
    primary: '打开 Playground',
    secondary: '阅读 The Riddle Book',
  },
  footer: {
    tagline: '一门受 Rust 和 Go 启发的实验性编程语言。',
    groups: [
      {
        title: '学习',
        links: [
          { label: '文档', href: 'https://riddle-lang.github.io/docs/' },
          { label: 'Playground', href: 'https://riddle-lang.github.io/playground/' },
        ],
      },
      {
        title: '项目',
        links: [
          { label: '源码仓库', href: 'https://github.com/riddle-lang/riddle' },
          { label: 'ridup 工具链管理器', href: 'https://github.com/riddle-lang/ridup' },
          { label: '版本发布', href: 'https://github.com/riddle-lang/riddle/releases' },
          { label: '问题反馈', href: 'https://github.com/riddle-lang/riddle/issues' },
        ],
      },
    ],
    license: 'Apache License 2.0',
    community: '交流群',
    communityValue: 'QQ 677741637',
    copyright: 'The Riddle Project',
  },
};
