import { useEffect, useState } from "react";
import { apiFetch, formatDate } from "./lib/adminApi";

function DetailCell({ label, value }) {
  return (
    <div>
      <div className="font-body text-xs text-gray-400 mb-1">{label}</div>
      <div className="font-body text-sm text-navy font-medium break-words">
        {value ? value : <span className="text-gray-300">—</span>}
      </div>
    </div>
  );
}

function Section({ title, right, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
      <div className="flex items-center mb-4">
        <h3 className="font-body text-base font-semibold text-navy">{title}</h3>
        {right && <span className="ml-auto text-xs text-gray-400">{right}</span>}
      </div>
      {children}
    </div>
  );
}

/** Read-only agent detail with login history. */
export default function AgentDetailModal({ agentId, onClose, onEdit, onRates }) {
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`agents.php/${agentId}`);
        if (data.success) setAgent(data.data);
        else setError(data.message || "Failed to load agent");
      } catch {
        setError("Error loading agent");
      }
    })();
  }, [agentId]);

  const logs = agent?.login_logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">
              {agent ? agent.company_name : "Agent Details"}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {agent ? `${agent.agent_code} • ${agent.status}` : "Contact channels and login history"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <p className="font-body text-red-600">{error}</p>}
          {!agent && !error && <p className="font-body text-gray-500">Loading...</p>}
          {agent && (
            <>
              <Section title="Contact Channels">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                  <DetailCell label="Contact Person" value={agent.contact_name} />
                  <DetailCell label="Email (login)" value={agent.email} />
                  <DetailCell label="Phone" value={agent.phone} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                  <DetailCell label="WhatsApp" value={agent.whatsapp} />
                  <DetailCell label="LINE ID" value={agent.line_id} />
                  <DetailCell label="WeChat ID" value={agent.wechat_id} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <DetailCell label="Country" value={agent.country} />
                  <DetailCell label="Travel Licence No." value={agent.license_no} />
                  <DetailCell label="Tax ID" value={agent.tax_id} />
                </div>
              </Section>

              <Section title="Address & Notes">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DetailCell label="Address" value={agent.address} />
                  <DetailCell label="Internal Notes" value={agent.notes} />
                </div>
              </Section>

              <Section
                title="Login Activity"
                right={`${agent.login_count || 0} logins • last ${agent.last_login ? formatDate(agent.last_login) : "never"} • login details ${agent.credentials_sent_at ? "emailed " + formatDate(agent.credentials_sent_at) : "never emailed"}`}
              >
                {logs.length === 0 ? (
                  <p className="font-body text-sm text-gray-400">No login attempts recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-100">
                          <th className="font-body text-xs font-semibold text-gray-500 px-3 py-2">When</th>
                          <th className="font-body text-xs font-semibold text-gray-500 px-3 py-2">Result</th>
                          <th className="font-body text-xs font-semibold text-gray-500 px-3 py-2">IP Address</th>
                          <th className="font-body text-xs font-semibold text-gray-500 px-3 py-2">Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="font-body text-sm text-gray-700 px-3 py-2">{formatDate(log.created_at)}</td>
                            <td className="px-3 py-2">
                              {Number(log.success) === 1 ? (
                                <span className="rounded-full bg-green-50 text-green-600 px-2.5 py-1 text-xs font-semibold">Success</span>
                              ) : (
                                <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-1 text-xs font-semibold">Failed</span>
                              )}
                            </td>
                            <td className="font-body text-sm text-gray-700 px-3 py-2">{log.ip_address || "-"}</td>
                            <td className="font-body text-xs text-gray-500 px-3 py-2">{(log.user_agent || "-").substring(0, 60)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Close</button>
          <button onClick={() => onRates(agentId)} className="px-5 py-2.5 font-body text-sm font-semibold text-navy bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Contract Rates</button>
          <button onClick={() => onEdit(agent)} disabled={!agent} className="px-6 py-2.5 font-body text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all disabled:opacity-50">Edit Agent</button>
        </div>
      </div>
    </div>
  );
}
