import React, { useMemo, useState } from 'react';

const transformationData = [
  {
    id: 'max',
    title: 'Max • Premium Grooming',
    before: '/before1.png',
    after: '/after1.png',
  },
  {
    id: 'luna',
    title: 'Luna • Professional Grooming',
    before: '/before2.png',
    after: '/after2.png',
  },
  {
    id: 'whiskers',
    title: 'Whiskers • Cat Grooming Special',
    before: '/before.png',
    after: '/after3.png',
  },
];

const BeforeAfterCard = ({ title, before, after }) => {
  const [position, setPosition] = useState(50);

  const sliderLabel = useMemo(
    () => `Slide to reveal ${title}`,
    [title],
  );

  return (
    <div className="transformation-card">
      <div className="transformation-images">
        <div className="transformation-image is-after">
          <img src={after} alt={`${title} after grooming`} loading="lazy" />
          <span className="after-label badge-label">After</span>
        </div>
        <div
          className="transformation-image is-before"
          style={{ width: `${position}%` }}
        >
          <img src={before} alt={`${title} before grooming`} loading="lazy" />
          <span className="before-label badge-label">Before</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="transformation-slider-input"
          aria-label={sliderLabel}
        />

        <button
          type="button"
          className="play-btn"
          style={{ left: `calc(${position}% - 25px)` }}
          aria-hidden="true"
        >
          <i className="bi bi-chevron-left"></i>
          <i className="bi bi-chevron-right"></i>
        </button>

      </div>
      <div className="transformation-title">{title}</div>
    </div>
  );
};

const TransformationsSection = () => {
  return (
    <section className="transformations-section">
      <div className="container">
        <h2 className="section-title">From Woof to Wow</h2>
        <p className="section-subtitle">
          Sit back and watch our stylists create magic with their hands, as they curate
          the perfect look for your pets.
        </p>

        <div className="row g-4">
          {transformationData.map((transformation) => (
            <div key={transformation.id} className="col-lg-4 col-md-6">
              <BeforeAfterCard {...transformation} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationsSection;
