export const formatCurrencyINR = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

/** Short format for mobile: ₹1.03L for amounts >= 1 lakh, else full format */
export const formatCurrencyShort = (value = 0) => {
  const num = Number(value) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return formatCurrencyINR(num);
};

export const formatDateIN = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const toMaskedEmail = (email = "") => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}***@${domain}`;
};
