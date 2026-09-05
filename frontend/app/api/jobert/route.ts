import { NextRequest, NextResponse } from "next/server";

/* ── Gemini REST endpoint ── */
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

/* ── JOBERT system prompt ── */
const SYSTEM_PROMPT = `You are JOBERT, the official AI assistant of the INFORM Student Information System at Benedicto College (Cebu, Philippines).

Your role is to help students with questions about:
- How to log in (Student ID is a 9-digit number, numbers only)
- Viewing grades and understanding the Philippine grading scale (1.00 highest, 5.00 failed, 3.00 passing at 75%)
- Class schedule (Mon-Fri timetable)
- Tuition fees and payments
- Library books (borrowing, returning, due dates)
- Enrollment (currently open, deadline June 15, 2026)
- Requesting documents (TOR, Certificate of Enrollment, Good Moral, Diploma)
- Scholarships (Academic Excellence, Financial Assistance, Government Voucher)
- Lost ID replacement (go to Registrar, PHP 150 fee)
- Campus services (Clinic, Guidance Office, Canteen, Gym)
- Academic calendar (1st Sem: Aug 2025 - Jan 2026, 2nd Sem: Feb - Jun 2026)
- Admin access centralized at /login, for staff only
- Contact info (Registrar: registrar@inform.edu, Room 101 Admin Bldg, Mon-Fri 8AM-5PM)
- IT Help Desk: helpdesk@inform.edu, Room 010 Admin Bldg
- Cashier: Room 102 Admin Bldg, Mon-Fri 8AM-4PM

Use your institution-issued student or staff credentials to sign in.

Benedicto College offers:
- Academic Track and Technical Professional Track (SHS)
- Guaranteed No Tuition Fee for incoming Grade 11 students from public schools (SY 2026-2027)
- CESA Esports League teams: BC Cheetahs (MLBB) and BC Valorant team
- Website: https://benedictocollege.edu.ph
- Facebook: /BENEDICTO COLLEGE
- Phone: 032 345 6873
- Mobile: +63 908 899 8600

Rules:
- Only answer questions related to Benedicto College and the INFORM system
- If asked about something unrelated, politely say you can only help with INFORM and Benedicto College topics
- Keep answers concise and helpful
- Use a friendly, professional tone
- Format lists with line breaks for readability
- Always refer to yourself as JOBERT`;

/* ── Built-in fallback responses (used when no API key is set) ── */
function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("log in") || msg.includes("login") || msg.includes("sign in")) {
    return "To log in to INFORM:\n\n1. Go to the login page\n2. Enter your Student ID, teacher ID, or admin ID\n3. Enter your password\n4. Click \"Access Portal\"\n\nNeed more help? Contact IT Help Desk at helpdesk@inform.edu or Room 010 Admin Bldg.";
  }
  if (msg.includes("password") || msg.includes("forgot")) {
    return "If you forgot your password:\n\n1. Contact the IT Help Desk at helpdesk@inform.edu\n2. Visit Room 010, Admin Building (Mon-Fri, 8AM-5PM)\n3. Bring your school ID or employee ID for verification";
  }
  if (msg.includes("grade") || msg.includes("gwa") || msg.includes("average")) {
    return "Philippine Grading Scale at Benedicto College:\n\n• 1.00 = 99-100% (Highest)\n• 1.25 = 96-98%\n• 1.50 = 93-95%\n• 1.75 = 90-92%\n• 2.00 = 87-89%\n• 2.25 = 84-86%\n• 2.50 = 81-83%\n• 2.75 = 78-80%\n• 3.00 = 75-77% (Passing)\n• 5.00 = Below 75% (Failed)\n\nYour GWA is the average of all your subject grades.";
  }
  if (msg.includes("tuition") || msg.includes("pay") || msg.includes("fee")) {
    return "To pay your tuition fees:\n\n1. Go to the Cashier's Office — Room 102, Admin Building\n2. Hours: Mon-Fri, 8AM-4PM\n3. You can also pay via online banking (ask the Cashier for details)\n\nFee breakdown (per semester):\n• Tuition Fee: ₱18,500\n• Miscellaneous: ₱2,200\n• Laboratory: ₱1,500\n• Library: ₱500\n• Student Activity: ₱800\n• ID/Registration: ₱350";
  }
  if (msg.includes("enrollment") || msg.includes("enroll")) {
    return "Enrollment Information:\n\n• Status: Currently OPEN\n• Deadline: June 15, 2026\n• Where: Registrar's Office, Room 101 Admin Bldg\n• Hours: Mon-Fri, 8AM-5PM\n\nRequirements:\n• Previous semester grades\n• Cleared balance (no outstanding fees)\n• Accomplished enrollment form\n\nContact: registrar@inform.edu";
  }
  if (msg.includes("schedule") || msg.includes("class") || msg.includes("timetable")) {
    return "Your class schedule is available in the Dashboard under \"View Schedule\".\n\nAcademic Calendar:\n• 1st Semester: Aug 2025 – Jan 2026\n• 2nd Semester: Feb – Jun 2026\n\nClasses run Mon-Fri. Check your specific timetable in the Schedule section of your portal.";
  }
  if (msg.includes("library") || msg.includes("book") || msg.includes("borrow")) {
    return "Library Services:\n\n• Location: Library Building, Ground Floor\n• Hours: Mon-Fri, 7AM-6PM\n• Borrowing limit: 3 books at a time\n• Loan period: 7 days\n• Late return penalty: ₱5/day per book\n\nTo borrow: Present your school ID at the library counter.\nTo return: Bring the book to the same counter before the due date.";
  }
  if (msg.includes("tor") || msg.includes("transcript") || msg.includes("document") || msg.includes("certificate")) {
    return "Document Requests (Registrar's Office, Room 101):\n\n• Transcript of Records (TOR): ₱150, 3-5 working days\n• Certificate of Enrollment: ₱50, same day\n• Good Moral Certificate: ₱50, 1-2 working days\n• Diploma: Available after graduation clearance\n\nBring your school ID and fill out a request form. Contact: registrar@inform.edu";
  }
  if (msg.includes("scholarship")) {
    return "Available Scholarships at Benedicto College:\n\n1. Academic Excellence Scholarship\n   • For students with GWA of 1.50 or higher\n   • Covers 50-100% of tuition\n\n2. Financial Assistance Grant\n   • For students with financial need\n   • Submit income certificate from parents\n\n3. Government Voucher (SHS)\n   • For incoming Grade 11 from public schools\n   • No tuition fee for SY 2026-2027\n\nApply at the Registrar's Office.";
  }
  if (msg.includes("contact") || msg.includes("office") || msg.includes("help")) {
    return "Benedicto College Contact Information:\n\n📍 Registrar's Office\n   Room 101, Admin Building\n   registrar@inform.edu\n   Mon-Fri, 8AM-5PM\n\n💻 IT Help Desk\n   Room 010, Admin Building\n   helpdesk@inform.edu\n\n💰 Cashier\n   Room 102, Admin Building\n   Mon-Fri, 8AM-4PM\n\n📞 032 345 6873\n📱 +63 908 899 8600\n🌐 benedictocollege.edu.ph";
  }
  if (msg.includes("id") && (msg.includes("lost") || msg.includes("replace") || msg.includes("replacement"))) {
    return "Lost ID Replacement:\n\n1. Go to the Registrar's Office (Room 101, Admin Bldg)\n2. Fill out a lost ID form\n3. Pay the replacement fee: ₱150 at the Cashier\n4. Present your receipt to the Registrar\n5. New ID will be ready in 3-5 working days";
  }
  if (msg.includes("demo") || msg.includes("account") || msg.includes("test")) {
    return "This system is configured for real institutional accounts. Please use your assigned ID and password to access the portal.";
  }

  return "I'm JOBERT, your INFORM assistant at Benedicto College! I can help you with:\n\n• Logging in to INFORM\n• Grades and GWA\n• Class schedule\n• Tuition fees and payments\n• Library services\n• Enrollment\n• Document requests\n• Scholarships\n• Contact information\n\nWhat would you like to know?";
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
