// Site name and author details shared by page titles, the footer, post meta row and About page.
export const site = {
  name: "Worked Examples",
  url: "https://ryanscharfer.blog",
  author: "Ryan Scharfer",
  initials: "RS",
  // Path under public/, e.g. "/avatar.png". Square image; shown in a circle. Initials are used until it's set.
  avatar: "/avatar.png",
  location: "Springfield, Oregon",
  bio: "Full-stack engineer in Springfield, Oregon, writing about the parts of the web he's still getting a grip on.",
  description: "Tutorials and notes on React, JavaScript, authentication and the tools around them.",
  github: "https://github.com/rscharfer",
  linkedin: "https://www.linkedin.com/in/educationalsoftwareengineer/",
  // giscus: comments stored in GitHub Discussions. Comments stay hidden until categoryId is set.
  comments: {
    repo: "rscharfer/myblog",
    repoId: "MDEwOlJlcG9zaXRvcnkyOTc2MDM0Njc=",
    category: "Announcements",
    categoryId: "DIC_kwDOEb0Ri84DKCjK",
    // Paper/ink theme from public/giscus/. Needs a CORS header on /giscus/* (see design/REPORT.md) before turning on.
    customTheme: false,
  },
};
