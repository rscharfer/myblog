import {
  BLUE_TOMATO,
  ALMOST_BLACK_WITH_RED_TINT,
  LIME_GREEN,
  PURPLE,
  LIGHT_PINK,
  YELLOW_ORANGE,
  LIGHT_BLUE
} from "./color";



var theme = {
  plain: {
    color: LIGHT_PINK,
    backgroundColor: ALMOST_BLACK_WITH_RED_TINT,
  },
  styles: [
    {
      types: ["changed"],
      style: {
        color: "black",
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "black",
      },
    },
    {
      types: ["inserted"],
      style: {
        color: "black",
      },
    },
    {
      types: ["comment"],
      style: {
        color: LIGHT_BLUE,
        fontStyle: "italic",
      },
    },
    {
      types: ["punctuation"],
      style: {
        color: "rgb(255, 255, 255)",
      },
    },
    {
      types: ["constant"],
      style: {
        color: YELLOW_ORANGE,
      },
    },
    {
      types: ["string", "url"],
      style: {
        color: YELLOW_ORANGE,
      },
    },
    {
      types: ["variable"],
      style: {
        color: PURPLE,
      },
    },
    {
      types: ["number", "boolean"],
      style: {
        color: LIME_GREEN,
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: YELLOW_ORANGE,
      },
    },
    {
      types: [
        "keyword",
        "operator",
        "property",
        "namespace",
        "tag",
        "selector",
        "doctype",
      ],
      style: {
        color: BLUE_TOMATO,
      },
    },
    {
      types: ["builtin", "char", "constant", "function", "class-name"],
      style: {
        color: LIME_GREEN,
      },
    },
  ],
};

export default theme;
