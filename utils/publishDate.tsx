// validate post date with helpful error messages

type DateValidater = (date: string) => RegExpMatchArray


export const validateDate: DateValidater = (date) => {
  const validDateFormat = /^(?<year>\d{4})\.(?<month>\d{2})\.(?<day>\d{2})$/;

  if (!validDateFormat.test(date))
    throw new Error(
      `publish data ${date} should be in the format year.month.day format such as 2021.12.01`
    );

  const dateObject = date.match(validDateFormat);

  if (Number(dateObject.groups.month) > 12)
    throw new Error(
      "The month in your publish date for a post is greater than 12"
    );

  if (Number(dateObject.groups.day) > 31)
    throw new Error(
      "The day in your publish date for a post is greater than 31"
    );

  if (
    dateObject.groups.day.length !== 2 ||
    dateObject.groups.month.length !== 2
  )
    throw new Error(
      "All days and months in the publish dates need to be two digits"
    );

  return dateObject;
};

type DateComparer = (pd1: RegExpMatchArray, pd2: RegExpMatchArray) => 1 | -1 | 0;

export const latestFirst: DateComparer = (pd1, pd2) => {
  for (let index = 1; index <= 3; index++) {
    if (Number(pd1[index]) < Number(pd2[index])) return 1;
    else if (Number(pd1[index]) > Number(pd2[index])) return -1;
  }
  return 0;
};
