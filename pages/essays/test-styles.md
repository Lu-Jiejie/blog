---
title: 测试文章样式与目录功能
subtitle: 用于测试各种 Markdown 样式和 TOC 组件
date: 2024-01-15
type: blog
tags: [测试, 样式, Markdown]
description: 一篇用于测试博客各种样式和目录功能的测试文章
---

这是一篇测试文章，用于展示博客的各种 Markdown 样式和目录功能。

## 一级标题：基础文本样式

### 二级标题：文本格式

这是普通段落文本。支持**粗体文字**、_斜体文字_、~~删除线~~、`行内代码`等基本格式。

你也可以使用[链接](https://example.com)和脚注[^1]。

[^1]: 这是一个脚注示例

#### 三级标题：列表

无序列表：

- 第一项
- 第二项
  - 嵌套项 2.1
  - 嵌套项 2.2
- 第三项

有序列表：

1. 第一步
2. 第二步
3. 第三步

### 二级标题：引用块

> 这是一个引用块
>
> 可以包含多行文本
>
> > 还可以嵌套引用

## 一级标题：代码示例

### 二级标题：行内代码

使用 `const value = 42` 这样的行内代码。

#### 三级标题：代码块

```javascript
// JavaScript 代码示例
function greet(name) {
  console.log(`Hello, ${name}!`)
  return true
}

const result = greet('World')
```

```typescript
// TypeScript 代码示例
interface User {
  id: number
  name: string
  email?: string
}

const user: User = {
  id: 1,
  name: 'Test User',
}
```

```css
/* CSS 代码示例 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
```

## 一级标题：表格与其他元素

### 二级标题：表格

| 列1 | 列2 | 列3 |
| --- | --- | --- |
| A1  | B1  | C1  |
| A2  | B2  | C2  |
| A3  | B3  | C3  |

#### 三级标题：水平线

---

### 二级标题：任务列表

- [x] 已完成任务
- [x] 另一个已完成任务
- [ ] 未完成任务
- [ ] 待办事项

## 一级标题：高级功能

### 二级标题：GitHub 提示块

> [!NOTE]
> 这是一个提示信息

> [!TIP]
> 这是一个小技巧

> [!IMPORTANT]
> 这是重要信息

> [!WARNING]
> 这是警告信息

> [!CAUTION]
> 这是危险警告

### 二级标题：数学公式

行内公式：$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

#### 三级标题：emoji 表情

支持 emoji：✨ 🚀 💡 🎉 📝 🔥

## 一级标题：图片与媒体

### 二级标题：图片示例

![示例图片](https://file.lujiejie.de/api/file/1781208786459_pic1.jpeg)

#### 三级标题：带标题的图片

<figure>
  <img src="https://file.lujiejie.de/api/file/1781208786459_pic1.jpeg" alt="图例示例">
  <figcaption>这是图片标题</figcaption>
</figure>

## 一级标题：深层嵌套测试

### 二级标题：层级 A

这是层级 A 的内容。

#### 三级标题：层级 A-1

这是层级 A-1 的内容。

#### 三级标题：层级 A-2

这是层级 A-2 的内容。

### 二级标题：层级 B

这是层级 B 的内容。

#### 三级标题：层级 B-1

这是层级 B-1 的内容。

#### 三级标题：层级 B-2

这是层级 B-2 的内容。

#### 三级标题：层级 B-3

这是层级 B-3 的内容。

## 一级标题：结论

### 二级标题：总结

这篇测试文章展示了：

- 各种文本格式
- 代码高亮
- 表格和列表
- GitHub 提示块
- 多层级标题结构

这些内容可以充分测试 TOC 目录功能和各种样式的渲染效果。

#### 三级标题：后续计划

- 继续完善样式
- 优化响应式布局
- 增强交互体验

---

**文章结束** - 感谢阅读！
