<!--

This source file is part of the NHLBI-AI Stanford Data Science Center Website open-source project

SPDX-FileCopyrightText: 2026 Schmiedmayer Lab and the project authors (see CONTRIBUTORS.md)

SPDX-License-Identifier: MIT

-->

# NHLBI-AI Stanford Data Science Center Website

[![Build and Test](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/check.yml/badge.svg)](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/check.yml)
[![Deployment](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/pages.yml/badge.svg)](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/pages.yml)
[![CodeQL](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/codeql.yml/badge.svg)](https://github.com/SchmiedmayerLab/NHLBIAIDSCWebsite/actions/workflows/codeql.yml)
[![REUSE status](https://api.reuse.software/badge/github.com/SchmiedmayerLab/NHLBIAIDSCWebsite)](https://api.reuse.software/info/github.com/SchmiedmayerLab/NHLBIAIDSCWebsite)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

![NHLBI-AI Stanford Data Science Center](public/brand/bluesky-banner.png)

The public website for the NHLBI-AI Stanford Data Science Center: a service and community hub
advancing safe agentic AI, multimodal models, and reproducible research workflows across
NHLBI-supported biomedical data and secure research environments.

## Tooling

- Astro 7 and strict TypeScript for a static, low-JavaScript website.
- Modern responsive CSS with light, dark, reduced-motion, and print support.
- Vitest, Playwright, and Axe for unit, browser, responsive, and accessibility checks.
- ESLint, Stylelint, Markdownlint, Prettier, and deterministic site/link audits.
- GitHub Pages deployment with root-domain and project-path portability.
- REUSE-compliant licensing and SchmiedmayerLab repository standards.

## Develop locally

Requires Node.js 24 and npm 11.

```sh
npm ci
npm run dev
```

Run the complete local quality gate before committing:

```sh
npm run validate:all
reuse lint
npm audit --audit-level=high
```

## Deployment

GitHub Pages builds automatically from `main` and serves the site at
[nhlbi-ai-dsc.org](https://nhlbi-ai-dsc.org/). The workflow reads the active Pages origin and base
path at runtime, so the same source also remains portable to a GitHub project URL.

The published Google Forms and interim contact address are configured in `site.config.mjs`.
Deployments can override them with GitHub Actions repository variables:

- `PARTICIPATION_FORM_URL`: Stanford-owned engagement Google Form embed URL.
- `CAREER_INTEREST_FORM_URL`: Stanford-owned future-opportunities Google Form embed URL.
- `CENTER_CONTACT_EMAIL`: public center contact address.

The form URLs must end in `viewform?embedded=true`. Collaboration inquiries and future-opportunity
expressions use separate forms, response sheets, and access policies.

## Project map

| Path                 | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `site.config.mjs`    | Identity, navigation, metadata, forms, and discovery policy        |
| `src/data/center.ts` | Data programs, capabilities, services, team, and open-source tools |
| `src/pages/`         | Landing, participation, opportunities, discovery, and error routes |
| `src/styles/`        | Responsive component and presentation styling                      |
| `public/brand/`      | Committed SVG and PNG identity assets                              |
| `BRAND.md`           | Verbal identity, asset selection, and usage guidance               |
| `.github/workflows/` | CI, standards, security, link audit, and Pages deployment          |

Regenerate the committed brand kit and browser icons after changing their source or copy:

```sh
npm run brand:generate
```

## Contributing

Contributions to this project are welcome. Please read the
[contribution guidelines](https://github.com/SchmiedmayerLab/.github/blob/main/CONTRIBUTING.md) and
[contributor covenant code of conduct](https://github.com/SchmiedmayerLab/.github/blob/main/CODE_OF_CONDUCT.md)
first. The project authors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md).

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for more information.
Portraits and third-party institutional materials retain their respective rights as documented in
[REUSE.toml](REUSE.toml) and [LICENSES/](LICENSES/).

## Citation

If you use this software, please cite it using the metadata in [CITATION.cff](CITATION.cff), which
GitHub surfaces through the
[_Cite this repository_](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)
button.

## Our Research

For more information, visit the
[Schmiedmayer Lab GitHub organization](https://github.com/SchmiedmayerLab).

![Schmiedmayer Lab](https://raw.githubusercontent.com/SchmiedmayerLab/.github/main/assets/footer-light.png#gh-light-mode-only)
![Schmiedmayer Lab](https://raw.githubusercontent.com/SchmiedmayerLab/.github/main/assets/footer-dark.png#gh-dark-mode-only)
