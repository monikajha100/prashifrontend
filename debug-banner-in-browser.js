// Browser Console Debug Script
// Copy and paste this into your browser's console (F12 -> Console tab)

console.log('🔍 Banner Debug Script');
console.log('======================');

// 1. Check if banner data is being fetched
console.log('1. Checking banner API...');
fetch('https://api.praashibysupal.com/api/banners/active')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Banner API Response:', data);
    
    if (data && data.length > 0) {
      const banner = data[0];
      console.log('📊 Banner Details:');
      console.log('   Title:', banner.title);
      console.log('   Image URL:', banner.image);
      console.log('   Active:', banner.is_active);
      
      // 2. Test if image loads
      console.log('\n2. Testing image load...');
      const img = new Image();
      img.onload = function() {
        console.log('✅ Image loaded successfully!');
        console.log('   Dimensions:', this.width + 'x' + this.height);
      };
      img.onerror = function() {
        console.log('❌ Image failed to load!');
      };
      img.src = banner.image;
      
      // 3. Check if banner element exists
      console.log('\n3. Checking banner elements...');
      const bannerElements = document.querySelectorAll('.hero-banner-slider, .banner-slide, [class*="banner"]');
      console.log('Found banner elements:', bannerElements.length);
      
      bannerElements.forEach((element, index) => {
        console.log(`   Element ${index + 1}:`, element);
        console.log(`   Classes:`, element.className);
        console.log(`   Background:`, window.getComputedStyle(element).background);
        console.log(`   Background Image:`, window.getComputedStyle(element).backgroundImage);
      });
      
      // 4. Check for React state
      console.log('\n4. Checking React state...');
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('✅ React app detected');
      } else {
        console.log('⚠️  React state not accessible');
      }
      
    } else {
      console.log('❌ No banners found in API response');
    }
  })
  .catch(error => {
    console.log('❌ Banner API Error:', error);
  });

// 5. Check for any JavaScript errors
console.log('\n5. Checking for errors...');
window.addEventListener('error', function(e) {
  console.log('❌ JavaScript Error:', e.error);
});

// 6. Check network requests
console.log('\n6. Network requests will be visible in Network tab');
console.log('   Look for failed requests (red entries)');

console.log('\n🎯 Next Steps:');
console.log('1. Check the banner elements found above');
console.log('2. Look at the background/backgroundImage CSS properties');
console.log('3. Check Network tab for any failed image requests');
console.log('4. Look for any JavaScript errors in Console');
