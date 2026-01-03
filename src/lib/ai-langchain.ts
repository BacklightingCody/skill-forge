import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { LearningIntent, GeneratedPlan, GraphNode } from "@/types";

// ============ Enhanced Zod Schema for Day-by-Day Planning ============

const resourceSchema = z.object({
  type: z.enum(["doc", "video", "tutorial", "book"]).describe("资源类型"),
  title: z.string().describe("资源标题，要具体明确"),
  url: z.string().optional().describe("资源链接，尽量提供真实可访问的URL"),
});

const dailyTaskSchema = z.object({
  id: z.string().describe("任务唯一ID，格式：d{day}_t{task_index}，如 d1_t1"),
  day: z.number().int().min(1).describe("该任务所属的天数"),
  title: z.string().max(20).describe("任务简短标题（不超过20字），用于节点展示，如：变量与数据类型"),
  description: z.string().describe("任务详细描述，包含：1.具体学习什么内容 2.要掌握哪些知识点 3.建议的学习方法"),
  objectives: z.array(z.string()).min(2).max(4).describe("学习目标：学完后应该理解/掌握什么概念，如：理解let和const的区别、掌握变量提升机制"),
  timeMinutes: z.number().int().min(5).max(120).describe("预计时间（分钟）"),
  resources: z.array(resourceSchema).min(1).max(3).describe("推荐的学习资源，1-3个"),
  assessment: z.array(z.string()).min(3).max(5).describe("验收标准：具体的、可自我检验的动作项。每条必须是【能做到XXX】的格式，要针对本任务的学习目标来制定，不能笼统。例如：能手写一个使用解构赋值的代码"),
  dependencies: z.array(z.string()).describe("依赖的前置任务ID列表"),
});

const milestoneSchema = z.object({
  id: z.string().describe("里程碑唯一ID，格式：m{index}"),
  dayRange: z.tuple([z.number().int().min(1), z.number().int()]).describe("里程碑覆盖的天数范围 [开始天, 结束天]"),
  title: z.string().describe("里程碑标题，概括这个阶段的核心目标"),
  description: z.string().describe("里程碑描述，说明完成这个阶段后能达到什么水平"),
  tasks: z.array(dailyTaskSchema).min(1).describe("该里程碑包含的每日任务列表"),
});

export const learningPlanSchema = z.object({
  title: z.string().describe("学习计划标题"),
  description: z.string().describe("学习计划整体描述，概述学习路径和最终目标"),
  milestones: z.array(milestoneSchema).min(1).describe("里程碑列表，按时间顺序排列"),
});

export type LearningPlanOutput = z.infer<typeof learningPlanSchema>;

// ============ LangChain Configuration ============

function createZhipuClient() {
  return new ChatOpenAI({
    modelName: process.env.AI_MODEL || "glm-4-flash",
    openAIApiKey: process.env.ZHIPU_API_KEY || process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.AI_BASE_URL || "https://open.bigmodel.cn/api/paas/v4",
    },
    temperature: 0.7,
    maxTokens: 8000,
  });
}

// ============ Prompt Templates ============

const SYSTEM_TEMPLATE = `你是一位资深的编程教育专家和学习规划师。你的任务是为学习者制定【极其具体、可执行】的每日学习计划。

## 核心原则

### 1. 任务标题必须简洁（不超过20字）
❌ 错误示例："学习JavaScript中的变量声明以及数据类型的使用方法"（太长）
✅ 正确示例："变量与数据类型"、"Props属性传递"、"useState状态管理"

### 2. 学习目标（objectives）要明确知识点
学习目标是"学完后应该理解/掌握什么概念"，用于帮助学习者明确方向
❌ 错误示例："学会编程"（太笼统）
✅ 正确示例：
  - "理解let和const的区别及使用场景"
  - "掌握变量提升(hoisting)机制"
  - "理解JavaScript的7种数据类型"

### 3. 验收标准（assessment）必须针对学习目标，具体可验证
验收标准是"能做到什么"，每条必须是【能XXX】的格式，且要针对对应的学习目标
❌ 错误示例："理解变量"（无法验证，太笼统）
✅ 正确示例（针对"理解let和const的区别"这个学习目标）：
  - "能不看文档向他人解释let和const的三个主要区别"
  - "能根据场景判断应该使用let还是const并说明理由"
  - "能手写代码演示const声明对象时为何还能修改属性"

### 4. 学习内容要循序渐进
- 第一天不要直接上高级概念
- 每天的内容要基于前一天的知识
- 适时安排复习和实践巩固

### 5. 资源推荐要实用
优先推荐这些免费资源：
- 官方文档（React官网、Vue官网、MDN等）
- 菜鸟教程 (runoob.com)
- 掘金小册/博客
- B站优质教程
- freeCodeCamp

## 输出格式要求
- 里程碑数量：根据总天数划分，7天内2-3个，14天3-4个，30天4-5个
- 任务ID格式：d{{day}}_t{{task_index}}，如 d1_t1 表示第1天第1个任务
- 里程碑ID格式：m1, m2, m3...
- dayRange 必须连续覆盖第1天到最后一天，不能有间隙
- 每天的任务时间总和应等于用户设定的每日学习时间
- objectives 和 assessment 要一一对应：每个学习目标都应有对应的验收标准

{format_instructions}`;

const USER_TEMPLATE = `请为以下学习目标生成【具体到每一天】的学习计划：

## 学习者信息
- 学习目标：{goal}
- 总学习天数：{totalDays} 天
- 每日可用时间：{dailyMinutes} 分钟
- 期望达到水平：{targetLevel}
- 当前基础：{currentLevel}

## 重要要求

1. **覆盖每一天**：必须为第1天到第{totalDays}天的每一天都安排学习任务

2. **标题要简洁**（不超过20字）：
   - 用于在节点图上展示
   - 如"变量与类型"、"函数基础"、"组件Props"

3. **学习目标（objectives）要清晰**：
   - 2-4条，说明学完后应该理解/掌握什么概念
   - 如："理解let和const的区别"、"掌握变量作用域"

4. **验收标准（assessment）要针对学习目标**：
   - 每条必须是【能XXX】的格式
   - 必须针对对应的学习目标制定，不能笼统
   - 示例（针对"理解let和const区别"）：
     - "能向他人解释let和const的三个主要区别"
     - "能判断具体场景下应该用let还是const"

5. **学习资源要真实**：
   - 推荐真实存在的免费学习资源
   - 包含具体的文章/视频/文档名称
   - 尽量提供可访问的URL

6. **难度要匹配**：
   - 根据用户当前水平调整起点
   - 根据目标水平规划终点
   - 保持合理的难度曲线

请现在生成这个学习计划，确保每一天的内容都足够具体和可执行。`;

// ============ Main Generation Function ============

export async function generateLearningPlanWithLangChain(
  intent: LearningIntent
): Promise<GeneratedPlan> {
  console.log("Starting AI generation with config:", {
    model: process.env.AI_MODEL,
    baseURL: process.env.AI_BASE_URL,
    hasApiKey: !!(process.env.ZHIPU_API_KEY || process.env.OPENAI_API_KEY),
  });

  const parser = StructuredOutputParser.fromZodSchema(learningPlanSchema);
  const formatInstructions = parser.getFormatInstructions();

  const levelDescriptions = {
    beginner: "初学者，目标是能够基础使用",
    intermediate: "中级，目标是灵活运用，能独立负责项目",
  };

  const currentDescriptions = {
    none: "完全没有基础",
    basic: "有一些基础概念了解",
    some: "有一定实践经验",
  };

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", USER_TEMPLATE],
  ]);

  const model = createZhipuClient();

  const chain = RunnableSequence.from([
    prompt,
    model,
    parser,
  ]);

  try {
    console.log("Invoking LangChain with intent:", intent.goal);
    const result = await chain.invoke({
      format_instructions: formatInstructions,
      goal: intent.goal,
      totalDays: intent.totalDays,
      dailyMinutes: intent.dailyMinutes,
      targetLevel: levelDescriptions[intent.experienceLevel],
      currentLevel: currentDescriptions[intent.currentLevel],
    });

    console.log("AI generation successful, transforming result...");
    // Transform to GeneratedPlan format
    return transformToGeneratedPlan(result, intent.totalDays);
  } catch (error) {
    console.error("LangChain generation error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    // Re-throw to let retry logic handle it
    throw error;
  }
}

// ============ Transform Functions ============

function transformToGeneratedPlan(
  plan: LearningPlanOutput,
  totalDays: number
): GeneratedPlan {
  const nodes: GraphNode[] = [];
  const edges: { id: string; source: string; target: string }[] = [];
  const nodeIdMap = new Map<string, string>();

  // Convert milestones to the expected format and create graph nodes
  const milestones = plan.milestones.map((milestone, mIndex) => {
    const tasks = milestone.tasks.map((task, tIndex) => {
      const nodeId = `n_${milestone.id}_${task.id}`;
      nodeIdMap.set(task.id, nodeId);

      nodes.push({
        id: nodeId,
        milestoneId: milestone.id,
        taskId: task.id,
        label: task.title,
        type: "task",
        day: task.day,
        dependencies: task.dependencies,
      });

      return {
        id: task.id,
        title: task.title,
        desc: task.description,
        objectives: task.objectives || [],
        timeMinutes: task.timeMinutes,
        resources: task.resources.map((r) => ({
          type: r.type,
          title: r.title,
          url: r.url,
        })),
        assessment: task.assessment,
      };
    });

    return {
      id: milestone.id,
      dayRange: milestone.dayRange,
      title: milestone.title,
      description: milestone.description,
      tasks,
    };
  });

  // Create edges based on dependencies
  let edgeIndex = 0;
  nodes.forEach((node) => {
    if (node.dependencies && node.dependencies.length > 0) {
      node.dependencies.forEach((depTaskId) => {
        const sourceNodeId = nodeIdMap.get(depTaskId);
        if (sourceNodeId) {
          edges.push({
            id: `e${++edgeIndex}`,
            source: sourceNodeId,
            target: node.id,
          });
        }
      });
    }
  });

  // If no explicit dependencies, create linear edges between consecutive tasks
  if (edges.length === 0 && nodes.length > 1) {
    const sortedNodes = [...nodes].sort((a, b) => a.day - b.day);
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      edges.push({
        id: `e${i + 1}`,
        source: sortedNodes[i].id,
        target: sortedNodes[i + 1].id,
      });
    }
  }

  // Calculate node positions
  const positionedNodes = calculateNodePositions(nodes, totalDays);

  // Clear dependencies after using them for edges (not needed in final format)
  positionedNodes.forEach((node) => {
    node.dependencies = [];
  });

  return {
    milestones,
    graphData: {
      nodes: positionedNodes,
      edges,
    },
  };
}

function calculateNodePositions(
  nodes: GraphNode[],
  totalDays: number
): GraphNode[] {
  const dayGroups = new Map<number, GraphNode[]>();

  // Group nodes by day
  nodes.forEach((node) => {
    const group = dayGroups.get(node.day) || [];
    group.push(node);
    dayGroups.set(node.day, group);
  });

  // Calculate positions with better spacing for day-by-day layout
  const result: GraphNode[] = [];
  const xSpacing = 220; // Horizontal spacing between days
  const ySpacing = 100; // Vertical spacing for multiple tasks per day

  // Use a more compact layout for many days
  const daysArray = Array.from(dayGroups.keys()).sort((a, b) => a - b);

  daysArray.forEach((day, dayIndex) => {
    const group = dayGroups.get(day) || [];
    const x = dayIndex * xSpacing;

    group.forEach((node, index) => {
      // Center vertically if multiple tasks per day
      const totalHeight = (group.length - 1) * ySpacing;
      const startY = -totalHeight / 2;
      const y = startY + index * ySpacing;

      result.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return result;
}

// ============ Fallback Plan ============

// 预定义的学习内容模板，根据不同技术栈提供具体的学习路径
const LEARNING_TEMPLATES: Record<string, {
  phases: {
    title: string;
    topics: {
      title: string;
      description: string;
      objectives: string[];
      resources: { type: "doc" | "video" | "tutorial"; title: string; url: string }[];
      assessments: string[];
    }[];
  }[];
}> = {
  react: {
    phases: [
      {
        title: "React 基础入门",
        topics: [
          {
            title: "环境搭建",
            description: "学习如何使用 Create React App 或 Vite 创建 React 项目，了解项目结构和基本配置。",
            objectives: [
              "了解 React 项目的基本结构",
              "理解 Vite 作为构建工具的优势",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 快速开始", url: "https://react.dev/learn" },
              { type: "tutorial", title: "Vite 创建 React 项目", url: "https://vitejs.dev/guide/" },
            ],
            assessments: [
              "能独立使用 Vite 创建一个新的 React 项目",
              "能说出 src 目录下各文件的作用",
              "能成功运行开发服务器并在浏览器中看到页面",
            ],
          },
          {
            title: "JSX 语法",
            description: "学习 JSX 的基本语法，理解 JSX 与 HTML 的区别，掌握在 JSX 中使用表达式和条件渲染。",
            objectives: [
              "理解 JSX 是什么以及它与 HTML 的区别",
              "掌握在 JSX 中使用 JavaScript 表达式",
              "掌握条件渲染的几种方式",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - JSX", url: "https://react.dev/learn/writing-markup-with-jsx" },
              { type: "tutorial", title: "菜鸟教程 - React JSX", url: "https://www.runoob.com/react/react-jsx.html" },
            ],
            assessments: [
              "能向他人解释 JSX 与 HTML 的三个主要区别",
              "能在 JSX 中正确使用 {} 嵌入 JavaScript 表达式",
              "能使用三元运算符和 && 实现条件渲染",
            ],
          },
          {
            title: "组件基础",
            description: "学习函数组件的定义方式，理解组件的概念，掌握组件的导入导出。",
            objectives: [
              "理解 React 组件的概念",
              "掌握函数组件的定义方式",
              "理解组件的导入导出机制",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 组件", url: "https://react.dev/learn/your-first-component" },
            ],
            assessments: [
              "能创建一个简单的函数组件并正确导出",
              "能解释为什么组件名必须大写",
              "能将一个页面拆分成多个组件并组合使用",
            ],
          },
          {
            title: "Props传递",
            description: "学习如何通过 props 在组件之间传递数据，理解单向数据流的概念。",
            objectives: [
              "理解 props 的作用和单向数据流",
              "掌握 props 的传递和解构",
              "理解 props 的只读性",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - Props", url: "https://react.dev/learn/passing-props-to-a-component" },
            ],
            assessments: [
              "能向子组件传递 props 并在子组件中使用",
              "能使用 props 解构简化代码",
              "能设置 props 的默认值",
              "能解释为什么 props 是只读的",
            ],
          },
          {
            title: "useState",
            description: "学习 useState Hook 的使用，理解状态与普通变量的区别，掌握状态更新的正确方式。",
            objectives: [
              "理解状态与普通变量的区别",
              "掌握 useState 的使用方式",
              "理解状态更新的异步性",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - useState", url: "https://react.dev/reference/react/useState" },
              { type: "video", title: "B站 - React Hooks 详解", url: "https://www.bilibili.com" },
            ],
            assessments: [
              "能使用 useState 创建和更新状态",
              "能解释为什么不能直接修改状态而要用 setter 函数",
              "能正确更新对象和数组类型的状态",
              "能实现一个计数器组件",
            ],
          },
          {
            title: "事件处理",
            description: "学习 React 中的事件处理机制，掌握常用事件的绑定方式和事件对象的使用。",
            objectives: [
              "理解 React 事件系统",
              "掌握常用事件的绑定方式",
              "掌握事件对象的使用",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 事件处理", url: "https://react.dev/learn/responding-to-events" },
            ],
            assessments: [
              "能正确绑定 onClick、onChange 等事件",
              "能在事件处理函数中获取并使用事件对象",
              "能阻止事件的默认行为和冒泡",
            ],
          },
          {
            title: "列表渲染",
            description: "学习如何渲染列表数据，理解 key 属性的重要性和正确用法。",
            objectives: [
              "理解列表渲染的原理",
              "理解 key 属性的作用",
              "掌握列表的增删改操作",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 列表和 Key", url: "https://react.dev/learn/rendering-lists" },
            ],
            assessments: [
              "能使用 map 方法渲染一个列表",
              "能解释为什么需要 key 以及如何选择合适的 key",
              "能实现一个带有增删功能的待办事项列表",
            ],
          },
          {
            title: "useEffect",
            description: "学习 useEffect Hook，理解副作用的概念，掌握依赖数组的使用。",
            objectives: [
              "理解什么是副作用",
              "掌握 useEffect 的使用时机",
              "理解依赖数组的作用",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - useEffect", url: "https://react.dev/reference/react/useEffect" },
            ],
            assessments: [
              "能解释什么是副作用以及为什么需要 useEffect",
              "能正确设置 useEffect 的依赖数组",
              "能使用 useEffect 进行数据获取",
              "能正确清理 useEffect 中的副作用",
            ],
          },
          {
            title: "表单处理",
            description: "学习受控组件和非受控组件的概念，掌握表单数据的收集和验证。",
            objectives: [
              "理解受控组件和非受控组件的区别",
              "掌握表单状态管理",
              "掌握基本的表单验证",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 表单", url: "https://react.dev/learn/sharing-state-between-components" },
            ],
            assessments: [
              "能实现一个受控的输入框组件",
              "能处理多个表单字段的状态",
              "能实现简单的表单验证逻辑",
            ],
          },
          {
            title: "状态提升",
            description: "学习组件之间的通信方式，理解状态提升的概念和应用场景。",
            objectives: [
              "理解状态提升的概念",
              "掌握父子组件通信",
              "理解单向数据流",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 状态提升", url: "https://react.dev/learn/sharing-state-between-components" },
            ],
            assessments: [
              "能实现父子组件之间的双向通信",
              "能将共享状态提升到合适的父组件",
              "能通过 props 回调实现子传父",
            ],
          },
          {
            title: "useContext",
            description: "学习 Context API，解决 props 逐层传递的问题，实现跨组件的状态共享。",
            objectives: [
              "理解 Context 解决的问题",
              "掌握 Context 的创建和使用",
              "理解 Context 的使用场景",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - useContext", url: "https://react.dev/reference/react/useContext" },
            ],
            assessments: [
              "能创建和使用 Context",
              "能使用 useContext 获取 Context 值",
              "能判断什么时候应该使用 Context",
            ],
          },
          {
            title: "自定义Hook",
            description: "学习如何创建自定义 Hook，实现逻辑复用。",
            objectives: [
              "理解自定义 Hook 的作用",
              "掌握自定义 Hook 的创建方式",
              "掌握逻辑复用的最佳实践",
            ],
            resources: [
              { type: "doc", title: "React 官方文档 - 自定义 Hook", url: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
            ],
            assessments: [
              "能解释自定义 Hook 的命名规范（use 开头）",
              "能将重复的状态逻辑抽取为自定义 Hook",
              "能创建一个 useLocalStorage Hook",
            ],
          },
          {
            title: "路由基础",
            description: "学习 React Router 的基本使用，实现多页面应用的路由配置。",
            objectives: [
              "理解前端路由的原理",
              "掌握 React Router 的基本配置",
              "掌握路由参数的获取",
            ],
            resources: [
              { type: "doc", title: "React Router 官方文档", url: "https://reactrouter.com/en/main" },
            ],
            assessments: [
              "能配置基本的路由结构",
              "能使用 Link 和 NavLink 进行导航",
              "能获取路由参数和查询参数",
              "能实现嵌套路由",
            ],
          },
          {
            title: "项目实战",
            description: "综合运用所学知识，完成一个完整的 React 项目，如待办事项应用或简单的博客。",
            objectives: [
              "掌握项目的整体规划",
              "掌握组件的合理拆分",
              "掌握状态管理的最佳实践",
            ],
            resources: [
              { type: "tutorial", title: "React 实战项目教程", url: "https://react.dev/learn/thinking-in-react" },
            ],
            assessments: [
              "能独立完成项目的组件设计和拆分",
              "能正确管理项目中的状态",
              "能处理项目中的路由跳转",
              "代码结构清晰，符合最佳实践",
            ],
          },
        ],
      },
    ],
  },
  default: {
    phases: [
      {
        title: "基础入门",
        topics: [
          {
            title: "环境搭建",
            description: "搭建开发环境，了解基本概念和核心术语，为后续学习打下基础。",
            objectives: [
              "了解基本开发环境配置",
              "理解核心概念和术语",
            ],
            resources: [
              { type: "doc", title: "官方文档 - 快速开始", url: "https://developer.mozilla.org" },
            ],
            assessments: [
              "能成功搭建开发环境",
              "能解释核心概念和术语",
              "能运行第一个示例程序",
            ],
          },
          {
            title: "核心语法",
            description: "学习核心语法和基本用法，掌握最常用的功能和特性。",
            objectives: [
              "掌握基本语法结构",
              "理解代码执行流程",
            ],
            resources: [
              { type: "doc", title: "基础语法教程", url: "https://developer.mozilla.org" },
            ],
            assessments: [
              "能正确使用基本语法结构",
              "能编写简单的代码",
              "能解释代码的执行流程",
            ],
          },
          {
            title: "进阶特性",
            description: "深入学习进阶特性，理解高级概念和最佳实践。",
            objectives: [
              "理解进阶特性的作用",
              "掌握高级概念",
            ],
            resources: [
              { type: "doc", title: "进阶教程", url: "https://developer.mozilla.org" },
            ],
            assessments: [
              "能正确使用进阶特性",
              "能解释高级概念的原理",
              "能应用最佳实践编写代码",
            ],
          },
          {
            title: "项目实战",
            description: "通过实际项目练习巩固所学知识，积累实战经验。",
            objectives: [
              "掌握项目开发流程",
              "积累实战经验",
            ],
            resources: [
              { type: "tutorial", title: "实战项目教程", url: "https://developer.mozilla.org" },
            ],
            assessments: [
              "能独立完成小型项目",
              "代码质量良好，结构清晰",
              "能向他人解释实现思路",
            ],
          },
        ],
      },
    ],
  },
};

function detectTechnology(goal: string): string {
  const lowerGoal = goal.toLowerCase();
  if (lowerGoal.includes("react")) return "react";
  if (lowerGoal.includes("vue")) return "vue";
  if (lowerGoal.includes("typescript") || lowerGoal.includes("ts")) return "typescript";
  if (lowerGoal.includes("node")) return "node";
  if (lowerGoal.includes("python")) return "python";
  if (lowerGoal.includes("javascript") || lowerGoal.includes("js")) return "javascript";
  return "default";
}

function createFallbackPlan(intent: LearningIntent): GeneratedPlan {
  const tech = detectTechnology(intent.goal);
  const template = LEARNING_TEMPLATES[tech] || LEARNING_TEMPLATES.default;

  const nodes: GraphNode[] = [];
  const edges: { id: string; source: string; target: string }[] = [];
  const milestones = [];

  // 获取所有主题
  const allTopics = template.phases.flatMap(phase => phase.topics);
  const totalTopics = allTopics.length;

  // 计算每天应该学习多少内容
  const topicsPerDay = Math.max(1, Math.ceil(totalTopics / intent.totalDays));

  // 计算里程碑数量
  const milestonesCount = Math.min(4, Math.max(2, Math.ceil(intent.totalDays / 7)));
  const daysPerMilestone = Math.ceil(intent.totalDays / milestonesCount);

  let topicIndex = 0;
  let lastNodeId: string | null = null;
  let edgeIndex = 0;

  for (let m = 0; m < milestonesCount; m++) {
    const startDay = m * daysPerMilestone + 1;
    const endDay = Math.min((m + 1) * daysPerMilestone, intent.totalDays);
    const tasks = [];

    for (let day = startDay; day <= endDay; day++) {
      // 获取当天的主题，循环使用主题
      const topic = allTopics[topicIndex % totalTopics];
      topicIndex++;

      const taskId = `d${day}_t1`;
      const nodeId = `n_m${m + 1}_${taskId}`;

      const dayInPhase = day - startDay + 1;
      const totalDaysInPhase = endDay - startDay + 1;

      // 根据阶段进度调整标题
      let taskTitle = topic.title;
      if (totalDaysInPhase > 1) {
        if (dayInPhase === 1) {
          taskTitle = `${topic.title} - 基础学习`;
        } else if (dayInPhase === totalDaysInPhase) {
          taskTitle = `${topic.title} - 实践巩固`;
        } else {
          taskTitle = `${topic.title} - 深入理解`;
        }
      }

      tasks.push({
        id: taskId,
        title: topic.title,
        desc: `${topic.description}\n\n今日重点：结合实际例子理解概念，动手敲代码练习。`,
        objectives: topic.objectives || [],
        timeMinutes: Math.min(intent.dailyMinutes, 60),
        resources: topic.resources.map(r => ({
          type: r.type,
          title: r.title,
          url: r.url,
        })),
        assessment: topic.assessments,
      });

      nodes.push({
        id: nodeId,
        milestoneId: `m${m + 1}`,
        taskId,
        label: topic.title,
        type: "task",
        day,
        dependencies: [],
        position: { x: (day - 1) * 220, y: 0 },
      });

      if (lastNodeId) {
        edges.push({
          id: `e${++edgeIndex}`,
          source: lastNodeId,
          target: nodeId,
        });
      }
      lastNodeId = nodeId;
    }

    const phaseTitle = template.phases[0]?.title || "学习阶段";
    milestones.push({
      id: `m${m + 1}`,
      dayRange: [startDay, endDay] as [number, number],
      title: m === 0 ? `${intent.goal} - 基础入门` :
             m === milestonesCount - 1 ? `${intent.goal} - 实战应用` :
             `${intent.goal} - 进阶提升`,
      description: `第 ${startDay} 天到第 ${endDay} 天：${
        m === 0 ? '打好基础，掌握核心概念' :
        m === milestonesCount - 1 ? '综合运用，完成实战项目' :
        '深入理解，提升实践能力'
      }`,
      tasks,
    });
  }

  return {
    milestones,
    graphData: {
      nodes,
      edges,
    },
  };
}

// ============ Export for API Route ============

export async function generatePlanWithRetry(
  intent: LearningIntent,
  retries = 2
): Promise<GeneratedPlan> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Generating plan attempt ${attempt + 1}/${retries}...`);
      const plan = await generateLearningPlanWithLangChain(intent);

      // Validate that we have tasks for each day
      const allDays = new Set<number>();
      plan.milestones.forEach((m) => {
        m.tasks.forEach((t) => {
          // Extract day from task id if possible
          const match = t.id.match(/d(\d+)/);
          if (match) {
            allDays.add(parseInt(match[1]));
          }
        });
      });

      // Also check from graph nodes
      plan.graphData.nodes.forEach((n) => {
        allDays.add(n.day);
      });

      console.log(`Generated plan covers ${allDays.size} days out of ${intent.totalDays}`);

      return plan;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Generation attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  console.warn("All generation attempts failed, using fallback plan");
  return createFallbackPlan(intent);
}
