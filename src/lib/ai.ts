import OpenAI from "openai";
import type { LearningIntent, GeneratedPlan } from "@/types";
import { validateGeneratedPlan } from "./validators";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `你是一个专业的学习规划师，专门为编程学习者制定个性化学习计划。

你的任务是根据用户的学习目标、时间和当前水平，生成一个结构化的学习计划。

输出必须是严格的 JSON 格式，包含以下结构：

{
  "milestones": [
    {
      "id": "m1",
      "dayRange": [1, 7],
      "title": "里程碑标题",
      "description": "里程碑描述",
      "tasks": [
        {
          "id": "t1",
          "desc": "任务描述",
          "timeMinutes": 45,
          "resources": [
            {"type": "doc", "title": "资源标题", "url": "https://..."}
          ],
          "assessment": ["验证问题1", "验证问题2", "验证问题3"]
        }
      ]
    }
  ],
  "graphData": {
    "nodes": [
      {
        "id": "n1",
        "milestoneId": "m1",
        "taskId": "t1",
        "label": "节点标签",
        "type": "task",
        "day": 1,
        "dependencies": []
      }
    ],
    "edges": [
      {"id": "e1", "source": "n1", "target": "n2"}
    ]
  }
}

规则：
1. 任务粒度适中，每个任务 15-60 分钟
2. 每个任务有 3-5 个验证检查项（assessment）
3. 推荐免费优质资源（官方文档、MDN、FreeCodeCamp 等）
4. 依赖关系合理，支持并行学习
5. 节点类型：milestone 表示里程碑节点，task 表示具体任务节点
6. 确保所有 ID 唯一
7. graphData.nodes 中的 day 字段表示该节点对应的学习天数
8. 根据用户的经验水平调整难度和深度`;

function buildUserPrompt(intent: LearningIntent): string {
  const levelDesc = {
    beginner: "初学者，目标是能够基础使用",
    intermediate: "中级，目标是灵活运用，能独立负责项目",
  };

  const currentDesc = {
    none: "完全没有基础",
    basic: "有一些基础概念了解",
    some: "有一定实践经验",
  };

  return `请为以下学习目标生成学习计划：

学习目标：${intent.goal}
总天数：${intent.totalDays} 天
每日学习时间：${intent.dailyMinutes} 分钟（约 ${Math.round(intent.dailyMinutes / 60 * 10) / 10} 小时）
目标水平：${levelDesc[intent.experienceLevel]}
当前水平：${currentDesc[intent.currentLevel]}

请生成一个完整的学习计划，确保：
1. 内容覆盖实现学习目标所需的所有知识点
2. 进度合理，符合每日学习时间限制
3. 包含理论学习和实践项目
4. 资源推荐以免费、优质为主`;
}

export async function generateLearningPlan(
  intent: LearningIntent,
  retries = 3
): Promise<GeneratedPlan> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(intent) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("AI 返回内容为空");
      }

      const parsed = JSON.parse(content);
      const validated = validateGeneratedPlan(parsed);

      // 计算节点位置
      validated.graphData.nodes = calculateNodePositions(validated.graphData.nodes);

      return validated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`AI 生成失败 (尝试 ${attempt + 1}/${retries}):`, lastError.message);

      // 指数退避
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  // 所有重试都失败，返回降级模板
  console.warn("AI 生成失败，使用降级模板");
  return createFallbackPlan(intent);
}

function calculateNodePositions(nodes: GeneratedPlan["graphData"]["nodes"]): GeneratedPlan["graphData"]["nodes"] {
  const dayGroups = new Map<number, typeof nodes>();

  // 按天分组
  nodes.forEach((node) => {
    const group = dayGroups.get(node.day) || [];
    group.push(node);
    dayGroups.set(node.day, group);
  });

  // 计算位置
  const result: typeof nodes = [];
  const xSpacing = 250;
  const ySpacing = 100;

  dayGroups.forEach((group, day) => {
    const x = (day - 1) * xSpacing;
    group.forEach((node, index) => {
      const y = index * ySpacing;
      result.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return result;
}

function createFallbackPlan(intent: LearningIntent): GeneratedPlan {
  const daysPerMilestone = Math.ceil(intent.totalDays / 3);

  return {
    milestones: [
      {
        id: "m1",
        dayRange: [1, daysPerMilestone],
        title: `${intent.goal} - 基础入门`,
        description: "了解基本概念和核心知识点",
        tasks: [
          {
            id: "t1",
            desc: "了解基本概念",
            timeMinutes: Math.min(60, intent.dailyMinutes),
            resources: [
              {
                type: "doc",
                title: "官方文档",
                url: "https://developer.mozilla.org",
              },
            ],
            assessment: [
              "能解释核心概念",
              "了解基本用法",
              "完成入门练习",
            ],
          },
        ],
      },
      {
        id: "m2",
        dayRange: [daysPerMilestone + 1, daysPerMilestone * 2],
        title: `${intent.goal} - 进阶学习`,
        description: "深入理解和实践应用",
        tasks: [
          {
            id: "t2",
            desc: "实践应用",
            timeMinutes: Math.min(60, intent.dailyMinutes),
            resources: [
              {
                type: "tutorial",
                title: "实践教程",
                url: "https://freecodecamp.org",
              },
            ],
            assessment: [
              "完成实践项目",
              "理解高级用法",
              "能独立解决问题",
            ],
          },
        ],
      },
      {
        id: "m3",
        dayRange: [daysPerMilestone * 2 + 1, intent.totalDays],
        title: `${intent.goal} - 综合项目`,
        description: "完成综合项目，巩固所学",
        tasks: [
          {
            id: "t3",
            desc: "完成综合项目",
            timeMinutes: Math.min(90, intent.dailyMinutes),
            resources: [
              {
                type: "doc",
                title: "项目参考",
              },
            ],
            assessment: [
              "完成项目核心功能",
              "代码质量良好",
              "能解释实现思路",
            ],
          },
        ],
      },
    ],
    graphData: {
      nodes: [
        {
          id: "n1",
          milestoneId: "m1",
          taskId: "t1",
          label: "基础入门",
          type: "task",
          day: 1,
          dependencies: [],
          position: { x: 0, y: 0 },
        },
        {
          id: "n2",
          milestoneId: "m2",
          taskId: "t2",
          label: "进阶学习",
          type: "task",
          day: daysPerMilestone + 1,
          dependencies: ["n1"],
          position: { x: 250, y: 0 },
        },
        {
          id: "n3",
          milestoneId: "m3",
          taskId: "t3",
          label: "综合项目",
          type: "task",
          day: daysPerMilestone * 2 + 1,
          dependencies: ["n2"],
          position: { x: 500, y: 0 },
        },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
      ],
    },
  };
}
