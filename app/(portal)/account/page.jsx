"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, User, Building2, Mail, Phone, MapPin, Download, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { formatDateIN } from "@/lib/format";

export default function AccountPage() {
  const { customer, supabase, logout } = useAuth();
  const router = useRouter();
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
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Mobile Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors md:hidden"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-slate-400">Customer profile and related documents.</p>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center py-4 md:items-start md:text-left md:flex-row md:gap-6 md:bg-[#13131a] md:p-8 md:rounded-3xl md:border md:border-[#1e1e2e]">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6c63ff] text-4xl font-bold text-white mb-4 md:mb-0 shadow-lg shadow-[#6c63ff]/20">
          {customer?.customer_name?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{customer?.customer_name || "Customer Name"}</h2>
          <p className="text-slate-400 font-medium">{customer?.company_name || "Company Name"}</p>
          <div className="hidden md:flex gap-4 mt-4">
             <div className="px-3 py-1 bg-[#1a1a2e] rounded-full text-xs font-semibold text-[#6c63ff] border border-[#6c63ff]/20">
               ID: {customer?.display_id || "CUST-000"}
             </div>
             <div className="px-3 py-1 bg-[#1a1a2e] rounded-full text-xs font-semibold text-emerald-400 border border-emerald-400/20">
               Active
             </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Your Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-8 bg-[#6c63ff] rounded-full"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Your Details</h3>
          </div>
          <div className="grid gap-3">
            <AccountField icon={Mail} label="Email Address" value={customer?.email_address} />
            <AccountField icon={Phone} label="Phone Number" value={customer?.phone_number} />
            <AccountField icon={MapPin} label="Billing Address" value={customer?.company_address} />
            <AccountField icon={User} label="Contact Person" value={customer?.contact_person} />
          </div>
        </div>

        {/* Account Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Account Info</h3>
          </div>
          <div className="grid gap-3">
            <AccountField icon={FileText} label="Customer ID" value={customer?.display_id || "CUST-000"} />
            <AccountField icon={Download} label="Customer Since" value={formatDateIN(customer?.created_at) || "N/A"} />
            
            {/* Sales Contact */}
            <div className="flex items-start gap-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <User size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your Sales Contact</p>
                <p className="mt-1 font-bold text-white">Ajay (Ezinix Team)</p>
                <a href="tel:+919211957576" className="text-sm text-amber-500 font-medium hover:underline">+91 9211957576</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-rose-500/10 p-4 font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all md:max-w-xs"
      >
        <LogOut size={20} />
        Logout
      </button>

      {/* Document Section (Moved to Bottom or could be separate tab) */}
      <div className="pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Documents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orderDocs.length === 0 && returnDocs.length === 0 ? (
            <EmptyDocuments message="No documents found." />
          ) : (
            <>
              {orderDocs.map(doc => (
                <DocumentCard key={doc.order_document_id} doc={doc} relatedId={orderMap[doc.order_id]} />
              ))}
              {returnDocs.map(doc => (
                <DocumentCard key={doc.return_document_id} doc={doc} relatedId={returnMap[doc.return_id]} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 shadow-sm transition-all hover:border-[#6c63ff]/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[#6c63ff]">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-white">{value || "-"}</p>
      </div>
    </div>
  );
}

function DocumentCard({ doc, relatedId }) {
  return (
    <a
      href={doc.file_url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-4 transition-all hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e]"
    >
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="shrink-0 rounded bg-[#2e2e3e] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            #{relatedId || "-"}
          </span>
        </div>
        <p className="truncate text-sm font-medium text-white group-hover:text-[#6c63ff] transition-colors">
          {doc.file_name}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e1e2e] text-slate-400 group-hover:bg-[#6c63ff] group-hover:text-white transition-colors">
        <Download size={16} />
      </div>
    </a>
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
