export function GET() {
  return Response.json(
    {
      status: "healthy",
      service: "community-manager-web",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
