import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取技能
export async function GET() {
  try {
    const userId = "demo-user";

    const skills = await prisma.manualSkill.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to get skills" },
      { status: 500 }
    );
  }
}

// 添加技能
export async function POST(request: NextRequest) {
  try {
    const userId = "demo-user";
    const body = await request.json();
    const { name, description, category, level } = body;

    const skill = await prisma.manualSkill.create({
      data: {
        userId,
        name,
        description,
        category,
        level: level || 1,
      },
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

// 删除技能
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    await prisma.manualSkill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
