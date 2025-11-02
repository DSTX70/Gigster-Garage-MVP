import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createIntake, createPlan, executePlan, getReview } from "../utils/hub.server";
export async function action({ request }: ActionFunctionArgs){
  const form = await request.formData();
  const title = String(form.get("title") || "Demo Scaffold");
  const intake = await createIntake({ title, objective: "Spin up starter repo", due_date: new Date().toISOString(), owner: "you", template: "react-next", stack: "TS+Vite" });
  const plan = await createPlan(intake.ticket_id, { milestones: ["bootstrap","lint+test","build"], dod: "CI green + README + tokens wired", caps: { budget_usd: 100 } });
  const run = await executePlan(plan.plan_id, { autonomy: "L1", gates: true });
  const review = await getReview(run.run_id);
  return json({ intake, plan, run, review });
}
export default function Index(){
  const data = useActionData<typeof action>(); const nav = useNavigation(); const busy = nav.state !== "idle";
  return (<main className="max-w-3xl mx-auto p-6"><h1 className="text-3xl font-heading mb-4">Gigster Garage — Remix Hub Demo</h1>
    <Form method="post" className="flex gap-2 items-center"><input name="title" placeholder="Title" defaultValue="Demo Scaffold" className="border rounded-xl px-3 py-2 text-sm w-full" />
    <button disabled={busy} className="px-3 py-2 rounded-xl border text-sm">{busy ? "Running…" : "Run /intake → /plan → /execute → /review"}</button></Form>
    {data && <pre className="bg-white border rounded-xl p-4 mt-4 text-xs overflow-auto">{JSON.stringify(data,null,2)}</pre>}
    {!data && <p className="text-sm text-neutral-600 mt-3">Mock mode controlled by <code>USE_MOCKS</code> and <code>MOCK_FALLBACK</code>.</p>}
  </main>);
}