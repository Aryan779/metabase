import { t } from "ttag";
import moment from "moment-timezone";

import type { Database } from "metabase-types/api/database";
import { HelpText, HelpTextConfig } from "metabase-lib/expressions/types";

const getDescriptionForNow = (database: Database, reportTimezone: string) => {
  const hasTimezoneFeatureFlag = database.features.includes("set-timezone");
  const timezone = hasTimezoneFeatureFlag ? reportTimezone : "UTC";
  const nowAtTimezone = getNowAtTimezone(timezone, reportTimezone);

  // H2 is the only DBMS we support where:
  // · set-timezone isn't a feature, and
  // · it's possible for now to be in the system timezone, not UTC.
  // also H2 is not recommended for use in production, so for now we skip
  // deeper logic to support displaying timestamps in it.
  if (database.engine === "h2") {
    return t`Returns the current timestamp (in milliseconds).`;
  } else {
    return t`Returns the current timestamp (in milliseconds). Currently ${nowAtTimezone} in ${timezone}.`;
  }
};

const helperTextStrings: HelpTextConfig[] = [
  {
    name: "count",
    structure: "Count",
    description: () => t`Returns the count of rows in the selected data.`,
    example: "Count",
    args: [],
  },
  {
    name: "cum-count",
    structure: "CumulativeCount",
    description: () => t`The additive total of rows across a breakout.`,
    example: "CumulativeCount",
    args: [],
  },
  {
    name: "sum",
    structure: "Sum(" + t`column` + ")",
    description: () => t`Adds up all the values of the column.`,
    example: "Sum([" + t`Subtotal` + "])",
    args: [{ name: t`column`, description: t`The column or number to sum.` }],
  },
  {
    name: "cum-sum",
    structure: "CumulativeSum(" + t`column` + ")",
    description: () => t`The rolling sum of a column across a breakout.`,
    example: "CumulativeSum([" + t`Subtotal` + "])",
    args: [{ name: t`column`, description: t`The column or number to sum.` }],
  },
  {
    name: "distinct",
    structure: "Distinct(" + t`column` + ")",
    description: () => t`The number of distinct values in this column.`,
    example: "Distinct([" + t`Last Name` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column whose distinct values to count.`,
      },
    ],
  },
  {
    name: "stddev",
    structure: "StandardDeviation(" + t`column` + ")",
    description: () => t`Calculates the standard deviation of the column.`,
    example: "StandardDeviation([" + t`Population` + "])",
    args: [
      {
        name: t`column`,
        description: t`The numeric column to get standard deviation of.`,
      },
    ],
  },
  {
    name: "avg",
    structure: "Average(" + t`column` + ")",
    description: () => t`Returns the average of the values in the column.`,
    example: "Average([" + t`Quantity` + "])",
    args: [
      {
        name: t`column`,
        description: t`The numeric column whose values to average.`,
      },
    ],
  },
  {
    name: "min",
    structure: "Min(" + t`column` + ")",
    description: () => t`Returns the smallest value found in the column`,
    example: "Min([" + t`Salary` + "])",
    args: [
      {
        name: t`column`,
        description: t`The numeric column whose minimum you want to find.`,
      },
    ],
  },
  {
    name: "max",
    structure: "Max(" + t`column` + ")",
    description: () => t`Returns the largest value found in the column.`,
    example: "Max([" + t`Age` + "])",
    args: [
      {
        name: t`column`,
        description: t`The numeric column whose maximum you want to find.`,
      },
    ],
  },
  {
    name: "share",
    structure: "Share(" + t`condition` + ")",
    description: () =>
      t`Returns the percent of rows in the data that match the condition, as a decimal.`,
    example: "Share([" + t`Source` + '] = "' + t`Google` + '")',
    args: [
      {
        name: t`condition`,
        description: t`Something that should evaluate to true or false.`,
      },
    ],
  },
  {
    name: "count-where",
    structure: "CountIf(" + t`condition` + ")",
    description: () => t`Only counts rows where the condition is true.`,
    example: "CountIf([" + t`Subtotal` + "] > 100)",
    args: [
      {
        name: t`condition`,
        description: t`Something that should evaluate to true or false.`,
      },
    ],
  },
  {
    name: "sum-where",
    structure: "SumIf(" + t`column` + ", " + t`condition` + ")",
    description: () =>
      t`Sums up the specified column only for rows where the condition is true.`,
    example:
      "SumIf([" +
      t`Subtotal` +
      "], [" +
      t`Order Status` +
      '] = "' +
      t`Valid` +
      '")',
    args: [
      { name: t`column`, description: t`The numeric column to sum.` },
      {
        name: t`condition`,
        description: t`Something that should evaluate to true or false.`,
      },
    ],
  },
  {
    name: "var",
    structure: "Variance(" + t`column` + ")",
    description: () => t`Returns the numeric variance for a given column.`,
    example: "Variance([" + t`Temperature` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to get the variance of.`,
      },
    ],
  },
  {
    name: "median",
    structure: "Median(" + t`column` + ")",
    description: () => t`Returns the median value of the specified column.`,
    example: "Median([" + t`Age` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to get the median of.`,
      },
    ],
  },
  {
    name: "percentile",
    structure: "Percentile(" + t`column` + ", " + t`percentile-value` + ")",
    description: () =>
      t`Returns the value of the column at the percentile value.`,
    example: "Percentile([" + t`Score` + "], 0.9)",
    args: [
      {
        name: t`column`,
        description: t`The column or number to get the percentile of.`,
      },
      {
        name: t`percentile-value`,
        description: t`The value of the percentile.`,
      },
    ],
  },
  {
    name: "lower",
    structure: "lower(" + t`text` + ")",
    description: () => t`Returns the string of text in all lower case.`,
    example: "lower([" + t`Status` + "])",
    args: [
      {
        name: t`text`,
        description: t`The column with values to convert to lower case.`,
      },
    ],
  },
  {
    name: "upper",
    structure: "upper(" + t`text` + ")",
    description: () => t`Returns the text in all upper case.`,
    example: "upper([" + t`Status` + "])",
    args: [
      {
        name: t`text`,
        description: t`The column with values to convert to upper case.`,
      },
    ],
  },
  {
    name: "substring",
    structure:
      "substring(" + t`text` + ", " + t`position` + ", " + t`length` + ")",
    description: () => t`Returns a portion of the supplied text.`,
    example: "substring([" + t`Title` + "], 1, 10)",
    args: [
      {
        name: t`text`,
        description: t`The column or text to return a portion of.`,
      },
      {
        name: t`position`,
        description: t`The position to start copying characters. Index starts at position 1.`,
      },
      { name: t`length`, description: t`The number of characters to return.` },
    ],
    docsPage: "substring",
  },
  {
    name: "regex-match-first",
    structure: "regexextract(" + t`text` + ", " + t`regular_expression` + ")",
    description: () =>
      t`Extracts matching substrings according to a regular expression.`,
    example: "regexextract([" + t`Address` + '], "[0-9]+")',
    args: [
      { name: t`text`, description: t`The column or text to search through.` },
      {
        name: t`regular_expression`,
        description: t`The regular expression to match.`,
      },
    ],
    docsPage: "regexextract",
  },
  {
    name: "concat",
    structure: "concat(" + t`value1` + ", " + t`value2` + ", …)",
    description: () => t`Combine two or more strings of text together.`,
    example: "concat([" + t`Last Name` + '], ", ", [' + t`First Name` + "])",
    args: [
      { name: t`value1`, description: t`The column or text to begin with.` },
      {
        name: t`value2`,
        description: t`This will be added to the end of value1, and so on.`,
      },
    ],
    docsPage: "concat",
  },
  {
    name: "replace",
    structure: "replace(" + t`text` + ", " + t`find` + ", " + t`replace` + ")",
    description: () => t`Replaces a part of the input text with new text.`,
    example:
      "replace([" +
      t`Title` +
      '], "' +
      t`Enormous` +
      '", "' +
      t`Gigantic` +
      '")',
    args: [
      { name: t`text`, description: t`The column or text to search through.` },
      { name: t`find`, description: t`The text to find.` },
      { name: t`replace`, description: t`The text to use as the replacement.` },
    ],
  },
  {
    name: "length",
    structure: "length(" + t`text` + ")",
    description: () => t`Returns the number of characters in text.`,
    example: "length([" + t`Comment` + "])",
    args: [
      {
        name: t`text`,
        description: t`The column or text you want to get the length of.`,
      },
    ],
  },
  {
    name: "trim",
    structure: "trim(" + t`text` + ")",
    description: () =>
      t`Removes leading and trailing whitespace from a string of text.`,
    example: "trim([" + t`Comment` + "])",
    args: [
      { name: t`text`, description: t`The column or text you want to trim.` },
    ],
  },
  {
    name: "rtrim",
    structure: "rtrim(" + t`text` + ")",
    description: () => t`Removes trailing whitespace from a string of text.`,
    example: "rtrim([" + t`Comment` + "])",
    args: [
      { name: t`text`, description: t`The column or text you want to trim.` },
    ],
  },
  {
    name: "ltrim",
    structure: "ltrim(" + t`text` + ")",
    description: () => t`Removes leading whitespace from a string of text.`,
    example: "ltrim([" + t`Comment` + "])",
    args: [
      { name: t`text`, description: t`The column or text you want to trim.` },
    ],
  },
  {
    name: "abs",
    structure: "abs(" + t`column` + ")",
    description: () =>
      t`Returns the absolute (positive) value of the specified column.`,
    example: "abs([" + t`Debt` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to return absolute (positive) value of.`,
      },
    ],
  },
  {
    name: "floor",
    structure: "floor(" + t`column` + ")",
    description: () => t`Rounds a decimal number down.`,
    example: "floor([" + t`Price` + "])",
    args: [
      { name: t`column`, description: t`The column or number to round down.` },
    ],
  },
  {
    name: "ceil",
    structure: "ceil(" + t`column` + ")",
    description: () => t`Rounds a decimal number up.`,
    example: "ceil([" + t`Price` + "])",
    args: [
      { name: t`column`, description: t`The column or number to round up.` },
    ],
  },
  {
    name: "round",
    structure: "round(" + t`column` + ")",
    description: () =>
      t`Rounds a decimal number either up or down to the nearest integer value.`,
    example: "round([" + t`Temperature` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to round to nearest integer.`,
      },
    ],
  },
  {
    name: "sqrt",
    structure: "sqrt(" + t`column` + ")",
    description: () => t`Returns the square root.`,
    example: "sqrt([" + t`Hypotenuse` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to return square root value of.`,
      },
    ],
  },
  {
    name: "power",
    structure: "power(" + t`column` + ", " + t`exponent` + ")",
    description: () => t`Raises a number to the power of the exponent value.`,
    example: "power([" + t`Length` + "], 2)",
    args: [
      {
        name: t`column`,
        description: t`The column or number raised to the exponent.`,
      },
      { name: t`exponent`, description: t`The value of the exponent.` },
    ],
  },
  {
    name: "log",
    structure: "log(" + t`column` + ")",
    description: () => t`Returns the base 10 log of the number.`,
    example: "log([" + t`Value` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to return the natural logarithm value of.`,
      },
    ],
  },
  {
    name: "datetime-diff",
    structure:
      "datetimeDiff(" +
      t`datetime1` +
      ", " +
      t`datetime2` +
      ", " +
      t`unit` +
      ")",
    description: () =>
      t`Get the difference between two datetime values (datetime2 minus datetime1) using the specified unit of time.`,
    example:
      "datetimeDiff([" +
      t`created_at` +
      "], [" +
      t`shipped_at` +
      "], " +
      t`"month"` +
      ")",
    args: [
      {
        name: t`datetime1, datetime2`,
        description: t`The columns or expressions with your datetime values.`,
      },
      {
        name: t`unit`,
        description: t`Choose from: "year", "month", "week", "day", "hour", "minute", or "second".`,
      },
    ],
    docsPage: "datetimediff",
  },
  {
    name: "exp",
    structure: "exp(" + t`column` + ")",
    description: () =>
      t`Returns Euler's number, e, raised to the power of the supplied number.`,
    example: "exp([" + t`Interest Months` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column or number to return the exponential value of.`,
      },
    ],
  },
  {
    name: "contains",
    structure: "contains(" + t`string1` + ", " + t`string2` + ")",
    description: () => t`Checks to see if string1 contains string2 within it.`,
    example: "contains([" + t`Status` + '], "' + t`Pass` + '")',
    args: [
      { name: t`string1`, description: t`The column or text to check.` },
      { name: t`string2`, description: t`The string of text to look for.` },
    ],
  },
  {
    name: "starts-with",
    structure: "startsWith(" + t`text` + ", " + t`comparison` + ")",
    description: () =>
      t`Returns true if the beginning of the text matches the comparison text.`,
    example:
      "startsWith([" + t`Course Name` + '], "' + t`Computer Science` + '")',
    args: [
      { name: t`text`, description: t`The column or text to check.` },
      {
        name: t`comparison`,
        description: t`The string of text that the original text should start with.`,
      },
    ],
  },
  {
    name: "ends-with",
    structure: "endsWith(" + t`text` + ", " + t`comparison` + ")",
    description: () =>
      t`Returns true if the end of the text matches the comparison text.`,
    example: "endsWith([" + t`Appetite` + '], "' + t`hungry` + '")',
    args: [
      { name: t`text`, description: t`The column or text to check.` },
      {
        name: t`comparison`,
        description: t`The string of text that the original text should end with.`,
      },
    ],
  },
  {
    name: "between",
    structure: "between(" + t`column` + ", " + t`start` + ", " + t`end` + ")",
    description: () =>
      t`Checks a date or number column's values to see if they're within the specified range.`,
    example: "between([" + t`Created At` + '], "2019-01-01", "2020-12-31")',
    args: [
      {
        name: t`column`,
        description: t`The date or numeric column that should be within the start and end values.`,
      },
      { name: t`start`, description: t`The beginning of the range.` },
      { name: t`end`, description: t`The end of the range.` },
    ],
  },
  {
    name: "interval",
    structure: "timeSpan(" + t`number` + ", " + t`text` + ")",
    description: () => t`Gets a time interval of specified length`,
    example: 'timeSpan(7, "day")',
    args: [
      {
        name: t`number`,
        description: t`Period of interval, where negative values are back in time.`,
      },
      {
        name: t`text`,
        description: t`Type of interval like "day", "month", "year".`,
      },
    ],
  },
  {
    name: "time-interval",
    structure:
      "interval(" + t`column` + ", " + t`number` + ", " + t`text` + ")",
    description: () =>
      t`Checks a date column's values to see if they're within the relative range.`,
    example: "interval([" + t`Created At` + '], -1, "month")',
    args: [
      {
        name: t`column`,
        description: t`The date column to return interval of.`,
      },
      {
        name: t`number`,
        description: t`Period of interval, where negative values are back in time.`,
      },
      {
        name: t`text`,
        description: t`Type of interval like "day", "month", "year".`,
      },
    ],
  },
  {
    name: "relative-datetime",
    structure: "relativeDateTime(" + t`number` + ", " + t`text` + ")",
    description: () => t`Gets a timestamp relative to the current time`,
    example: 'relativeDateTime(-30, "day")',
    args: [
      {
        name: t`number`,
        description: t`Period of interval, where negative values are back in time.`,
      },
      {
        name: t`text`,
        description: t`Type of interval like "day", "month", "year".`,
      },
    ],
  },
  {
    name: "is-null",
    structure: "isnull(" + t`column` + ")",
    description: () => t`Checks if a column is null`,
    example: "isnull([" + t`Discount` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column to check.`,
      },
    ],
    docsPage: "isnull",
  },
  {
    name: "is-empty",
    structure: "isempty(" + t`column` + ")",
    description: () => t`Checks if a column is empty`,
    example: "isempty([" + t`Name` + "])",
    args: [
      {
        name: t`column`,
        description: t`The column to check.`,
      },
    ],
    docsPage: "isempty",
  },
  {
    name: "coalesce",
    structure: "coalesce(" + t`value1` + ", " + t`value2` + ", …)",
    description: () =>
      t`Looks at the values in each argument in order and returns the first non-null value for each row.`,
    example:
      "coalesce([" +
      t`Comments` +
      "], [" +
      t`Notes` +
      '], "' +
      t`No comments` +
      '")',
    args: [
      { name: t`value1`, description: t`The column or value to return.` },
      {
        name: t`value2`,
        description: t`If value1 is empty, value2 gets returned if its not empty, and so on.`,
      },
    ],
    docsPage: "coalesce",
  },
  {
    name: "case",
    structure: "case(" + t`condition` + ", " + t`output` + ", …)",
    description: () =>
      t`Tests an expression against a list of cases and returns the corresponding value of the first matching case, with an optional default value if nothing else is met.`,
    example:
      "case([" +
      t`Weight` +
      '] > 200, "' +
      t`Large` +
      '", [' +
      t`Weight` +
      '] > 150, "' +
      t`Medium` +
      '", "' +
      t`Small` +
      '")',
    args: [
      {
        name: t`condition`,
        description: t`Something that should evaluate to true or false.`,
      },
      {
        name: t`output`,
        description: t`The value that will be returned if the preceding condition is true, and so on.`,
      },
    ],
    docsPage: "case",
  },
  {
    name: "get-year",
    structure: "year(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer with the number of the year.`,
    example: "year([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-quarter",
    structure: "quarter(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (1-4) with the number of the quarter in the year.`,
    example: "quarter([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-month",
    structure: "month(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (1-12) with the number of the month in the year.`,
    example: "month([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-week",
    structure: "week(" + t`column` + ", " + t`mode` + ")",
    description: () => t`Extracts the week of the year as an integer.`,
    example: "week([" + t`Created At` + '], "iso")',
    args: [
      {
        name: t`column`,
        description: t`The name of the column with your date or datetime value.`,
      },
      {
        name: t`mode`,
        description: t`Optional. The default is "ISO".
- ISO: Week 1 starts on the Monday before the first Thursday of January.
- US: Week 1 starts on Jan 1. All other weeks start on Sunday.
- Instance: Week 1 starts on Jan 1. All other weeks start on the day defined in your Metabase localization settings.
`,
      },
    ],
  },
  {
    name: "get-day",
    structure: "day(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (1-31) with the number of the day of the month.`,
    example: "day([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-day-of-week",
    structure: "weekday(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (1-7) with the number of the day of the week.`,
    example: "weekday([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-hour",
    structure: "hour(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (0-23) with the number of the hour. No AM/PM.`,
    example: "hour([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-minute",
    structure: "minute(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (0-59) with the number of the minute in the hour.`,
    example: "minute([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "get-second",
    structure: "second(" + t`column` + ")",
    description: () =>
      t`Takes a datetime and returns an integer (0-59) with the number of the seconds in the minute.`,
    example: "second([" + t`Created At` + "])",
    args: [
      {
        name: t`column`,
        description: t`The datetime column.`,
      },
    ],
  },
  {
    name: "datetime-add",
    structure:
      "datetimeAdd(" + t`column` + ", " + t`amount` + ", " + t`unit` + ")",
    description: () => t`Adds some units of time to a date or timestamp value.`,
    example: "datetimeAdd([" + t`Created At` + '], 1, "' + t`month` + '")',
    args: [
      {
        name: t`column`,
        description: t`The column with your date or timestamp values.`,
      },
      {
        name: t`amount`,
        description: t`The number of units to be added.`,
      },
      {
        name: t`unit`,
        description: t`"year", "month", "quarter", "day", "hour", "minute", "second" or "millisecond".`,
      },
    ],
    docsPage: "datetimeadd",
  },
  {
    name: "datetime-subtract",
    structure:
      "datetimeSubtract(" + t`column` + ", " + t`amount` + ", " + t`unit` + ")",
    description: () =>
      t`Subtracts some units of time to a date or timestamp value.`,
    example: "datetimeSubtract([" + t`Created At` + '], 1, "' + t`month` + '")',
    args: [
      {
        name: t`column`,
        description: t`The column with your date or timestamp values.`,
      },
      {
        name: t`amount`,
        description: t`The number of units to be subtracted.`,
      },
      {
        name: t`unit`,
        description: t`"year", "month", "quarter", "day", "hour", "minute", "second" or "millisecond".`,
      },
    ],
    docsPage: "datetimesubtract",
  },
  {
    name: "now",
    structure: "now",
    description: getDescriptionForNow,
    example: "now",
    args: [],
  },
  {
    name: "convert-timezone",
    structure:
      "convertTimezone(" +
      t`column` +
      ", " +
      t`target` +
      ", [" +
      t`source` +
      "])",
    description: () => t`Convert timezone of a date or timestamp column.
We support tz database time zone names.
See the full list here: https://w.wiki/4Jx`,
    example:
      "convertTimezone([" + t`Created At` + '], "Asia/Ho_Chi_Minh", "UTC")',
    args: [
      {
        name: t`column`,
        description: t`The column with your date or timestamp values.`,
      },
      {
        name: t`target`,
        description: t`The timezone you want to assign to your column.`,
      },
      {
        name: t`source`,
        description: t`The current time zone. Only required for timestamps with no time zone.`,
      },
    ],
    docsPage: "converttimezone",
  },
];

export const getHelpText = (
  name: string,
  database: Database,
  reportTimezone: string,
): HelpText | undefined => {
  const helperTextConfig = helperTextStrings.find(h => h.name === name);

  return (
    helperTextConfig && {
      ...helperTextConfig,
      description: helperTextConfig.description(database, reportTimezone),
    }
  );
};

const getNowAtTimezone = (timezone: string, reportTimezone: string) =>
  timezone ? moment().tz(reportTimezone).format("LT") : moment().format("LT");

export const getHelpDocsUrl = ({ docsPage }: HelpText): string => {
  return docsPage
    ? `questions/query-builder/expressions/${docsPage}`
    : "questions/query-builder/expressions";
};
