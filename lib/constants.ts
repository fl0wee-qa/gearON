export const SITE_NAME = "gearON";

export const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "FULFILLED",
] as const;

export const TRANSITION_DEFAULT = "transition-all duration-200";
