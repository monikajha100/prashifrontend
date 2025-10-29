import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { categoriesAPI, toAbsoluteImageUrl } from '../services/api';
import './CategorySlider.css';

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const { data: categories, isLoading, error } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => {
        // The API returns categories directly as an array
        const categoriesList = Array.isArray(response) ? response : (response.data || []);
        const filtered = categoriesList?.filter(cat => cat.is_active) || [];
        return filtered;
      }
    }
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setItemsPerView(1); // Show 1 item on very small screens
      } else if (window.innerWidth < 768) {
        setItemsPerView(2); // Show 2 items on mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3); // Show 3 items on tablets
      } else {
        setItemsPerView(4); // Show 4 items on desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (categories && currentIndex < categories.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Top Trending Collections</h2>
          <div className="loading-slider">
            <div className="loading-card"></div>
            <div className="loading-card"></div>
            <div className="loading-card"></div>
            <div className="loading-card"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Categories API error:', error);
    return (
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Top Trending Collections</h2>
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
            <p>Unable to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + itemsPerView);
  const canGoNext = currentIndex < categories.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  return (
    <section className="trending-section">
      <div className="container">
        <h2 className="section-title">Top Trending Collections</h2>
        <div className="category-slider-container">
          <button 
            className={`slider-btn prev-btn ${!canGoPrev ? 'disabled' : ''}`}
            onClick={prevSlide}
            disabled={!canGoPrev}
            aria-label="Previous collections"
          >
            ‹
          </button>
          
          <div className="category-slider">
            <div 
              className="slider-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(categories.length / itemsPerView) * 100}%`
              }}
            >
              {categories.map((category) => {
                console.log('Category:', category.name, 'Image:', category.image, 'Absolute URL:', category.image ? toAbsoluteImageUrl(category.image) : 'No image');
                return (
                <div key={category.id} className="collection-card-wrapper" style={{ flex: `0 0 ${100 / itemsPerView}%` }}>
                  <Link 
                    to={`/products?category=${category.slug}`}
                    className="collection-card"
                    onClick={(e) => {
                      // Ensure proper navigation on mobile
                      if (window.innerWidth <= 768) {
                        e.preventDefault();
                        window.location.href = `/products?category=${category.slug}`;
                      }
                    }}
                  >
                    <div className="collection-icon">
                      {category.image ? (
                        <img 
                          src={toAbsoluteImageUrl(category.image)} 
                          alt={category.name}
                          className="category-image"
                          onError={(e) => {
                            console.error('Image failed to load:', category.image, '->', toAbsoluteImageUrl(category.image));
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'inline';
                            }
                          }}
                          onLoad={(e) => {
                            // Ensure image is visible when loaded
                            e.target.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className="default-icon" style={{display: category.image ? 'none' : 'inline'}}>💎</span>
                    </div>
                    <h3 className="collection-name">{category.name}</h3>
                    <p className="collection-subtitle">
                      {category.description || 'Explore Collection'}
                    </p>
                  </Link>
                </div>
                );
              })}
            </div>
          </div>
          
          <button 
            className={`slider-btn next-btn ${!canGoNext ? 'disabled' : ''}`}
            onClick={nextSlide}
            disabled={!canGoNext}
            aria-label="Next collections"
          >
            ›
          </button>
        </div>
        
        {categories.length > itemsPerView && (
          <div className="slider-dots">
            {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                className={`dot ${Math.floor(currentIndex / itemsPerView) === index ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySlider;