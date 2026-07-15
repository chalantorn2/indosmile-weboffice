import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate, formatDate } from "./lib/adminApi";
import AgentFormModal from "./AgentFormModal";
import AgentDetailModal from "./AgentDetailModal";
import AgentPasswordModal from "./AgentPasswordModal";
import AgentRatesModal from "./AgentRatesModal";

const columnHelper = createColumnHelper();

const STATUS_STYLES = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-red-50 text-red-600",
  suspended: "bg-amber-50 text-amber-600",
};

// Bridge the legacy onToast(type, message) callback used by some agent modals to Sonner.
const toastAdapter = (type, message) => (toast[type] || toast.message)(message);

export default function Agents() {
  const queryClient = useQueryClient();

  // modal state
  const [formAgent, setFormAgent] = useState(undefined); // undefined = closed, null = create, obj = edit
  const [detailId, setDetailId] = useState(null);
  const [ratesAgent, setRatesAgent] = useState(null);
  const [passwordData, setPasswordData] = useState(null); // { data, subtitle }

  const { data: agents = [], isPending } = useQuery({
    queryKey: ["agents"],
    queryFn: () => apiGet("agents.php"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["agents"] });

  const onFormSaved = (message, generated) => {
    setFormAgent(undefined);
    toast.success(message);
    invalidate();
    if (generated) {
      setPasswordData({ data: generated, subtitle: "Give these credentials to the agent" });
    }
  };

  const openEditFromDetail = (agent) => {
    setDetailId(null);
    setFormAgent(agent);
  };

  const openRatesFromDetail = (id) => {
    const agent = agents.find((a) => a.id === id);
    setDetailId(null);
    if (agent) setRatesAgent(agent);
  };

  const passwordMutation = useMutation({
    mutationFn: (agent) => apiMutate(`agents.php/${agent.id}/generate-password`, "POST"),
    onSuccess: (data, agent) => {
      setPasswordData({
        data: { ...agent, generated_password: data.generated_password },
        subtitle: "Send the new password to the agent",
      });
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Error generating password"),
  });

  const generatePassword = (agent) => {
    if (!window.confirm(`Generate a new password for "${agent.company_name}"? Their current password will stop working immediately.`)) return;
    passwordMutation.mutate(agent);
  };

  const deleteMutation = useMutation({
    mutationFn: (agent) => apiMutate(`agents.php/${agent.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Agent deleted");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Error deleting agent"),
  });

  const deleteAgent = (agent) => {
    if (!window.confirm(`Delete agent "${agent.company_name}"? Their login and history will be removed. This cannot be undone.`)) return;
    deleteMutation.mutate(agent);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("agent_code", {
        header: "Code",
        cell: (info) => <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-navy">{info.getValue()}</code>,
      }),
      columnHelper.accessor("company_name", {
        header: "Company",
        cell: (info) => <span className="font-semibold text-navy">{info.getValue()}</span>,
      }),
      columnHelper.accessor("contact_name", {
        header: "Contact",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[info.getValue()] || "bg-gray-100 text-gray-600"}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("credentials_sent_at", {
        header: "Login Sent",
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-50 text-green-600 px-2.5 py-1 text-xs font-semibold" title={`Sent ${formatDate(info.getValue())}`}>Sent</span>
          ) : (
            <span className="rounded-full bg-amber-50 text-amber-600 px-2.5 py-1 text-xs font-semibold" title="Not emailed their login details yet">Not sent</span>
          ),
      }),
      columnHelper.accessor("last_login", {
        header: "Last Login",
        cell: ({ row, getValue }) => (
          <>
            {getValue() ? formatDate(getValue()) : <span className="text-gray-400">Never</span>}
            <span className="text-xs text-gray-400"> · {row.original.login_count || 0}</span>
          </>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => {
          const agent = row.original;
          return (
            <div className="flex gap-1.5 justify-end flex-wrap">
              <button onClick={() => setDetailId(agent.id)} className="px-2.5 py-1.5 font-body text-xs font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Details</button>
              <button onClick={() => setRatesAgent(agent)} className="px-2.5 py-1.5 font-body text-xs font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Rates</button>
              <button onClick={() => generatePassword(agent)} className="px-2.5 py-1.5 font-body text-xs font-semibold text-navy bg-yellow rounded-lg hover:brightness-95 transition-all">Password</button>
              <button onClick={() => deleteAgent(agent)} className="px-2.5 py-1.5 font-body text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({ data: agents, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Agents</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {agents.length} B2B partner{agents.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={() => setFormAgent(null)} className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all">
          + Add New Agent
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No agents yet. Click “Add New Agent” to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-navy text-white text-left">
                    {hg.headers.map((header) => (
                      <th key={header.id} className={`font-body text-sm font-semibold px-4 py-3 ${header.column.columnDef.meta?.align === "right" ? "text-right" : ""}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-yellow/5">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 font-body text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formAgent !== undefined && (
        <AgentFormModal agent={formAgent} onClose={() => setFormAgent(undefined)} onSaved={onFormSaved} />
      )}
      {detailId !== null && (
        <AgentDetailModal agentId={detailId} onClose={() => setDetailId(null)} onEdit={openEditFromDetail} onRates={openRatesFromDetail} />
      )}
      {ratesAgent && (
        <AgentRatesModal agent={ratesAgent} onClose={() => setRatesAgent(null)} onToast={toastAdapter} />
      )}
      {passwordData && (
        <AgentPasswordModal
          data={passwordData.data}
          subtitle={passwordData.subtitle}
          onClose={() => setPasswordData(null)}
          onToast={toastAdapter}
          onSent={invalidate}
        />
      )}
    </div>
  );
}
