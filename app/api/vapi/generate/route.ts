import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {

  console.log("HIT THE POST ROUTE");
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    console.log("Raw questions from AI:", questions);

    let parsedQuestions;
    try {
        parsedQuestions = JSON.parse(questions);
        console.log("Parsed questions:", parsedQuestions);
    } catch (parseError) {
        console.error("Failed to parse questions JSON:", parseError);
        return Response.json({ success: false, error: "Invalid JSON from AI" }, { status: 500 });
    }

    const interview = {
        role,
        type,
        level,
        techstack: techstack.split(","),
        questions: parsedQuestions,
        userId: userid,
        finalized: true,
        coverImage: getRandomInterviewCover(),
        createdAt: new Date().toISOString(),
    };


    console.log("Adding to Firestore project:", process.env.FIREBASE_PROJECT_ID);
    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

{/*
    sign in information

    {
    "type": "mixed",
    "role": "frontend",
    "level": "senior",
    "techstack": "next.js",
    "amount": "7",
    "userid":
    "PJ5IarwrsBgybZAFnDpbi02hbL62" -> your userID
}
    */}