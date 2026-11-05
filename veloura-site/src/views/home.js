import { products, byWorld, byId } from '../data/products.js';
import { world, on } from '../state.js';
import { card, icon, cut, reveal, rail, load3D, reduced } from '../ui.js';
import { LOGO } from '../logo.js';

const CH = 4.3; // story length in chapters

const W = (noir, rose) => `<span data-w="noir">${noir}</span><span data-w="rose">${rose}</span>`;

export default {
  title: 'Veloura — Iconic Scents. Miniature Luxury.',
  render() {
    const best = ['vetiver-fume', 'rose-velours', 'oud-nocturne', 'vanille-satin', 'cedre-poivre', 'litchi-rose', 'cuir-ambre', 'jasmin-lumiere'].map(byId);
    const noirArt = byWorld('noir').slice(0, 3), roseArt = byWorld('rose').slice(0, 3);
    return `
    <section class="story" id="story" aria-label="Veloura story">
      <div class="story__sticky">
        <div class="story__fallback" aria-hidden="true"><div class="fb-noir"></div><div class="fb-rose"></div></div>
        <canvas class="story__canvas" aria-hidden="true"></canvas>

        <div class="chapter chapter--hero on" data-ch="0">
          <div class="chapter__inner">
            <div class="hero-brand">
              <span class="tone-signature twinkle">${LOGO.full}</span>
              <p>Iconic Scents. Miniature Luxury.</p>
            </div>
            <div class="hero-sides">
              <div class="hero-side hero-side--noir" data-side="-1">
                <span class="world-name">NOIR</span>
                <small>The masculine collection</small>
                <h3>The Art of Presence</h3>
                <p>Iconic fragrances. Bold impressions. Luxury in every detail.</p>
                <a class="btn btn--noir" href="#noir" data-go-world="noir">Explore Noir ${icon('arrow')}</a>
              </div>
              <div class="hero-side hero-side--rose" data-side="1">
                <span class="world-name">ROSÉ</span>
                <small>The feminine collection</small>
                <h3>A Little Luxury, A Lot of Love</h3>
                <p>Fall in love with iconic fragrances in their most irresistible sizes.</p>
                <a class="btn btn--rose" href="#rose" data-go-world="rose">Explore Rosé ${icon('arrow')}</a>
              </div>
            </div>
          </div>
          <div class="scroll-cue" aria-hidden="true">Scroll<span></span></div>
        </div>

        <div class="chapter" data-ch="1"><div class="chapter__inner"><div class="chapter__text">
          <p class="eyebrow">${W('Veloura Noir', 'Veloura Rosé')}</p>
          <h2 class="display" style="font-size:clamp(2rem,1.2rem + 3.4vw,4.4rem)">${W('The Art of Presence', 'A Little Luxury, A Lot of Love')}</h2>
          <p class="lede" style="color:inherit">${W('Iconic fragrances. Bold impressions. Luxury in every detail.', 'Fall in love with iconic fragrances in their most irresistible sizes.')}</p>
        </div></div></div>

        <div class="chapter" data-ch="2"><div class="chapter__inner"><div class="chapter__text">
          <p class="eyebrow">The ritual</p>
          <h2>Lift. Spray.<br>Discover.</h2>
          <p>Every miniature carries the full composition — top, heart and base — in a size made for discovering, travelling and gifting.</p>
          <ul class="note-tags">${W('<li>Bergamot</li><li>Vetiver</li><li>Smoked cedar</li><li>Ambergris</li>', '<li>Lychee</li><li>Damask rose</li><li>Peony</li><li>Velvet musk</li>')}</ul>
        </div></div></div>

        <div class="chapter" data-ch="3"><div class="chapter__inner"><div class="chapter__text">
          <p class="eyebrow">Miniature luxury</p>
          <h2>The same signature.<br>A fraction of the size.</h2>
          <p>Wear a fragrance for days, not seconds on a paper strip. Carry it everywhere. Change it with your mood.</p>
          <a class="btn btn--ghost" href="#shop">Shop all minis ${icon('arrow')}</a>
        </div></div></div>

        <div class="chapter" data-ch="4"><div class="chapter__inner"><div class="chapter__text">
          <p class="eyebrow">Discovery sets</p>
          <h2>Build your<br>own set</h2>
          <p>Choose three or five miniatures and receive them in a signature Veloura case — the perfect way to find your scent, or to give one.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#build-a-set">Build a set ${icon('arrow')}</a><a class="btn btn--ghost" href="#finder">Take the scent quiz</a></div>
        </div></div></div>

        <div class="story-progress" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<i data-dot="${i}"></i>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap" data-rail>
        <div class="section-head">
          <div><p class="eyebrow rv">Most loved</p><h2 class="rv">Best sellers</h2></div>
          <div class="rail-ctrl"><a class="btn btn--ghost btn--sm" href="#shop">View all</a><button class="round-btn" data-prev aria-label="Previous">${icon('arrow', 'flip')}</button><button class="round-btn" data-next aria-label="Next">${icon('arrow')}</button></div>
        </div>
        <div class="rail">${best.map((p, i) => card(p, i)).join('')}</div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="center" style="margin-bottom:clamp(28px,4vw,52px)"><p class="eyebrow rv">Two worlds</p><h2 class="rv">Shop by collection</h2></div>
        <div class="grid cols-2 stack">
          <a class="world-card world-card--noir rv" href="#noir" data-tilt data-go-world="noir">
            <span class="world-card__bg"></span>
            <span class="world-card__art">${noirArt.map((p) => `<img src="${cut(p)}" alt="" loading="lazy">`).join('')}</span>
            <span class="world-card__content"><span class="world-card__title">NOIR</span><span>Woods, spice, leather and smoke.</span><span class="world-card__cta">Explore ${icon('arrow')}</span></span>
          </a>
          <a class="world-card world-card--rose rv" href="#rose" data-tilt data-go-world="rose" style="--d:1">
            <span class="world-card__bg"></span>
            <span class="world-card__art">${roseArt.map((p) => `<img src="${cut(p)}" alt="" loading="lazy">`).join('')}</span>
            <span class="world-card__content"><span class="world-card__title">ROSÉ</span><span>Florals, gourmands and luminous musks.</span><span class="world-card__cta">Explore ${icon('arrow')}</span></span>
          </a>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="band band--finder rv">
          <div>
            <p class="eyebrow">Scent finder</p>
            <h2>Find your signature in five questions</h2>
            <p class="lede">Tell us your mood, your moments and the notes you love. We'll match you with three miniatures to try.</p>
            <ol class="steps"><li><b>1</b><span>Answer five quick questions — about a minute.</span></li><li><b>2</b><span>See your three closest matches and why they suit you.</span></li><li><b>3</b><span>Add one, or take all three as a discovery set.</span></li></ol>
            <a class="btn" href="#finder">Start the quiz ${icon('arrow')}</a>
          </div>
          <div class="band__art"><img src="img/case-${world.current}.webp" alt="A Veloura discovery case holding five miniatures" loading="lazy" data-world-img="case"></div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="center" style="margin-bottom:clamp(28px,4vw,52px)"><p class="eyebrow rv">The gifting experience</p><h2 class="rv">Unboxing, perfected</h2>
          <p class="lede rv">Every order arrives in our signature case — black and champagne gold for Noir, blush and rose for Rosé — with room for a handwritten note.</p></div>
        <div class="grid cols-2 stack">
          <figure class="world-card world-card--noir rv" style="min-height:clamp(300px,36vw,460px);margin:0"><span class="world-card__bg"></span><img src="img/gift-noir.webp" alt="Veloura Noir gift case" loading="lazy" style="position:absolute;inset:8% 6% 18%;width:88%;height:74%;object-fit:contain"><figcaption class="world-card__content"><span class="world-card__cta" style="margin:0">Veloura Noir case</span></figcaption></figure>
          <figure class="world-card world-card--rose rv" style="min-height:clamp(300px,36vw,460px);margin:0;--d:1"><span class="world-card__bg"></span><img src="img/gift-rose.webp" alt="Veloura Rosé gift case" loading="lazy" style="position:absolute;inset:8% 6% 18%;width:88%;height:74%;object-fit:contain"><figcaption class="world-card__content"><span class="world-card__cta" style="margin:0">Veloura Rosé case</span></figcaption></figure>
        </div>
        <div class="center" style="margin-top:32px"><a class="btn" href="#gifts">Shop gift sets ${icon('gift')}</a></div>
      </div>
    </section>`;
  },

  async mount(root, { header }) {
    reveal(root); rail(root);
    const story = root.querySelector('#story');
    const canvas = story.querySelector('canvas');
    const chapters = [...story.querySelectorAll('.chapter')];
    const dots = [...story.querySelectorAll('[data-dot]')];
    header.classList.add('on-story');
    let api = null, hover = 0, p = 0, alive = true;

    const update = () => {
      const r = story.getBoundingClientRect();
      const total = r.height - innerHeight;
      p = Math.max(0, Math.min(1, -r.top / total)) * CH;
      chapters.forEach((c, i) => {
        const on = i === 0 ? p < 0.42 : i === 4 ? p > 3.55 : Math.abs(p - i) < 0.42;
        c.classList.toggle('on', on);
        c.style.setProperty('--k', on ? 1 : 0);
      });
      const active = Math.min(4, Math.round(Math.min(p, 4)));
      dots.forEach((d, i) => d.classList.toggle('on', i === active));
      api?.setProgress(p);
      header.classList.toggle('on-story', r.bottom > innerHeight * 0.5 && p < 0.3);
    };
    const onScroll = () => requestAnimationFrame(update);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();

    // hover a world in the opening chapter
    const onMove = (e) => {
      const r = story.getBoundingClientRect();
      if (e.pointerType === 'touch') return;
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / innerHeight - 0.5;
      api?.setPointer(nx, ny);
      hover = p < 0.4 && e.clientY < innerHeight ? (nx < 0 ? -1 : 1) : 0;
      api?.setHover(hover);
    };
    story.addEventListener('pointermove', onMove, { passive: true });
    story.addEventListener('pointerleave', () => { hover = 0; api?.setHover(0); });
    story.querySelectorAll('[data-side]').forEach((s) => s.addEventListener('focusin', () => api?.setHover(+s.dataset.side)));

    const offWorld = on('world', (w) => {
      api?.setWorld(w);
      root.querySelectorAll('[data-world-img="case"]').forEach((im) => { im.src = `img/case-${w}.webp`; });
    });

    const mod = await load3D();
    if (mod && alive) {
      try {
        api = mod.mountStory(canvas, { world: world.current, reducedMotion: reduced() });
        api.setProgress(p);
        requestAnimationFrame(() => story.classList.add('has-3d'));
        const vis = new IntersectionObserver(([e]) => api?.setVisible(e.isIntersecting));
        vis.observe(story);
        this._vis = vis;
      } catch (e) { console.warn('Story 3D failed', e); }
    }

    return () => {
      alive = false;
      removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll);
      offWorld(); this._vis?.disconnect(); api?.dispose(); header.classList.remove('on-story');
    };
  },
};
