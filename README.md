# riddle-lang.github.io

Riddle 语言官网主页。Astro 5 + Tailwind CSS v4，静态输出，无前端框架运行时。

同一组织下的另外几个仓库与本仓库互不影响：

- Playground — <https://riddle-lang.github.io/playground/>
- 文档 — <https://riddle-lang.github.io/docs/>
- 编译器与工具链 — <https://github.com/riddle-lang/riddle>
- ridup（工具链管理器） — <https://github.com/riddle-lang/ridup>

## 本地开发

```bash
npm install          # 首次需要放行构建脚本，见下
npm run dev          # http://localhost:4321
npm run check        # astro check：类型与模板检查
npm run build        # 先 check 再输出到 dist/
npm run preview      # 预览 dist/
```

npm 11 默认不执行依赖的安装脚本，而 `esbuild` 和 `sharp` 需要它。如果 `npm install`
之后出现 `allow-scripts` 警告或构建失败：

```bash
npm install-scripts approve esbuild
npm install-scripts approve sharp
```

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并发布。

**有一步必须手动做一次**（Astro 构建到 `dist/`，不是仓库根目录，所以不能用默认的
分支部署）：

> GitHub 仓库 → **Settings** → **Pages** → **Build and deployment** → **Source**
> 选择 **GitHub Actions**。

改完之后 workflow 才能发布成功；只做一次，后续推送不用再管。

## 目录结构

```
src/
  pages/index.astro       中文首页（/）
  pages/en/index.astro    英文首页（/en/）
  i18n/zh.ts, en.ts       全站文案，两份内容都实现 SiteContent
  i18n/types.ts           文案结构定义
  components/             各个板块，FeatureShowcase 是特性展示的主体
  layouts/Base.astro      head、主题切换、滚动动画、复制按钮
  styles/global.css       设计令牌与全局样式
  lib/icons.ts            内联 SVG 图标路径
  lib/inline.ts           把文案里的反引号转成 <code>
  data/riddle.tmLanguage.json  Shiki 用的 Riddle 语法定义
public/fonts/             Maple Mono 子集（等宽字体，含许可证）
scripts/                  仅开发期使用，见下
```

### 改文案

只改 `src/i18n/zh.ts` 和 `src/i18n/en.ts`。两个文件都必须满足 `SiteContent`，缺字段
会被 `npm run build` 里的 `astro check` 拦下（`astro build` 本身不做类型检查），所以
中英文不会漏掉一边。文案里用反引号包住的片段会渲染成行内代码，不要在文案里写 HTML；
行内代码不换行，长命令请放到 `usage` 或代码块里。

### 代码高亮

`src/data/riddle.tmLanguage.json` 从 `riddle/editors/vscode/syntaxes/` 复制而来，
只改了 `name` / `displayName` / `aliases` 以便 Shiki 注册。语法更新时重新复制并保留
这几个字段。高亮在构建期完成，浏览器不加载高亮器。

### 字体

`public/fonts/` 里是 Maple Mono CN 的子集（Latin + 标点，43 KB/字重）。原字体单个
18.5 MB，用 `fonttools` 裁剪：

```bash
pyftsubset MapleMono-CN-Medium.ttf --flavor=woff2 \
  --unicodes="U+0000-00FF,U+2000-206F,U+2190-21FF,U+2200-22FF,U+2500-257F,U+25A0-25FF,U+2600-26FF" \
  --output-file=public/fonts/MapleMono-Medium.woff2
```

代码里禁用了连字（`font-variant-ligatures: none`）——Maple Mono 会把 `--` 连成破折号，
命令行参数会被显示成错的样子。

## scripts/

只在开发时用，不参与构建：

- `generate-images.mjs` — 生成 `public/og.png` 与 `public/apple-touch-icon.png`。
  改了 OG 文案后重新跑一次。
- `shot.mjs` — 用无头 Edge 通过 CDP 截整页图，并报告横向溢出的元素。
  `node scripts/shot.mjs <url> <宽度> <dark|light> <输出.png>`，需要先起 `npm run preview`。
- `probe.mjs` — 同样的 CDP 通道，但执行任意表达式，用来查页面里的实际计算值。

## 许可

站点代码与 Riddle 一致，Apache License 2.0。`public/fonts/MapleMono-LICENSE.txt`
是字体自己的许可证（SIL OFL 1.1）。
