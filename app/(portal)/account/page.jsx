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

      const { data } = await supabase
        .from("customer_documents")
        .select("*")
        .eq("customer_id", customer.customer_id)
        .order("created_at", { ascending: false });

      setOrderDocs(data ?? []);
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

      {/* Header Section */}
      <div className="rounded-3xl border border-[#1e1e2e] bg-[#13131a] p-6 md:p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Company Name</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {customer?.customer_name || "Customer Name"}
            </h1>
          </div>
          <div className="flex flex-col gap-1 text-left md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Customer ID:</span>
              <span className="text-sm font-semibold text-[#6c63ff]">{customer?.display_id || "CUST-000"}</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Customer Since:</span>
              <span className="text-sm font-semibold text-white">{formatDateIN(customer?.created_at) || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1 w-8 bg-[#6c63ff] rounded-full"></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Details</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AccountField icon={User} label="Contact Person" value={customer?.contact_person} />
          <AccountField icon={Phone} label="Phone Number" value={customer?.phone_number} />
          <AccountField icon={Mail} label="Email" value={customer?.email_address} />
          <AccountField icon={MapPin} label="Billing Address" value={customer?.company_address} />
        </div>
      </div>

      {/* Document Section */}
      <div className="pt-8 border-t border-[#1e1e2e]">
        <h2 className="text-lg font-semibold text-white mb-1">Onboarding Documents</h2>
        <p className="text-sm text-slate-400 mb-6">Documents provided during your account registration.</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orderDocs.length === 0 ? (
            <EmptyDocuments message="No onboarding documents found." />
          ) : (
            orderDocs.map(doc => (
              <DocumentCard key={doc.customer_document_id} doc={doc} />
            ))
          )}
        </div>
      </div>

      {/* Sales Contact Section - Standalone at Bottom */}
      <div className="pt-8 border-t border-[#1e1e2e]">
        <div className="max-w-md">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Your Sales Contact</h3>
          <div className="flex items-start gap-4 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 shadow-sm border-l-4 border-l-amber-500">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <User size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-lg">Ajay (Ezinix Team)</p>
              <p className="mt-1 text-sm text-amber-500 font-medium tracking-wide">+91 9211957576</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-8">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 rounded-2xl bg-rose-500/10 px-8 py-4 font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all w-full md:w-auto"
        >
          <LogOut size={20} />
          Logout
        </button>
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

function DocumentCard({ doc }) {
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
            {doc.document_type || "Onboarding"}
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2e2e3e] bg-[#0a0a0f]/50 p-8 text-center w-full">
      <FileText className="mb-3 text-slate-500" size={24} />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
