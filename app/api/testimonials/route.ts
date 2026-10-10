import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    testimonials: [
      {
        id: "t1",
        name: "Rhea & Arjun",
        testimonial: "The final miniature looked exactly like our wedding photo and now sits beautifully in our living room.",
        rating: 5,
      },
      {
        id: "t2",
        name: "Nisha",
        testimonial: "We ordered a custom family piece and couldn’t be happier with the detailing and finish.",
        rating: 5,
      },
    ],
  });
}
