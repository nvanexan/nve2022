const DashedList = {
  render: "dashed-list",
  description: "Display the enclosed content in a dashed list",
  children: ["list"],
  attributes: {
    type: {
      type: String,
      default: "dashed-list",
      matches: ["dashed-list"],
      description: "Controls the style of the list",
      errorLevel: "warning",
    },
  },
} as any;

export default DashedList;
