# Third-party notices

## Yu / 余 · 0011 Manufacture / XII

Arknights characters, artwork, textures, and animation data belong to their respective rightsholders, including Shanghai Hypergryph Network Technology Co., Ltd. The portfolio does not claim ownership of these assets.

The upstream [ArknightsLive2d-Web README](https://github.com/SHUAXINDIARY/ArknightsLive2d-Web/blob/63d96eeba95d3e6d65479e9c7ff27a49913ecb5c/README.md) states:

> 本仓库所有素材版权归属 上海鹰角网络科技有限公司。仅供学习交流使用，禁止用于商业用途，任何侵权后果自负。

Model data: [isHarryh/Ark-Models](https://github.com/isHarryh/Ark-Models/tree/8a3857c250a5c271429aefa82c660ff35803166e), revision `8a3857c250a5c271429aefa82c660ff35803166e`.

- Chibi: `models/2026_yu_nian#12/build_char_2026_yu_nian#12.{atlas,png,skel}`
- Dynamic illustration: `models_illust/dyn_illust_2026_yu_nian#12/dyn_illust_char_2026_yu_nian#12.{atlas,png,skel}`

## Spine browser runtime

Vendored `public/live2d/vendor/spine-webgl.js` comes from [SHUAXINDIARY/ArknightsLive2d-Web](https://github.com/SHUAXINDIARY/ArknightsLive2d-Web/blob/63d96eeba95d3e6d65479e9c7ff27a49913ecb5c/assets/js/spine-webgl.js), revision `63d96eeba95d3e6d65479e9c7ff27a49913ecb5c`. Spine technology is developed by Esoteric Software. The upstream package declares ISC, but does not include a standalone license file at this revision; that package declaration does not establish rights to Arknights artwork or supersede applicable Spine runtime terms.

Local adaptations preserve URL separators in the runtime's resource loaders and rename each model's atlas page to `model.png`. The portfolio's embed renderer and React controls are separate local implementations. The dialog poster is captured from the local renderer; the transparent background preview is exported from its canvas in the Idle pose. The exact original and adapted hashes and source URLs are recorded in `public/live2d/asset-manifest.json`.
