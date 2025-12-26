import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      rating: '4.5',
      text: `Today We Completed Our Both Dog’s Grooming And Hygiene Service...I absolutely loved Bhao Bhao Pet Grooming! 🐶✨ The groomer is amazing — he handled pets with so much love and patience... Thank you for making my pets look adorable and feel pampered`,
      author: 'Raj Kapoor, New Delhi',
    },
    {
      rating: '5.0',
      text: `Bhaobhao transformed my hyperactive kiddo into a calm prince in under two hours that too at my home without going anywhere. The groomer arrived on time, fully equipped, and handled my dog with incredible patience and expertise.`,
      author: 'Raj Kapoor, New Delhi',
    },
    {
      rating: '4.5',
      text: `Had a lovely experience with BhaoBhao. Shruti understood all the needs over bhaobhao whatsapp while booking the appointment and groomer Ankit handled my dog very gently. Would surely recommend their service!`,
      author: 'Raj Kapoor, New Delhi',
    },
    {
      rating: '4.5',
      text: `Today We Completed Our Both Dog’s Grooming And Hygiene Service...I absolutely loved Bhao Bhao Pet Grooming! 🐶✨ The groomer is amazing — he handled pets with so much love and patience... Thank you for making my pets look adorable and feel pampered`,
      author: 'Raj Kapoor, New Delhi',
    },
    {
      rating: '4.5',
      text: `Had a lovely experience with BhaoBhao. Shruti understood all the needs over bhaobhao whatsapp while booking the appointment and groomer Ankit handled my dog very gently. Would surely recommend their service!`,
      author: 'Raj Kapoor, New Delhi',
    },
    {
      rating: '5.0',
      text: `Bhaobhao transformed my hyperactive kiddo into a calm prince in under two hours that too at my home without going anywhere. The groomer arrived on time, fully equipped, and handled my dog with incredible patience and expertise.`,
      author: 'Raj Kapoor, New Delhi',
    },
  ];

  const circularTestimonials = useMemo(() => {
    const duplications = 3; // keeps the carousel fed so the loop feels endless
    return Array.from({ length: duplications }, (_, dupIdx) =>
      testimonials.map((item, originalIdx) => ({
        ...item,
        circularId: `${item.author}-${originalIdx}-${dupIdx}`,
      }))
    ).flat();
  }, [testimonials]);

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="testimonials-title">Real people, <span>Real love</span></h2>
        <p className="testimonials-subtitle">Authentic experiences from our happy pet parents</p>
      </div>

      <div className="testimonials-carousel ">
        <Swiper
          className="swiper"
          modules={[Autoplay]}
          slidesPerView={4.5}
          spaceBetween={32}
          centeredSlides={true}
          loop={true}
          loopAdditionalSlides={testimonials.length}
          speed={10000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
          }}
          breakpoints={{
            1400: {
              slidesPerView: 5,
              spaceBetween: 32,
              centeredSlides: true,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 24,
              centeredSlides: true,
            },
            992: {
              slidesPerView: 3,
              spaceBetween: 18,
              centeredSlides: true,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 14,
              centeredSlides: true,
            },
            0: {
              slidesPerView: 1.3,
              spaceBetween: 12,
              centeredSlides: true,
            },
          }}
        >
          {circularTestimonials.map((item) => (
            <SwiperSlide key={item.circularId}>
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <span className="score">{item.rating}</span>
                  <span className="star">★</span>
                </div>
                <p className="testimonial-text">“{item.text}”</p>
                <p className="testimonial-author">{item.author}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="testimonial-fade testimonial-fade-left" aria-hidden="true" />
        <div className="testimonial-fade testimonial-fade-right" aria-hidden="true" />
      </div>

      <div className="testimonial-dogs">
        <img src="./img10.png" alt="Happy pets" />
      </div>
    </section>
  );
};

export default TestimonialsSection;
