import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export const formatHuman = (date: Date | string): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: ru });
};
