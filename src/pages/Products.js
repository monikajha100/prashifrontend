import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { productsAPI, categoriesAPI, subcategoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFilter, FaSearch } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const featured = searchParams.get('featured') || '';
  // Use backend default sorting; hide sort controls
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Debug: Log search parameters
  useEffect(() => {
    if (search) {
      console.log('Search parameter from URL:', search);
      console.log('All search params:', { category, subcategory, search, page, minPrice, maxPrice });
    }
  }, [search, category, subcategory, page, minPrice, maxPrice]);

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    ['products', { category, subcategory, search, page, minPrice, maxPrice, featured }],
    () => {
      // If featured=true, use the featured products API
      if (featured === 'true') {
        return productsAPI.getFeatured(20); // Get more featured products for the page
      }
      // Otherwise use the regular products API
      return productsAPI.getAll({
        category,
        subcategory,
        search,
        page,
        minPrice,
        maxPrice
      });
    },
    {
      select: (response) => {
        // Handle different response structures
        if (featured === 'true') {
          return { products: response.data, total: response.data.length };
        }
        return response.data;
      }
    }
  );

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data
    }
  );

  // Fetch subcategories when category changes
  const { data: subcategories } = useQuery(
    ['subcategories', category],
    () => (category ? subcategoriesAPI.getByCategory(category) : Promise.resolve({ data: [] })),
    {
      enabled: !!category,
      select: (response) => response.data
    }
  );

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Only reset to first page when filtering (not when changing page)
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  // Reset subcategory when category changes
  useEffect(() => {
    if (!category && subcategory) {
      handleFilterChange('subcategory', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory]);

  // Sort controls removed

  const clearFilters = () => {
    setSearchParams({});
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Error loading products</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <Helmet>
        <title>Products - Praashibysupal</title>
        <meta name="description" content="Browse our complete collection of jewelry including necklaces, earrings, rings, bracelets and more." />
      </Helmet>

      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            {featured === 'true' ? '⭐ Featured Products' :
             category ? categories?.find(c => c.slug === category)?.name || 'Products' : 
             search ? `Search Results for "${search}"` : 'All Products'}
          </h1>
          <p className="page-subtitle">
            {productsData?.pagination?.totalProducts || productsData?.total || 0} products found
          </p>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar (Dropdowns) - Hide for featured products */}
          {featured !== 'true' && (
            <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="filter-group">
              <h4>Category</h4>
              <select
                value={category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="price-input"
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Dropdown */}
            <div className="filter-group">
              <h4>Subcategory</h4>
              <select
                value={subcategory}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                className="price-input"
                disabled={!category}
              >
                <option value="">All Subcategories</option>
                {subcategories?.map(sub => (
                  <option key={sub.id} value={sub.slug}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Price Dropdown */}
            <div className="filter-group">
              <h4>Price Range</h4>
              <select
                value={`${minPrice || ''}-${maxPrice || ''}`}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '-') {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  } else {
                    const [min, max] = value.split('-');
                    handleFilterChange('minPrice', min && min !== '' ? min : '');
                    handleFilterChange('maxPrice', max && max !== '' ? max : '');
                  }
                }}
                className="price-input"
              >
                <option value="-">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="500-2000">₹500 - ₹2,000</option>
                <option value="2000-5000">₹2,000 - ₹5,000</option>
                <option value="5000-">Above ₹5,000</option>
              </select>
            </div>
          </div>
          )}

          {/* Products Content */}
          <div className="products-content">
            {/* Toolbar - Hide for featured products */}
            {featured !== 'true' && (
              <div className="products-toolbar">
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <LoadingSpinner text="Loading products..." />
            ) : productsData?.products?.length > 0 ? (
              <>
                <div className="products-grid">
                  {productsData.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData.pagination && productsData.pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-btn"
                      disabled={!productsData.pagination.hasPrev}
                      onClick={() => handleFilterChange('page', page - 1)}
                    >
                      Previous
                    </button>
                    
                    <div className="pagination-info">
                      Page {productsData.pagination.currentPage} of {productsData.pagination.totalPages}
                    </div>
                    
                    <button 
                      className="pagination-btn"
                      disabled={!productsData.pagination.hasNext}
                      onClick={() => handleFilterChange('page', page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <FaSearch size={48} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
