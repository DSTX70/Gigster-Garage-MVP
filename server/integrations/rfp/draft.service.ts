export async function createProposalDraft(input:{ rfpId:string; client:string; dueDate:string; scope:string; attachments?:string[] }) {
  // TODO: persist draft & link attachments; emit audit
  return { ok: true, proposalId: `prop_${Date.now()}` };
}
