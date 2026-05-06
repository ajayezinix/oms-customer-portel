"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, User, Building2, Mail, Phone, MapPin, Download } from "lucide-react";
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
    <div className="space-y-6 md:space-y-8">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-slate-400">Customer profile and related documents.</p>
      </div>

      <section className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={Building2} label="Company Name" value={customer?.company_name} fullWidth />
        <InfoCard icon={User} label="Contact Person" value={customer?.contact_person} />
        <InfoCard icon={Mail} label="Email Address" value={customer?.email_address} />
        <InfoCard icon={Phone} label="Phone Number" value={customer?.phone_number} />
        <InfoCard
          icon={MapPin}
          label="Billing Address"
          value={customer?.company_address}
          fullWidth
        />
      </section>

      <section className="rounded-2xl border border-[#1e1e2e] bg-gradient-to-br from-[#13131a] to-[#1a1a2e] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a0f] border border-[#2e2e3e]">
            <FileText className="text-[#6c63ff]" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Documents</p>
            <p className="text-3xl font-bold text-white">{totalDocs}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Order Documents</h2>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : orderDocs.length === 0 ? (
          <EmptyDocuments message="No order documents uploaded yet." />
        ) : (
          <DocumentList
            docs={orderDocs.map((doc) => ({
              id: doc.order_document_id,
              name: doc.file_name,
              relatedId: orderMap[doc.order_id],
              category: doc.document_category,
              date: doc.created_at,
              url: doc.file_url,
            }))}
            relatedLabel="Ord"
          />
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Return Documents</h2>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : returnDocs.length === 0 ? (
          <EmptyDocuments message="No return documents uploaded yet." />
        ) : (
          <DocumentList
            docs={returnDocs.map((doc) => ({
              id: doc.return_document_id,
              name: doc.file_name,
              relatedId: returnMap[doc.return_id],
              category: "return_document",
              date: doc.created_at,
              url: doc.file_url,
            }))}
            relatedLabel="Ret"
          />
        )}
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div className={`flex items-start gap-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-sm transition-colors hover:bg-[#1a1a2e]/50 ${fullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[#6c63ff]">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm md:text-base font-medium text-white">{value || "-"}</p>
      </div>
    </div>
  );
}

function DocumentList({ docs, relatedLabel }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-4 transition-all hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e]"
        >
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="shrink-0 rounded bg-[#2e2e3e] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {relatedLabel}: {doc.relatedId || "-"}
              </span>
              <span className="truncate text-xs text-slate-400 capitalize">
                {String(doc.category).replace("_", " ")}
              </span>
            </div>
            <p className="truncate text-sm font-medium text-white group-hover:text-[#6c63ff] transition-colors">
              {doc.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatDateIN(doc.date)}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e1e2e] text-slate-400 group-hover:bg-[#6c63ff] group-hover:text-white transition-colors">
            <Download size={16} />
          </div>
        </a>
      ))}
    </div>
  );
}

function EmptyDocuments({ message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2e2e3e] bg-[#0a0a0f]/50 p-8 text-center">
      <FileText className="mb-3 text-slate-500" size={24} />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
