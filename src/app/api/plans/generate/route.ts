import { NextRequest, NextResponse } from "next/server";
import { generatePlanWithRetry } from "@/lib/ai-langchain";
import { validateLearningIntent } from "@/lib/validators";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const intent = validateLearningIntent(body);

    console.log("Generating learning plan for:", intent.goal);
    const plan = await generatePlanWithRetry(intent);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Generate plan error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
