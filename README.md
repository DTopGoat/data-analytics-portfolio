# Clint Aguilar: portfolio site

Static site, deployed by Netlify from `main` (`publish = "."`). No build step, no external hosts.

- `index.html`: home page
- `projects/*.html`: case studies (three on public data, four from day-job work shown with synthetic visuals only)
- `dashboards/<name>/`: interactive Plotly dashboards on public data (ClinicalTrials.gov, UCI Online Retail II)
- `assets/vendor/plotly.min.js`: plotly.js v4.1.1 (MIT), served locally. It has one small patch so d3 `attr("style")` goes through CSSOM; `plotly-rules.css` is the same-origin stylesheet Plotly writes its runtime rules into. Together these keep the strict CSP in `netlify.toml` (no inline scripts or styles) free of violations.

Placeholders still to fill in: `[CONTACT_EMAIL]` (home page contact).

Data rule: nothing here may contain patient data, client or employer data, internal identifiers, credentials or proprietary SQL. Day-job visuals are synthetic.
