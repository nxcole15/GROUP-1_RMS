import { NextRequest, NextResponse } from "next/server";

/* ── Gemini REST endpoint ── */
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

/* ── JOBERT system prompt ── */
const SYSTEM_PROMPT = `You are JOBERT, the official AI assistant of the INFORM Student Information System at Cebu Far East Institute (CFEI).

Your role is to help students understand and navigate the INFORM system. Here is exactly what the system does:

WHAT STUDENTS CAN DO IN INFORM:
- View their own grades per term (Term 1, Term 2, Term 3)
- Request their grades when the grade request window is open
- View their class schedule (Mon-Fri timetable per subject, room, and teacher)
- View their tuition fees and payment status (how much is paid and balance due)
- Request documents (e.g. Transcript of Records, Certificate of Enrollment)
- Download approved documents
- View notifications (enrollment updates, payment confirmations, grade releases, system alerts)
- View their profile (student ID, name, pathway, grade level, term, email)

GRADE REQUEST FLOW (how grades work):
1. Student opens the term and clicks "Request Grade" for a subject
2. The request is recorded as Pending
3. Teacher processes and calculates the grade, then submits it
4. Registrar reviews the grade
5. Principal reviews and approves
6. Registrar releases the grade
7. Teacher releases it to the student
8. Student can now see the released grade in My Grades

DOCUMENT REQUEST FLOW:
1. Student selects a document type from Available Documents and confirms the request
2. Status becomes Pending
3. Teacher reviews/validates the request
4. Admin approves and assigns a Release Date
5. Student sees the document under Approved Documents and can download it

GRADING SYSTEM (percentage-based):
- Grades are stored as a percentage (e.g. 92.50)
- The Philippine grading scale still applies:
  1.00 = 99-100%, 1.25 = 96-98%, 1.50 = 93-95%, 1.75 = 90-92%,
  2.00 = 87-89%, 2.25 = 84-86%, 2.50 = 81-83%, 2.75 = 78-80%,
  3.00 = 75-77% (Passing), 5.00 = Below 75% (Failed)

ENROLLMENT:
- Enrollment is managed by admin and may be open or closed depending on the current term
- Students can check if enrollment is open from the Dashboard
- The system supports Terms 1, 2, and 3 per school year

ACCOUNTS & LOGIN:
- Students log in at /login using their Student ID and password
- Teachers and admins also log in at /login using their own IDs
- If a student forgets their password or gets locked out, they should contact the school's IT or Registrar

WHAT JOBERT CANNOT DO:
- JOBERT cannot view your actual grades, schedule, or account details — those are shown in the portal
- JOBERT cannot process requests or change any data
- JOBERT can only guide you on how to use the system

SCHOOL INFORMATION:
- School: Cebu Far East Institute (CFEI)
- System name: INFORM Self-Service Student Information Kiosk

Rules:
- Only answer questions related to CFEI and the INFORM system
- If asked about something unrelated, politely say you can only help with INFORM and CFEI topics
- Keep answers concise and helpful
- Use a friendly, professional tone
- Format lists with line breaks for readability
- Always refer to yourself as JOBERT`;

/* ── Built-in fallback responses (used when no API key is set) ── */
function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("log in") || msg.includes("login") || msg.includes("sign in")) {
    return "To log in to INFORM:\n\n1. Go to the login page at /login\n2. Enter your Student ID and password\n3. Click \"Access Portal\"\n\nTeachers and admins also log in at the same page using their own IDs.\n\nIf you are locked out or forgot your password, contact your school's Registrar or IT support.";
  }

  if (msg.includes("password") || msg.includes("forgot") || msg.includes("locked")) {
    return "If you forgot your password or your account is locked:\n\n1. Contact the school Registrar or IT support\n2. Bring your school ID for verification\n\nFor security, passwords can only be reset by an authorized admin.";
  }

  if (msg.includes("grade request") || msg.includes("request grade")) {
    return "How to request your grades in INFORM:\n\n1. Go to My Grades\n2. Select the term (Term 1, 2, or 3)\n3. Click \"Request Grade\" for the subject you want\n4. Your request is submitted as Pending\n\nAfter that, the flow is:\nYou → Teacher calculates → Registrar reviews → Principal approves → Registrar releases → Teacher releases → You can view it\n\nNote: The request button only appears when the grade request window is open.";
  }

  if (msg.includes("grade") || msg.includes("gwa") || msg.includes("average")) {
    return "Your grades are shown in the My Grades section by term.\n\nPhilippine Grading Scale used in INFORM:\n\n• 1.00 = 99-100% (Highest)\n• 1.25 = 96-98%\n• 1.50 = 93-95%\n• 1.75 = 90-92%\n• 2.00 = 87-89%\n• 2.25 = 84-86%\n• 2.50 = 81-83%\n• 2.75 = 78-80%\n• 3.00 = 75-77% (Passing)\n• 5.00 = Below 75% (Failed)\n\nGrades are only visible once they have been released to you by your teacher.";
  }

  if (msg.includes("tuition") || msg.includes("pay") || msg.includes("fee") || msg.includes("balance")) {
    return "Your tuition fee details are in the Tuition Fee section of your portal.\n\nYou can see:\n• Total fees\n• Amount already paid\n• Remaining balance\n• Individual fee items and their payment status\n\nFor payment transactions, coordinate with the school Cashier directly.";
  }

  if (msg.includes("enrollment") || msg.includes("enroll")) {
    return "Enrollment in INFORM:\n\n• The admin controls when enrollment opens and closes each term\n• You can check if enrollment is currently open from your Dashboard\n• The system supports Term 1, Term 2, and Term 3 per school year\n\nIf you have questions about enrollment requirements or deadlines, contact the school Registrar.";
  }

  if (msg.includes("schedule") || msg.includes("class") || msg.includes("timetable")) {
    return "Your class schedule is in the My Schedule section.\n\nIt shows:\n• Your subjects per day (Monday to Friday)\n• Time and room for each class\n• Your subject teacher\n\nSchedules are set by the admin and assigned to your account.";
  }

  if (msg.includes("document") || msg.includes("tor") || msg.includes("transcript") || msg.includes("certificate")) {
    return "How to request a document in INFORM:\n\n1. Go to the Documents section\n2. Find the document type you need under Available Documents\n3. Click to request it and confirm\n4. Your request becomes Pending\n5. It goes through Teacher review → Admin approval → Release Date is set\n6. Once approved, you can download it from the Approved Documents list\n\nDocument types available depend on what the admin has set up in the system.";
  }

  if (msg.includes("notification")) {
    return "Your notifications are in the Notifications section.\n\nYou will receive alerts for:\n• Enrollment updates\n• Payment confirmations\n• Grade releases\n• Document request status changes\n• System announcements\n\nYou can mark notifications as read or dismiss them.";
  }

  if (msg.includes("profile")) {
    return "Your profile shows your basic account information:\n\n• Student ID\n• Full name\n• Pathway and grade level\n• Current term\n• Email address\n\nTo update your profile details, contact the school Registrar or admin.";
  }

  if (msg.includes("what can") || msg.includes("what do") || msg.includes("feature") || msg.includes("help")) {
    return "Here is what INFORM lets you do:\n\n• My Grades — view released grades per term and request grades when open\n• My Schedule — see your class timetable (day, time, room, teacher)\n• Tuition Fee — check your fees, payments, and balance\n• Documents — request and download official documents\n• Notifications — stay updated on grades, payments, and announcements\n• My Profile — view your student information\n\nWhat would you like help with?";
  }

  return "Hi! I am JOBERT, your INFORM assistant at Cebu Far East Institute.\n\nI can help you with:\n\n• Logging in to INFORM\n• How grades and grade requests work\n• Viewing your class schedule\n• Tuition fees and payments\n• Requesting documents\n• Enrollment status\n• Notifications and profile\n\nWhat would you like to know?";
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== JOBERT API CALLED (Gemini) ===");

    const { message, history } = await req.json();
    console.log("Message received:", message);

    /* ── No API key: use built-in fallback ── */
    if (!GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY set — using fallback responses");
      const reply = getFallbackReply(message);
      return NextResponse.json({ reply });
    }

    /* ── Build conversation turns for Gemini ── */
    const historyTurns = (history || [])
      .slice(-6)
      .filter((m: { role: string; text: string }) => m.text?.trim())
      .map((m: { role: string; text: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        ...historyTurns,
        { role: "user", parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    console.log("Sending request to Gemini API...");
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      /* Fall back to built-in reply on API error */
      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    const data = await response.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      getFallbackReply(message);

    return NextResponse.json({ reply: text.trim() });
  } catch (err) {
    console.error("JOBERT route error:", err);
    /* Return a helpful fallback instead of a 500 error */
    try {
      const { message } = await req.json().catch(() => ({ message: "" }));
      return NextResponse.json({ reply: getFallbackReply(message ?? "") });
    } catch {
      return NextResponse.json({
        reply: "I'm having trouble right now. Please try again in a moment.",
      });
    }
  }
}
