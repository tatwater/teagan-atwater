const actions = [
  {
    id: "home",
    name: "Home",
    shortcut: ["h"],
    keywords: "",
    perform: () => (window.location.pathname = "/"),
  },
  {
    id: "signin",
    name: "Sign In",
    shortcut: ["s"],
    keywords: "",
    perform: () => (window.location.pathname = "/signin"),
  },
  // {
  //   id: "projects",
  //   name: "Sanity Projects List",
  //   shortcut: ["p"],
  //   keywords: "",
  //   perform: () => (window.location.pathname = "/projects"),
  // },
  // {
  //   id: "github-site",
  //   name: "This site on Github",
  //   shortcut: ["g"],
  //   keywords: "",
  //   perform: () => (window.location.pathname = "/"),
  // },
];


export default actions;
