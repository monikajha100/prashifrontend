import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Helmet>
        <title>About Us - Praashibysupal</title>
        <meta name="description" content="Learn about Praashibysupal's journey in creating luxury jewelry, our commitment to quality, and our passion for Victorian-inspired designs." />
        <meta name="keywords" content="jewelry, victorian sets, color changing jewelry, designer jewelry, luxury jewelry, earrings, necklaces, rings" />
      </Helmet>

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">About Praashibysupal</h1>
          <p className="page-subtitle">Crafting timeless elegance through Victorian-inspired luxury jewelry</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story" style={{padding: '80px 0', background: 'white'}}>
        <div className="container">
          <div className="story-content" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center'}}>
            <div className="story-text">
              <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '30px'}}>Our Story</h2>
              <p style={{fontSize: '1.1rem', lineHeight: '1.8', color: '#666', marginBottom: '25px'}}>
                We began our journey over 10 years ago as a small offline jewellery venture. What started as a humble collection soon grew into a trusted name loved by our loyal customers. Over the years, we have served countless women who believed in our designs, quality and commitment.
              </p>
              <p style={{fontSize: '1.1rem', lineHeight: '1.8', color: '#666', marginBottom: '25px'}}>
                With this strong foundation, we stepped into the online space to make our jewellery accessible to women everywhere. Praashi by Supal is not just about ornaments – it's about celebrating individuality, confidence and everyday beauty. From minimal everyday wear to festive pieces, our collection is designed to complement every occasion and mood.
              </p>
              <p style={{fontSize: '1.1rem', lineHeight: '1.8', color: '#666'}}>
                Our vision is simple – to continue delivering affordable luxury that makes you feel confident, stylish and special, just as we have for the past decade.
              </p>
            </div>
            <div className="story-image" style={{textAlign: 'center'}}>
              <div style={{width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'}}>
                <img 
                  src="/uploads/products/supal.jpg" 
                  alt="Supal - Founder of Praashibysupal" 
                  style={{width: '100%', height: 'auto', minHeight: '400px', maxHeight: '600px', display: 'block', objectFit: 'cover', borderRadius: '20px'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div style={{width: '100%', height: '500px', background: 'linear-gradient(135deg, #F5F5DC 0%, #FFF8DC 100%)', borderRadius: '20px', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'}}>
                  💎
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="our-values" style={{padding: '80px 0', background: '#f8f9fa'}}>
        <div className="container">
          <h2 style={{textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '60px'}}>Our Values</h2>
          <div className="values-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px'}}>
            <div className="value-card" style={{background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease'}}>
              <div style={{fontSize: '3rem', marginBottom: '20px', color: 'var(--gold)'}}>💰</div>
              <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '15px'}}>Affordability</h3>
              <p style={{color: '#666', lineHeight: '1.6'}}>We make style accessible, blending elegance with affordability so you never compromise.</p>
            </div>
            <div className="value-card" style={{background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease'}}>
              <div style={{fontSize: '3rem', marginBottom: '20px', color: 'var(--gold)'}}>✨</div>
              <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '15px'}}>Quality</h3>
              <p style={{color: '#666', lineHeight: '1.6'}}>We deliver high-quality, timeless jewellery. From everyday chic pieces to festive designs, every item reflects elegance and premium finish.</p>
            </div>
            <div className="value-card" style={{background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease'}}>
              <div style={{fontSize: '3rem', marginBottom: '20px', color: 'var(--gold)'}}>💝</div>
              <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '15px'}}>Customer Satisfaction</h3>
              <p style={{color: '#666', lineHeight: '1.6'}}>Your happiness is our priority. We go above and beyond to ensure every customer has an exceptional experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Profile Section */}
      <section className="founder-section" style={{padding: '80px 0', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'}}>
        <div className="container">
          <h2 style={{textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '60px'}}>Meet Our Founder</h2>
          <div className="founder-content" style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto'}}>
            <div className="founder-image" style={{textAlign: 'center'}}>
              <div style={{width: '280px', height: '280px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)', border: '5px solid #D4AF37', position: 'relative'}}>
                <img 
                  src="/uploads/products/supal.jpg" 
                  alt="Supal - Founder of Praashibysupal" 
                  style={{width: '120%', height: 'auto', objectFit: 'cover', objectPosition: 'center 35%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg, #F5F5DC 0%, #FFF8DC 100%)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '6rem'}}>
                  👩‍💼
                </div>
              </div>
            </div>
            <div className="founder-details">
              <h3 style={{fontSize: '2rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '15px'}}>Supal</h3>
              <p style={{color: 'var(--gold)', fontWeight: '600', fontSize: '1.2rem', marginBottom: '25px'}}>Founder & Creative Director</p>
              <div style={{color: '#666', lineHeight: '1.8', fontSize: '1.1rem'}}>
                <p style={{marginBottom: '20px'}}>
                  I'm Supal, the heart and mind behind Praashi by Supal, where I bring carefully selected jewellery that inspires confidence and joy. Every piece in our collection is chosen to blend elegance, trend and timeless appeal.
                </p>
                <p style={{marginBottom: '20px'}}>
                  With a passion for creating beautiful, accessible jewelry, I believe that every woman deserves to feel special and confident in what she wears. Our curated collection reflects this philosophy, offering pieces that complement every style, occasion, and personality.
                </p>
                <p>
                  At Praashi by Supal, we don't just sell jewelry – we create experiences that celebrate individuality and empower women to express their unique beauty through carefully crafted pieces that tell their story.
                </p>
              </div>
              <div style={{marginTop: '30px', paddingTop: '25px', borderTop: '2px solid #f0f0f0'}}>
                <p style={{color: 'var(--gold)', fontWeight: '600', fontStyle: 'italic', fontSize: '1.1rem'}}>
                  "Every piece of jewelry should make you feel confident, beautiful, and uniquely you."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta" style={{padding: '80px 0', background: 'linear-gradient(135deg, var(--charcoal) 0%, var(--black) 100%)', color: 'white', textAlign: 'center'}}>
        <div className="container">
          <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '700', marginBottom: '20px'}}>Ready to Start Your Journey?</h2>
          <p style={{fontSize: '1.2rem', marginBottom: '40px', opacity: '0.9'}}>Get in touch with us to learn more about our jewelry or discuss custom designs.</p>
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/contact" style={{background: 'var(--gold)', color: 'var(--black)', padding: '15px 30px', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.3s ease'}}>
              Contact Us
            </Link>
            <Link to="/products" style={{background: 'transparent', color: 'white', border: '2px solid var(--gold)', padding: '15px 30px', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.3s ease'}}>
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
