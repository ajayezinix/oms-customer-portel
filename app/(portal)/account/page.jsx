"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, User, Building2, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { formatDateIN } from "@/lib/format";

export default function AccountPage() {
  const { customer, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderDocs, setOrderDocs] = useState([]);
  const [returnDocs, setReturnDocs] = useState([]);
  const [orderMap, setOrderMap] = useState({});
  const [returnMap, setReturnMap] = useState({});

  useEffect(() => {
    const loadDocuments = async () => {
      if (!customer?.customer_id) return;
      setLoading(true);

      const [{ data: orders }, { data: returns }] = await Promise.all([
        supabase.from("orders").select("order_id,display_id").eq("customer_id", customer.customer_id),
        supabase.from("returns").select("return_id,display_id").eq("customer_id", customer.customer_id),
      ]);

      const orderRows = orders ?? [];
      const returnRows = returns ?? [];

      const nextOrderMap = {};
      const nextReturnMap = {};
      orderRows.forEach((row) => {
        nextOrderMap[row.order_id] = row.display_id || row.order_id.slice(0, 8);
      });
      returnRows.forEach((row) => {
        nextReturnMap[row.return_id] = row.display_id || row.return_id.slice(0, 8);
      });
      setOrderMap(nextOrderMap);
      setReturnMap(nextReturnMap);

      const [{ data: orderDocuments }, { data: returnDocuments }] = await Promise.all([
        orderRows.length
          ? supabase
              .from("order_documents")
              .select("order_document_id,order_id,document_category,file_name,file_url,created_at")
              .in(
                "order_id",
                orderRows.map((row) => row.order_id)
              )
              .order("created_at", { ascending: false })
          : { data: [] },
        returnRows.length
          ? supabase
              .from("return_documents")
              .select("return_document_id,return_id,file_name,file_url,created_at")
              .in(
                "return_id",
                returnRows.map((row) => row.return_id)
              )
              .order("created_at", { ascending: false })
          : { data: [] },
      ]);

      setOrderDocs(orderDocuments ?? []);
      setReturnDocs(returnDocuments ?? []);
      setLoading(false);
    };

    loadDocuments();
  }, [customer?.customer_id, supabase]);

  const totalDocs = useMemo(() => orderDocs.length + returnDocs.length, [orderDocs.length, returnDocs.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-slate-400">Customer profile and related documents.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={User} label="Customer Name" value={customer?.customer_name} />
        <InfoCard icon={Building2} label="Contact Person" value={customer?.contact_person} />
        <InfoCard icon={Mail} label="Email" value={customer?.email_address} />
        <InfoCard icon={Phone} label="Phone" value={customer?.phone_number} />
        <InfoCard
          icon={MapPin}
          label="Company Address"
          value={customer?.company_address}
          fullWidth
        />
      </section>

      <section className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <p className="text-sm text-slate-400">Total Documents</p>
        <p className="mt-2 text-2xl font-semibold">{totalDocs}</p>
      </section>

      <section className="space-y-4 rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <h2 className="font-semibold">Order Documents</h2>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : orderDocs.length === 0 ? (
          <EmptyDocuments message="No order documents uploaded yet." />
        ) : (
          <DocumentTable
            rows={orderDocs.map((doc) => ({
              id: doc.order_document_id,
              name: doc.file_name,
              relatedId: orderMap[doc.order_id],
              category: doc.document_category,
              date: doc.created_at,
              url: doc.file_url,
            }))}
            relatedLabel="Order"
          />
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <h2 className="font-semibold">Return Documents</h2>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : returnDocs.length === 0 ? (
          <EmptyDocuments message="No return documents uploaded yet." />
        ) : (
          <DocumentTable
            rows={returnDocs.map((doc) => ({
              id: doc.return_document_id,
              name: doc.file_name,
              relatedId: returnMap[doc.return_id],
              category: "return_document",
              date: doc.created_at,
              url: doc.file_url,
            }))}
            relatedLabel="Return"
          />
        )}
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div className={`rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4 ${fullWidth ? "md:col-span-2" : ""}`}>
      <p className="inline-flex items-center gap-2 text-sm text-slate-400">
        <Icon size={15} />
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-white">{value || "-"}</p>
    </div>
  );
}

function DocumentTable({ rows, relatedLabel }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="py-2">File</th>
            <th>{relatedLabel} ID</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#1e1e2e]">
              <td className="py-3">{row.name}</td>
              <td>{row.relatedId || "-"}</td>
              <td className="capitalize">{String(row.category).replace("_", " ")}</td>
              <td>{formatDateIN(row.date)}</td>
              <td>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-[#6c63ff] px-3 py-1.5 text-xs text-white"
                >
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyDocuments({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-[#2a2a3f] p-6 text-center text-sm text-slate-400">
      <FileText className="mx-auto mb-2" size={18} />
      {message}
    </div>
  );
}
