import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { categoriesAPI, toAbsoluteImageUrl } from '../services/api';
import './CategorySlider.css';

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

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
    // Show empty state but keep the section visible
    return (
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Top Trending Collections</h2>
          <div className="category-slider-container" style={{justifyContent: 'center'}}>
            <div style={{textAlign: 'center', padding: '40px', color: '#666', width: '100%'}}>
              <p>Collections coming soon...</p>
            </div>
          </div>
        </div>
      </section>
    );
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
                width: `${categories.length * (100 / itemsPerView)}%`,
                display: 'flex !important',
                visibility: 'visible !important',
                opacity: '1 !important',
                transition: 'transform 0.5s ease',
                flexWrap: 'nowrap !important',
                height: 'auto',
                position: 'relative'
              }}
            >
              {categories.map((category, idx) => {
                const cardWidthPercent = 100 / itemsPerView;
                console.log(`Rendering category ${idx}:`, category.name, 'Width:', cardWidthPercent + '%');
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
                    display: 'flex !important',
                    visibility: 'visible !important',
                    opacity: '1 !important',
                    position: 'relative'
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
      </div>
    </section>
  );
};

export default CategorySlider;