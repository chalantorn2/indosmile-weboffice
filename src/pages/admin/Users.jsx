import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiGet, apiMutate, formatDate } from "./lib/adminApi";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

const columnHelper = createColumnHelper();

const ROLE_STYLES = {
  admin: "bg-navy/10 text-navy",
  staff: "bg-blue-50 text-blue-600",
};

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block font-body text-sm font-semibold text-navy mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : (
        hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);

  // Password is required on create, optional on edit; when present it must be 6+ chars.
  const schema = useMemo(
    () =>
      z.object({
        full_name: z.string().trim().min(1, "Full name is required"),
        username: z.string().trim().min(1, "Username is required"),
        email: z.string().trim().min(1, "Email is required").email("Invalid email"),
        role: z.enum(["staff", "admin"]),
        status: z.enum(["active", "inactive"]),
        password: isEdit
          ? z.string().refine((v) => v === "" || v.length >= 6, "Min 6 characters")
          : z.string().min(6, "Min 6 characters"),
      }),
    [isEdit]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.full_name || "",
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "staff",
      status: user?.status || "active",
      password: "",
    },
  });

  useEffect(() => {
    reset({
      full_name: user?.full_name || "",
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "staff",
      status: user?.status || "active",
      password: "",
    });
  }, [user, reset]);

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        username: values.username.trim(),
        email: values.email.trim(),
        full_name: values.full_name.trim(),
        role: values.role,
        status: values.status,
      };
      if (values.password) payload.password = values.password;
      return apiMutate(isEdit ? `users.php/${user.id}` : "users.php", isEdit ? "PUT" : "POST", payload);
    },
    onSuccess: () => onSaved(isEdit ? "User updated" : "User created"),
    onError: (err) => toast.error(err.message || "Error saving user. Please try again."),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">{isEdit ? "Edit User" : "Add New User"}</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {isEdit ? "Update user account details" : "Create a new admin account"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <form id="userForm" onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
            <h3 className="font-body text-base font-semibold text-navy mb-4">Account Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Full Name" required error={errors.full_name?.message}>
                <input className={inputClass} {...register("full_name")} placeholder="e.g. John Doe" />
              </Field>
              <Field label="Username" required error={errors.username?.message}>
                <input className={inputClass} {...register("username")} placeholder="e.g. johndoe" />
              </Field>
            </div>
            <div className="mb-4">
              <Field label="Email" required error={errors.email?.message}>
                <input type="email" className={inputClass} {...register("email")} placeholder="e.g. john@example.com" />
              </Field>
            </div>
            <Field
              label="Password"
              required={!isEdit}
              hint={isEdit ? "Leave blank to keep current password" : "Min 6 characters"}
              error={errors.password?.message}
            >
              <input type="password" className={inputClass} {...register("password")} placeholder="Min 6 characters" />
            </Field>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-body text-base font-semibold text-navy mb-4">Role & Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Role" required>
                <select className={inputClass} {...register("role")}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} {...register("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
          <button type="submit" form="userForm" disabled={saveMutation.isPending} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {saveMutation.isPending ? "Saving..." : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [formUser, setFormUser] = useState(undefined); // undefined closed, null create, obj edit

  const { data: users = [], isPending } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet("users.php"),
  });

  const openEdit = async (id) => {
    try {
      const data = await apiGet(`users.php/${id}`);
      setFormUser(data);
    } catch {
      toast.error("Error loading user");
    }
  };

  const onSaved = (message) => {
    setFormUser(undefined);
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (user) => apiMutate(`users.php/${user.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(err.message || "Error deleting user"),
  });

  const remove = (user) => {
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    deleteMutation.mutate(user);
  };

  const selfId = Number(admin.id);

  const columns = useMemo(
    () => [
      columnHelper.accessor("full_name", {
        header: "Name",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-body text-xs font-semibold">
              {initials(getValue() || row.original.username)}
            </div>
            <span className="font-body text-sm text-gray-700">{getValue() || "-"}</span>
          </div>
        ),
      }),
      columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-navy">{info.getValue()}</code>,
      }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ROLE_STYLES[info.getValue()] || "bg-gray-100 text-gray-600"}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${info.getValue() === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("last_login", {
        header: "Last Login",
        cell: (info) => (info.getValue() ? formatDate(info.getValue()) : <span className="text-gray-400">Never</span>),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end items-center">
            <button onClick={() => openEdit(row.original.id)} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all">Edit</button>
            {Number(row.original.id) !== selfId ? (
              <button onClick={() => remove(row.original)} className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
            ) : (
              <span className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-semibold">You</span>
            )}
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selfId]
  );

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Users</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {users.length} admin account{users.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={() => setFormUser(null)} className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all">
          + Add New User
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-navy text-white text-left">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`font-body text-sm font-semibold px-4 py-3 ${header.column.columnDef.meta?.align === "right" ? "text-right" : ""}`}
                      >
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

      {formUser !== undefined && (
        <UserFormModal user={formUser} onClose={() => setFormUser(undefined)} onSaved={onSaved} />
      )}
    </div>
  );
}
