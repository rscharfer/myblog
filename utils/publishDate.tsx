// validate post date with helpful error messages

type DateValidator = (date: string) => Date;

export const validateDate: DateValidator = (date) => {
  const validDateFormat = /^[A-Za-z]+ \d{1,2}, \d{4}$/;

  if (!validDateFormat.test(date))
    throw new Error(
      `publish date "${date}" should be in the format "Month D, YYYY" such as "April 7, 2026"`
    );

  const parsed = new Date(date);
  if (isNaN(parsed.getTime()))
    throw new Error(`publish date "${date}" is not a valid date`);

  return parsed;
};

type DateComparer = (pd1: Date, pd2: Date) => 1 | -1 | 0;

export const latestFirst: DateComparer = (pd1, pd2) => {
  if (pd1 < pd2) return 1;
  if (pd1 > pd2) return -1;
  return 0;
};
