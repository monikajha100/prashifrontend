import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { categoriesAPI, toAbsoluteImageUrl } from '../services/api';
import './CategorySlider.css';

const fallbackCategories = [
  {
    id: 'fallback-1',
    name: 'Rings',
    slug: 'rings',
    description: 'Designer rings for every occasion',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'fallback-2',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Statement necklaces that shine',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'fallback-3',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant earrings collection',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'fallback-4',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Graceful bracelets and bangles',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'fallback-5',
    name: 'Sets',
    slug: 'sets',
    description: 'Curated jewellery sets',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'fallback-6',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look with accessories',
    image: '/placeholder-product.jpg'
  }
];

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  const { data: categories, isLoading, error } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => {
        try {
          // The API returns categories directly as an array
          const categoriesList = Array.isArray(response) ? response : (response?.data || []);
          const filtered = categoriesList?.filter(cat => cat.is_active) || [];
          console.log('Categories loaded:', filtered.length, filtered);
          return filtered;
        } catch (err) {
          console.error('Error processing categories:', err);
          return [];
        }
      },
      retry: 2,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      onError: (err) => {
        console.error('Categories fetch error:', err);
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      
      let newItemsPerView = 3;
      if (width < 480) {
        newItemsPerView = 1; // Show 1 item on very small screens
      } else if (width < 768) {
        newItemsPerView = 1; // Show 1 item on mobile for better visibility
      } else if (width < 1024) {
        newItemsPerView = 2; // Show 2 items on tablets
      } else {
        newItemsPerView = 3; // Show 3 items on desktop
      }
      
      if (newItemsPerView !== itemsPerView) {
        setItemsPerView(newItemsPerView);
        // Reset index when view changes
        setCurrentIndex(0);
      }
    };

    // Set initial value immediately
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  // Reset index if categories change
  useEffect(() => {
    if (categories && categories.length > 0 && currentIndex >= categories.length) {
      setCurrentIndex(0);
    }
  }, [categories, currentIndex]);

  // Debug: Log current state
  useEffect(() => {
    console.log('CategorySlider State:', {
      categories: categories?.length || 0,
      isLoading,
      error: error?.message,
      itemsPerView,
      currentIndex,
      isMobile
    });
  }, [categories, isLoading, error, itemsPerView, currentIndex, isMobile]);

  const displayCategories = categories && categories.length > 0 ? categories : fallbackCategories;
  const usingFallback = !categories || categories.length === 0;
  const canGoNext = currentIndex < displayCategories.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <section className="trending-section">
      <div className="container">
        <h2 className="section-title">Top Trending Collections</h2>
        {isLoading ? (
          <div className="category-slider-container" style={{justifyContent: 'center'}}>
            <div className="loading-slider">
              <div className="loading-card"></div>
              <div className="loading-card"></div>
              <div className="loading-card"></div>
              <div className="loading-card"></div>
            </div>
          </div>
        ) : isMobile ? (
          <div className="mobile-horizontal-scroll">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="mobile-scroll-card"
              >
                <div className="mobile-scroll-image-wrapper">
                  {category.image ? (
                    <img
                      src={toAbsoluteImageUrl(category.image)}
                      alt={category.name}
                      className="mobile-scroll-image"
                    />
                  ) : (
                    <span className="default-icon">💎</span>
                  )}
                </div>
                <div className="mobile-scroll-content">
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Explore Collection'}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : displayCategories.length > 0 ? (
        <div className="category-slider-container">
          <button 
            className={`slider-btn prev-btn ${!canGoPrev ? 'disabled' : ''}`}
            onClick={prevSlide}
            disabled={!canGoPrev}
            aria-label="Previous collections"
          >
            <FaChevronLeft style={{ 
              display: 'block',
              width: '20px',
              height: '20px',
              color: 'white',
              fill: 'white'
            }} />
          </button>
          
          <div className="category-slider" style={{ 
            width: '100%', 
            maxWidth: '100%',
            overflow: 'hidden', 
            position: 'relative',
            flex: '1 1 0%',
            minWidth: 0,
            height: 'auto'
          }}>
            <div 
              className="slider-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(displayCategories.length / itemsPerView) * 100}%`,
                display: 'flex',
                visibility: 'visible',
                opacity: 1,
                transition: 'transform 0.5s ease',
                flexWrap: 'nowrap',
                height: 'auto',
                position: 'relative',
                alignItems: 'stretch'
              }}
            >
              {displayCategories.map((category, idx) => {
                const cardWidthPercent = 100 / itemsPerView;
                return (
                <div 
                  key={category.id} 
                  className="collection-card-wrapper" 
                  style={{ 
                    flex: `0 0 ${cardWidthPercent}%`,
                    minWidth: `${cardWidthPercent}%`,
                    maxWidth: `${cardWidthPercent}%`,
                    width: `${cardWidthPercent}%`,
                    boxSizing: 'border-box',
                    display: 'flex',
                    visibility: 'visible',
                    opacity: 1,
                    position: 'relative',
                    padding: isMobile ? '0 8px' : '0 10px'
                  }}
                >
                  <Link 
                    to={`/products?category=${category.slug}`}
                    className="collection-card"
                  >
                    <div className="collection-icon">
                      {category.image ? (
                        <img 
                          src={toAbsoluteImageUrl(category.image)} 
                          alt={category.name}
                          className="category-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'inline';
                            }
                          }}
                          onLoad={(e) => {
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
            <FaChevronRight style={{ 
              display: 'block',
              width: '20px',
              height: '20px',
              color: 'white',
              fill: 'white'
            }} />
          </button>
        </div>
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
            <p>No categories available right now. Please check back soon.</p>
          </div>
        )}
        {error && (
          <div style={{textAlign: 'center', marginTop: '20px', color: '#aa0000', fontSize: '0.9rem'}}>
            <p>Unable to load live categories. Showing curated list instead.</p>
          </div>
        )}
        {usingFallback && !isLoading && !error && (
          <div style={{textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.9rem'}}>
            <p>Showing our curated categories while the live catalogue loads.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySlider;