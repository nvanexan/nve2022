---
seo_title: "Micro Frontends | Nick Van Exan"
title: "Micro Frontends"
author: "Nick Van Exan"
date: "2023-02-22T19:39:23Z"
summary: "Some thoughts on Micro Frontends"
---

{% partial file="partials/article-title.md" /%}

Last week I was asked by a client to give a quick talk on micro frontends and design systems. The organization is in the process of moving out of a monolithic architecture with an aging, unstable frontend codebase. I work with a team that is working to improve the a11y posture of the application to [WCAG AA standards](https://www.w3.org/WAI/WCAG2AA-Conformance), supporting the organization's journey both in the monolith and its movement to a more modern React-based design system.

During my talk, it became clear that a lot of folks are a bit unsure about what micro frontends are, why they might be useful, and how to properly implement them. The following are some notes I have on these topics from our own journey out of a difficult monolithic codebase: what's working, what's not, lessons learned.

## Micro Frontends: What and Why

[Micro frontends](https://micro-frontends.org/) ("MFEs") are an architectural pattern. The pattern is primarily used to solve organizational, in addition to techical, issues that can arise in monolithic codebases. In our case, the problems that arising are:

- The frontend code for the monolith is written in old technology, Dojo, which does not lend itself to well-written, isolated, component-based UI.
- The frontend code in the monolith is not well tested: unit tests are almost non-existent, and reliance is instead placed on end-to-end regression tests.
- Regressions are not caught until code is shipped to master and deployed, resulting in long delays between when an engineer makes a change and when defects are caught; in addition, if the defect is serious enough, developers can block the work of other teams entirely by committing a bug to master.
- Just working with the git repo, which is old, is slow and time consuming: changing branches, pulling latest, performing rebases - it all takes a long time in the monolith; nothing is snappy.
- There is no great design system for the monolith: no clear documentation of APIs of UI components, no clear separation of business and UI logic even in platform-level components, and many components are repeated within the monolith by multiple teams (e.g. each team has their own implementation of a combo box).

Our goal with implementing MFEs at the client is to allow frontend teams to scaffold new repos that are separate and independent from the monolith. Those repos can have their own modern tech stack (e.g. [React](https://reactjs.org/) for UI, [Storybook](https://storybook.js.org/) for documentation, [Jest](https://jestjs.io/) for unit testing, etc.) and can be built, tested and deployed independently of the monolith.

## MFE Architecture

In the monolith, hooks are embedded into the aging Dojo-based codebase to render the MFE apps where they need to be seen. This could be done for a specific feature in the app (greenfield or otherwise), or something used by many features, such as the global header or footer of the application.

{% diagram src="/public/images/MFEs.svg" /%}

## MFE Benefits and What's Working

Some teams within the organization are already spinning up MFE repos and getting productive in a more modern tech stack. They are realizing a number of [benefits commonly attributed to MFE architecture](https://martinfowler.com/articles/micro-frontends.html#Benefits):

- Incremental upgrades
- Simple, decoupled codebases
- Independent deployment
- Autonomous teams

In addition, these teams are beginning to leverage a [design system](https://www.invisionapp.com/inside-design/guide-to-design-systems/) that is being scaffolded quickly in parallel. That design system is React-based, and leverages [Storybook](https://storybook.js.org/) to give all teams a consistent set of interactive documentation. Importantly for my team, that design systems is also where a lot of a11y engineering and testing is being targeted. The idea is, as feature teams spin up their MFEs, the new design system will be part of their bootstrap - a baseline dependency - and they can just use it to compose their new UI.

The following diagram illustrates the various stakeholders who are involved in the creation and maintenance of the design system. Feature teams are encouraged to contribute back to the design system UI kit, similar to open-source.

{% diagram src="/public/images/DesignSystems.svg" /%}

## MFE Burdens and Common Mistakes

Although my client is early in its MFE journey, I am noticing already a few important problems and mistakes that are being made. I've seen these at many organizations, and they are:

- Too many MFEs
- Mixed technologies across MFEs
- Mixed patterns across MFEs
- Poor documentation and communication

### Too many MFEs

There are, already, too many MFEs being created at my client's organization. This is an issue of architecture. While some discrete UI components may do fine as separate MFEs, generally you don't want to have an MFE for every UI component you are attempting to replace. If you have 1,000 base UI components, you'd end up with 1,000 MFEs. Now imagine trying to find the right repo to update your code. You can't easily. And good luck with not only debugging but onboarding too.

This is a common problem I've encountered at various organizations. Generally, the best approach is to slice your existing codebase into features or logical chunks like a feature or section of the application, and move that entire slice into its own MFE. For example, if your application had a "Student Hub" and a "Teacher Hub", you'd want to move each of those hubs into their own MFEs. Similarly, if you have a feature such as a chat service or inbox messaging service, you could move those areas into their own MFEs as well.

This issues is of course more art than science. But the aim is to ensure your MFEs represent at the end the groups of engineers you want to be working together on sections of the application that logically are connected. So start from your desired end state: figure out what sections of the app you want to convert at a time and what engineers you want working on those sections, and then cut a new MFE.

### Mixed technologies across MFEs

This is another common sin I've seen repeated across organizations. MFEs are often advertised as ways to allow your organization to have teams leveraging different tech stacks that suit their desires. Team A wants Vue, team B wants Angular, and team C wants React. With MFEs, they can each have it their way. Right?

Wrong. Firstly, if you do this, you'll need multiple design systems to cater to the multiple tech stacks, which is no good from a code re-usability point of view. But secondly, and perhaps most crucially, if you do this you'll have entirely different coding paradigms and patterns in each MFE, making it more difficult for engineers on team A to work on features maintained by engineers on team B. From a governance perspective, and an engineering management perspective, this is a losing proposition. You may get some gains in velocity on specific teams, but overall less velocity as an organization.

Where at all possible, keep the technologies the same across your MFEs and design system.

### Mixed patterns across MFEs

This is the same issue as above, except with respect to patterns. For example, you may have all of your MFEs using React and SCSS modules for styling. But in some repos, SCSS is not heavily nested whereas in others it is. Or in some repos your teams use snake casing, and in others camel casing. Again, for better organizational velocity, it is important for teams to align on patterns even across different MFE repos.

### Poor documentation and communication

This last issue is generally what leads to the rest of the above issues. And it is, again, a matter of governance.

Platform engineering teams are typically needed to help ensure that MFEs are initially scaffolded with the right technologies, tooling, and patterns. They need to show the rest of the organization what a good starter MFE looks like, and how to go about building it out. And there needs to be adequate documentation of expectations, both in the MFE readme as well as on internal wikis and slack / teams channels.

For engineers to work seamlessly across MFEs, each MFE needs to be well-documented, particularly where it departs from generally accepted organizational patterns, technologies or architectures. The feature teams, as well as the platform team, need to be working together to document and maintain standards and a cohesive approach to patterns and practices.

## Summary of Lessons Learned

As I wrangle with MFE architectures in the real world, the following are some of the main lessons I've learned:

- Carve up your monolith by feature, make conversion / migration to MFEs feature-led
- Align on patterns and tech stacks, the same tooling for as many as possible
- Trust but verify, make time for code reviews and knowledge shares for consistent patterns and practices across MFEs

Doing MFEs well is not easy. It can get unruly pretty quickly. Sometimes that's okay. But often it's a red flag. If you're having difficulties or growing pains with your move to an MFE architecture, feel free to reach out. I'm always happy to chat.
