import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaGem,
  FaCrown,
  FaShippingFast,
  FaHeadset,
  FaLeaf,
  FaStar,
  FaWhatsapp,
} from "react-icons/fa";
import {
  productsAPI,
  categoriesAPI,
  contactAPI,
  toAbsoluteImageUrl,
} from "../services/api";
import ProductSlider from "../components/ProductSlider";
import CategorySlider from "../components/CategorySlider";
import "../live-styles.css";
import "./LuxuryLanding.css";

const testimonials = [
  {
    name: "Riya Sharma",
    location: "Mumbai",
    comment:
      "The craftsmanship is exquisite! The Victorian set I ordered was breathtaking and arrived beautifully packaged.",
  },
  {
    name: "Neha Patel",
    location: "Ahmedabad",
    comment:
      "Perfect destination for bridal jewelry. The team helped me customize every detail and the results were stunning.",
  },
  {
    name: "Ananya Gupta",
    location: "Delhi",
    comment:
      "Premium quality with personal service. Loved the color-changing collection – absolutely mesmerizing!",
  },
];

const valueHighlights = [
  {
    icon: <FaCrown />,
    title: "Signature Designs",
    description:
      "Limited-edition Victorian and contemporary collections designed in-house by our master artisans.",
  },
  {
    icon: <FaGem />,
    title: "Premium Quality",
    description:
      "Crafted with high-grade materials, hypoallergenic plating, and meticulous attention to detail.",
  },
  {
    icon: <FaShippingFast />,
    title: "Pan-India Delivery",
    description:
      "Insured express shipping with handcrafted packaging that keeps every jewel safe and radiant.",
  },
  {
    icon: <FaHeadset />,
    title: "Concierge Support",
    description:
      "Dedicated jewelry stylists to guide you through personalization, gifting, and styling.",
  },
];

const steps = [
  {
    heading: "Discover",
    detail:
      "Explore curated collections tailored to bridal, festive, and everyday luxe moments.",
  },
  {
    heading: "Personalize",
    detail:
      "Share your inspiration—our design studio customizes finishes, stones, and detailing.",
  },
  {
    heading: "Craft",
    detail:
      "Artisans bring your vision to life with precision setting, polishing, and plating.",
  },
  {
    heading: "Deliver",
    detail:
      "Your jewelry arrives in signature packaging with care instructions and authenticity.",
  },
];

const defaultFeatured = [
  {
    id: "default-neck-piece",
    name: "Heritage Polki Bridal Set",
    slug: "heritage-polki-bridal-set",
    price: 8999,
    original_price: 11999,
    primary_image: "/placeholder-product.jpg",
  },
  {
    id: "default-earrings",
    name: "Aurora Color-Changing Chandbali",
    slug: "aurora-color-changing-chandbali",
    price: 2299,
    original_price: 3499,
    primary_image: "/placeholder-product.jpg",
  },
];

const LuxuryLanding = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    budget: "",
    interest: "",
    message: "",
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery("landingCategories", categoriesAPI.getAll, {
    select: (response) => response?.data || [],
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: featuredProducts,
    isLoading: featuredLoading,
    error: featuredError,
  } = useQuery(
    "landingFeaturedProducts",
    () => productsAPI.getFeatured(6),
    {
      select: (response) => {
        if (!response) return [];
        const items = Array.isArray(response.data) ? response.data : [];
        return items.slice(0, 6);
      },
      staleTime: 1000 * 60 * 3,
    }
  );

  const displayCategories = useMemo(() => {
    if (categoriesError || categoriesLoading) return [];
    if (!Array.isArray(categories)) return [];
    return categories.slice(0, 6);
  }, [categories, categoriesError, categoriesLoading]);

  const displayFeaturedProducts = useMemo(() => {
    if (featuredError) return defaultFeatured;
    if (!featuredProducts || featuredProducts.length === 0) {
      return defaultFeatured;
    }
    return featuredProducts;
  }, [featuredProducts, featuredError]);

  const heroImageUrl = useMemo(() => {
    const base = process.env.PUBLIC_URL || "";
    return `${base}/banner.jpg`;
  }, []);

  const contactMutation = useMutation(contactAPI.submit, {
    onSuccess: () => {
      toast.success(
        "Thank you! Our jewelry specialist will connect with you shortly."
      );
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        budget: "",
        interest: "",
        message: "",
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        "We could not submit your inquiry. Please try again in a moment.";
      toast.error(message);
    },
  });

  const splitName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "-";
    return { firstName, lastName };
  };

  const handleInquirySubmit = (event) => {
    event.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Please share your name so we know how to address you.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please provide an email address to receive our response.");
      return;
    }
    if (formData.message.trim().length < 10) {
      toast.error("Please add a short note about what you're looking for.");
      return;
    }

    const { firstName, lastName } = splitName(formData.fullName);
    contactMutation.mutate({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      subject: "luxury-landing-inquiry",
      message: [
        `Interest: ${formData.interest || "Not specified"}`,
        `Budget: ${formData.budget || "Not specified"}`,
        "",
        formData.message,
      ].join("\n"),
    });
  };

  return (
    <div className="luxury-landing">
      <Helmet>
        <title>Praashi Bespoke Experience - Curated Luxury Jewelry</title>
        <meta
          name="description"
          content="Explore bespoke jewelry experiences by Praashi by Supal. Discover signature collections, personalized craftsmanship, and concierge support tailored to your story."
        />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <section
        className="landing-hero"
        style={{ "--hero-image": `url("${heroImageUrl}")` }}
      >
        <div className="hero-overlay">
          <div className="hero-content container">
            <motion.span
              className="hero-eyebrow"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Praashi Bespoke
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Craft Your Signature Jewelry Story
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              From Victorian heirlooms to contemporary masterpieces, each piece
              is handcrafted with precision, passion, and a promise of timeless
              elegance.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="/products?featured=true" className="hero-primary-btn">
                Explore Signature Pieces
              </Link>
              <a
                href="https://wa.me/918780606280"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-secondary-btn"
              >
                <FaWhatsapp />
                Chat With A Stylist
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="landing-metrics container">
        <div className="metric-card">
          <span className="metric-value">6K+</span>
          <span className="metric-label">Happy Patrons</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">150+</span>
          <span className="metric-label">Exclusive Designs</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">12+</span>
          <span className="metric-label">Years Crafting Luxury</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">24h</span>
          <span className="metric-label">Personalized Support</span>
        </div>
      </section>

      <section className="landing-highlight">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Curated For Every Occasion
          </motion.h2>
          <p className="section-subtitle">
            Discover jewels designed to elevate bridal dreams, festive sparkle,
            and milestone celebrations.
          </p>
          <div className="highlight-grid">
            {valueHighlights.map((item) => (
              <motion.div
                key={item.title}
                className="highlight-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="highlight-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-categories container">
        <div className="section-heading">
          <div>
            <h2>Featured Style Stories</h2>
            <p>
              Shop the most loved categories across necklaces, earrings, rings,
              and more.
            </p>
          </div>
          <Link to="/products" className="section-link">
            View All Collections →
          </Link>
        </div>
        {displayCategories.length > 0 ? (
          <div className="landing-category-grid">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="landing-category-card"
              >
                <div className="category-image-wrapper">
                  <img
                    src={toAbsoluteImageUrl(category.image) || "/placeholder-product.jpg"}
                    alt={category.name}
                    loading="lazy"
                  />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span>Explore Collection</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <CategorySlider />
        )}
      </section>

      <section className="landing-featured container">
        <div className="section-heading">
          <div>
            <h2>Signature Bestsellers</h2>
            <p>
              A showcase of handpicked creations adored by our jewelry
              connoisseurs.
            </p>
          </div>
          <Link to="/products?featured=true" className="section-link">
            Shop Featured →
          </Link>
        </div>
        <ProductSlider products={displayFeaturedProducts} category="featured" />
      </section>

      <section className="landing-timeline">
        <div className="container">
          <div className="timeline-intro">
            <h2>Your Bespoke Journey</h2>
            <p>
              We transform inspiration into timeless heirlooms through a curated
              concierge process rooted in craftsmanship and care.
            </p>
          </div>
          <div className="timeline-grid">
            {steps.map((step, index) => (
              <div className="timeline-card" key={step.heading}>
                <span className="timeline-index">{`0${index + 1}`}</span>
                <h3>{step.heading}</h3>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-testimonials">
        <div className="container">
          <h2>Kind Words From Patrons</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div className="testimonial-card" key={testimonial.name}>
                <FaStar className="testimonial-icon" />
                <p className="testimonial-comment">{testimonial.comment}</p>
                <div className="testimonial-meta">
                  <span className="testimonial-name">{testimonial.name}</span>
                  <span className="testimonial-location">
                    {testimonial.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-inquiry">
        <div className="container inquiry-container">
          <div className="inquiry-content">
            <h2>Plan Your Personalized Consultation</h2>
            <p>
              Share your vision and let our stylists craft a jewelry experience
              tailored uniquely to you. We respond within 24 hours.
            </p>
            <ul className="inquiry-highlights">
              <li>
                <FaLeaf />
                Eco-conscious materials & hypoallergenic plating
              </li>
              <li>
                <FaGem />
                Custom stone setting & finish options
              </li>
              <li>
                <FaHeadset />
                Dedicated stylists for virtual and in-store consults
              </li>
            </ul>
          </div>
          <form className="inquiry-form" onSubmit={handleInquirySubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    fullName: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="interest">Interest</label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    interest: event.target.value,
                  }))
                }
              >
                <option value="">Select your focus</option>
                <option value="bridal">Bridal & Wedding Jewelry</option>
                <option value="festive">Festive & Occasion Wear</option>
                <option value="daily">Everyday Luxe</option>
                <option value="gifting">Premium Gifting</option>
                <option value="custom">Fully Custom Design</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="budget">Budget Range</label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    budget: event.target.value,
                  }))
                }
              >
                <option value="">Select a range</option>
                <option value="under-5000">Under ₹5,000</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-20000">₹10,000 - ₹20,000</option>
                <option value="20000-plus">₹20,000+</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Tell Us More</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Share details, inspirations, or special requests..."
                value={formData.message}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    message: event.target.value,
                  }))
                }
                required
              />
            </div>
            <button
              type="submit"
              className="inquiry-submit"
              disabled={contactMutation.isLoading}
            >
              {contactMutation.isLoading ? "Submitting..." : "Submit Inquiry"}
            </button>
            <span className="form-disclaimer">
              We respect your privacy. Your details are shared only with our
              in-house stylists.
            </span>
          </form>
        </div>
      </section>

      <section className="landing-footer-cta container">
        <div className="cta-card">
          <h2>Visit Our Experience Studio</h2>
          <p>
            Book a personal appointment at our Ahmedabad studio or schedule a
            virtual styling session with our concierge team.
          </p>
          <div className="cta-actions">
            <a
              href="https://maps.google.com/?q=203+SF+ANIKEDHYA+CAPITAL+-2+NR+MAHALAXMI+CROSS+ROAD+PALDI+AHMEDABAD"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-link"
            >
              Get Directions
            </a>
            <a href="tel:+918780606280" className="cta-link secondary">
              Call +91 87806 06280
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LuxuryLanding;

