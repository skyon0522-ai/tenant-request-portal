export default async ({ params: paramsPromise }: { params: Promise<{ slug: string[] }> }) => {
  return (
    <div>
      <h1>Tenant Request Portal</h1>
      <p>
        Create and track customer service requests for your demo company using the existing Payload forms.
      </p>

      <h2>Requests</h2>
      <p>Requesters can create and view requests. Staff can change their status and respond within their assigned company.</p>
      <p>
        <a href="/admin/collections/pages">Open Requests</a>
      </p>

      <h2>Synthetic local demo</h2>
      <p>These accounts and requests are test fixtures. This example does not verify a real person or connect to SSO.</p>
      <p>
        Requester: requester1@example.test. Staff: tenant1@payloadcms.com. Local demo password: demo.
      </p>
    </div>
  )
}
