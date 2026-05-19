const padDatePart = (value: number) => String(value).padStart(2, "0");

export const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateInputValue = () => {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
};

export const isValidDateInputValue = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && toDateInputValue(parsed) === value;
};

export const isBookableDateRange = (
  startDate: string,
  endDate: string,
  minimumStartDate = getTomorrowDateInputValue(),
) =>
  isValidDateInputValue(startDate) &&
  isValidDateInputValue(endDate) &&
  startDate >= minimumStartDate &&
  endDate >= startDate;
