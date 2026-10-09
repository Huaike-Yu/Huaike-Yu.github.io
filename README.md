# Huaike Yu — Research & Portfolio

An academic portfolio with a pastel card layout, built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Run locally

```sh
npm install
npm run dev
```

Vite serves the portfolio at `http://localhost:3000`.

```sh
npm run typecheck
npm run build
npm run preview
```

## Update the profile

Edit `profile.json` for personal details, education, experience, skills, publications, and project participation. The portfolio and profile guide use this file. Publication entries explicitly distinguish preprints from the published article; grant participation is labeled Project Participant.

The download button serves `public/assets/Huaike_Yu_CV.pdf`. Regenerate it after editing the profile:

```sh
python scripts/build_cv.py
```

The generator requires ReportLab. The original template’s PDF remains in `assets/` and is not linked by the site.

## Contact and profile guide

The contact form opens a prefilled email draft addressed to `huaike.yu@unswalumni.com`. The visitor sends it through their email app.

The profile guide works from the supplied profile without an API key. The inherited Gemini integration is optional: `GEMINI_API_KEY` enables model responses with the profile as context. Vite embeds this key in the client bundle; use a server-side proxy before enabling it on a public deployment. Leave the key unset for the local profile guide.

## Yu companion and skin artwork

The companion uses Yu's **0011 Manufacture / XII** chibi model. Click Yu or choose an action to interact; pause or collapse it from its toolbar. The open/closed preference is saved locally. On a first visit below 768px it starts collapsed.

The matching **dynamic illustration** is integrated into the page background with transparent edges and a soft fade for text readability. A 144 KB transparent WebP preview appears first. Desktop animation loads after the profile's first paint; mobile and reduced-motion settings use the static preview. The background is decorative and has no on-page controls. The chibi's **Skin** button opens the enlarged artwork viewer.

The enlarged viewer retains Idle, Interact, Special, pause/resume, and Escape controls. Its renderer is removed when closed. The animated illustration resources total approximately 9.9 MB; chibi resources total approximately 1.4 MB. Each canvas uses a separate same-origin iframe. The background renders at 20 fps with its pixel ratio capped at 1, and pauses while a dialog is open. Animation also stops when the page or stage is hidden, or when the visitor pauses it.

The runtime and six model files are served locally from `public/live2d/`, with no dependency on the remote viewer at runtime. `asset-manifest.json` records pinned source commits, source URLs, SHA-256 hashes, and the filename/URL adaptations. To restore those vendored files:

```sh
python scripts/fetch_yu_assets.py
```

The dialog's fallback poster is a screenshot of the local Spine renderer's Idle pose. The background preview is exported directly from the same renderer with transparency; it does not use a cropped texture atlas. To regenerate it, open `/live2d/embed.html?model=portrait&snapshot=1` and use **Save transparent preview**, placing the downloaded WebP at `public/live2d/yu-xii-background.webp`. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for asset ownership, upstream notices, and source links.

## Credits

Adapted from [KawaiiFolio](https://github.com/sharmila1320/KawaiiFolio) by Sharmila Rapeti.
