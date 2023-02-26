---
seo_title: "Micro Frontends | Nick Van Exan"
title: "Micro Frontends"
author: "Nick Van Exan"
date: "2023-02-22T19:39:23Z"
social_image: "https://nick.vanexan.ca/public/images/MFE-social.png"
summary: "Some thoughts on MFEs for large organizations"
---

{% partial file="partials/article-title.md" /%}

Last week I was asked by a client to give a talk on micro frontends and design systems. The organization is in the process of moving out of a monolithic architecture with an aging, unstable frontend codebase that was written in [Dojo](https://dojotoolkit.org/) to a UI written in [React](https://reactjs.org/).

I work on and with a set of a11y teams that are working to improve the accessibility of the application to [WCAG AA standards](https://www.w3.org/WAI/WCAG2AA-Conformance), supporting the organization's journey both in the monolith and its movement to a React-based design system.

During my talk, I fielded questions about what micro frontends are, why they might be useful, and how to implement them. The following are notes I have on these topics from our journey out of a difficult monolith codebase: what's working, what's not, and lessons learned along the way.

## Micro Frontends: What and Why

[Micro frontends](https://micro-frontends.org/) ("MFEs") are an architectural pattern. The pattern is used to solve organizational and technical issues that can arise in organizations with monolith codebases. In our case, the problems that have arisen are:

- The frontend code for the monolith is written in old technology, [Dojo](https://dojotoolkit.org/), which does not lend itself to well-written component-based UI.
- The frontend code in the monolith lacks unit tests. Reliance is instead placed on end-to-end regression tests.
- Regressions are often not caught until code is shipped to main and deployed to many QA testing environments, resulting in lengthy delays between when an engineer makes a change and when defects are caught; in addition, if the defect is serious enough, developers can block the work of other teams by committing a bug to main.
- Working with the git repo is slow and time consuming: changing branches, pulling latest, performing rebases - it all takes a long time in the monolith; nothing is snappy.
- There is no design system for the monolith: no clear documentation of APIs for UI components, no clear separation of business and UI logic in platform-level components, and many components are repeated within the monolith by multiple teams (e.g. each team has their own implementation of a combo box).[^1]

These issues aren't great, for morale, for DX, for code quality, for user experience, and more. But with 15 year old software, you can't re-write everything in one shot overnight. You need to move incrementally to your desired state. And that's where MFEs play an important role.

The goal with implementing MFEs is to allow frontend teams to scaffold new repos that are separate and independent from the monolith.

Those repos can have their own modern tech stack. In my client's case, that stack consists of [React](https://reactjs.org/) for UI, [Jest](https://jestjs.io/) for unit testing, and [Typescript](https://www.typescriptlang.org/) for type safety and easier UI API documentation.

Moreover, because those frontends exist in separate repos, they can be built, tested and deployed independently of the monolith. Teams working on MFEs can move fast on building and shipping a feature, without being bogged down in the slow process required to make changes to the delicate monolith.

In the monolith, hooks are then embedded into the Dojo-based codebase to render the MFE apps where they need to be seen. I refer to this as "hole-punching". You punch holes in your existing app to create a window to an MFE that is served independently. This can be done for a feature in the app, or for something used by many features, such as a global header or footer of the application.

{% diagram src="/public/images/MFEs.svg" alt="MFE 'Hole Punch' Architecture" /%}

## MFE Benefits and What's Working

Some teams within the organization are already spinning up MFE repos and getting productive in a more modern tech stack. They are realizing a number of [benefits commonly attributed to MFE architecture](https://martinfowler.com/articles/micro-frontends.html#Benefits):

- Incremental upgrades
- Simple, decoupled codebases
- Independent deployment
- Autonomous teams

In addition, these teams are beginning to leverage a [design system](https://www.invisionapp.com/inside-design/guide-to-design-systems/) that is being scaffolded quickly in parallel. That design system is React-based, and leverages [Storybook](https://storybook.js.org/) to give all teams a consistent set of interactive documentation.

Importantly for my team, that design systems is where a lot of a11y engineering and testing is being targeted. The idea is, as feature teams spin up their MFEs, the new design system will be part of their bootstrap - a baseline dependency which they can use to compose their UI, and rely on to implement a11y correctly.

The following diagram illustrates the various stakeholders who are involved in the creation and maintenance of the design system. Feature teams are encouraged to contribute back to the design system UI kit, similar to open-source.

{% diagram src="/public/images/DesignSystems.svg" alt="Design System Stakeholders" multimode=true /%}

## MFE Burdens and Common Mistakes

There are a number of recurring issues that I've seen arise at organizations during their early days with MFEs. These include:

- Too many MFEs
- Mixed technologies across MFEs
- Mixed patterns across MFEs
- Poor documentation and communication

### Too many MFEs

The biggest issue I've seen at organizations early in their MFE journey is the creation of too many MFEs. This is an issue of architecture. It is also an issue of communication, particularly among senior leadership.

For example, leadership within my client's organization is asking how quickly the old Dojo-based UI can be replaced with the new design system. Can we do a one-for-one swap of a grid component, for example? Can we replace all the Dojo checkboxes with React checkboxes?

While you *could try* to use MFEs to do this, in my experience this is not how best to think of MFEs. You don't want to replace single components with single MFE repos. You want to ensure that each MFE repo represents a logical segment of the application.

While some discrete UI components may do fine as separate MFEs, generally you don't want to have an MFE for every UI component you are attempting to replace. If you have 1,000 base UI components, you'd end up with 1,000 MFEs. Now imagine trying to find the right repo to update your code. You can't easily. And good luck with debugging and onboarding.

==The aim with MFEs is not to recreate spaghetti structures but to make your application more like a pizza. You want to slice your existing codebase into features or otherwise logical chunks, and move that entire slice into its own MFE.== 

This process is of course more art than science. In some cases, a logical slice for an MFE might be a whole section of an application under a particular route of navigation. In other cases, it might be something more cross-cutting that still makes sense as a discrete unit of development, such as an inbox messaging service or a chatbot.

The aim is to ensure that your MFEs represent sections of the application that are logically connected. Start from your desired end state: figure out what sections of the app you want to convert at, when, and what engineers you want working on those sections, and *then* cut a new MFE.

### Mixed technologies across MFEs

This is another sin I've seen repeated across organizations. MFEs are advertised as ways to allow teams to leverage different tech stacks that suit their desires. Team A wants Vue, Team B wants Angular, and Team C wants React. With MFEs, they can each have it their way. Right?

Wrong. Or maybe, but you may not like the outcome.

Firstly, if you do this, you'll need multiple design systems to cater to the multiple tech stacks, which is not desirable from a code re-usability point of view.[^2] 

Secondly, if you do this you'll have different coding paradigms and patterns in each MFE, making it difficult for engineers on Team A to work on features maintained by engineers on Team B. From a governance perspective, and an engineering management perspective, this is a losing proposition. Specific teams may gain velocity, but the the velocity of the organization as a whole may suffer.

Interoperability between teams isn't always a concern. And sometimes having a team move fast on a particular feature using a new or different tech stack makes total sense. There's no absolutes. But if the aim is to move a large organization into a cohesive new reality for a large application, keeping the technologies the same across your MFEs and design system will best preserve organizational velocity.

### Mixed patterns across MFEs

This is the same issue as above applied to patterns and practices. For example, you may have some MFEs implementing class components and more OOP development patterns whereas other teams prefer functional programming styles and composability. Or in some repos your teams may use snake casing, and in others camel casing. Where the divergences in patterns and practices are material, it becomes less easy for engineers to work across MFEs. For better organizational velocity, teams should align on patterns across different MFE repos.

### Poor documentation and communication

This last issue is kindling for the rest of the issues. And it is, again, a matter of governance.

Platform engineering teams are needed to help ensure that MFEs are initially scaffolded with the right technologies, tooling, and patterns. They need to show the rest of the organization what a good starter MFE looks like, and how to go about building it out. And there needs to be adequate documentation of expectations, in the MFE readme files and on internal wikis.

Similarly, for engineers to work seamlessly across MFEs, each MFE needs to be well-documented, particularly where it departs from organizational patterns, technologies or architectures. 

And the work doesn't end after first commit. The feature teams, and the platform team, need to always be working together to document and maintain standards and a cohesive approach to patterns and practices.

When thinking about desired outcomes, the aim should be making onboarding an engineer into an organization as painless as possible. With multiple MFEs, where potentially anything goes in each repo, greater vigilance in documenting decisions and approaches and maintaining standards is needed.

## Summary of Lessons Learned

To summarize some lessons I've learned wrangling MFE architectures in the real world:

- **Carve up your monolith by feature** => make conversion / migration to MFEs a feature-led exercise
- **Align on patterns and tech stacks** => the same tooling for as many as possible
- **Trust but verify; share and document** => make time for code reviews and knowledge shares for consistent patterns and practices across MFEs

Doing MFEs well is not easy. It can get unruly pretty quickly. If you're having difficulties or growing pains with your move to an MFE architecture, I hope the above may be of some benefit. 

{% partial file="partials/article-footer.md" /%}

[^1]: To put this kind of thing in business context, see Nathan Curtis's discussion on $1,000,000 buttons in [And You Thought Buttons Were Easy?](https://medium.com/eightshapes-llc/and-you-thought-buttons-were-easy-26eb5b5c1871)

[^2]: There is new tooling emerging that may make this less of an issue. With [StencilJS](https://stenciljs.com/), for example, you could write components for your design system that can then be compiled into framework-specific code in addition to native [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). Most design systems in production today, however, haven't been set up in this way.
